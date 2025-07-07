'use client'

import { forwardRef, useMemo } from 'react'
import { CatmullRomCurve3, Vector3 } from 'three'

interface Wire3DProps {
  startPosition: [number, number, number]
  endPosition: [number, number, number]
  color: string
  onClick?: () => void
  isDeleteMode?: boolean
}

const Wire3D = forwardRef<THREE.Group, Wire3DProps>(
  ({ startPosition, endPosition, color, onClick, isDeleteMode }, ref) => {
    const curve = useMemo(() => {
      const start = new Vector3(...startPosition)
      const end = new Vector3(...endPosition)
      const mid = new Vector3(
        (start.x + end.x) / 2,
        Math.max(start.y, end.y) + 0.15,
        (start.z + end.z) / 2
      )
      
      return new CatmullRomCurve3([start, mid, end])
    }, [startPosition, endPosition])

    const points = useMemo(() => curve.getPoints(20), [curve])

    return (
      <group ref={ref} onClick={onClick}>
        {/* Wire body using tube geometry */}
        <mesh castShadow receiveShadow>
          <tubeGeometry args={[curve, 20, 0.02, 8, false]} />
          <meshStandardMaterial color={isDeleteMode ? "#ff4444" : color} />
        </mesh>
        
        {/* Start connector - lower and shorter */}
        <mesh position={[startPosition[0], startPosition[1] - 0.03, startPosition[2]]} castShadow receiveShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.04]} />
          <meshStandardMaterial color="#c0c0c0" />
        </mesh>
        
        {/* End connector - lower and shorter */}
        <mesh position={[endPosition[0], endPosition[1] - 0.03, endPosition[2]]} castShadow receiveShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.04]} />
          <meshStandardMaterial color="#c0c0c0" />
        </mesh>
      </group>
    )
  }
)

Wire3D.displayName = 'Wire3D'

export default Wire3D