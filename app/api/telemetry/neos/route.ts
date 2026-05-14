import { NextResponse } from 'next/server'

export const revalidate = 21600 // 6-hour cache

export async function GET() {
  const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY'
  const today = new Date().toISOString().slice(0, 10)
  try {
    const res = await fetch(
      `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${apiKey}`,
      { next: { revalidate: 21600 } }
    )
    if (!res.ok) throw new Error(`upstream ${res.status}`)
    const raw = await res.json()
    const count = raw.element_count ?? 0
    return NextResponse.json({
      status: 'ok',
      data: { count, date: today },
      fetched_at: new Date().toISOString(),
      source: 'api.nasa.gov/neo',
    })
  } catch {
    return NextResponse.json({
      status: 'error',
      data: { count: 8, date: today },
      fetched_at: new Date().toISOString(),
      source: 'fallback',
    })
  }
}
