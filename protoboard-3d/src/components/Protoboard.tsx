'use client'

import { useComponents } from '@/contexts/ComponentContext'
import { ThreeEvent } from '@react-three/fiber'
import Resistor3D from './Resistor3D'
import Wire3D from './Wire3D'
import LED3D from './LED3D'
import { useState } from 'react'

export function Protoboard() {
  const { 
    selectedComponent, 
    addComponent, 
    placedComponents,
    removeComponent,
    isPlacingWire, 
    setIsPlacingWire, 
    wireStartPosition, 
    setWireStartPosition,
    isPlacingResistor,
    setIsPlacingResistor,
    resistorStartPosition,
    setResistorStartPosition,
    isPlacingLED,
    setIsPlacingLED,
    ledStartPosition,
    setLEDStartPosition,
    isDeleteMode,
    circuitSimulation
  } = useComponents()
  
  const [hoveredHole, setHoveredHole] = useState<[number, number] | null>(null)

  const getHolePosition = (row: number, col: number): [number, number, number] => {
    return [-3.6 + (col * 0.3), 0.15, -1.8 + (row * 0.3)]
  }

  const handleComponentClick = (componentId: string) => {
    if (isDeleteMode) {
      const component = placedComponents.find(c => c.id === componentId)
      const componentType = component?.type === 'resistor' ? 'resistor' : 
                           component?.type === 'led' ? 'LED' : 'wire'
      const confirmed = window.confirm(`🗑️ Delete this ${componentType}?`)
      if (confirmed) {
        removeComponent(componentId)
      }
    }
  }

  const handleHoleClick = (event: ThreeEvent<MouseEvent>, row: number, col: number) => {
    event.stopPropagation()
    
    if (isDeleteMode || !selectedComponent) return
    
    const position = getHolePosition(row, col)
    
    if (selectedComponent.type === 'wire') {
      if (!isPlacingWire) {
        setIsPlacingWire(true)
        setWireStartPosition(position)
      } else {
        if (wireStartPosition) {
          const wireId = Date.now().toString()
          addComponent({
            id: wireId,
            type: 'wire',
            position: [0, 0, 0],
            startPosition: wireStartPosition,
            endPosition: position,
            color: selectedComponent.color || '#000000'
          })
          setIsPlacingWire(false)
          setWireStartPosition(null)
        }
      }
    } else if (selectedComponent.type === 'resistor') {
      if (!isPlacingResistor) {
        setIsPlacingResistor(true)
        setResistorStartPosition(position)
      } else {
        if (resistorStartPosition) {
          // Calculate if positions are exactly 3 holes apart
          const startRow = Math.round((resistorStartPosition[2] + 1.8) / 0.3)
          const startCol = Math.round((resistorStartPosition[0] + 3.6) / 0.3)
          const endRow = Math.round((position[2] + 1.8) / 0.3)
          const endCol = Math.round((position[0] + 3.6) / 0.3)
          
          // Check if it's exactly 2 holes apart horizontally or vertically
          const isValidPlacement = 
            (Math.abs(endCol - startCol) === 2 && endRow === startRow) ||
            (Math.abs(endRow - startRow) === 2 && endCol === startCol)
          
          if (isValidPlacement) {
            const resistorId = Date.now().toString()
            addComponent({
              id: resistorId,
              type: 'resistor',
              position: resistorStartPosition,
              endPosition: position,
              value: selectedComponent.value || '220',
              color: selectedComponent.color || '#ff6b6b'
            })
            setIsPlacingResistor(false)
            setResistorStartPosition(null)
          } else {
            // Show feedback that placement is invalid
            alert('⚠️ Resistors must be placed exactly 2 holes apart!')
          }
        }
      }
    } else if (selectedComponent.type === 'led') {
      if (!isPlacingLED) {
        setIsPlacingLED(true)
        setLEDStartPosition(position)
      } else {
        if (ledStartPosition) {
          // Calculate if positions are exactly 2 holes apart
          const startRow = Math.round((ledStartPosition[2] + 1.8) / 0.3)
          const startCol = Math.round((ledStartPosition[0] + 3.6) / 0.3)
          const endRow = Math.round((position[2] + 1.8) / 0.3)
          const endCol = Math.round((position[0] + 3.6) / 0.3)
          
          // Check if it's exactly 1 hole apart horizontally or vertically
          const isValidPlacement = 
            (Math.abs(endCol - startCol) === 1 && endRow === startRow) ||
            (Math.abs(endRow - startRow) === 1 && endCol === startCol)
          
          if (isValidPlacement) {
            const ledId = Date.now().toString()
            
            // Determine polarity based on placement direction
            // If placed left-to-right or top-to-bottom, it's normal
            // If placed right-to-left or bottom-to-top, it's reversed
            const isReversed = (endCol < startCol) || (endRow < startRow)
            
            addComponent({
              id: ledId,
              type: 'led',
              position: ledStartPosition,
              endPosition: position,
              color: selectedComponent.color || '#ff0000',
              polarity: isReversed ? 'reversed' : 'normal'
            })
            setIsPlacingLED(false)
            setLEDStartPosition(null)
          } else {
            // Show feedback that placement is invalid
            alert('⚠️ LEDs must be placed exactly 1 hole apart!')
          }
        }
      }
    }
  }

  return (
    <group position={[0, 0, 0]}>
      {/* Main protoboard base */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[8, 0.2, 6]} />
        <meshStandardMaterial color="#f8f8f8" />
      </mesh>

      {/* Female holes pattern - bigger and fewer for kids */}
      {Array.from({ length: 12 }, (_, i) =>
        Array.from({ length: 25 }, (_, j) => (
          <mesh
            key={`hole-${i}-${j}`}
            position={getHolePosition(i, j)}
            onClick={(e) => handleHoleClick(e, i, j)}
            onPointerEnter={() => setHoveredHole([i, j])}
            onPointerLeave={() => setHoveredHole(null)}
          >
            <cylinderGeometry args={[0.08, 0.08, 0.05]} />
            <meshStandardMaterial 
              color={
                (wireStartPosition && 
                 wireStartPosition[0] === getHolePosition(i, j)[0] && 
                 wireStartPosition[2] === getHolePosition(i, j)[2]) ? "#ff6600" :
                (resistorStartPosition && 
                 resistorStartPosition[0] === getHolePosition(i, j)[0] && 
                 resistorStartPosition[2] === getHolePosition(i, j)[2]) ? "#ff0066" :
                (ledStartPosition && 
                 ledStartPosition[0] === getHolePosition(i, j)[0] && 
                 ledStartPosition[2] === getHolePosition(i, j)[2]) ? "#ffff00" :
                (hoveredHole?.[0] === i && hoveredHole?.[1] === j) ? "#00ff88" : 
                "#2a2a2a"
              } 
            />
          </mesh>
        ))
      )}

      {/* Power rails */}
      <mesh position={[0, 0.05, 2.7]}>
        <boxGeometry args={[7, 0.02, 0.3]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
      
      <mesh position={[0, 0.05, 2.3]}>
        <boxGeometry args={[7, 0.02, 0.3]} />
        <meshStandardMaterial color="#0000ff" />
      </mesh>

      <mesh position={[0, 0.05, -2.3]}>
        <boxGeometry args={[7, 0.02, 0.3]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
      
      <mesh position={[0, 0.05, -2.7]}>
        <boxGeometry args={[7, 0.02, 0.3]} />
        <meshStandardMaterial color="#0000ff" />
      </mesh>

      {/* Placed components */}
      {placedComponents.map((component) => {
        if (component.type === 'resistor' && component.endPosition) {
          return (
            <Resistor3D
              key={component.id}
              position={component.position}
              endPosition={component.endPosition}
              value={component.value || '220'}
              color={component.color || '#ff6b6b'}
              onClick={() => handleComponentClick(component.id)}
              isDeleteMode={isDeleteMode}
            />
          )
        } else if (component.type === 'led' && component.endPosition) {
          const circuitState = circuitSimulation?.components[component.id]
          return (
            <LED3D
              key={component.id}
              position={component.position}
              endPosition={component.endPosition}
              color={component.color || '#ff0000'}
              onClick={() => handleComponentClick(component.id)}
              isDeleteMode={isDeleteMode}
              componentId={component.id}
              circuitState={circuitState}
              polarity={component.polarity}
            />
          )
        } else if (component.type === 'wire' && component.startPosition && component.endPosition) {
          const circuitState = circuitSimulation?.components[component.id]
          return (
            <Wire3D
              key={component.id}
              startPosition={component.startPosition}
              endPosition={component.endPosition}
              color={component.color || '#000000'}
              onClick={() => handleComponentClick(component.id)}
              isDeleteMode={isDeleteMode}
              current={circuitState?.current || 0}
              showCurrentFlow={circuitSimulation?.isComplete || false}
            />
          )
        }
        return null
      })}
    </group>
  )
}