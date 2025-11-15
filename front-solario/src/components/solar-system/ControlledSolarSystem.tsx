import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { Planet } from './Planet.tsx'
import { Sun } from './Sun.tsx'
import planetsData from '../../data/planets.json'
import { ThirdPersonCamera } from './ThirdPersonCamera.tsx'
import { useMemo, useState, useEffect } from 'react'
import { celestialBodies } from './CelestialBodies.tsx'
import { PlayerShip } from './game-objects/PlayerShip.tsx'

export const ControlledSolarSystem: React.FC = () => {

  const ws = useMemo(() => new WebSocket("ws://localhost:5000"), [])

  const [bodies, setBodies] = useState([])
  const [selfPlayer, setSelfPlayer] = useState(null)
  const [otherPlayers, setOtherPlayers] = useState([])

  useEffect(() => {
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === "state") {
        setBodies(data.planets)
        setSelfPlayer(data.self)
      }
    }
  }, [ws])


  return (
    <Canvas camera={{ position: [0, 5, 12], fov: 50 }} className="fullscreen-canvas bg-black">
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 0]} intensity={2.5} />
      <Stars radius={100} depth={50} count={5000} factor={4} fade />

      <CelestialBodies ws={ws} />
      <PlayerShip selfPlayer={selfPlayer} />
      {otherPlayers.map((player) => (
        <PlayerShip key={player.playerId} selfPlayer={player} />
      ))}
      <ThirdPersonCamera playerRef={null} />
    </Canvas>
  )
}
