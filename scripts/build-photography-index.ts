#!/usr/bin/env node
/**
 * scripts/build-photography-index.ts
 *
 * Scans public/photography/ for image files, extracts EXIF metadata via exifr,
 * merges with existing content/photography/index.json (preserving human-edited
 * fields for known IDs), and writes the sorted result back.
 *
 * Usage:  npx tsx scripts/build-photography-index.ts
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join, extname, basename } from 'path'
import exifr from 'exifr'

// ─── Types (mirrors §7.2 schema) ─────────────────────────────────────────────

interface PhotoLocation {
  lat: number | null
  lon: number | null
  name: string
}

interface PhotoExif {
  camera?: string
  lens?: string
  focal?: string
  aperture?: string
  shutter?: string
  iso?: number
}

interface Photo {
  id: string
  src: string
  title: string
  captured_at: string
  location: PhotoLocation
  exif: PhotoExif
  caption: string
  featured: boolean
  panorama: boolean
}

// ─── Paths ────────────────────────────────────────────────────────────────────

const ROOT       = join(__dirname, '..')
const PHOTO_DIR  = join(ROOT, 'public', 'photography')
const INDEX_PATH = join(ROOT, 'content', 'photography', 'index.json')
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png'])

// ─── EXIF formatting helpers ──────────────────────────────────────────────────

function formatCamera(make: string | undefined, model: string | undefined): string | undefined {
  if (!make && !model) return undefined
  if (!model) return make
  if (!make)  return model
  // Avoid "Apple Apple iPhone 15 Pro" — skip Make if Model already starts with it
  const m = make.trim()
  const d = model.trim()
  return d.toLowerCase().startsWith(m.toLowerCase()) ? d : `${m} ${d}`
}

function formatShutter(exp: number | undefined): string | undefined {
  if (exp == null || isNaN(exp)) return undefined
  if (exp >= 1)  return `${exp}s`
  const denom = Math.round(1 / exp)
  return `1/${denom}s`
}

function formatFocal(mm: number | undefined): string | undefined {
  if (mm == null || isNaN(mm)) return undefined
  return `${Math.round(mm)}mm`
}

function formatAperture(f: number | undefined): string | undefined {
  if (f == null || isNaN(f)) return undefined
  return `f/${f}`
}

function dmsToDecimal(dms: unknown, ref: unknown): number | undefined {
  if (dms == null) return undefined
  // exifr may return a pre-converted number, or a [deg, min, sec] array
  if (typeof dms === 'number') {
    const sign = (ref === 'S' || ref === 'W') ? -1 : 1
    return sign * dms
  }
  if (Array.isArray(dms) && dms.length >= 3) {
    const [deg, min, sec] = dms as number[]
    const decimal = deg + min / 60 + sec / 3600
    const sign = (ref === 'S' || ref === 'W') ? -1 : 1
    return Math.round(decimal * 1e6) / 1e6
      * sign
  }
  return undefined
}

function formatDate(d: Date | undefined): string {
  if (!d || isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)   // YYYY-MM-DD
}

// ─── Minimal JPEG/JFIF dimension reader (avoids extra deps) ──────────────────
// Walks markers to find SOF0/SOF1/SOF2 which contain height × width.

function readJpegDimensions(buf: Buffer): { width: number; height: number } | null {
  let i = 0
  if (buf[0] !== 0xFF || buf[1] !== 0xD8) return null   // not a JPEG
  i = 2
  while (i < buf.length - 3) {
    if (buf[i] !== 0xFF) return null
    const marker = buf[i + 1]
    // SOF markers that carry image dimensions
    if (marker === 0xC0 || marker === 0xC1 || marker === 0xC2 ||
        marker === 0xC3 || marker === 0xC9 || marker === 0xCA) {
      const h = buf.readUInt16BE(i + 5)
      const w = buf.readUInt16BE(i + 7)
      if (w > 0 && h > 0) return { width: w, height: h }
    }
    if (marker === 0xD9 || marker === 0xDA) return null  // EOI / SOS — stop
    const segLen = buf.readUInt16BE(i + 2)
    i += 2 + segLen
  }
  return null
}

function isPanorama(filePath: string, exifWidth?: number, exifHeight?: number): boolean {
  let width  = exifWidth  ?? 0
  let height = exifHeight ?? 0

  if (!width || !height) {
    // Fall back to reading the JPEG SOF header
    try {
      const buf = readFileSync(filePath)
      const dims = readJpegDimensions(buf)
      if (dims) { width = dims.width; height = dims.height }
    } catch { /* ignore */ }
  }

  if (!width || !height) return false
  // Normalise: some cameras store rotated dimensions in EXIF
  const ratio = Math.max(width, height) / Math.min(width, height)
  return ratio > 2.0
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // 1. Load existing index (keyed by id)
  let existing: Map<string, Photo> = new Map()
  try {
    const raw = readFileSync(INDEX_PATH, 'utf8')
    const arr: Photo[] = JSON.parse(raw)
    for (const p of arr) existing.set(p.id, p)
  } catch { /* first run — no existing file */ }

  const existingCount = existing.size
  let addedCount   = 0
  let gpsCount     = 0

  // 2. Scan image files
  const files = readdirSync(PHOTO_DIR)
    .filter(f => IMAGE_EXTS.has(extname(f).toLowerCase()))
    .sort()   // stable order before we re-sort by date

  const results: Photo[] = []

  for (const filename of files) {
    const filePath = join(PHOTO_DIR, filename)
    const ext      = extname(filename).toLowerCase()
    const id       = basename(filename, ext)
    const src      = `/photography/${filename}`

    // 3. Extract EXIF
    let rawExif: Record<string, unknown> = {}
    try {
      rawExif = await exifr.parse(filePath, {
        pick: [
          'DateTimeOriginal', 'CreateDate',
          'Make', 'Model', 'LensModel',
          'FocalLength', 'FNumber', 'ExposureTime', 'ISO',
          'GPSLatitude', 'GPSLongitude',
          'GPSLatitudeRef', 'GPSLongitudeRef',
          'PixelXDimension', 'PixelYDimension',
          'ImageWidth', 'ImageLength',
        ],
        translateValues: false,   // keep raw numeric arrays for GPS DMS
      }) ?? {}
    } catch (err) {
      console.warn(`  ⚠  EXIF parse failed for ${filename}:`, (err as Error).message)
    }

    const exifOut: PhotoExif = {}
    const cam = formatCamera(rawExif.Make as string, rawExif.Model as string)
    if (cam) exifOut.camera = cam

    const lens = rawExif.LensModel as string | undefined
    if (lens) exifOut.lens = lens

    const focal = formatFocal(rawExif.FocalLength as number)
    if (focal) exifOut.focal = focal

    const aperture = formatAperture(rawExif.FNumber as number)
    if (aperture) exifOut.aperture = aperture

    const shutter = formatShutter(rawExif.ExposureTime as number)
    if (shutter) exifOut.shutter = shutter

    const iso = rawExif.ISO as number | undefined
    if (iso) exifOut.iso = iso

    const capturedAt = formatDate(
      (rawExif.DateTimeOriginal ?? rawExif.CreateDate) as Date | undefined
    )

    const gpsLat = dmsToDecimal(rawExif.GPSLatitude, rawExif.GPSLatitudeRef)
    const gpsLon = dmsToDecimal(rawExif.GPSLongitude, rawExif.GPSLongitudeRef)
    const hasGPS = gpsLat != null && gpsLon != null
    if (hasGPS) gpsCount++

    // Detect panorama from image dimensions
    const exifW = (rawExif.PixelXDimension ?? rawExif.ImageWidth)  as number | undefined
    const exifH = (rawExif.PixelYDimension ?? rawExif.ImageLength) as number | undefined
    const panorama = isPanorama(filePath, exifW, exifH)

    // 4. Merge with existing
    if (existing.has(id)) {
      const prev = existing.get(id)!
      results.push({
        ...prev,                   // preserve all human-edited fields
        src,                       // refresh src (in case file moved)
        exif: exifOut,             // refresh EXIF block
        captured_at: capturedAt || prev.captured_at,
        location: {
          ...prev.location,
          lat: hasGPS ? (gpsLat ?? prev.location.lat) : prev.location.lat,
          lon: hasGPS ? (gpsLon ?? prev.location.lon) : prev.location.lon,
        },
      })
    } else {
      addedCount++
      results.push({
        id,
        src,
        title:       '',
        captured_at: capturedAt,
        location: {
          lat:  hasGPS ? (gpsLat ?? null) : null,
          lon:  hasGPS ? (gpsLon ?? null) : null,
          name: '',
        },
        exif:     exifOut,
        caption:  '',
        featured: false,
        panorama,
      })
    }
  }

  // 5. Sort by captured_at descending (empty dates go last)
  results.sort((a, b) => {
    if (!a.captured_at && !b.captured_at) return 0
    if (!a.captured_at) return 1
    if (!b.captured_at) return -1
    return b.captured_at.localeCompare(a.captured_at)
  })

  // 6. Write
  writeFileSync(INDEX_PATH, JSON.stringify(results, null, 2) + '\n', 'utf8')

  // 7. Summary
  console.log('\n╔══════════════════════════════════════')
  console.log(`║  Photography index built`)
  console.log(`╠══════════════════════════════════════`)
  console.log(`║  Files scanned : ${files.length}`)
  console.log(`║  Pre-existing  : ${existingCount} (${existingCount - addedCount} matched, human fields preserved)`)
  console.log(`║  Added new     : ${addedCount}`)
  console.log(`║  Had GPS data  : ${gpsCount}`)
  console.log(`║  Output        : content/photography/index.json`)
  console.log('╚══════════════════════════════════════\n')
  console.log('Next steps: fill in title, caption, location.name, featured, panorama')
  console.log('for each entry marked with empty strings.\n')
}

main().catch(err => { console.error(err); process.exit(1) })
