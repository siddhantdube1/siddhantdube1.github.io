'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

// ─── Constants ────────────────────────────────────────────────────────────────

const EARTH_RADIUS = 2
const ISS_ALTITUDE = 0.12   // scaled altitude above surface
const KL_LAT_DEG  = 3.139
const KL_LON_DEG  = 101.687
// Earth sidereal day: 86164.1 seconds → radians/second
const EARTH_RAD_PER_SEC = (2 * Math.PI) / 86164.1
// Resume sidereal auto-rotation this long after the user releases the drag.
const INTERACTION_COOLDOWN_MS = 3000

// ─── Shared interaction state ─────────────────────────────────────────────────

interface InteractionState {
  isInteracting: boolean
  lastInteractionAt: number  // performance.now() timestamp; -Infinity = never
}

// ─── Theme color palettes ─────────────────────────────────────────────────────

interface EarthColors {
  sphereFill:       string
  sphereOpacity:    number
  wire:             string
  wireOpacity:      number
  klMarker:         string   // ground station — primary accent
  issMarker:        string   // live tracking — visually distinct from KL
  markerScale:      number   // 1.0 = default; bumped in light mode for visibility
}

function earthColors(theme: 'dark' | 'light'): EarthColors {
  if (theme === 'light') {
    return {
      sphereFill:    '#ebe1cf',  // --bg-elevated parchment
      sphereOpacity: 1.0,
      wire:          '#b8860b',  // --instrument copper/brass
      wireOpacity:   0.5,
      klMarker:      '#b8860b',  // --instrument copper — matches accent system
      issMarker:     '#b91c1c',  // brick red — distinct from KL, reads on parchment
      markerScale:   1.2,        // slightly larger for visibility on light surface
    }
  }
  return {
    sphereFill:    '#04060d',  // --bg void
    sphereOpacity: 0.85,
    wire:          '#38bdf8',  // --instrument cyan
    wireOpacity:   0.55,
    klMarker:      '#38bdf8',  // --instrument cyan — ground station
    issMarker:     '#fbbf24',  // --warning amber — live tracking
    markerScale:   1.0,
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function latLonToVec3(lat: number, lon: number, r: number): THREE.Vector3 {
  const phi   = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta),
  )
}

// Convert ISS lat/lon to 3D position on sphere at ISS altitude
function issLatLonToVec3(lat: number, lon: number): THREE.Vector3 {
  return latLonToVec3(lat, lon, EARTH_RADIUS + ISS_ALTITUDE)
}

// ─── Wireframe Earth ─────────────────────────────────────────────────────────

function EarthMesh({
  colors,
  interactionRef,
}: {
  colors: EarthColors
  interactionRef: React.MutableRefObject<InteractionState>
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(EARTH_RADIUS, 3), [])

  // Accumulated rotation, advanced by delta-time only when auto-rotating.
  // Switching from "elapsed*rate" to "accumulator + dt*rate" prevents a jump
  // when resuming after a drag — paused frames don't add to the accumulator.
  const rotationRef = useRef(0)
  const lastFrameRef = useRef<number | null>(null)

  useFrame(() => {
    if (!meshRef.current) return
    const now = performance.now()
    const dt = lastFrameRef.current == null ? 0 : (now - lastFrameRef.current) / 1000
    lastFrameRef.current = now

    const { isInteracting, lastInteractionAt } = interactionRef.current
    const idleMs = now - lastInteractionAt
    const shouldAutoRotate = !isInteracting && idleMs > INTERACTION_COOLDOWN_MS

    if (shouldAutoRotate) rotationRef.current += dt * EARTH_RAD_PER_SEC
    meshRef.current.rotation.y = rotationRef.current
  })

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshBasicMaterial color={colors.sphereFill} transparent opacity={colors.sphereOpacity} side={THREE.FrontSide} />
      <lineSegments>
        <edgesGeometry args={[geometry]} />
        <lineBasicMaterial color={colors.wire} transparent opacity={colors.wireOpacity} />
      </lineSegments>
    </mesh>
  )
}

// ─── KL ground marker ────────────────────────────────────────────────────────

function KLMarker({ colors }: { colors: EarthColors }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const position = useMemo(() => latLonToVec3(KL_LAT_DEG, KL_LON_DEG, EARTH_RADIUS * 1.015), [])
  const r = 0.045 * colors.markerScale

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    const mat = meshRef.current.material as THREE.MeshBasicMaterial
    mat.opacity = 0.5 + 0.5 * Math.sin(t * 3)
  })

  // renderOrder forces this mesh to draw AFTER the sphere; depthTest:false on
  // the material then keeps the pixels regardless of the depth buffer. Without
  // both, the opaque sphere (transparent:true, opacity:1 in light mode) draws
  // over markers on its far side via the transparent queue's back-to-front sort.
  return (
    <mesh ref={meshRef} position={position} renderOrder={999}>
      <sphereGeometry args={[r, 8, 8]} />
      <meshBasicMaterial color={colors.klMarker} transparent opacity={1} depthTest={false} />
    </mesh>
  )
}

