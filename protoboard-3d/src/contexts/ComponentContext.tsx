'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { CircuitSimulator, CircuitSimulationResult } from '@/utils/circuitSimulation'

interface LEDState {
  isOn: boolean
  isBurned: boolean
  current: number
  voltage: number
}

interface PlacedComponent {
  id: string
  type: 'wire' | 'resistor' | 'led' | 'switch'
  position: [number, number, number]
  rotation?: [number, number, number]
  color?: string
  value?: string
  startPosition?: [number, number, number]
  endPosition?: [number, number, number]
  polarity?: 'normal' | 'reversed'
  isOn?: boolean
}

interface SelectedComponent {
  id: string
  name: string
  type: 'resistor' | 'wire' | 'led' | 'switch'
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
  isPlacingSwitch: boolean
  setIsPlacingSwitch: (placing: boolean) => void
  isDeleteMode: boolean
  setIsDeleteMode: (deleteMode: boolean) => void
  circuitSimulation: CircuitSimulationResult | null
  runCircuitSimulation: () => void
  showInstructions: boolean
  setShowInstructions: (show: boolean) => void
  isCircuitRunning: boolean
  setIsCircuitRunning: (running: boolean) => void
  ledStates: Map<string, LEDState>
  updateLEDState: (componentId: string, state: LEDState) => void
  resetAllLEDs: () => void
  updateSwitchState: (componentId: string, isOn: boolean) => void
  exportConfiguration: () => void
  importConfiguration: (file: File) => void
  clearAll: () => void
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
  const [isPlacingSwitch, setIsPlacingSwitch] = useState(false)
  const [isDeleteMode, setIsDeleteMode] = useState(false)
  const [circuitSimulation, setCircuitSimulation] = useState<CircuitSimulationResult | null>(null)
  const [showInstructions, setShowInstructions] = useState(false)
  const [isCircuitRunning, setIsCircuitRunning] = useState(false)
  const [ledStates, setLedStates] = useState<Map<string, LEDState>>(new Map())
  const [simulator] = useState(() => new CircuitSimulator())



  const addComponent = (component: PlacedComponent) => {
    setPlacedComponents(prev => [...prev, component])
    
    // Initialize LED state if it's an LED component
    if (component.type === 'led') {
      updateLEDState(component.id, {
        isOn: false,
        isBurned: false,
        current: 0,
        voltage: 0
      })
    }
  }

  const removeComponent = (id: string) => {
    console.log(`Removing component ${id}`)
    setPlacedComponents(prev => {
      const newComponents = prev.filter(comp => comp.id !== id)
      console.log(`Components before: ${prev.length}, after: ${newComponents.length}`)
      return newComponents
    })
    // Remove LED state if it's an LED component
    setLedStates(prev => {
      const newStates = new Map(prev)
      newStates.delete(id)
      return newStates
    })
    // Stop circuit when component is deleted
    setIsCircuitRunning(false)
    setCircuitSimulation(null)
  }

  const updateLEDState = (componentId: string, state: LEDState) => {
    setLedStates(prev => {
      const newStates = new Map(prev)
      newStates.set(componentId, state)
      return newStates
    })
  }

  const resetAllLEDs = () => {
    setLedStates(prev => {
      const newStates = new Map()
      prev.forEach((_, id) => {
        newStates.set(id, {
          isOn: false,
          isBurned: false,
          current: 0,
          voltage: 0
        })
      })
      return newStates
    })
  }

  const updateSwitchState = (componentId: string, isOn: boolean) => {
    console.log(`Switch ${componentId} toggled to: ${isOn}`)
    
    // Update components state
    const updatedComponents = placedComponents.map(comp => 
      comp.id === componentId ? { ...comp, isOn } : comp
    )
    setPlacedComponents(updatedComponents)
    
    // Immediately rerun simulation if circuit is running
    if (isCircuitRunning) {
      console.log('Circuit is running, updating simulation...')
      console.log('Updated components:', updatedComponents)
      
      setTimeout(() => {
        simulator.loadCircuit(updatedComponents)
        const result = simulator.simulate()
        setCircuitSimulation(result)
        
        // Update LED states
        updatedComponents.forEach(component => {
          if (component.type === 'led') {
            const circuitState = result.components[component.id]
            if (circuitState) {
              console.log(`Updating LED ${component.id} to:`, circuitState)
              updateLEDState(component.id, {
                isOn: circuitState.isOn,
                isBurned: circuitState.isBurned,
                current: circuitState.current,
                voltage: circuitState.voltage
              })
            }
          }
        })
      }, 10)
    }
  }

