'use client'

import { forwardRef, useEffect, useState, useRef } from 'react'
import * as THREE from 'three'
import { useComponents } from '@/contexts/ComponentContext'

interface LED3DProps {
  position: [number, number, number]
  endPosition: [number, number, number]
  color: string
  onClick?: () => void
  isDeleteMode?: boolean
  componentId?: string
  circuitState?: {
    isOn: boolean
    isBurned: boolean
    current: number
  }
  polarity?: 'normal' | 'reversed'
}

// Global LED state
let globalLEDState = false
let globalLEDBurnedState = false
const ledStateCallbacks: Set<() => void> = new Set()
const ledBurnCallbacks: Set<() => void> = new Set()

// Console commands to control LED
if (typeof window !== 'undefined') {
  (window as typeof window & {
    toggleLED: () => void
    setLED: (state: boolean) => void
    burnLED: () => void
    repairLED: () => void
  }).toggleLED = () => {
    if (!globalLEDBurnedState) {
      globalLEDState = !globalLEDState
      console.log(`LED turned ${globalLEDState ? 'ON' : 'OFF'}`)
      ledStateCallbacks.forEach(callback => callback())
    } else {
      console.log('❌ Cannot turn on burned LED! Use repairLED() first.')
    }
  }
  
  (window as typeof window & {
    setLED: (state: boolean) => void
  }).setLED = (state: boolean) => {
    if (!globalLEDBurnedState || !state) {
      globalLEDState = state
      console.log(`LED turned ${globalLEDState ? 'ON' : 'OFF'}`)
      ledStateCallbacks.forEach(callback => callback())
    } else {
      console.log('❌ Cannot turn on burned LED! Use repairLED() first.')
    }
  }
  
  (window as typeof window & {
    burnLED: () => void
  }).burnLED = () => {
    globalLEDBurnedState = true
    globalLEDState = false
    console.log('💥 LED BURNED OUT! Smoke particles activated.')
    ledBurnCallbacks.forEach(callback => callback())
    ledStateCallbacks.forEach(callback => callback())
  }
  
  (window as typeof window & {
    repairLED: () => void
  }).repairLED = () => {
    globalLEDBurnedState = false
    console.log('🔧 LED repaired and ready to use!')
    ledBurnCallbacks.forEach(callback => callback())
  }
}