// ─── ISS marker ──────────────────────────────────────────────────────────────

interface ISSMarkerProps {
  lat: number
  lon: number
  colors: EarthColors
}

function ISSMarker({ lat, lon, colors }: ISSMarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const targetPos = useMemo(() => issLatLonToVec3(lat, lon), [lat, lon])

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(targetPos.x, targetPos.y, targetPos.z)
    }
  }, [targetPos])

  const s = 0.06 * colors.markerScale

  return (
    <mesh ref={meshRef} position={[targetPos.x, targetPos.y, targetPos.z]} renderOrder={999}>
      <boxGeometry args={[s, s, 0.02]} />
      <meshBasicMaterial color={colors.issMarker} depthTest={false} />
    </mesh>
  )
}

// ─── Scene ────────────────────────────────────────────────────────────────────

interface SceneProps {
  issLat: number
  issLon: number
  colors: EarthColors
  interactionRef: React.MutableRefObject<InteractionState>
}

function Scene({ issLat, issLon, colors, interactionRef }: SceneProps) {
  return (
    <>
      <ambientLight intensity={0.2} />
      <EarthMesh colors={colors} interactionRef={interactionRef} />
      <KLMarker colors={colors} />
      <ISSMarker lat={issLat} lon={issLon} colors={colors} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        onStart={() => {
          interactionRef.current.isInteracting = true
        }}
        onEnd={() => {
          interactionRef.current.isInteracting = false
          interactionRef.current.lastInteractionAt = performance.now()
        }}
      />
    </>
  )
}

// ─── Static SVG fallback (mobile / reduced-motion) ───────────────────────────

function EarthFallback({ issLat, issLon, colors }: { issLat: number; issLon: number; colors: EarthColors }) {
  const klX = ((KL_LON_DEG + 180) / 360) * 300
  const klY = ((90 - KL_LAT_DEG) / 180) * 150
  const issX = ((issLon + 180) / 360) * 300
  const issY = ((90 - issLat) / 180) * 150

  return (
    <div className="flex flex-col items-center gap-2" aria-label="Earth map — static view">
      <svg
        width="300" height="150" viewBox="0 0 300 150"
        aria-hidden="true"
        style={{ border: '1px solid var(--inert)', borderRadius: 4 }}
      >
        <rect width="300" height="150" fill={colors.sphereFill} />
        {/* Graticule lines */}
        {[30, 60, 90, 120, 150, 180, 210, 240, 270, 300].map(x => (
          <line key={x} x1={x} y1={0} x2={x} y2={150} stroke={colors.wire} strokeWidth="0.5" opacity={colors.wireOpacity} />
        ))}
        {[37.5, 75, 112.5].map(y => (
          <line key={y} x1={0} y1={y} x2={300} y2={y} stroke={colors.wire} strokeWidth="0.5" opacity={colors.wireOpacity} />
        ))}
        {/* KL marker */}
        <circle cx={klX} cy={klY} r={4 * colors.markerScale} fill={colors.klMarker} opacity={0.9} />
        <text x={klX + 6} y={klY + 4} fill={colors.klMarker} fontSize={7} fontFamily="monospace">KL</text>
        {/* ISS marker */}
        <rect x={issX - 4 * colors.markerScale} y={issY - 4 * colors.markerScale} width={8 * colors.markerScale} height={8 * colors.markerScale} fill={colors.issMarker} opacity={0.9} />
        <text x={issX + 6} y={issY + 4} fill={colors.issMarker} fontSize={7} fontFamily="monospace">ISS</text>
      </svg>
      <p className="font-mono-display text-[10px]" style={{ color: 'var(--ink-dim)' }}>[STATIC VIEW]</p>
    </div>
  )
}

// ─── Public component ─────────────────────────────────────────────────────────

interface EarthGlobeProps {
  issLat: number
  issLon: number
  theme: 'dark' | 'light'
  reducedMotion?: boolean
  isMobile?: boolean
}

export function EarthGlobe({ issLat, issLon, theme, reducedMotion, isMobile }: EarthGlobeProps) {
  const colors = earthColors(theme)
  // Created here so OrbitControls (in Scene) and EarthMesh share one source of truth.
  // -Infinity puts the cooldown gate "infinitely far in the past" → auto-rotate from mount.
  const interactionRef = useRef<InteractionState>({
    isInteracting: false,
    lastInteractionAt: -Infinity,
  })

  if (reducedMotion || isMobile) {
    return <EarthFallback issLat={issLat} issLon={issLon} colors={colors} />
  }

  return (
    <div
      style={{ width: '100%', maxWidth: 420, aspectRatio: '1', minHeight: 320 }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        tabIndex={-1}
      >
        <Scene issLat={issLat} issLon={issLon} colors={colors} interactionRef={interactionRef} />
      </Canvas>
    </div>
  )
}
