import { NextResponse } from 'next/server'

export const revalidate = 1800 // 30-minute cache

interface Launch {
  name: string
  net: string // NET (No Earlier Than) timestamp
  pad?: string
}

const FALLBACK: Launch = {
  name: 'UNKNOWN — NO UPLINK',
  net: '',
  pad: '—',
}

export async function GET() {
  try {
    const res = await fetch(
      'https://ll.thespacedevs.com/2.2.0/launch/upcoming/?format=json&limit=1&status=1',
      { next: { revalidate: 1800 } }
    )
    if (!res.ok) throw new Error(`upstream ${res.status}`)
    const raw = await res.json()
    const launch = raw.results?.[0]
    if (!launch) throw new Error('no launches in response')
    return NextResponse.json({
      status: 'ok',
      data: {
        name: launch.name,
        net: launch.net,
        pad: launch.pad?.name ?? '—',
        provider: launch.launch_service_provider?.name ?? '—',
      },
      fetched_at: new Date().toISOString(),
      source: 'll.thespacedevs.com',
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