// Smoke Particle Component
function SmokeParticles({ position }: { position: [number, number, number] }) {
  const particlesRef = useRef<THREE.Points>(null)
  
  useEffect(() => {
    if (!particlesRef.current) return
    
    const particles = 50
    const positions = new Float32Array(particles * 3)
    const velocities = new Float32Array(particles * 3)
    const ages = new Float32Array(particles)
    
    for (let i = 0; i < particles; i++) {
      const i3 = i * 3
      positions[i3] = (Math.random() - 0.5) * 0.02
      positions[i3 + 1] = 0
      positions[i3 + 2] = (Math.random() - 0.5) * 0.02
      
      velocities[i3] = (Math.random() - 0.5) * 0.001
      velocities[i3 + 1] = Math.random() * 0.002 + 0.001
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.001
      
      ages[i] = Math.random() * 100
    }
    
    particlesRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    
    const animate = () => {
      if (!particlesRef.current) return
      
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
      
      for (let i = 0; i < particles; i++) {
        const i3 = i * 3
        
        positions[i3] += velocities[i3]
        positions[i3 + 1] += velocities[i3 + 1]
        positions[i3 + 2] += velocities[i3 + 2]
        
        ages[i] += 1
        
        if (ages[i] > 100 || positions[i3 + 1] > 0.3) {
          positions[i3] = (Math.random() - 0.5) * 0.02
          positions[i3 + 1] = 0
          positions[i3 + 2] = (Math.random() - 0.5) * 0.02
          ages[i] = 0
        }
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true
      requestAnimationFrame(animate)
    }
    
    animate()
  }, [])
  
  return (
    <group position={position}>
      <points ref={particlesRef}>
        <bufferGeometry />
        <pointsMaterial 
          color="#666666" 
          size={0.005} 
          transparent 
          opacity={0.6}
          sizeAttenuation={true}
        />
      </points>
    </group>
  )
}

const LED3D = forwardRef<THREE.Group, LED3DProps>(
  ({ position, endPosition, color, onClick, isDeleteMode, componentId, circuitState, polarity = 'normal' }, ref) => {
    const { ledStates, isCircuitRunning } = useComponents()
    
    // Get individual LED state from context, fallback to global state for backward compatibility
    const individualLEDState = componentId ? ledStates.get(componentId) : null
    const [isOn, setIsOn] = useState(individualLEDState?.isOn || circuitState?.isOn || globalLEDState)
    const [isBurned, setIsBurned] = useState(individualLEDState?.isBurned || circuitState?.isBurned || globalLEDBurnedState)
    
    // Update state when individual LED state changes
    useEffect(() => {
      if (individualLEDState) {
        setIsOn(individualLEDState.isOn)
        setIsBurned(individualLEDState.isBurned)
      } else if (circuitState) {
        setIsOn(circuitState.isOn)
        setIsBurned(circuitState.isBurned)
      }
    }, [individualLEDState, circuitState])

    // Reset LED state when circuit stops
    useEffect(() => {
      if (!isCircuitRunning) {
        setIsOn(false)
        setIsBurned(false)
      }
    }, [isCircuitRunning])

    useEffect(() => {
      const stateCallback = () => {
        if (!isCircuitRunning) {
          setIsOn(false)
        } else if (individualLEDState) {
          setIsOn(individualLEDState.isOn)
        } else {
          setIsOn(globalLEDState)
        }
      }
      const burnCallback = () => {
        if (!isCircuitRunning) {
          setIsBurned(false)
        } else if (individualLEDState) {
          setIsBurned(individualLEDState.isBurned)
        } else {
          setIsBurned(globalLEDBurnedState)
        }
      }
      
      ledStateCallbacks.add(stateCallback)
      ledBurnCallbacks.add(burnCallback)
      
      return () => {
        ledStateCallbacks.delete(stateCallback)
        ledBurnCallbacks.delete(burnCallback)
      }
    }, [individualLEDState, isCircuitRunning])

    // Calculate direction and length between two pins (always 2 pins apart)
    const dx = endPosition[0] - position[0]
    const dz = endPosition[2] - position[2]
    const length = Math.sqrt(dx * dx + dz * dz)
    const angle = Math.atan2(dx, dz)
    
    const midPoint: [number, number, number] = [
      (position[0] + endPosition[0]) / 2,
      position[1] + 0.08, // Lower position closer to board
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
        {/* LED body - dome shape - bigger */}
        <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.15, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial 
            color={isDeleteMode ? "#ff4444" : 
                   isBurned ? "#222222" :
                   (isOn && !isBurned) ? color : "#444444"}
            emissive={isOn && !isDeleteMode && !isBurned ? color : "#000000"}
            emissiveIntensity={isOn && !isBurned ? 0.3 : 0}
            transparent={true}
            opacity={isBurned ? 0.5 : 0.8}
          />
        </mesh>
        
        {/* Burn marks when LED is damaged */}
        {isBurned && !isDeleteMode && (
          <mesh position={[0, 0.08, 0.12]} castShadow>
            <sphereGeometry args={[0.05, 8, 4]} />
            <meshStandardMaterial color="#1a0a00" />
          </mesh>
        )}
        
        {/* LED base - bigger cylinder */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.16]} />
          <meshStandardMaterial 
            color={isDeleteMode ? "#ff4444" : 
                   isBurned ? "#1a1a1a" : "#8B4513"} 
          />
        </mesh>
        
        {/* Left pin (cathode - shorter, negative) */}
        <mesh position={[0, -0.08, length / 2]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, polarity === 'reversed' ? 0.10 : 0.06]} />
          <meshStandardMaterial color="#C0C0C0" />
        </mesh>
        
        {/* Right pin (anode - longer, positive) */}
        <mesh position={[0, -0.08, -length / 2]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, polarity === 'reversed' ? 0.06 : 0.10]} />
          <meshStandardMaterial color="#C0C0C0" />
        </mesh>
        
        {/* Polarity indicators */}
        {/* Flat side on cathode (negative) */}
        <mesh position={[0, 0.08, length / 2 - 0.05]} castShadow>
          <boxGeometry args={[0.3, 0.02, 0.02]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        
        {/* Minus symbol on cathode (negative side) */}
        <mesh position={[0, 0.12, length / 2]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.08, 0.015, 0.005]} />
          <meshStandardMaterial color={isDeleteMode ? "#ff0000" : "#ffffff"} />
        </mesh>
        
        {/* Plus symbol on anode (positive side) - horizontal */}
        <mesh position={[0, 0.12, -length / 2]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.08, 0.015, 0.005]} />
          <meshStandardMaterial color={isDeleteMode ? "#ff0000" : "#ffffff"} />
        </mesh>
        {/* Plus symbol on anode (positive side) - vertical */}
        <mesh position={[0, 0.12, -length / 2]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.08, 0.015, 0.005]} />
          <meshStandardMaterial color={isDeleteMode ? "#ff0000" : "#ffffff"} />
        </mesh>
        
        {/* Colored rings for easy identification */}
        <mesh position={[0, 0.05, length / 2]} castShadow>
          <torusGeometry args={[0.18, 0.02, 8, 16]} />
          <meshStandardMaterial color={isDeleteMode ? "#ff4444" : "#ff0000"} /> {/* Red for negative */}
        </mesh>
        
        <mesh position={[0, 0.05, -length / 2]} castShadow>
          <torusGeometry args={[0.18, 0.02, 8, 16]} />
          <meshStandardMaterial color={isDeleteMode ? "#ff4444" : "#00ff00"} /> {/* Green for positive */}
        </mesh>
        
        {/* Light effect when LED is on */}
        {isOn && !isDeleteMode && !isBurned && (
          <pointLight
            position={[0, 0.15, 0]}
            color={color}
            intensity={0.7}
            distance={3}
            decay={2}
          />
        )}
        
        {/* Smoke particles when LED is burned */}
        {isBurned && !isDeleteMode && (
          <SmokeParticles position={[0, 0.2, 0]} />
        )}
      </group>
    )
  }
)

LED3D.displayName = 'LED3D'

export default LED3D