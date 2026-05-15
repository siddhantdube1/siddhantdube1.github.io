'use client'

import { useEffect, useRef } from 'react'

// Section IDs in document order. Lines connect consecutive entries that are
// currently visible (or within VIEWPORT_SLOP_PX of the viewport).
const SECTION_IDS = ['ground', 'manifest', 'log', 'systems', 'payloads', 'downlink', 'channel']

const VIEWPORT_SLOP_PX = 200
// Spec says 0.15–0.25 opacity. Pick the midpoint and let the per-heading
// fade lerp scale it down toward 0 when leaving the slop band.
const BASE_OPACITY = 0.2
// Lerp factor toward target opacity per frame. ~0.12 reaches ~95% in 25 frames
// (~400ms at 60fps) — matches the spec's "~400ms fade".
const FADE_LERP = 0.12

interface HeadingState {
  el: HTMLElement
  opacity: number
  target: number
}

export function ConstellationOverlay() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Resolve heading elements once. If page structure changes at runtime
    // (e.g. a section is conditionally rendered), this would need to re-query;
    // not a concern for the current static layout.
    const headings: HeadingState[] = []
    for (const id of SECTION_IDS) {
      const section = document.getElementById(id)
      if (!section) continue
      const h2 = section.querySelector('h2')
      if (h2 instanceof HTMLElement) {
        headings.push({ el: h2, opacity: 0, target: 0 })
      }
    }
    if (headings.length < 2) return  // nothing to connect

    // --inert is the spec's color for atmospheric overlays. Read once;
    // re-read inside tick() is unnecessary since CSS vars rarely change.
    const readInert = () =>
      getComputedStyle(document.documentElement).getPropertyValue('--inert').trim() || '#475569'
    let inertColor = readInert()

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    let rafId: number | null = null

    const scheduleFrame = () => {
      if (rafId == null) rafId = requestAnimationFrame(tick)
    }

    const tick = () => {
      rafId = null
      const vh = window.innerHeight
      const vw = window.innerWidth

      // Update targets based on whether each heading is in viewport + slop.
      for (const h of headings) {
        const r = h.el.getBoundingClientRect()
        const visible = r.bottom > -VIEWPORT_SLOP_PX && r.top < vh + VIEWPORT_SLOP_PX
        h.target = visible ? 1 : 0
      }

      // Lerp opacity toward target; track whether any heading still animating.
      let stillAnimating = false
      for (const h of headings) {
        const delta = h.target - h.opacity
        if (Math.abs(delta) > 0.001) {
          h.opacity += delta * FADE_LERP
          stillAnimating = true
        } else {
          h.opacity = h.target
        }
      }

      // Draw consecutive line segments. Each line's opacity is the minimum of
      // its two endpoints' opacities times the base — so a line only reaches
      // full faint visibility when both ends are in band.
      ctx.clearRect(0, 0, vw, vh)
      ctx.strokeStyle = inertColor
      ctx.lineWidth = 1
      for (let i = 0; i < headings.length - 1; i++) {
        const a = headings[i]
        const b = headings[i + 1]
        const op = Math.min(a.opacity, b.opacity)
        if (op < 0.01) continue

        const ra = a.el.getBoundingClientRect()
        const rb = b.el.getBoundingClientRect()
        ctx.globalAlpha = op * BASE_OPACITY
        ctx.beginPath()
        ctx.moveTo(ra.left + ra.width / 2, ra.top + ra.height / 2)
        ctx.lineTo(rb.left + rb.width / 2, rb.top + rb.height / 2)
        ctx.stroke()
      }
      ctx.globalAlpha = 1

      if (stillAnimating) scheduleFrame()
    }

    // Re-read CSS variable on theme toggle (the `dark` class flips on <html>).
    const themeObserver = new MutationObserver(() => {
      inertColor = readInert()
      scheduleFrame()
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    const onScroll = () => scheduleFrame()
    const onResize = () => { resize(); scheduleFrame() }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })

    // Kick off an initial frame so visible-at-load headings fade in.
    scheduleFrame()

    return () => {
      if (rafId != null) cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      themeObserver.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 20,
      }}
    />
  )
}
