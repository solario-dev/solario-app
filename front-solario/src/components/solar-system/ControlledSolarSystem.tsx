import { Canvas } from '@react-three/fiber'
import { ThirdPersonCamera } from './game-objects/ThirdPersonCamera.tsx'
import { useMemo, useState, useEffect } from 'react'
import { PlayerShip } from './game-objects/PlayerShip.tsx'
import { useRef } from 'react'
import * as THREE from 'three'
import { Stars } from '@react-three/drei'
import type { CelestialBodyType } from '../../types/CelestialBodyType.ts'
import type { RemotePlayer } from '../../types/RemotePlayer.ts'
import { usePlayerInput } from '../../hooks/usePlayerInput.tsx'

export const ControlledSolarSystem: React.FC = () => {

  const ws = useMemo(() => new WebSocket("ws://localhost:5000"), [])

  const [bodies, setBodies] = useState([])
  const [selfPlayer, setSelfPlayer] = useState(null)
  const [otherPlayers, setOtherPlayers] = useState([])

  usePlayerInput(ws)

  // ref do statku gracza, przekażemy do kamery
  const shipRef = useRef<THREE.Group | null>(null)

  // Inicjalizacja / obsługa wiadomości z WebSocket
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === "state") {
          // Zakładam strukturę: { type: "state", self: {...}, others: [...], bodies: [...] }
          if (data.bodies) setBodies(data.bodies)
          if (data.self) setSelfPlayer(data.self)
          if (data.others) setOtherPlayers(data.others)
        }
      } catch (err) {
        console.error("WS message parse error", err)
      }
    }

    ws.addEventListener("message", onMessage)

    // cleanup on unmount
    return () => {
      ws.removeEventListener("message", onMessage)
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close()
      }
    }
  }, [ws])


  return (
    <Canvas camera={{ position: [0, 5, 12], fov: 50 }} className="fullscreen-canvas bg-black">
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 0]} intensity={2.5} />
      <Stars radius={100} depth={50} count={5000} factor={4} fade />

      {/* tu pokażesz planety (CelestialBodies powinien przyjmować lista ciał) */}
      {bodies.map((b: CelestialBodyType) => (
        <mesh key={b.name} position={[b.x, b.y, b.z]}>
          <sphereGeometry args={[b.size ?? 1, 32, 32]} />
          <meshStandardMaterial color={b.color ?? "gray"} />
        </mesh>
      ))}

      {/* Self player */}
      <PlayerShip ref={shipRef} player={selfPlayer} color="orange" />

      {/* Other players */}
      {otherPlayers.map((p:RemotePlayer) => (
        <PlayerShip key={p.playerId ?? `${p.x}-${p.y}-${p.z}`} player={p} color="lightblue" />
      ))}

      <ThirdPersonCamera playerRef={shipRef} />
    </Canvas>
  )
}
