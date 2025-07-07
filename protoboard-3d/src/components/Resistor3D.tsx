'use client'

import { forwardRef } from 'react'
import * as THREE from 'three';

interface Resistor3DProps {
  position: [number, number, number]
  endPosition: [number, number, number]
  value: string
  color: string
  onClick?: () => void
  isDeleteMode?: boolean
}

const Resistor3D = forwardRef<THREE.Group, Resistor3DProps>(
  ({ position, endPosition, color, onClick, isDeleteMode }, ref) => {
    // Calculate direction and length between two pins (always 2 pins apart)
    const dx = endPosition[0] - position[0]
    const dz = endPosition[2] - position[2]
    const length = Math.sqrt(dx * dx + dz * dz)
    const angle = Math.atan2(dx, dz)
    
    const midPoint: [number, number, number] = [
      (position[0] + endPosition[0]) / 2,
      position[1] + 0.06, // Lower position closer to board
      (position[2] + endPosition[2]) / 2
    ]

    return (
      <group ref={ref} position={midPoint} rotation={[0, -angle, 0]} onClick={onClick}>
        {/* Horizontal cylinder body - oriented along Z axis, ends align with pins */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.04, 0.04, length]} />
          <meshStandardMaterial color={isDeleteMode ? "#ff4444" : color} />
        </mesh>
        
        {/* Left pin - lower and shorter */}
        <mesh position={[0, -0.04, length / 2]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.08]} />
          <meshStandardMaterial color="#C0C0C0" />
        </mesh>
        
        {/* Right pin - lower and shorter */}
        <mesh position={[0, -0.04, -length / 2]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.08]} />
          <meshStandardMaterial color="#C0C0C0" />
        </mesh>
      </group>
    )
  }
)

Resistor3D.displayName = 'Resistor3D'

export default Resistor3D