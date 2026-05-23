'use client'

import { useEffect, useRef } from 'react'

// Dimensionless units. World [-1.5, 1.5]; reset when |x| or |y| > ESCAPE_BOUND.
const G = 1.0, MASS = 1.0, DT = 0.005, STEPS_PER_FRAME = 4
const TRAIL_LEN = 200, ESCAPE_BOUND = 3.0, SOFTENING = 0.01, WORLD_HALF = 1.5

interface Body {
  x: number; y: number; vx: number; vy: number; ax: number; ay: number
  trail: { x: number; y: number }[]
}

// Randomized equilateral-ish triangle with tangential velocities — net angular
// momentum gives orbital behavior, jitter makes every reset chaotically unique.
function makeBodies(): Body[] {
  const R = 0.6
  const baseAngle = Math.random() * Math.PI * 2
  const v = 0.7 + (Math.random() - 0.5) * 0.2
  return [0, 1, 2].map(i => {
    const a = baseAngle + (i * 2 * Math.PI) / 3 + (Math.random() - 0.5) * 0.4
    return {
      x: R * Math.cos(a),
      y: R * Math.sin(a),
      vx: -v * Math.sin(a) + (Math.random() - 0.5) * 0.1,
      vy:  v * Math.cos(a) + (Math.random() - 0.5) * 0.1,
      ax: 0, ay: 0,
      trail: [],
    }
  })
}

function computeAccel(b: Body[]) {
  for (const x of b) { x.ax = 0; x.ay = 0 }
  for (let i = 0; i < b.length; i++) {
    for (let j = i + 1; j < b.length; j++) {
      const dx = b[j].x - b[i].x
      const dy = b[j].y - b[i].y
      const r2 = dx*dx + dy*dy + SOFTENING
      const inv = 1 / (r2 * Math.sqrt(r2))     // 1 / r³
      const f = G * MASS * inv
      b[i].ax += f * dx;  b[i].ay += f * dy
      b[j].ax -= f * dx;  b[j].ay -= f * dy
    }
  }
}

// Velocity Verlet: half-kick → drift → recompute accel → half-kick. Symplectic,
// so energy stays bounded over long runs even without damping.
function step(bodies: Body[]) {
  for (const b of bodies) {
    b.vx += 0.5 * b.ax * DT
    b.vy += 0.5 * b.ay * DT
    b.x  += b.vx * DT
    b.y  += b.vy * DT
  }
  computeAccel(bodies)
  for (const b of bodies) {
    b.vx += 0.5 * b.ax * DT
    b.vy += 0.5 * b.ay * DT
  }
}

const COLOR_VARS = ['--instrument', '--warning', '--ink-dim'] as const

function readColors(): string[] {
  const s = getComputedStyle(document.documentElement)
  return COLOR_VARS.map(v => s.getPropertyValue(v).trim() || '#888')
}

export function ThreeBodySim() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = window.devicePixelRatio || 1

    let colors = readColors()
    let bodies = makeBodies()
    computeAccel(bodies)

    const size = Math.min(canvas.clientWidth, canvas.clientHeight) || 120
    canvas.width  = size * dpr
    canvas.height = size * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const toPx = (x: number, y: number) => ({
      px: (x / (WORLD_HALF * 2) + 0.5) * size,
      py: (y / (WORLD_HALF * 2) + 0.5) * size,
    })

    const draw = () => {
      ctx.clearRect(0, 0, size, size)
      ctx.lineWidth = 1
      bodies.forEach((b, i) => {
        ctx.strokeStyle = colors[i]
        for (let k = 1; k < b.trail.length; k++) {
          // alpha grows from tail (~0) to head (1); scaled down so trails stay subtle
          ctx.globalAlpha = (k / b.trail.length) * 0.7
          const a = toPx(b.trail[k - 1].x, b.trail[k - 1].y)
          const c = toPx(b.trail[k].x, b.trail[k].y)
          ctx.beginPath()
          ctx.moveTo(a.px, a.py)
          ctx.lineTo(c.px, c.py)
          ctx.stroke()
        }
        ctx.globalAlpha = 1
        ctx.fillStyle = colors[i]
        const p = toPx(b.x, b.y)
        ctx.beginPath()
        ctx.arc(p.px, p.py, 1.6, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.globalAlpha = 1
    }

    if (reduced) {
      // Pre-roll the sim, draw one static frame with a frozen trail, exit.
      for (let s = 0; s < 200; s++) {
        step(bodies)
        for (const b of bodies) {
          b.trail.push({ x: b.x, y: b.y })
          if (b.trail.length > TRAIL_LEN) b.trail.shift()
        }
      }
      draw()
      return
    }

    let rafId: number | null = null
    let running = true

    const tick = () => {
      rafId = null
      if (!running) return
      for (let s = 0; s < STEPS_PER_FRAME; s++) step(bodies)
      let escaped = false
      for (const b of bodies) {
        b.trail.push({ x: b.x, y: b.y })
        if (b.trail.length > TRAIL_LEN) b.trail.shift()
        if (Math.abs(b.x) > ESCAPE_BOUND || Math.abs(b.y) > ESCAPE_BOUND) escaped = true
      }
      if (escaped) {
        bodies = makeBodies()
        computeAccel(bodies)
      }
      draw()
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    // Pause rAF when the canvas isn't in view — no point integrating off-screen.
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
