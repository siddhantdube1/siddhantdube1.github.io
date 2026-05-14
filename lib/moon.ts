import * as Astronomy from 'astronomy-engine'

export interface MoonData {
  phase: number        // 0–1 illumination fraction
  phaseName: string
  angle: number        // 0–360 ecliptic longitude
}

function phaseName(angle: number): string {
  if (angle < 22.5)  return 'NEW MOON'
  if (angle < 67.5)  return 'WAXING CRESCENT'
  if (angle < 112.5) return 'FIRST QUARTER'
  if (angle < 157.5) return 'WAXING GIBBOUS'
  if (angle < 202.5) return 'FULL MOON'
  if (angle < 247.5) return 'WANING GIBBOUS'
  if (angle < 292.5) return 'LAST QUARTER'
  if (angle < 337.5) return 'WANING CRESCENT'
  return 'NEW MOON'
}

export function getMoonData(date: Date = new Date()): MoonData {
  const illum = Astronomy.Illumination(Astronomy.Body.Moon, date)
  const angle = illum.phase_angle   // degrees
  // Convert phase_angle (Sun-Moon-Observer) to waxing/waning fraction
  // astronomy-engine Illumination gives phase_fraction directly
  const phase = illum.phase_fraction
  // phase_angle is 0 at new moon, 180 at full — we need ecliptic longitude diff
  const moonLon = Astronomy.EclipticGeoMoon(date).lon
  const sunLon  = Astronomy.SunPosition(date).elon
  let diff = moonLon - sunLon
  if (diff < 0) diff += 360

  return {
    phase,
    phaseName: phaseName(diff),
    angle: diff,
  }
}
