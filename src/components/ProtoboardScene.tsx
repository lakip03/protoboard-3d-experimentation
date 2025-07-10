'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Protoboard } from './Protoboard'
import Battery3D from './Battery3D'
import { useComponents } from '@/contexts/ComponentContext'

export default function ProtoboardScene() {
  const { selectedComponent, isPlacingWire, setIsPlacingWire, setWireStartPosition } = useComponents()

  const handleBatteryTerminalClick = (terminal: 'positive' | 'negative') => {
    if (selectedComponent?.type === 'wire' && !isPlacingWire) {
      setIsPlacingWire(true)
      // Battery terminal positions
      const batteryPosition: [number, number, number] = terminal === 'positive' 
        ? [6.15, 1.07, 0] 
        : [5.85, 1.07, 0]
      setWireStartPosition(batteryPosition)
    }
  }

  return (
    <div className="w-full h-screen bg-gray-100">
      <Canvas
        camera={{
          position: [0, 5, 10],
          fov: 50,
        }}
        shadows
      >
        <color attach="background" args={['#f5f5f5']} />
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />
        
        <Protoboard />
        <Battery3D 
          position={[6, 0, 0]} 
          onClick={handleBatteryTerminalClick}
        />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={50}
          target={[0, 0, 0]}
          makeDefault
        />
      </Canvas>
    </div>
  )
}