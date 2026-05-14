import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg)', color: 'var(--ink)' }}
    >
      <div className="font-mono-display text-sm space-y-4 max-w-sm w-full">
        <p className="text-lg font-bold" style={{ color: 'var(--critical)' }}>TELEMETRY DROPOUT</p>
        <div className="h-px" style={{ background: 'var(--inert)' }} />
        <p><span style={{ color: 'var(--ink-dim)' }}>SIGNAL LOST AT  </span><span style={{ color: 'var(--warning)' }}>404</span></p>
        <p style={{ color: 'var(--ink-dim)' }}>
          ATTEMPTING RECONNECT <span className="blink">. . .</span>
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-block border px-6 py-2 text-xs tracking-widest transition-colors duration-150 font-mono-display"
            style={{ borderColor: 'var(--instrument)', color: 'var(--instrument)' }}
          >
            RETURN TO BASE
          </Link>
        </div>
      </div>
    </div>
  )
}
