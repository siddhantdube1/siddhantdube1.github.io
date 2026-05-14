'use client'

import { useState, useEffect, useRef } from 'react'

const QUOTES = [
  { text: '"Mathematics is the music of reason."', author: '— Sylvester', triggerId: 'log' },
  { text: '"The eye sees only what the mind is prepared to comprehend."', author: '— Bergson', triggerId: 'payloads' },
  { text: '"The universe is under no obligation to make sense to you."', author: '— Tyson', triggerId: 'channel' },
]

export function PhilosophyCrossfade() {
  const [active, setActive] = useState<number | null>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const observers: IntersectionObserver[] = []

    QUOTES.forEach((q, i) => {
      const el = document.getElementById(q.triggerId)
      if (!el) return

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActive(i)
            timers.current.forEach(clearTimeout)
            timers.current = [
              setTimeout(() => setActive(null), 4000),
            ]
          }
        },
        { threshold: 0.3 }
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => {
      observers.forEach(o => o.disconnect())
      timers.current.forEach(clearTimeout)
    }
  }, [])

  if (active === null) return null

  const q = QUOTES[active]

  return (
    <div
      className="fixed right-6 top-1/2 -translate-y-1/2 z-40 pointer-events-none max-w-xs text-right"
      style={{
        animation: 'philoFade 4s ease-in-out',
      }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes philoFade {
          0%   { opacity: 0 }
          15%  { opacity: 1 }
          75%  { opacity: 1 }
          100% { opacity: 0 }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes philoFade { 0%, 100% { opacity: 0 } }
        }
      `}</style>
      <p className="font-serif-inscription italic text-sm leading-relaxed" style={{ color: 'var(--ink-dim)', opacity: 0.65 }}>
        {q.text}
      </p>
      <p className="font-mono-display text-[10px] mt-1" style={{ color: 'var(--ink-dim)', opacity: 0.45 }}>
        {q.author}
      </p>
    </div>
  )
}
