'use client'

import { useState, useEffect, useCallback } from 'react'

const DESKTOP_LINES = [
  '> ESTABLISHING UPLINK ...',
  '> HANDSHAKE  ............  OK',
  '> AUTHENTICATING OPERATOR  ............  SD-01',
  '> LOADING TELEMETRY ARRAY  ............  OK',
  '> WELCOME, OPERATOR.',
  '> SCROLL TO ENTER LOG.',
]

const MOBILE_LINES = [
  '> ESTABLISHING UPLINK ...',
  '> HANDSHAKE  ............  OK',
  '> WELCOME, OPERATOR.',
]

const LINE_DELAY_MS = 280
const FADE_OUT_MS   = 300

export function BootSequence({ onDone }: { onDone: () => void }) {
  const [lines, setLines]     = useState<string[]>([])
  const [fading, setFading]   = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const finish = useCallback(() => {
    setFading(true)
    setTimeout(onDone, FADE_OUT_MS)
  }, [onDone])

  useEffect(() => {
    // Skip entirely under prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onDone()
      return
    }

    const mobile = window.innerWidth < 768
    setIsMobile(mobile)
    const sequence = mobile ? MOBILE_LINES : DESKTOP_LINES

    // Skip on any user interaction
    const skip = () => finish()
    window.addEventListener('keydown', skip,  { once: true })
    window.addEventListener('click',   skip,  { once: true })
    window.addEventListener('touchstart', skip, { once: true })

    let i = 0
    const show = () => {
      if (i < sequence.length) {
        setLines(prev => [...prev, sequence[i]])
        i++
        setTimeout(show, LINE_DELAY_MS)
      } else {
        // Auto-finish after last line
        setTimeout(finish, 600)
      }
    }
    // Small initial delay so the page paints first
    const t = setTimeout(show, 100)

    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', skip)
      window.removeEventListener('click',   skip)
      window.removeEventListener('touchstart', skip)
    }
  }, [finish])

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center px-8"
      style={{
        background: 'var(--bg)',
        opacity: fading ? 0 : 1,
        transition: `opacity ${FADE_OUT_MS}ms cubic-bezier(0.4,0,0.2,1)`,
      }}
      aria-live="polite"
      aria-label="Boot sequence — press any key to skip"
    >
      <div className="w-full max-w-xl space-y-2">
        {lines.map((line, i) => (
          <p
            key={i}
            className="font-mono-display text-sm md:text-base"
            style={{ color: 'var(--instrument)' }}
          >
            {line}
          </p>
        ))}
        {/* Blinking cursor on last line */}
        {lines.length > 0 && lines.length < (isMobile ? MOBILE_LINES : DESKTOP_LINES).length && (
          <span className="font-mono-display text-sm md:text-base blink" style={{ color: 'var(--instrument)' }}>_</span>
        )}
      </div>
      <p
        className="absolute bottom-8 font-mono-display text-xs"
        style={{ color: 'var(--ink-dim)' }}
      >
        PRESS ANY KEY TO SKIP
      </p>
    </div>
  )
}
