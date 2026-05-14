import { NextResponse } from 'next/server'

export const revalidate = 3600 // 1-hour server cache

const FALLBACK = {
  title: 'Pillars of Creation',
  date: '2024-01-01',
  url: 'https://apod.nasa.gov/apod/image/2401/PillarsCreation_Webb_960.jpg',
  hdurl: 'https://apod.nasa.gov/apod/image/2401/PillarsCreation_Webb_4000.jpg',
  explanation: 'The Pillars of Creation are towering columns of cool gas and dust.',
}

export async function GET() {
  const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY'
  try {
    const res = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) throw new Error(`upstream ${res.status}`)
    const raw = await res.json()
    return NextResponse.json({
      status: 'ok',
      data: {
        title: raw.title,
        date: raw.date,
        url: raw.media_type === 'image' ? raw.url : raw.thumbnail_url,
        hdurl: raw.hdurl,
        explanation: raw.explanation?.slice(0, 200),
        media_type: raw.media_type,
      },
      fetched_at: new Date().toISOString(),
      source: 'api.nasa.gov/planetary/apod',
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
