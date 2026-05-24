'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import * as Astronomy from 'astronomy-engine'

// ─── Constants ────────────────────────────────────────────────────────────────

const EARTH_RADIUS = 2
const ISS_ALTITUDE = 0.12
const KL_LAT_DEG = 3.139
const KL_LON_DEG = 101.687
// Earth sidereal day: 86164.1 s → radians/second
const EARTH_RAD_PER_SEC = (2 * Math.PI) / 86164.1
const INTERACTION_COOLDOWN_MS = 3000
// Sun direction shifts ~15°/hour, so 60s updates are well under 0.3° drift.
const SUN_UPDATE_MS = 60_000

const STAR_COUNT  = 1200
const STAR_RADIUS = 30   // ~15× Earth radius; far enough to read as backdrop

const KL_COLOR  = '#38bdf8'
const ISS_COLOR = '#fbbf24'

// ─── Types ────────────────────────────────────────────────────────────────────

interface InteractionState {
  isInteracting: boolean
  lastInteractionAt: number   // -Infinity = never
}

// ─── Geometry helpers ─────────────────────────────────────────────────────────

function latLonToVec3(lat: number, lon: number, r: number): THREE.Vector3 {
  const phi   = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta),
  )
}

function issLatLonToVec3(lat: number, lon: number): THREE.Vector3 {
  return latLonToVec3(lat, lon, EARTH_RADIUS + ISS_ALTITUDE)
}

// ─── Sun direction in Earth body-fixed frame ──────────────────────────────────
// Subsolar point: the geographic (lat, lon) where the sun is directly overhead
// at the given instant. Subsolar lat = sun's declination; subsolar lon =
// (RA_sun − GAST) × 15°. Passing this through latLonToVec3 gives the sun's
// direction in the same body-fixed frame as the texture mapping, so the shader
// terminator aligns with real geography (KL on the day side at KL noon, etc.).
// The group's visual rotation does not affect this calculation because the
// shader uses object-local normals; both N and L live in body frame together.
function computeSunDirection(date: Date, out: THREE.Vector3): void {
  const sunJ2000  = Astronomy.GeoVector(Astronomy.Body.Sun, date, true)
  const sunOfDate = Astronomy.RotateVector(Astronomy.Rotation_EQJ_EQD(date), sunJ2000)
  const eq   = Astronomy.EquatorFromVector(sunOfDate)
  const gast = Astronomy.SiderealTime(date)   // hours
  let lon = (eq.ra - gast) * 15               // degrees
  while (lon >  180) lon -= 360
  while (lon < -180) lon += 360
  const v = latLonToVec3(eq.dec, lon, 1)
  out.copy(v)
}

// ─── Shaders ──────────────────────────────────────────────────────────────────

const EARTH_VERT = /* glsl */ `
  varying vec3 vNormalLocal;
  varying vec2 vUv;
  void main() {
    vNormalLocal = normal;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Lighting baked into the fragment shader instead of a separate DirectionalLight,
// because ShaderMaterial doesn't read Three's light uniforms. NdotL drives both
// the directional falloff (0.95 coefficient) and the small ambient floor (0.05).
// The smoothstep band ±0.10 spans ~11° of N·L either side of the terminator
// great circle — the twilight zone where day and night textures cross-fade.
const EARTH_FRAG = /* glsl */ `
  varying vec3 vNormalLocal;
  varying vec2 vUv;
  uniform sampler2D uDayTexture;
  uniform sampler2D uNightTexture;
  uniform vec3 uSunDirection;
  void main() {
    vec3 N = normalize(vNormalLocal);
    float NdotL = dot(N, uSunDirection);
    float dayBlend = smoothstep(-0.10, 0.10, NdotL);
    vec3 day   = texture2D(uDayTexture,   vUv).rgb;
    vec3 night = texture2D(uNightTexture, vUv).rgb;
    // 0.05 ambient + Lambertian sun term
    vec3 dayLit = day * (0.05 + 0.95 * max(NdotL, 0.0));
    vec3 color  = mix(night, dayLit, dayBlend);
    gl_FragColor = vec4(color, 1.0);
  }
