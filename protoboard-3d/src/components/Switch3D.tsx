'use client'

import { forwardRef, useState } from 'react'
import * as THREE from 'three'

interface Switch3DProps {
  position: [number, number, number]
  endPosition?: [number, number, number]
  onClick?: () => void
  isDeleteMode?: boolean
  componentId?: string
  isOn?: boolean
  onToggle?: (isOn: boolean) => void
  isPlacingWire?: boolean
}

const Switch3D = forwardRef<THREE.Group, Switch3DProps>(
  ({ position, endPosition, onClick, isDeleteMode, componentId, isOn = false, onToggle, isPlacingWire = false }, ref) => {
    const [internalState, setInternalState] = useState(isOn)
    
    const handleClick = (e: any) => {
      // Don't intercept clicks when placing wires - let them pass through to the hole
      if (isPlacingWire) {
        return
      }
      
      e.stopPropagation()
      
      if (isDeleteMode) {
        onClick?.()
        return
      }
      
      const newState = !internalState
      setInternalState(newState)
      onToggle?.(newState)
    }

    const switchPosition = internalState ? 0.02 : -0.02

    return (
      <group ref={ref} position={position}>
        {/* Switch base - bigger */}
        <mesh castShadow receiveShadow onClick={handleClick}>
          <boxGeometry args={[0.24, 0.16, 0.12]} />
          <meshStandardMaterial 
            color={isDeleteMode ? "#ff4444" : "#2a2a2a"} 
          />
        </mesh>
        
        {/* Switch toggle - bigger */}
        <mesh 
          position={[switchPosition * 2, 0.10, 0]} 
          castShadow 
          receiveShadow 
          onClick={handleClick}
        >
          <boxGeometry args={[0.08, 0.12, 0.08]} />
          <meshStandardMaterial 
            color={isDeleteMode ? "#ff6666" : internalState ? "#4ade80" : "#ef4444"} 
          />
        </mesh>
        
        {/* Switch pins - bigger */}
        <mesh position={[-0.16, -0.12, 0]} castShadow>
          <cylinderGeometry args={[0.016, 0.016, 0.08]} />
          <meshStandardMaterial color="#C0C0C0" />
        </mesh>
        
        <mesh position={[0.16, -0.12, 0]} castShadow>
          <cylinderGeometry args={[0.016, 0.016, 0.08]} />
          <meshStandardMaterial color="#C0C0C0" />
        </mesh>
        
        {/* ON/OFF labels - bigger */}
        <mesh position={[0.04, 0.04, 0.07]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.04, 0.02]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        
        <mesh position={[-0.04, 0.04, 0.07]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.04, 0.02]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        
        {/* Status indicator light - bigger */}
        {internalState && !isDeleteMode && (
          <mesh position={[0, 0.18, 0]} castShadow>
            <sphereGeometry args={[0.016, 8, 8]} />
            <meshStandardMaterial 
              color="#00ff00" 
              emissive="#00ff00" 
              emissiveIntensity={0.5}
            />
          </mesh>
        )}
        
        {/* Click area - invisible but bigger for easier interaction */}
        <mesh onClick={handleClick} visible={false}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial transparent opacity={0} />
        </mesh>
      </group>
    )
  }
)

Switch3D.displayName = 'Switch3D'

export default Switch3D