'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─── Constants ────────────────────────────────────────────────────────────────

const EARTH_RADIUS = 2
const ISS_ALTITUDE = 0.12   // scaled altitude above surface
const KL_LAT_DEG  = 3.139
const KL_LON_DEG  = 101.687
// Earth sidereal day: 86164.1 seconds → radians/second
const EARTH_RAD_PER_SEC = (2 * Math.PI) / 86164.1

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

function EarthMesh() {
  const meshRef = useRef<THREE.Mesh>(null)
  const startTime = useRef(Date.now())

  // Low-poly icosphere → wireframe
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(EARTH_RADIUS, 3), [])

  useFrame(() => {
    if (!meshRef.current) return
    const elapsed = (Date.now() - startTime.current) / 1000
    meshRef.current.rotation.y = elapsed * EARTH_RAD_PER_SEC
  })

  return (
    <mesh ref={meshRef} geometry={geometry}>
      {/* Transparent dark faces */}
      <meshBasicMaterial color="#04060d" transparent opacity={0.85} side={THREE.FrontSide} />
      {/* Wireframe overlay */}
      <lineSegments>
        <edgesGeometry args={[geometry]} />
        <lineBasicMaterial color="#38bdf8" transparent opacity={0.55} />
      </lineSegments>
    </mesh>
  )
}

// ─── KL ground marker ────────────────────────────────────────────────────────

function KLMarker() {
  const meshRef = useRef<THREE.Mesh>(null)
  const position = useMemo(() => latLonToVec3(KL_LAT_DEG, KL_LON_DEG, EARTH_RADIUS + 0.01), [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    // Pulse opacity
    const t = clock.getElapsedTime()
    const mat = meshRef.current.material as THREE.MeshBasicMaterial
    mat.opacity = 0.5 + 0.5 * Math.sin(t * 3)
  })

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.045, 8, 8]} />
      <meshBasicMaterial color="#38bdf8" transparent opacity={1} />
    </mesh>
  )
}

// ─── ISS marker ──────────────────────────────────────────────────────────────

interface ISSMarkerProps {
  lat: number
  lon: number
}

function ISSMarker({ lat, lon }: ISSMarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const targetPos = useMemo(() => issLatLonToVec3(lat, lon), [lat, lon])

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(targetPos.x, targetPos.y, targetPos.z)
    }
  }, [targetPos])

  return (
    <mesh ref={meshRef} position={[targetPos.x, targetPos.y, targetPos.z]}>
      <boxGeometry args={[0.06, 0.06, 0.02]} />
      <meshBasicMaterial color="#fbbf24" />
    </mesh>
  )
}

// ─── Scene ────────────────────────────────────────────────────────────────────

interface SceneProps {
  issLat: number
  issLon: number
}

function Scene({ issLat, issLon }: SceneProps) {
  return (
    <>
      <ambientLight intensity={0.2} />
      <EarthMesh />
      <KLMarker />
      <ISSMarker lat={issLat} lon={issLon} />
    </>
  )
}

// ─── Static SVG fallback (mobile / reduced-motion) ───────────────────────────

function EarthFallback({ issLat, issLon }: { issLat: number; issLon: number }) {
  // Simple equirectangular SVG representation
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
        <rect width="300" height="150" fill="#04060d" />
        {/* Graticule lines */}
        {[30, 60, 90, 120, 150, 180, 210, 240, 270, 300].map(x => (
          <line key={x} x1={x} y1={0} x2={x} y2={150} stroke="#1a2030" strokeWidth="0.5" />
        ))}
        {[37.5, 75, 112.5].map(y => (
          <line key={y} x1={0} y1={y} x2={300} y2={y} stroke="#1a2030" strokeWidth="0.5" />
        ))}
        {/* KL marker */}
        <circle cx={klX} cy={klY} r={4} fill="#38bdf8" opacity={0.9} />
        <text x={klX + 6} y={klY + 4} fill="#38bdf8" fontSize={7} fontFamily="monospace">KL</text>
        {/* ISS marker */}
        <rect x={issX - 4} y={issY - 4} width={8} height={8} fill="#fbbf24" opacity={0.9} />
        <text x={issX + 6} y={issY + 4} fill="#fbbf24" fontSize={7} fontFamily="monospace">ISS</text>
      </svg>
      <p className="font-mono-display text-[10px]" style={{ color: 'var(--ink-dim)' }}>[STATIC VIEW]</p>
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
  if (reducedMotion || isMobile) {
    return <EarthFallback issLat={issLat} issLon={issLon} />
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
      >
        <Scene issLat={issLat} issLon={issLon} />
      </Canvas>
    </div>
  )
}
