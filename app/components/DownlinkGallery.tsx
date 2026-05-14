'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import FocusTrap from 'focus-trap-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PhotoLocation { lat: number; lon: number; name: string }
interface PhotoExif {
  camera?: string; lens?: string; focal?: string
  aperture?: string; shutter?: string; iso?: number
}

export interface Photo {
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

// ─── Metadata sidebar ─────────────────────────────────────────────────────────

function MetaSidebar({ photo }: { photo: Photo }) {
  const { exif, location } = photo
  const instrument = [exif.camera, exif.lens].filter(Boolean).join(' · ')
  const exposure   = [
    exif.shutter && `${exif.shutter}`,
    exif.aperture,
    exif.iso && `ISO ${exif.iso}`,
  ].filter(Boolean).join(' @ ')

  return (
    <div className="font-mono-display text-xs space-y-2 p-4 border-t md:border-t-0 md:border-l md:min-w-[220px] md:max-w-[220px]" style={{ borderColor: 'var(--inert)', color: 'var(--ink-dim)' }}>
      <p className="font-bold" style={{ color: 'var(--instrument)' }}>{photo.id.toUpperCase()}</p>
      <div className="h-px" style={{ background: 'var(--inert)' }} />
      <p><span style={{ color: 'var(--ink)' }}>CAPTURED  </span>{photo.captured_at}</p>
      <p><span style={{ color: 'var(--ink)' }}>SECTOR    </span>{location.name.toUpperCase()}</p>
      <p><span style={{ color: 'var(--ink)' }}>COORDS    </span>{Math.abs(location.lat).toFixed(3)}°{location.lat >= 0 ? 'N' : 'S'}  {Math.abs(location.lon).toFixed(3)}°{location.lon >= 0 ? 'E' : 'W'}</p>
      {instrument && <p><span style={{ color: 'var(--ink)' }}>INSTRUMENT</span><br />{instrument}</p>}
      {exposure   && <p><span style={{ color: 'var(--ink)' }}>EXPOSURE  </span>{exposure}</p>}
      {exif.focal && <p><span style={{ color: 'var(--ink)' }}>FOCAL     </span>{exif.focal}</p>}
      <div className="h-px" style={{ background: 'var(--inert)' }} />
      <p className="leading-relaxed italic">{photo.caption}</p>
    </div>
  )
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

interface LightboxProps {
  photos: Photo[]
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

function Lightbox({ photos, index, onClose, onPrev, onNext }: LightboxProps) {
  const photo = photos[index]

  // Arrow-key navigation stays on window so it works regardless of focus position.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onPrev, onNext])

  return (
    // FocusTrap handles ESC via onDeactivate and cycles Tab within the modal.
    <FocusTrap
      focusTrapOptions={{
        onDeactivate: onClose,
        clickOutsideDeactivates: true,
        escapeDeactivates: true,
        initialFocus: '[data-lightbox-close]',
      }}
    >
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ background: 'rgba(4,6,13,0.95)' }}
        role="dialog"
        aria-modal="true"
        aria-label={`Photo lightbox: ${photo.title}`}
      >
        <div
          className="relative flex flex-col md:flex-row max-w-5xl w-full mx-4 rounded"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--inert)' }}
        >
          {/* Close */}
          <button
            data-lightbox-close
            onClick={onClose}
            className="absolute top-3 right-3 z-10 p-1 rounded transition-colors duration-150"
            style={{ color: 'var(--ink-dim)' }}
            aria-label="Close lightbox"
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--instrument)')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-dim)')}
          >
            <X size={18} />
          </button>

          {/* Image */}
          <div className="relative flex-1 min-h-[280px] md:min-h-[420px]">
            <Image
              src={photo.src}
              alt={photo.title}
              fill
              className="object-contain rounded-t md:rounded-l md:rounded-tr-none"
              sizes="(max-width: 768px) 100vw, 70vw"
            />
            {/* Prev / Next */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={onPrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded transition-colors duration-150"
                  style={{ color: 'var(--ink-dim)', background: 'var(--bg-elevated)' }}
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={onNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded transition-colors duration-150"
                  style={{ color: 'var(--ink-dim)', background: 'var(--bg-elevated)' }}
                  aria-label="Next photo"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Metadata */}
          <MetaSidebar photo={photo} />
        </div>
      </div>
    </FocusTrap>
  )
}

// ─── Gallery grid ─────────────────────────────────────────────────────────────

interface DownlinkGalleryProps {
  photos: Photo[]
}

export function DownlinkGallery({ photos }: DownlinkGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  // Track the element that triggered the lightbox so we can return focus on close.
  const triggerRef = useRef<HTMLElement | null>(null)

  const featured = photos.filter(p => p.featured)
  const hero = featured[Math.floor(Date.now() / 86400000) % Math.max(featured.length, 1)]

  const open = (i: number, trigger: HTMLElement) => {
    triggerRef.current = trigger
    setLightboxIndex(i)
  }
  const close = useCallback(() => {
    setLightboxIndex(null)
    triggerRef.current?.focus()
    triggerRef.current = null
  }, [])
  const prev  = useCallback(() => setLightboxIndex(i => i === null ? null : (i - 1 + photos.length) % photos.length), [photos.length])
  const next  = useCallback(() => setLightboxIndex(i => i === null ? null : (i + 1) % photos.length), [photos.length])

  return (
    <>
      {/* Featured hero image */}
      {hero && (
        <div
          className="relative w-full mb-8 rounded overflow-hidden cursor-pointer"
          style={{ height: 300, border: '1px solid var(--inert)' }}
          onClick={e => open(photos.indexOf(hero), e.currentTarget as HTMLElement)}
          role="button"
          tabIndex={0}
          aria-label={`Open featured photo: ${hero.title}`}
          onKeyDown={e => e.key === 'Enter' && open(photos.indexOf(hero), e.currentTarget as HTMLElement)}
        >
          <Image
            src={hero.src}
            alt={hero.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div
            className="absolute bottom-0 left-0 right-0 px-4 py-3 font-mono-display text-xs"
            style={{ background: 'linear-gradient(transparent, rgba(4,6,13,0.85))', color: 'var(--ink-dim)' }}
          >
            <span style={{ color: 'var(--instrument)' }}>{hero.id.toUpperCase()}</span>
            {' · '}FEATURED · {hero.captured_at}
          </div>
        </div>
      )}

      {/* Thumbnail grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={e => open(i, e.currentTarget as HTMLElement)}
            className="relative overflow-hidden rounded transition-opacity duration-150"
            style={{ aspectRatio: '4/3', border: '1px solid var(--inert)' }}
            aria-label={`Open photo: ${photo.title}`}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--instrument)')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--inert)')}
          >
            <Image
              src={photo.src}
              alt={photo.title}
              fill
              className="object-cover"
              loading="lazy"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
            <div
              className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-150 flex items-end p-2"
              style={{ background: 'linear-gradient(transparent 50%, rgba(4,6,13,0.8))' }}
            >
              <p className="font-mono-display text-[10px] text-left leading-tight" style={{ color: 'var(--ink-dim)' }}>
                {photo.title}
              </p>
            </div>
          </button>
        ))}
      </div>

      {photos.length === 0 && (
        <div className="py-16 text-center font-mono-display text-xs" style={{ color: 'var(--ink-dim)' }}>
          // NO IMAGERY ON FILE — CHECK BACK SOON
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          index={lightboxIndex}
          onClose={close}
          onPrev={prev}
          onNext={next}
        />
      )}
    </>
  )
}
