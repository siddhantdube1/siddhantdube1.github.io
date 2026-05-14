import { NextResponse } from 'next/server'

export const revalidate = 300 // 5-minute cache

export async function GET() {
  try {
    const res = await fetch(
      'https://services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json',
      { next: { revalidate: 300 } }
    )
    if (!res.ok) throw new Error(`upstream ${res.status}`)
    const raw: string[][] = await res.json()
    // rows: [timestamp, density, speed, temperature] — skip header row
    const dataRows = raw.filter(r => r[0] !== 'time_tag' && r[2] !== null && r[2] !== '-9999.9')
    const latest = dataRows[dataRows.length - 1]
    if (!latest) throw new Error('no data rows')
    const speed = parseFloat(latest[2])
    if (isNaN(speed) || speed < 0) throw new Error('invalid speed')
    return NextResponse.json({
      status: 'ok',
      data: { speed_km_s: Math.round(speed), timestamp: latest[0] },
      fetched_at: new Date().toISOString(),
      source: 'services.swpc.noaa.gov',
    })
  } catch {
    return NextResponse.json({
      status: 'error',
      data: { speed_km_s: 412, timestamp: '' },
      fetched_at: new Date().toISOString(),
      source: 'fallback',
    })
  }
}
