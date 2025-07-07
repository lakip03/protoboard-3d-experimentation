'use client'

import { forwardRef, useEffect, useState, useRef } from 'react'
import * as THREE from 'three'

interface LED3DProps {
  position: [number, number, number]
  endPosition: [number, number, number]
  color: string
  onClick?: () => void
  isDeleteMode?: boolean
}

// Global LED state
let globalLEDState = false
let globalLEDBurnedState = false
const ledStateCallbacks: Set<() => void> = new Set()
const ledBurnCallbacks: Set<() => void> = new Set()

// Console commands to control LED
if (typeof window !== 'undefined') {
  (window as any).toggleLED = () => {
    if (!globalLEDBurnedState) {
      globalLEDState = !globalLEDState
      console.log(`LED turned ${globalLEDState ? 'ON' : 'OFF'}`)
      ledStateCallbacks.forEach(callback => callback())
    } else {
      console.log('❌ Cannot turn on burned LED! Use repairLED() first.')
    }
  }
  
  (window as any).setLED = (state: boolean) => {
    if (!globalLEDBurnedState || !state) {
      globalLEDState = state
      console.log(`LED turned ${globalLEDState ? 'ON' : 'OFF'}`)
      ledStateCallbacks.forEach(callback => callback())
    } else {
      console.log('❌ Cannot turn on burned LED! Use repairLED() first.')
    }
  }
  
  (window as any).burnLED = () => {
    globalLEDBurnedState = true
    globalLEDState = false
    console.log('💥 LED BURNED OUT! Smoke particles activated.')
    ledBurnCallbacks.forEach(callback => callback())
    ledStateCallbacks.forEach(callback => callback())
  }
  
  (window as any).repairLED = () => {
    globalLEDBurnedState = false
    console.log('🔧 LED repaired and ready to use!')
    ledBurnCallbacks.forEach(callback => callback())
  }
}

// Smoke Particle Component
function SmokeParticles({ position }: { position: [number, number, number] }) {
  const smokeRef = useRef<THREE.Group>(null)
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
  ({ position, endPosition, color, onClick, isDeleteMode }, ref) => {
    const [isOn, setIsOn] = useState(globalLEDState)
    const [isBurned, setIsBurned] = useState(globalLEDBurnedState)
    
    useEffect(() => {
      const stateCallback = () => setIsOn(globalLEDState)
      const burnCallback = () => setIsBurned(globalLEDBurnedState)
      
      ledStateCallbacks.add(stateCallback)
      ledBurnCallbacks.add(burnCallback)
      
      return () => {
        ledStateCallbacks.delete(stateCallback)
        ledBurnCallbacks.delete(burnCallback)
      }
    }, [])

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
      <group ref={ref} position={midPoint} rotation={[0, -angle, 0]} onClick={onClick}>
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
        
        {/* Left pin (cathode - shorter) */}
        <mesh position={[0, -0.08, length / 2]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.08]} />
          <meshStandardMaterial color="#C0C0C0" />
        </mesh>
        
        {/* Right pin (anode - longer) */}
        <mesh position={[0, -0.08, -length / 2]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.08]} />
          <meshStandardMaterial color="#C0C0C0" />
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