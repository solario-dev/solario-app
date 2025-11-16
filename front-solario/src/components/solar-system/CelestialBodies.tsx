import { useEffect, useState } from "react"
import { CelestialBody } from "./game-objects/CelestialBody.tsx"
import type { CelestialBodyProps } from "../../types/CelestialBodyType.ts"

export function CelestialBodies({ ws }: { ws: WebSocket }) {
  const [bodies, setBodies] = useState<CelestialBodyProps[]>([])

  useEffect(() => {
    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data)
      if (data.type === "state") {
        setBodies(data.bodies)
      }
    }
  }, [])

  return (
    <>
      {bodies.map((p) => (
        <CelestialBody
          key={p.name}
          name={p.name}
          position={p.position}
          size={p.size}
          color={p.color}
        />
      ))}
    </>
  )
}
