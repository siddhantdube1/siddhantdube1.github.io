'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'

const EarthGlobe = dynamic(
  () => import('./EarthGlobe').then(m => ({ default: m.EarthGlobe })),
  { ssr: false, loading: () => <EarthPlaceholder /> }
)

function EarthPlaceholder() {
  return (
    <div
      className="flex items-center justify-center rounded"
      style={{ border: '1px solid var(--inert)', minHeight: 320, background: 'var(--bg-elevated)', width: '100%', maxWidth: 420, aspectRatio: '1' }}
      aria-hidden="true"
    >
      <div className="text-center font-mono-display text-xs" style={{ color: 'var(--ink-dim)' }}>
        <p>◎</p>
        <p className="mt-2">EARTH · SD-01 GROUND TRACK</p>
        <p className="mt-1 text-[10px]">INITIALISING 3D RENDER<span className="blink">_</span></p>
      </div>
    </div>
  )
}

export function EarthGlobeWrapper() {
  const [issLat, setIssLat] = useState(-23.4)
  const [issLon, setIssLon] = useState(117.8)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    setIsMobile(window.innerWidth < 768)
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const pollISS = useCallback(async () => {
    try {
      const r = await fetch('/api/telemetry/iss')
      if (!r.ok) return
      const json = await r.json()
      setIssLat(json.data.latitude)
      setIssLon(json.data.longitude)
    } catch { /* keep last known */ }
  }, [])

  useEffect(() => {
    pollISS()
    // 30s on mobile saves cellular bandwidth and avoids waking the WebGL
    // context every 5s for a marker reposition that's invisible at this scale.
    const id = setInterval(pollISS, isMobile ? 30000 : 5000)
    return () => clearInterval(id)
  }, [pollISS, isMobile])

  return (
    <div
      className="flex items-center justify-center"
      aria-label="Photoreal Earth with real-time day/night terminator, Kuala Lumpur ground marker, and live ISS position"
    >
      <EarthGlobe
        issLat={issLat}
        issLon={issLon}
        reducedMotion={reducedMotion}
        isMobile={isMobile}
      />
    </div>
  )
}
