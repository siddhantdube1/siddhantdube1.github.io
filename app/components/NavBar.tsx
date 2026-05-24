'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
const NAV_LINKS = [
  { label: 'GROUND',   href: '#ground'   },
  { label: 'MANIFEST', href: '#manifest'  },
  { label: 'LOG',      href: '#log'       },
  { label: 'SYSTEMS',  href: '#systems'   },
  { label: 'PAYLOADS', href: '#payloads'  },
  { label: 'DOWNLINK', href: '#downlink'  },
  { label: 'TX',       href: '/blog'      },
  { label: 'CHANNEL',  href: '#channel'   },
]

function scrollToSection(href: string) {
  if (href.startsWith('#')) {
    const el = document.getElementById(href.slice(1))
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - 64
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }
}

export function NavBar() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('ground')

  useEffect(() => {
    const ids = ['ground', 'manifest', 'log', 'systems', 'payloads', 'downlink', 'channel']
    const onScroll = () => {
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 120 && rect.bottom >= 120) {
            setActive(id)
            break
          }
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Skip to main content — visible on focus for keyboard users */}
      <a
        href="#ground"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[999] focus:px-4 focus:py-2 focus:text-xs focus:font-mono-display focus:rounded"
        style={{ background: 'var(--instrument)', color: 'var(--bg)' } as React.CSSProperties}
      >
        SKIP TO CONTENT
      </a>
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{
        background: 'var(--bg-elevated)',
        borderColor: 'var(--inert)',
      }}
      aria-label="Site navigation"
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Wordmark */}
        <button
          onClick={() => scrollToSection('#ground')}
          className="font-mono-display text-sm font-bold tracking-widest"
          style={{ color: 'var(--instrument)' }}
          aria-label="Return to top"
        >
          SD-01
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ label, href }) => {
            const sectionId = href.startsWith('#') ? href.slice(1) : null
            const isActive = sectionId === active
            return href.startsWith('/') ? (
              <Link
                key={label}
                href={href}
                className="font-mono-display text-xs tracking-widest transition-colors duration-150"
                style={{ color: isActive ? 'var(--instrument)' : 'var(--ink-dim)' }}
              >
                {label}
              </Link>
            ) : (
              <button
                key={label}
                onClick={() => { scrollToSection(href); setOpen(false) }}
                className="font-mono-display text-xs tracking-widest transition-colors duration-150"
                style={{ color: isActive ? 'var(--instrument)' : 'var(--ink-dim)' }}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Mobile menu */}
        <div className="flex items-center gap-2">
          <button
            className="md:hidden p-2 rounded"
            style={{ color: 'var(--ink-dim)' }}
            onClick={() => setOpen(v => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile slide-down */}
      {open && (
        <div
          className="md:hidden border-t py-2"
          style={{ background: 'var(--bg-elevated)', borderColor: 'var(--inert)' }}
        >
          {NAV_LINKS.map(({ label, href }) =>
            href.startsWith('/') ? (
              <Link
                key={label}
                href={href}
                className="block px-6 py-3 font-mono-display text-xs tracking-widest"
                style={{ color: 'var(--ink-dim)' }}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ) : (
              <button
                key={label}
                className="block w-full text-left px-6 py-3 font-mono-display text-xs tracking-widest"
                style={{ color: 'var(--ink-dim)' }}
                onClick={() => { scrollToSection(href); setOpen(false) }}
              >
                {label}
              </button>
            )
          )}
        </div>
      )}
    </nav>
    </>
  )
}
