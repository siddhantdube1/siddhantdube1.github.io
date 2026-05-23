'use client'

import { useEffect, useRef } from 'react'

// Non-convex loss: sum of 4 Gaussians (3 wells + central bump) → global min,
// 2 shallower local minima, and a saddle so random starts land in different basins.
const DISPLAY = 80, WORLD_HALF = 1.0, LR = 0.02
const MAX_STEPS = 300, CONVERGE_GRAD = 0.05, TRAIL_LEN = 30
const LEVELS = [-0.85, -0.55, -0.25, 0.0, 0.2]

const PEAKS = [
  { cx: -0.45, cy:  0.10, amp: -1.00, sigma: 0.32 },  // global min
  { cx:  0.50, cy:  0.40, amp: -0.55, sigma: 0.28 },  // local min
  { cx:  0.30, cy: -0.55, amp: -0.35, sigma: 0.25 },  // shallow local min
  { cx:  0.00, cy:  0.00, amp:  0.30, sigma: 0.22 },  // central bump → saddle
]

function loss(x: number, y: number): number {
  let s = 0
  for (const p of PEAKS) {
    const dx = x - p.cx, dy = y - p.cy
    s += p.amp * Math.exp(-(dx*dx + dy*dy) / (2*p.sigma*p.sigma))
  }
  return s
}

function gradient(x: number, y: number): [number, number] {
  let gx = 0, gy = 0
  for (const p of PEAKS) {
    const dx = x - p.cx, dy = y - p.cy
    const k = p.amp * Math.exp(-(dx*dx + dy*dy) / (2*p.sigma*p.sigma)) / (p.sigma*p.sigma)
    gx -= k * dx
    gy -= k * dy
  }
  return [gx, gy]
}

function hexToRgb(h: string): [number, number, number] {
  const c = h.replace(/[^0-9a-f]/gi, '')
  return [parseInt(c.slice(0,2), 16), parseInt(c.slice(2,4), 16), parseInt(c.slice(4,6), 16)]
}

function readCSS(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888'
}

function randStart(): [number, number] {
  return [(Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 1.6]
}

export function GradientDescentSim() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = window.devicePixelRatio || 1
    const N = Math.round(DISPLAY * dpr)        // internal pixel grid
    canvas.width = N
    canvas.height = N
    canvas.style.width = `${DISPLAY}px`
    canvas.style.height = `${DISPLAY}px`
    // No setTransform — render directly in N×N pixel space so putImageData
    // and our line drawing both speak the same coordinate system.

    const pxToWorld = (px: number) => (px / N - 0.5) * 2 * WORLD_HALF
    const worldToPx = (x: number) => (x / (2 * WORLD_HALF) + 0.5) * N

    // Precompute loss field once (sized to internal canvas).
    const field = new Float32Array(N * N)
    for (let py = 0; py < N; py++) {
      for (let px = 0; px < N; px++) {
        field[py*N + px] = loss(pxToWorld(px), pxToWorld(py))
      }
    }

    let inert = hexToRgb(readCSS('--inert'))
    let instrument = readCSS('--instrument')
    let contourImg = ctx.createImageData(N, N)

    // Sign-change detection across LEVELS — a pixel is "on the contour" if
    // any level lies between its loss and its right/down neighbor's loss.
    // Produces clean one-pixel hairlines without marching squares.
    const renderContours = () => {
      const img = ctx.createImageData(N, N)
      const d = img.data
      for (let py = 0; py < N - 1; py++) {
        for (let px = 0; px < N - 1; px++) {
          const L  = field[py*N + px]
          const Lr = field[py*N + px + 1]
          const Lb = field[(py+1)*N + px]
          for (const lvl of LEVELS) {
            if ((L - lvl) * (Lr - lvl) < 0 || (L - lvl) * (Lb - lvl) < 0) {
              const i = (py*N + px) * 4
              d[i] = inert[0]; d[i+1] = inert[1]; d[i+2] = inert[2]; d[i+3] = 130
              break
            }
          }
        }
      }
      contourImg = img
    }
    renderContours()

    let pos: [number, number] = randStart()
    const trail: [number, number][] = []
    let steps = 0

    const draw = () => {
      ctx.putImageData(contourImg, 0, 0)
      ctx.lineWidth = Math.max(1, dpr)
      ctx.strokeStyle = instrument
      for (let i = 1; i < trail.length; i++) {
        ctx.globalAlpha = (i / trail.length) * 0.75
        ctx.beginPath()
        ctx.moveTo(worldToPx(trail[i-1][0]), worldToPx(trail[i-1][1]))
        ctx.lineTo(worldToPx(trail[i][0]),   worldToPx(trail[i][1]))
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      ctx.fillStyle = instrument
      ctx.beginPath()
      ctx.arc(worldToPx(pos[0]), worldToPx(pos[1]), 1.8 * dpr, 0, Math.PI * 2)
      ctx.fill()
    }

    const gdStep = () => {
      const [gx, gy] = gradient(pos[0], pos[1])
      pos[0] -= LR * gx
      pos[1] -= LR * gy
      trail.push([pos[0], pos[1]])
      if (trail.length > TRAIL_LEN) trail.shift()
      steps++
      const gmag = Math.sqrt(gx*gx + gy*gy)
      if (gmag < CONVERGE_GRAD || steps > MAX_STEPS) {
        pos = randStart()
        trail.length = 0
        steps = 0
      }
    }

    if (reduced) {
      for (let i = 0; i < 120; i++) gdStep()
      draw()
      return
    }

    let rafId: number | null = null
    let running = true

    const tick = () => {
      rafId = null
      if (!running) return
      gdStep()
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

    const themeObs = new MutationObserver(() => {
      inert = hexToRgb(readCSS('--inert'))
      instrument = readCSS('--instrument')
      renderContours()
    })
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
      style={{ display: 'block' }}
    />
  )
}
