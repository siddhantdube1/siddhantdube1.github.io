'use client'

import { useState } from 'react'

// ─── Pulsar data from Voyager Golden Record ───────────────────────────────────
// 14 pulsars selected by Frank Drake and Carl Sagan.
// Distances are in light-years from Sol, scaled for visual clarity.
// Angles are approximate to the original placard layout.
// Period in milliseconds (binary encoded as tick marks on each ray).

interface Pulsar {
  name: string
  distLy: number      // real distance in light-years
  angleDeg: number    // angle from centre (0 = right, CCW)
  periodMs: number    // pulse period in milliseconds
}

const PULSARS: Pulsar[] = [
  { name: 'PSR B1451-68', distLy:  346, angleDeg:   0, periodMs:  263 },
  { name: 'PSR B0833-45', distLy:  815, angleDeg:  27, periodMs:   89 },
  { name: 'PSR B0031-07', distLy: 2850, angleDeg:  55, periodMs:  943 },
  { name: 'PSR B0329+54', distLy: 3260, angleDeg:  88, periodMs:  715 },
  { name: 'PSR B1133+16', distLy: 3700, angleDeg: 119, periodMs:  188 },
  { name: 'PSR B0950+08', distLy:  890, angleDeg: 148, periodMs:  253 },
  { name: 'PSR B1642-03', distLy: 3300, angleDeg: 183, periodMs:  388 },
  { name: 'PSR B1055-52', distLy: 4500, angleDeg: 214, periodMs:  197 },
  { name: 'PSR B1929+10', distLy: 1110, angleDeg: 241, periodMs:  227 },
  { name: 'PSR B0950+08', distLy:  890, angleDeg: 270, periodMs:  253 },
  { name: 'PSR B0628-28', distLy: 6500, angleDeg: 298, periodMs: 1244 },
  { name: 'PSR B1508+55', distLy: 7900, angleDeg: 325, periodMs:  740 },
  { name: 'PSR B2021+51', distLy: 5700, angleDeg: 352, periodMs:  529 },
  { name: 'PSR B0611+22', distLy: 6400, angleDeg: 381, periodMs: 1484 },
]

// ─── SVG helpers ─────────────────────────────────────────────────────────────

const CX = 200   // centre X
const CY = 200   // centre Y
const MAX_LEN = 140  // max ray length in px (for the furthest pulsar)
const MAX_DIST = Math.max(...PULSARS.map(p => p.distLy))
const MAX_PERIOD = Math.max(...PULSARS.map(p => p.periodMs))

function rayEnd(angleDeg: number, length: number) {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: CX + Math.cos(rad) * length,
    y: CY - Math.sin(rad) * length,
  }
}

