'use client'

import { useState, useEffect, useCallback } from 'react'
import { getMoonData } from '@/lib/moon'

// ─── Types ────────────────────────────────────────────────────────────────────

type FeedStatus = 'ok' | 'stale' | 'error' | 'loading'

interface Widget<T> {
  status: FeedStatus
  data: T
  fetched_at?: string
}

interface ISSData  { latitude: number; longitude: number; altitude: number; velocity: number }
interface APODData { title: string; date: string; url: string; hdurl?: string; explanation?: string }
interface NEOData  { count: number; date: string }
interface MoonDataLocal { phase: number; phaseName: string }
interface SolarWindData { speed_km_s: number; timestamp: string }
interface LaunchData    { name: string; net: string; pad?: string; provider?: string }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusColor(s: FeedStatus): string {
  if (s === 'ok')      return 'var(--instrument)'
  if (s === 'stale')   return 'var(--warning)'
  return 'var(--ink-dim)'
}

function StatusTag({ s }: { s: FeedStatus }) {
  if (s === 'ok') return null
  return (
    <span className="font-mono-display text-[9px] ml-1" style={{ color: statusColor(s) }}>
      {s === 'stale' ? ' STALE' : s === 'loading' ? '' : ' LAST KNOWN'}
    </span>
  )
}

async function fetchFeed<T>(url: string): Promise<{ status: FeedStatus; data: T; fetched_at: string }> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

function isStale(fetched_at: string | undefined, maxAgeMs: number): boolean {
  if (!fetched_at) return false
  return Date.now() - new Date(fetched_at).getTime() > maxAgeMs
}

// ─── Widget container ─────────────────────────────────────────────────────────

function WidgetBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="p-3 rounded border"
      style={{ borderColor: 'var(--inert)', background: 'var(--bg-elevated)' }}
    >
      <p className="font-mono-display text-[10px] tracking-widest mb-1" style={{ color: 'var(--ink-dim)' }}>
        {label}
      </p>
      <div className="font-mono-display text-xs" style={{ color: 'var(--instrument)' }}>
        {children}
      </div>
    </div>
  )
}

// ─── Individual widgets ───────────────────────────────────────────────────────

function ISSWidget() {
  const FALLBACK: ISSData = { latitude: -23.4, longitude: 117.8, altitude: 408, velocity: 27600 }
  const [w, setW] = useState<Widget<ISSData>>({ status: 'loading', data: FALLBACK })

  const poll = useCallback(async () => {
    try {
      const r = await fetchFeed<ISSData>('/api/telemetry/iss')
      const stale = isStale(r.fetched_at, 30_000)
      setW({ status: stale ? 'stale' : 'ok', data: r.data, fetched_at: r.fetched_at })
    } catch {
      setW(prev => ({ ...prev, status: prev.fetched_at ? 'stale' : 'error' }))
    }
  }, [])

  useEffect(() => {
    poll()
    const id = setInterval(poll, 5000)
    return () => clearInterval(id)
  }, [poll])

  return (
    <WidgetBox label="ISS POSITION">
      <p aria-live="polite" style={{ color: statusColor(w.status) }}>
        LAT&nbsp;&nbsp;{w.data.latitude.toFixed(1)}°&nbsp;&nbsp;LON&nbsp;&nbsp;{w.data.longitude.toFixed(1)}°
        <StatusTag s={w.status} />
      </p>
      <p className="text-[10px] mt-0.5" style={{ color: 'var(--ink-dim)' }}>
        ALT {Math.round(w.data.altitude)} km
      </p>
    </WidgetBox>
  )
}

