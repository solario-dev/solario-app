export interface CelestialBody {
  name: string
  x: number
  y: number
  z: number
}

export interface CelestialBodyProps {
  name: string
  position: [number, number, number]
  size: number
  color: string
  hasRings?: boolean
  ringTexture?: string
}