`

// ─── Photoreal Earth (day/night shader sphere) ────────────────────────────────

function PhotorealEarth() {
  const dayTexture = useMemo(() => {
    const t = new THREE.TextureLoader().load('/textures/earth-day.jpg')
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  const nightTexture = useMemo(() => {
    const t = new THREE.TextureLoader().load('/textures/earth-night.jpg')
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])

  const uniforms = useMemo(() => ({
    uDayTexture:   { value: dayTexture },
    uNightTexture: { value: nightTexture },
    uSunDirection: { value: new THREE.Vector3(1, 0, 0) },
  }), [dayTexture, nightTexture])

  useEffect(() => {
    computeSunDirection(new Date(), uniforms.uSunDirection.value)
    const id = setInterval(() => {
      computeSunDirection(new Date(), uniforms.uSunDirection.value)
    }, SUN_UPDATE_MS)
    return () => clearInterval(id)
  }, [uniforms])

  return (
    <mesh>
      <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={EARTH_VERT}
        fragmentShader={EARTH_FRAG}
      />
    </mesh>
  )
}

// ─── Star field ───────────────────────────────────────────────────────────────
// Points distributed uniformly on a sphere at STAR_RADIUS. sizeAttenuation
// off → each star is a constant 1.5px regardless of camera distance. Opacity
// 0.5 + faint blue tint reads as atmosphere, not decoration. depthWrite off
// keeps stars from poking holes in the depth buffer behind the Earth.

function StarField() {
  const geometry = useMemo(() => {
    const positions = new Float32Array(STAR_COUNT * 3)
    for (let i = 0; i < STAR_COUNT; i++) {
      // Uniform distribution on a sphere: pick u∈[-1,1] (=cos φ), azimuth θ∈[0,2π).
      const u = Math.random() * 2 - 1
      const theta = Math.random() * Math.PI * 2
      const s = Math.sqrt(1 - u * u)
      positions[i*3]     = STAR_RADIUS * s * Math.cos(theta)
      positions[i*3 + 1] = STAR_RADIUS * u
      positions[i*3 + 2] = STAR_RADIUS * s * Math.sin(theta)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [])

  return (
    <points geometry={geometry}>
      <pointsMaterial
        color={0xe8eefa}
        size={1.5}
        sizeAttenuation={false}
        transparent
        opacity={0.5}
        depthWrite={false}
      />
    </points>
  )
}

// ─── KL ground marker ─────────────────────────────────────────────────────────

function KLMarker() {
  const meshRef = useRef<THREE.Mesh>(null)
  const position = useMemo(() => latLonToVec3(KL_LAT_DEG, KL_LON_DEG, EARTH_RADIUS * 1.015), [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    const mat = meshRef.current.material as THREE.MeshBasicMaterial
    mat.opacity = 0.5 + 0.5 * Math.sin(t * 3)
  })

  return (
    <mesh ref={meshRef} position={position} renderOrder={999}>
      <sphereGeometry args={[0.045, 8, 8]} />
      <meshBasicMaterial color={KL_COLOR} transparent opacity={1} depthTest={false} />
    </mesh>
  )
}

// ─── ISS marker ───────────────────────────────────────────────────────────────

function ISSMarker({ lat, lon }: { lat: number; lon: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const targetPos = useMemo(() => issLatLonToVec3(lat, lon), [lat, lon])

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(targetPos.x, targetPos.y, targetPos.z)
    }
  }, [targetPos])

  return (
    <mesh ref={meshRef} position={[targetPos.x, targetPos.y, targetPos.z]} renderOrder={999}>
      <boxGeometry args={[0.06, 0.06, 0.06]} />
      <meshBasicMaterial color={ISS_COLOR} transparent opacity={1} depthTest={false} />
    </mesh>
  )
}

// ─── Desktop scene ────────────────────────────────────────────────────────────

interface SceneProps {
  issLat: number
  issLon: number
  interactionRef: React.RefObject<InteractionState>
}

function Scene({ issLat, issLon, interactionRef }: SceneProps) {
  const groupRef = useRef<THREE.Group>(null)
  const rotationRef = useRef(0)
  const lastFrameRef = useRef<number | null>(null)

  useFrame(() => {
    if (!groupRef.current) return
    const now = performance.now()
    const dt = lastFrameRef.current == null ? 0 : (now - lastFrameRef.current) / 1000
    lastFrameRef.current = now

    const { isInteracting, lastInteractionAt } = interactionRef.current
    const idleMs = now - lastInteractionAt
    const shouldAutoRotate = !isInteracting && idleMs > INTERACTION_COOLDOWN_MS

    if (shouldAutoRotate) rotationRef.current += dt * EARTH_RAD_PER_SEC
    groupRef.current.rotation.y = rotationRef.current
  })

  return (
    <>
      <group ref={groupRef}>
        <PhotorealEarth />
        <KLMarker />
        <ISSMarker lat={issLat} lon={issLon} />
      </group>
      <StarField />
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

// ─── Mobile scene ─────────────────────────────────────────────────────────────

function MobileScene({ issLat, issLon, interactionRef }: SceneProps) {
  const groupRef = useRef<THREE.Group>(null)
  const rotationRef = useRef(0)
  const lastFrameRef = useRef<number | null>(null)

  useFrame(() => {
    if (!groupRef.current) return
    const now = performance.now()
    // Clamp dt — when Canvas frameloop flips back from 'never' after the hero
    // scrolls into view, the first frame's raw dt would otherwise be the entire
    // off-screen duration, causing a visible rotation jump.
    const rawDt = lastFrameRef.current == null ? 0 : (now - lastFrameRef.current) / 1000
    const dt = Math.min(rawDt, 0.1)
    lastFrameRef.current = now

    const { isInteracting, lastInteractionAt } = interactionRef.current
    const idleMs = now - lastInteractionAt
    const shouldAutoRotate = !isInteracting && idleMs > INTERACTION_COOLDOWN_MS

    if (shouldAutoRotate) rotationRef.current += dt * EARTH_RAD_PER_SEC
    groupRef.current.rotation.y = rotationRef.current
  })

  return (
    <>
      <group ref={groupRef}>
        <PhotorealEarth />
        <KLMarker />
        <ISSMarker lat={issLat} lon={issLon} />
      </group>
      <StarField />
      {/* Polar angles locked to π/2 → camera stays on equatorial plane.
          Horizontal swipes orbit left/right; vertical swipes fall through to
          the browser via touch-action: pan-y on the wrapper. */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.4}
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
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

// ─── Static SVG fallback (reduced-motion) ─────────────────────────────────────

function EarthFallback({ issLat, issLon }: { issLat: number; issLon: number }) {
  const klX  = ((KL_LON_DEG + 180) / 360) * 300
  const klY  = ((90 - KL_LAT_DEG) / 180) * 150
  const issX = ((issLon + 180) / 360) * 300
  const issY = ((90 - issLat)  / 180) * 150

  return (
    <div className="flex flex-col items-center gap-2" aria-label="Earth map — static view">
      <svg width="300" height="150" viewBox="0 0 300 150" aria-hidden="true"
        style={{ border: '1px solid var(--inert)', borderRadius: 4 }}>
        <rect width="300" height="150" fill="#04060d" />
        {[30, 60, 90, 120, 150, 180, 210, 240, 270, 300].map(x => (
          <line key={x} x1={x} y1={0} x2={x} y2={150} stroke={KL_COLOR} strokeWidth="0.5" opacity={0.3} />
        ))}
        {[37.5, 75, 112.5].map(y => (
          <line key={y} x1={0} y1={y} x2={300} y2={y} stroke={KL_COLOR} strokeWidth="0.5" opacity={0.3} />
        ))}
        <circle cx={klX} cy={klY} r={4} fill={KL_COLOR} opacity={0.9} />
        <text x={klX + 6} y={klY + 4} fill={KL_COLOR} fontSize={7} fontFamily="monospace">KL</text>
        <rect x={issX - 4} y={issY - 4} width={8} height={8} fill={ISS_COLOR} opacity={0.9} />
        <text x={issX + 6} y={issY + 4} fill={ISS_COLOR} fontSize={7} fontFamily="monospace">ISS</text>
      </svg>
      <p className="font-mono-display text-[10px]" style={{ color: 'var(--ink-dim)' }}>[STATIC VIEW]</p>
    </div>
  )
}

// ─── Desktop globe ────────────────────────────────────────────────────────────

function DesktopEarthGlobe({ issLat, issLon }: { issLat: number; issLon: number }) {
  const interactionRef = useRef<InteractionState>({
    isInteracting: false,
    lastInteractionAt: -Infinity,
  })
  return (
    <div style={{ width: '100%', maxWidth: 420, aspectRatio: '1', minHeight: 320 }} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        tabIndex={-1}
      >
        <Scene issLat={issLat} issLon={issLon} interactionRef={interactionRef} />
      </Canvas>
    </div>
  )
}

// ─── Mobile globe ─────────────────────────────────────────────────────────────

function MobileEarthGlobe({ issLat, issLon }: { issLat: number; issLon: number }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(true)
  const interactionRef = useRef<InteractionState>({
    isInteracting: false,
    lastInteractionAt: -Infinity,
  })

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={wrapperRef}
      style={{
        width: '100%',
        maxWidth: 280,
        aspectRatio: '1',
        maxHeight: 280,
        touchAction: 'pan-y pinch-zoom',
      }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        style={{ background: 'transparent' }}
        frameloop={inView ? 'always' : 'never'}
        tabIndex={-1}
      >
        <MobileScene issLat={issLat} issLon={issLon} interactionRef={interactionRef} />
      </Canvas>
    </div>
  )
}

// ─── Public component ─────────────────────────────────────────────────────────

interface EarthGlobeProps {
  issLat: number
  issLon: number
  reducedMotion?: boolean
  isMobile?: boolean
}

export function EarthGlobe({ issLat, issLon, reducedMotion, isMobile }: EarthGlobeProps) {
  if (reducedMotion) return <EarthFallback issLat={issLat} issLon={issLon} />
  if (isMobile)      return <MobileEarthGlobe issLat={issLat} issLon={issLon} />
  return <DesktopEarthGlobe issLat={issLat} issLon={issLon} />
}