function MoonWidget() {
  const [data, setData] = useState<MoonDataLocal | null>(null)

  useEffect(() => {
    const compute = () => {
      try {
        const d = getMoonData(new Date())
        setData({ phase: d.phase, phaseName: d.phaseName })
      } catch {
        setData({ phase: 0.67, phaseName: 'WAXING GIBBOUS' })
      }
    }
    compute()
    const id = setInterval(compute, 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <WidgetBox label="MOON PHASE">
      {data ? (
        <p style={{ color: 'var(--instrument)' }}>
          {data.phaseName} · {Math.round(data.phase * 100)}%
        </p>
      ) : (
        <p style={{ color: 'var(--ink-dim)' }}>COMPUTING<span className="blink">_</span></p>
      )}
    </WidgetBox>
  )
}

function APODWidget() {
  const FALLBACK: APODData = { title: 'Pillars of Creation', date: '—', url: '' }
  const [w, setW] = useState<Widget<APODData>>({ status: 'loading', data: FALLBACK })

  useEffect(() => {
    fetchFeed<APODData>('/api/telemetry/apod')
      .then(r => setW({ status: 'ok', data: r.data, fetched_at: r.fetched_at }))
      .catch(() => setW({ status: 'error', data: FALLBACK }))
  }, [])

  return (
    <WidgetBox label="APOD">
      {w.status === 'loading' ? (
        <p style={{ color: 'var(--ink-dim)' }}>ACQUIRING<span className="blink">_</span></p>
      ) : (
        <div className="flex gap-2 items-start">
          {w.data.url && (
            <a href={w.data.hdurl || w.data.url} target="_blank" rel="noopener noreferrer" aria-label={`APOD: ${w.data.title}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={w.data.url}
                alt={w.data.title}
                width={40} height={40}
                className="object-cover flex-shrink-0"
                style={{ border: '1px solid var(--inert)', imageRendering: 'auto' }}
              />
            </a>
          )}
          <div>
            <p style={{ color: statusColor(w.status) }} className="leading-snug text-[10px]">
              {w.data.date}<StatusTag s={w.status} />
            </p>
            <p className="text-[10px] leading-snug mt-0.5 line-clamp-2" style={{ color: 'var(--ink-dim)' }}>
              {w.data.title}
            </p>
          </div>
        </div>
      )}
    </WidgetBox>
  )
}

function NEOWidget() {
  const [w, setW] = useState<Widget<NEOData>>({ status: 'loading', data: { count: 0, date: '' } })

  useEffect(() => {
    fetchFeed<NEOData>('/api/telemetry/neos')
      .then(r => setW({ status: 'ok', data: r.data }))
      .catch(() => setW({ status: 'error', data: { count: 8, date: '' } }))
  }, [])

  return (
    <WidgetBox label="NEO PASSES TODAY">
      {w.status === 'loading' ? (
        <p style={{ color: 'var(--ink-dim)' }}>ACQUIRING<span className="blink">_</span></p>
      ) : (
        <p style={{ color: statusColor(w.status) }}>
          {w.data.count}<StatusTag s={w.status} />
        </p>
      )}
    </WidgetBox>
  )
}

function VoyagerWidget({ met }: { met: string }) {
  return (
    <WidgetBox label="V1 · MISSION ELAPSED TIME">
      <p aria-live="polite" style={{ color: 'var(--instrument)' }}>{met || '—'}</p>
    </WidgetBox>
  )
}

// ─── Solar wind (used in Mission Log header) ──────────────────────────────────

export function SolarWindBadge() {
  const [data, setData] = useState<SolarWindData | null>(null)

  useEffect(() => {
    fetchFeed<SolarWindData>('/api/telemetry/solar-wind')
      .then(r => setData(r.data))
      .catch(() => setData({ speed_km_s: 412, timestamp: '' }))
  }, [])

  return (
    <span className="font-mono-display text-xs" style={{ color: 'var(--ink-dim)' }}>
      SOLAR WIND&nbsp;·&nbsp;
      <span style={{ color: 'var(--instrument)' }}>
        {data ? `${data.speed_km_s} km/s` : '— km/s'}
      </span>
    </span>
  )
}

// ─── Next launch (used in bottom ticker) ─────────────────────────────────────

export function useNextLaunch() {
  const [data, setData] = useState<LaunchData | null>(null)

  useEffect(() => {
    fetchFeed<LaunchData>('/api/telemetry/launches')
      .then(r => setData(r.data))
      .catch(() => {})
  }, [])

  return data
}

// ─── Hero telemetry stack (all widgets together) ──────────────────────────────

export function HeroTelemetry({ voyagerMET }: { voyagerMET: string }) {
  return (
    <div className="font-mono-display text-xs space-y-3" style={{ minWidth: 220 }}>
      <p className="tracking-widest mb-1 text-[10px]" style={{ color: 'var(--ink-dim)' }}>
        TELEMETRY // LIVE
      </p>
      <ISSWidget />
      <MoonWidget />
      <APODWidget />
      <NEOWidget />
      <VoyagerWidget met={voyagerMET} />
    </div>
  )
}
