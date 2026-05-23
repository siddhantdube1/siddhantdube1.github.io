'use client'

import { useEffect, useRef } from 'react'

// Five tokens in a horizontal row. Weights are an undirected pair strength
// (i<j only), so 5C2 = 10 curves. Every TARGET_REFRESH_MS we randomize a new
// target weight vector; per-frame lerp slides current toward target. Result
// LOOKS like attention shifting; isn't actually attention.
const N_TOKENS = 5
const TARGET_REFRESH_MS = 2500
const LERP = 0.03

const PAIRS: [number, number][] = (() => {
  const out: [number, number][] = []
  for (let i = 0; i < N_TOKENS; i++) {
    for (let j = i + 1; j < N_TOKENS; j++) out.push([i, j])
  }
  return out
})()

// Pow > 1 skews random samples toward 0 — most pairs faint, a few stand out.
// That's what attention "looks like" at any given step.
function randomWeights(): number[] {
  return PAIRS.map(() => Math.pow(Math.random(), 2.2))
}

function readColors() {
  const s = getComputedStyle(document.documentElement)
  return {
    dot:  s.getPropertyValue('--ink-dim').trim()    || '#888',
    line: s.getPropertyValue('--instrument').trim() || '#38bdf8',
  }
}

export function AttentionViz() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = window.devicePixelRatio || 1
    const W = canvas.clientWidth  || 140
    const H = canvas.clientHeight || 60
    canvas.width  = W * dpr
    canvas.height = H * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    let colors = readColors()
    let weights = randomWeights()
    let target  = randomWeights()
    let lastRefresh = performance.now()

    const cy = H / 2
    const margin = 12
    const tokenXs: number[] = []
    for (let i = 0; i < N_TOKENS; i++) {
      tokenXs.push(margin + (i / (N_TOKENS - 1)) * (W - 2 * margin))
    }
    const maxSpan = tokenXs[N_TOKENS - 1] - tokenXs[0]
    const maxPeak = H / 2 - 8

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      ctx.lineWidth = 1
      ctx.strokeStyle = colors.line
      for (let k = 0; k < PAIRS.length; k++) {
        const w = weights[k]
        if (w < 0.04) continue
        const [i, j] = PAIRS[k]
        const x1 = tokenXs[i], x2 = tokenXs[j]
        const span = x2 - x1
        // Peak excursion scales with span; control point is at 2× peak so the
        // bezier midpoint actually reaches the intended peak height.
        const peak = (span / maxSpan) * maxPeak
        const above = k % 2 === 0 ? -1 : 1
        const ctrlY = cy + above * 2 * peak
        ctx.globalAlpha = w * 0.85
        ctx.beginPath()
        ctx.moveTo(x1, cy)
        ctx.quadraticCurveTo((x1 + x2) / 2, ctrlY, x2, cy)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      ctx.fillStyle = colors.dot
      for (const x of tokenXs) {
        ctx.beginPath()
        ctx.arc(x, cy, 2.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    if (reduced) {
      weights = target
      draw()
      return
    }

    let rafId: number | null = null
    let running = true

    const tick = () => {
      rafId = null
      if (!running) return
      const now = performance.now()
      if (now - lastRefresh > TARGET_REFRESH_MS) {
        target = randomWeights()
        lastRefresh = now
      }
      for (let k = 0; k < weights.length; k++) {
        weights[k] += (target[k] - weights[k]) * LERP
      }
      draw()
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting) {
          if (!running) {
            running = true
            if (rafId == null) rafId = requestAnimationFrame(tick)
          }
        } else {
          running = false
        }
      }
    }, { threshold: 0 })
    io.observe(canvas)

    const themeObs = new MutationObserver(() => { colors = readColors() })
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => {
      if (rafId != null) cancelAnimationFrame(rafId)
      io.disconnect()
      themeObs.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
