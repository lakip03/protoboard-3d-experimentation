'use client'

import { forwardRef, useState } from 'react'
import { ThreeEvent } from '@react-three/fiber'

interface Battery3DProps {
  position: [number, number, number]
  onClick?: (terminal: 'positive' | 'negative') => void
}

const Battery3D = forwardRef<THREE.Group, Battery3DProps>(
  ({ position, onClick }, ref) => {
    const [hoveredTerminal, setHoveredTerminal] = useState<'positive' | 'negative' | null>(null)

    const handleTerminalClick = (terminal: 'positive' | 'negative') => (event: ThreeEvent<MouseEvent>) => {
      event.stopPropagation()
      onClick?.(terminal)
    }

    return (
      <group ref={ref} position={position}>
        {/* Battery body */}
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.4, 0.4, 1.2]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
        
        {/* Battery label */}
        <mesh position={[0, 0.3, 0.41]} rotation={[0, 0, 0]}>
          <planeGeometry args={[0.6, 0.3]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        
        {/* 9V text indicator */}
        <mesh position={[0, 0.15, 0.42]} rotation={[0, 0, 0]}>
          <planeGeometry args={[0.3, 0.1]} />
          <meshStandardMaterial color="#ff0000" />
        </mesh>
        
        {/* Positive terminal */}
        <mesh 
          position={[0.15, 0.92, 0]}
          onClick={handleTerminalClick('positive')}
          onPointerEnter={() => setHoveredTerminal('positive')}
          onPointerLeave={() => setHoveredTerminal(null)}
          castShadow
        >
          <cylinderGeometry args={[0.05, 0.05, 0.1]} />
          <meshStandardMaterial 
            color={hoveredTerminal === 'positive' ? "#ffff00" : "#c0c0c0"} 
          />
        </mesh>
        
        {/* Negative terminal */}
        <mesh 
          position={[-0.15, 0.92, 0]}
          onClick={handleTerminalClick('negative')}
          onPointerEnter={() => setHoveredTerminal('negative')}
          onPointerLeave={() => setHoveredTerminal(null)}
          castShadow
        >
          <cylinderGeometry args={[0.05, 0.05, 0.1]} />
          <meshStandardMaterial 
            color={hoveredTerminal === 'negative' ? "#ffff00" : "#c0c0c0"} 
          />
        </mesh>
        
        {/* Terminal labels */}
        <mesh position={[0.15, 1.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.1, 0.1]} />
          <meshStandardMaterial color="#ff0000" />
        </mesh>
        
        <mesh position={[-0.15, 1.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.1, 0.1]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        
        {/* Base */}
        <mesh position={[0, -0.05, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.45, 0.45, 0.1]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
    )
  }
)

Battery3D.displayName = 'Battery3D'

export default Battery3D