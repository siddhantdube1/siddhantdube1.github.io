'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useTheme } from './ThemeProvider'

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

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15.5 10.5A7 7 0 0 1 7.5 2.5a7 7 0 1 0 8 8z" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="9" r="3.5" />
      <line x1="9"    y1="1"    x2="9"    y2="3"    />
      <line x1="9"    y1="15"   x2="9"    y2="17"   />
      <line x1="1"    y1="9"    x2="3"    y2="9"    />
      <line x1="15"   y1="9"    x2="17"   y2="9"    />
      <line x1="3.05" y1="3.05" x2="4.46" y2="4.46" />
      <line x1="13.54" y1="13.54" x2="14.95" y2="14.95" />
      <line x1="3.05" y1="14.95" x2="4.46" y2="13.54" />
      <line x1="13.54" y1="4.46" x2="14.95" y2="3.05" />
    </svg>
  )
}

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
  const { theme, toggleTheme } = useTheme()
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

        {/* Theme toggle + mobile menu */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded transition-colors duration-150"
            style={{ color: 'var(--ink-dim)' }}
            aria-label={theme === 'dark' ? 'Switch to Daylight Recovery' : 'Switch to Night Ops'}
            title={theme === 'dark' ? 'DAYLIGHT RECOVERY' : 'NIGHT OPS'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

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
  )
}
