'use client'

import { forwardRef } from 'react'
import * as THREE from 'three'

interface Transistor3DProps {
  position: [number, number, number]
  endPosition: [number, number, number]
  model: string
  onClick?: () => void
  isDeleteMode?: boolean
}

const Transistor3D = forwardRef<THREE.Group, Transistor3DProps>(
  ({ position, endPosition, onClick, isDeleteMode }, ref) => {
    // Calculate direction and length between two pins (always 2 pins apart)
    const dx = endPosition[0] - position[0]
    const dz = endPosition[2] - position[2]
    const length = Math.sqrt(dx * dx + dz * dz)
    const angle = Math.atan2(dx, dz)
    
    const midPoint: [number, number, number] = [
      (position[0] + endPosition[0]) / 2,
      position[1] + 0.2, // Float above the board
      (position[2] + endPosition[2]) / 2
    ]

    return (
      <group 
        ref={ref} 
        position={midPoint} 
        rotation={[0, -angle, 0]} 
        onClick={(e) => {
          e.stopPropagation()
          onClick?.()
        }}
      >
        {/* Transistor body - black cylindrical package */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.1, 0.1, length * 0.8]} />
          <meshStandardMaterial color={isDeleteMode ? "#ff4444" : "#1a1a1a"} />
        </mesh>
        
        {/* Left silver pin */}
        <mesh position={[0, -0.1, length * 0.4]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.2]} />
          <meshStandardMaterial color="#C0C0C0" />
        </mesh>
        
        {/* Right silver pin */}
        <mesh position={[0, -0.1, -length * 0.4]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.2]} />
          <meshStandardMaterial color="#C0C0C0" />
        </mesh>
        
        {/* Center pin (Base) - positioned at center */}
        <mesh position={[0, -0.1, 0]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.2]} />
          <meshStandardMaterial color="#C0C0C0" />
        </mesh>
        
        {/* Model label */}
        <mesh position={[0, 0.05, 0.11]} rotation={[0, 0, 0]}>
          <planeGeometry args={[length * 0.6, 0.06]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>
    )
  }
)

Transistor3D.displayName = 'Transistor3D'

export default Transistor3D