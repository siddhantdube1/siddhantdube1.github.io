import { NextResponse } from 'next/server'

export const revalidate = 5 // 5-second server cache

const FALLBACK = { latitude: -23.41, longitude: 117.82, altitude: 408, velocity: 27600 }

export async function GET() {
  try {
    const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544', {
      next: { revalidate: 5 },
    })
    if (!res.ok) throw new Error(`upstream ${res.status}`)
    const raw = await res.json()
    return NextResponse.json({
      status: 'ok',
      data: {
        latitude: raw.latitude,
        longitude: raw.longitude,
        altitude: raw.altitude,
        velocity: raw.velocity,
      },
      fetched_at: new Date().toISOString(),
      source: 'wheretheiss.at',
    })
  } catch {
    return NextResponse.json({
      status: 'error',
      data: FALLBACK,
      fetched_at: new Date().toISOString(),
      source: 'fallback',
    })
  }
}