  const runCircuitSimulation = () => {
    if (!isCircuitRunning) {
      // Start circuit simulation
      simulator.loadCircuit(placedComponents)
      const result = simulator.simulate()
      setCircuitSimulation(result)
      setIsCircuitRunning(true)
      
      // Update LED states based on simulation results
      placedComponents.forEach(component => {
        if (component.type === 'led') {
          const circuitState = result.components[component.id]
          if (circuitState) {
            updateLEDState(component.id, {
              isOn: circuitState.isOn,
              isBurned: circuitState.isBurned,
              current: circuitState.current,
              voltage: circuitState.voltage
            })
          }
        }
      })
      
      if (result.errors.length > 0) {
        result.errors.forEach(error => alert(error))
      }
      
      if (result.warnings.length > 0) {
        result.warnings.forEach(warning => alert(warning))
      }
    } else {
      // Stop circuit simulation and repair all LEDs
      setIsCircuitRunning(false)
      setCircuitSimulation(null)
      resetAllLEDs()
    }
  }

  const exportConfiguration = () => {
    const fileName = prompt('Enter a name for your circuit:', 'my-circuit') || 'my-circuit'
    
    const config = {
      placedComponents,
      ledStates: Array.from(ledStates.entries()),
      timestamp: new Date().toISOString()
    }
    
    const dataStr = JSON.stringify(config, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `${fileName}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const importConfiguration = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string)
        
        if (config.placedComponents && Array.isArray(config.placedComponents)) {
          // Stop circuit if running
          setIsCircuitRunning(false)
          setCircuitSimulation(null)
          
          // Load components
          setPlacedComponents(config.placedComponents)
          
          // Load LED states if available
          if (config.ledStates && Array.isArray(config.ledStates)) {
            const newLedStates = new Map(config.ledStates as [string, LEDState][])
            setLedStates(newLedStates)
          } else {
            // Initialize LED states for imported LEDs
            const newLedStates = new Map()
            config.placedComponents.forEach((component: PlacedComponent) => {
              if (component.type === 'led') {
                newLedStates.set(component.id, {
                  isOn: false,
                  isBurned: false,
                  current: 0,
                  voltage: 0
                })
              }
            })
            setLedStates(newLedStates)
          }
          
          alert('Configuration imported successfully!')
        } else {
          alert('Invalid configuration file format')
        }
      } catch {
        alert('Error reading configuration file')
      }
    }
    reader.readAsText(file)
  }

  const clearAll = () => {
    if (placedComponents.length > 0) {
      const confirmClear = confirm('Are you sure you want to clear all components from the protoboard?')
      if (confirmClear) {
        setPlacedComponents([])
        setLedStates(new Map())
        setIsCircuitRunning(false)
        setCircuitSimulation(null)
        setSelectedComponent(null)
        setIsDeleteMode(false)
        setIsPlacingWire(false)
        setWireStartPosition(null)
        setIsPlacingResistor(false)
        setResistorStartPosition(null)
        setIsPlacingLED(false)
        setLEDStartPosition(null)
        setIsPlacingSwitch(false)
      }
    }
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
      isPlacingSwitch,
      setIsPlacingSwitch,
      isDeleteMode,
      setIsDeleteMode,
      circuitSimulation,
      runCircuitSimulation,
      showInstructions,
      setShowInstructions,
      isCircuitRunning,
      setIsCircuitRunning,
      ledStates,
      updateLEDState,
      resetAllLEDs,
      updateSwitchState,
      exportConfiguration,
      importConfiguration,
      clearAll
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