'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface PlacedComponent {
  id: string
  type: 'wire' | 'resistor' | 'led'
  position: [number, number, number]
  rotation?: [number, number, number]
  color?: string
  value?: string
  startPosition?: [number, number, number]
  endPosition?: [number, number, number]
}

interface SelectedComponent {
  id: string
  name: string
  type: 'resistor' | 'wire' | 'led'
  color?: string
  value?: string
  emoji?: string
}

interface ComponentContextType {
  placedComponents: PlacedComponent[]
  selectedComponent: SelectedComponent | null
  setSelectedComponent: (component: SelectedComponent | null) => void
  addComponent: (component: PlacedComponent) => void
  removeComponent: (id: string) => void
  isPlacingWire: boolean
  setIsPlacingWire: (placing: boolean) => void
  wireStartPosition: [number, number, number] | null
  setWireStartPosition: (position: [number, number, number] | null) => void
  isPlacingResistor: boolean
  setIsPlacingResistor: (placing: boolean) => void
  resistorStartPosition: [number, number, number] | null
  setResistorStartPosition: (position: [number, number, number] | null) => void
  isPlacingLED: boolean
  setIsPlacingLED: (placing: boolean) => void
  ledStartPosition: [number, number, number] | null
  setLEDStartPosition: (position: [number, number, number] | null) => void
  isDeleteMode: boolean
  setIsDeleteMode: (deleteMode: boolean) => void
}

const ComponentContext = createContext<ComponentContextType | undefined>(undefined)

export function ComponentProvider({ children }: { children: ReactNode }) {
  const [placedComponents, setPlacedComponents] = useState<PlacedComponent[]>([])
  const [selectedComponent, setSelectedComponent] = useState<SelectedComponent | null>(null)
  const [isPlacingWire, setIsPlacingWire] = useState(false)
  const [wireStartPosition, setWireStartPosition] = useState<[number, number, number] | null>(null)
  const [isPlacingResistor, setIsPlacingResistor] = useState(false)
  const [resistorStartPosition, setResistorStartPosition] = useState<[number, number, number] | null>(null)
  const [isPlacingLED, setIsPlacingLED] = useState(false)
  const [ledStartPosition, setLEDStartPosition] = useState<[number, number, number] | null>(null)
  const [isDeleteMode, setIsDeleteMode] = useState(false)

  const addComponent = (component: PlacedComponent) => {
    setPlacedComponents(prev => [...prev, component])
  }

  const removeComponent = (id: string) => {
    setPlacedComponents(prev => prev.filter(comp => comp.id !== id))
  }

  return (
    <ComponentContext.Provider value={{
      placedComponents,
      selectedComponent,
      setSelectedComponent,
      addComponent,
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
      setIsDeleteMode
    }}>
      {children}
    </ComponentContext.Provider>
  )
}

export function useComponents() {
  const context = useContext(ComponentContext)
  if (context === undefined) {
    throw new Error('useComponents must be used within a ComponentProvider')
  }
  return context
}