// Binary tick marks along a ray — 1 bit per segment
function tickMarks(
  angleDeg: number,
  length: number,
  periodMs: number,
  stroke: string
): React.ReactElement[] {
  const bits = Math.round(periodMs / 100)   // rough binary representation
  const ticks: React.ReactElement[] = []
  const rad = (angleDeg * Math.PI) / 180
  const dx  = Math.cos(rad)
  const dy  = -Math.sin(rad)
  const perpX = -dy
  const perpY = dx
  const tickLen = 5
  const spacing = length / Math.max(bits + 1, 2)

  for (let i = 0; i < bits; i++) {
    const t = (i + 1) * spacing
    const mx = CX + dx * t
    const my = CY + dy * t
    ticks.push(
      <line
        key={i}
        x1={mx - perpX * tickLen / 2}
        y1={my - perpY * tickLen / 2}
        x2={mx + perpX * tickLen / 2}
        y2={my + perpY * tickLen / 2}
        stroke={stroke}
        strokeWidth="0.8"
        opacity="0.7"
      />
    )
  }
  return ticks
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

interface TooltipState {
  pulsar: Pulsar | null
  x: number
  y: number
}

// ─── Pulsar Map SVG ───────────────────────────────────────────────────────────

export function PulsarMap() {
  const [tooltip, setTooltip] = useState<TooltipState>({ pulsar: null, x: 0, y: 0 })
  const [h2Hover, setH2Hover] = useState(false)

  const stroke = 'var(--instrument)'
  const dim    = 'var(--ink-dim)'

  return (
    <div className="relative select-none" style={{ maxWidth: 400 }}>
      <svg
        viewBox="0 0 400 440"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Voyager Golden Record pulsar map — 14 pulsars radiating from Sol, with binary-coded pulse periods"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        {/* Background */}
        <rect width="400" height="440" fill="var(--bg-elevated)" rx="2" />

        {/* Sol (centre) */}
        <circle cx={CX} cy={CY} r={4} fill={stroke} />
        <circle cx={CX} cy={CY} r={8} fill="none" stroke={stroke} strokeWidth="0.6" opacity="0.4" />

        {/* 14 pulsar rays */}
        {PULSARS.map((p, i) => {
          const len = (p.distLy / MAX_DIST) * MAX_LEN
          const end = rayEnd(p.angleDeg, len)
          const midX = CX + Math.cos((p.angleDeg * Math.PI) / 180) * len * 0.5
          const midY = CY - Math.sin((p.angleDeg * Math.PI) / 180) * len * 0.5

          return (
            <g
              key={i}
              className="cursor-crosshair"
              onMouseEnter={e => setTooltip({ pulsar: p, x: e.clientX, y: e.clientY })}
              onMouseMove={e => setTooltip(t => ({ ...t, x: e.clientX, y: e.clientY }))}
              onMouseLeave={() => setTooltip({ pulsar: null, x: 0, y: 0 })}
              role="button"
              tabIndex={0}
              aria-label={`${p.name} — ${p.distLy.toLocaleString()} ly — period ${p.periodMs}ms`}
              onFocus={e => {
                const rect = e.currentTarget.getBoundingClientRect()
                setTooltip({ pulsar: p, x: rect.right, y: rect.top })
              }}
              onBlur={() => setTooltip({ pulsar: null, x: 0, y: 0 })}
            >
              {/* Invisible hit-area */}
              <line x1={CX} y1={CY} x2={end.x} y2={end.y} stroke="transparent" strokeWidth="10" />
              {/* Visible ray */}
              <line
                x1={CX} y1={CY} x2={end.x} y2={end.y}
                stroke={stroke} strokeWidth="0.8" opacity="0.8"
              />
              {/* Binary tick marks */}
              {tickMarks(p.angleDeg, len, p.periodMs, stroke)}
              {/* Endpoint dot */}
              <circle cx={end.x} cy={end.y} r={2} fill={stroke} opacity="0.9" />
            </g>
          )
        })}

        {/* Hyperfine hydrogen unit at bottom */}
        <g
          onMouseEnter={e => setH2Hover(true)}
          onMouseLeave={() => setH2Hover(false)}
          className="cursor-help"
          role="img"
          aria-label="21cm hydrogen hyperfine unit — the universal time reference encoded on the Golden Record"
        >
          {/* Two hydrogen atoms */}
          <circle cx={130} cy={370} r={8}  fill="none" stroke={stroke} strokeWidth="0.8" />
          <circle cx={130} cy={370} r={2}  fill={stroke} />
          <circle cx={155} cy={370} r={8}  fill="none" stroke={stroke} strokeWidth="0.8" />
          <circle cx={155} cy={370} r={2}  fill={stroke} />
          {/* Connecting line */}
          <line x1={138} y1={370} x2={147} y2={370} stroke={stroke} strokeWidth="0.6" />
          {/* 21cm wavelength bracket */}
          <line x1={120} y1={385} x2={165} y2={385} stroke={stroke} strokeWidth="0.6" />
          <line x1={120} y1={382} x2={120} y2={388} stroke={stroke} strokeWidth="0.6" />
          <line x1={165} y1={382} x2={165} y2={388} stroke={stroke} strokeWidth="0.6" />
          {/* Binary 1 */}
          <line x1={200} y1={362} x2={200} y2={378} stroke={stroke} strokeWidth="0.8" />
          <text x={196} y={390} fill={dim} fontSize="7" fontFamily="monospace">1420.405 MHz</text>

          {/* Hover highlight */}
          {h2Hover && (
            <rect x={112} y={355} width={200} height={45} fill={stroke} fillOpacity="0.06" rx="2" />
          )}
        </g>

        {/* Caption */}
        <text
          x={200} y={420}
          textAnchor="middle"
          fill={dim}
          fontSize="8"
          fontFamily="monospace"
          letterSpacing="0.05em"
        >
          VOYAGER GOLDEN RECORD · PULSAR MAP · 14 PULSARS FROM SOL
        </text>

        {/* Hover tooltip — rendered inside SVG as foreignObject for font flexibility */}
        {/* (handled outside SVG via absolute div) */}
      </svg>

      {/* Tooltip */}
      {tooltip.pulsar && (
        <div
          className="fixed z-50 pointer-events-none font-mono-display text-xs px-3 py-2 rounded border"
          style={{
            left: tooltip.x + 14,
            top: tooltip.y - 10,
            background: 'var(--bg-elevated)',
            borderColor: 'var(--instrument)',
            color: 'var(--ink)',
            maxWidth: 220,
          }}
        >
          <p className="font-bold" style={{ color: 'var(--instrument)' }}>{tooltip.pulsar.name}</p>
          <p style={{ color: 'var(--ink-dim)' }}>{tooltip.pulsar.distLy.toLocaleString()} ly from Sol</p>
          <p style={{ color: 'var(--ink-dim)' }}>Period {tooltip.pulsar.periodMs} ms</p>
        </div>
      )}

      {/* H2 tooltip */}
      {h2Hover && (
        <div
          className="absolute z-50 pointer-events-none font-mono-display text-xs px-3 py-2 rounded border"
          style={{
            bottom: 80,
            left: 0,
            right: 0,
            margin: '0 auto',
            maxWidth: 320,
            background: 'var(--bg-elevated)',
            borderColor: 'var(--instrument)',
            color: 'var(--ink)',
          }}
        >
          <p style={{ color: 'var(--ink-dim)' }}>
            THE UNIT IS 1420.405 MHz — THE 21CM HYDROGEN LINE —
            IF YOU UNDERSTAND THIS, YOU UNDERSTAND THE TIMES BELOW.
          </p>
        </div>
      )}
    </div>
  )
}
