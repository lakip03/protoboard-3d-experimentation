'use client'

import { useState } from 'react'
import { useComponents } from '@/contexts/ComponentContext'

interface Component {
  id: string
  name: string
  type: 'resistor' | 'wire' | 'led' | 'switch'
  color?: string
  value?: string
  emoji?: string
}

const components: Component[] = [
  { id: '1', name: '220Ω Resistor', type: 'resistor', color: '#ff6b6b', value: '220', emoji: '⚡' },
  { id: '2', name: '1kΩ Resistor', type: 'resistor', color: '#4ecdc4', value: '1000', emoji: '⚡' },
  { id: '3', name: '10kΩ Resistor', type: 'resistor', color: '#45b7d1', value: '10000', emoji: '⚡' },
  { id: '4', name: '100Ω Resistor', type: 'resistor', color: '#ffd93d', value: '100', emoji: '⚡' },
  { id: '5', name: '470Ω Resistor', type: 'resistor', color: '#ff9f43', value: '470', emoji: '⚡' },
  { id: '6', name: 'Red LED', type: 'led', color: '#ff0000', emoji: '💡' },
  { id: '7', name: 'Blue LED', type: 'led', color: '#0000ff', emoji: '💡' },
  { id: '8', name: 'Green LED', type: 'led', color: '#00ff00', emoji: '💡' },
  { id: '9', name: 'Yellow LED', type: 'led', color: '#ffff00', emoji: '💡' },
  { id: '10', name: 'Red Wire', type: 'wire', color: '#ff0000', emoji: '🔴' },
  { id: '11', name: 'Blue Wire', type: 'wire', color: '#0000ff', emoji: '🔵' },
  { id: '12', name: 'Green Wire', type: 'wire', color: '#00ff00', emoji: '🟢' },
  { id: '13', name: 'Yellow Wire', type: 'wire', color: '#ffff00', emoji: '🟡' },
  { id: '14', name: 'Black Wire', type: 'wire', color: '#000000', emoji: '⚫' },
  { id: '15', name: 'Switch', type: 'switch', color: '#2a2a2a', emoji: '🔘' },
]

export default function SideMenu() {
  const [isOpen, setIsOpen] = useState(true)
  const { 
    selectedComponent, 
    setSelectedComponent, 
    isPlacingWire, 
    isPlacingResistor,
    isPlacingLED,
    isPlacingSwitch,
    isDeleteMode,
    setIsDeleteMode,
    placedComponents,
    runCircuitSimulation,
    circuitSimulation,
    showInstructions,
    setShowInstructions,
    isCircuitRunning,
    ledStates,
    exportConfiguration,
    importConfiguration,
    clearAll
  } = useComponents()

  const handleComponentClick = (component: Component) => {
    setSelectedComponent(component)
    setIsDeleteMode(false)
  }

  const handleDeleteModeToggle = () => {
    setIsDeleteMode(!isDeleteMode)
    setSelectedComponent(null)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        importConfiguration(file)
      }
    }
    input.click()
  }

  return (
    <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-blue-50 to-purple-50 shadow-lg transition-transform duration-300 z-10 ${
      isOpen ? 'translate-x-0' : '-translate-x-80'
    }`}>
      <div className="w-80 h-full flex flex-col">
        <div className="p-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-purple-800 flex items-center gap-2">
              🔧 Electronic Parts
            </h2>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-3 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors text-xl"
            >
              {isOpen ? '👈' : '👉'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-6">
            {/* Run/Stop Circuit Button */}
            <div className="mb-6">
              <button
                onClick={runCircuitSimulation}
                className={`w-full p-4 rounded-xl border-3 text-center transition-all duration-200 transform hover:scale-105 shadow-lg ${
                  isCircuitRunning 
                    ? 'border-red-500 bg-red-100 hover:bg-red-200' 
                    : 'border-green-500 bg-green-100 hover:bg-green-200'
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
                  <div className="text-2xl">{isCircuitRunning ? '⏹️' : '⚡'}</div>
                  <div className={`font-bold text-lg ${
                    isCircuitRunning ? 'text-red-800' : 'text-green-800'
                  }`}>
                    {isCircuitRunning ? 'Stop Circuit' : 'Run Circuit'}
                  </div>
                </div>
              </button>
              
              {/* Circuit Status */}
              {isCircuitRunning && circuitSimulation && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-700">
                    {circuitSimulation.isComplete ? 
                      "✅ Circuit is working!" : 
                      "❌ Circuit incomplete"}
                  </p>
                  {circuitSimulation.hasShortCircuit && (
                    <p className="text-xs text-red-600 mt-1">⚠️ Short circuit detected!</p>
                  )}
                </div>
              )}
              
              
              {/* Reset Info */}
              {!isCircuitRunning && ledStates.size > 0 && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-700">
                    🔧 All LEDs have been repaired and reset
                  </p>
                </div>
              )}
            </div>

            {/* Instructions Button */}
            <div className="mb-6">
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="w-full p-4 rounded-xl border-3 text-center transition-all duration-200 transform hover:scale-105 border-blue-500 bg-blue-100 hover:bg-blue-200 shadow-lg"
              >
                <div className="flex items-center justify-center space-x-3">
                  <div className="text-2xl">📚</div>
                  <div className="font-bold text-blue-800 text-lg">
                    {showInstructions ? 'Hide Instructions' : 'Show Instructions'}
                  </div>
                </div>
              </button>
            </div>

            {/* Delete Mode Toggle */}
            <div className="mb-6">
              <button
                onClick={handleDeleteModeToggle}
                className={`w-full p-4 rounded-xl border-3 text-center transition-all duration-200 transform hover:scale-105 ${
                  isDeleteMode
                    ? 'border-red-500 bg-red-100 shadow-lg'
                    : 'border-gray-200 hover:border-red-300 hover:bg-red-50 bg-white'
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
                  <div className="text-2xl">🗑️</div>
                  <div className="font-bold text-gray-800 text-lg">
                    {isDeleteMode ? 'Exit Delete Mode' : 'Delete Components'}
                  </div>
                </div>
              </button>
              {placedComponents.length > 0 && (
                <p className="text-sm text-gray-600 mt-2 text-center">
                  {placedComponents.length} component{placedComponents.length !== 1 ? 's' : ''} on board
                </p>
              )}
            </div>

            {/* Import/Export/Clear Buttons */}
            <div className="mb-6 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={exportConfiguration}
                  disabled={placedComponents.length === 0}
                  className={`p-3 rounded-xl border-2 text-center transition-all duration-200 transform hover:scale-105 ${
                    placedComponents.length === 0
                      ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'border-green-500 bg-green-100 hover:bg-green-200 text-green-800'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <div className="text-xl">📤</div>
                    <div className="font-bold text-sm">Export</div>
                  </div>
                </button>
                <button
                  onClick={handleImport}
                  className="p-3 rounded-xl border-2 text-center transition-all duration-200 transform hover:scale-105 border-blue-500 bg-blue-100 hover:bg-blue-200 text-blue-800"
                >
                  <div className="flex flex-col items-center space-y-1">
                    <div className="text-xl">📥</div>
                    <div className="font-bold text-sm">Import</div>
                  </div>
                </button>
              </div>
              <button
                onClick={clearAll}
                disabled={placedComponents.length === 0}
                className={`w-full p-3 rounded-xl border-2 text-center transition-all duration-200 transform hover:scale-105 ${
                  placedComponents.length === 0
                    ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'border-orange-500 bg-orange-100 hover:bg-orange-200 text-orange-800'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <div className="text-xl">🧹</div>
                  <div className="font-bold text-sm">Clear All</div>
                </div>
              </button>
            </div>

          {/* Instructions Panel */}
          {showInstructions && (
            <div className="mb-6 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
              <h3 className="text-lg font-bold text-purple-800 mb-3 flex items-center gap-2">
                🎓 How to Build Circuits
              </h3>
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-white rounded-lg border border-purple-100">
                  <p className="font-medium text-purple-700">🔋 Step 1: Connect Battery</p>
                  <p className="text-purple-600">Connect a wire from the RED (+) terminal to start</p>
                </div>
                <div className="p-2 bg-white rounded-lg border border-purple-100">
                  <p className="font-medium text-purple-700">💡 Step 2: Add LED</p>
                  <p className="text-purple-600">Look for + and - symbols • Green ring = positive • Red ring = negative</p>
                </div>
                <div className="p-2 bg-white rounded-lg border border-purple-100">
                  <p className="font-medium text-purple-700">⚡ Step 3: Add Resistor</p>
                  <p className="text-purple-600">Use 220Ω resistor to protect your LED from burning!</p>
                </div>
                <div className="p-2 bg-white rounded-lg border border-purple-100">
                  <p className="font-medium text-purple-700">🔌 Step 4: Complete Circuit</p>
                  <p className="text-purple-600">Connect back to BLACK (-) terminal</p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                  <p className="font-medium text-green-700">✨ Remember:</p>
                  <p className="text-green-600">LEDs: 1 hole apart • Resistors: 2 holes apart</p>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="font-medium text-purple-700">🔄 Circuit Control:</p>
                  <p className="text-purple-600">Press &quot;Run Circuit&quot; to start • Press &quot;Stop Circuit&quot; to reset & repair LEDs</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
              ⚡ Resistors
            </h3>
            <div className="space-y-3">
              {components.filter(c => c.type === 'resistor').map((component) => (
                <button
                  key={component.id}
                  onClick={() => handleComponentClick(component)}
                  className={`w-full p-4 rounded-xl border-3 text-left transition-all duration-200 transform hover:scale-105 ${
                    selectedComponent?.id === component.id
                      ? 'border-green-500 bg-green-100 shadow-lg'
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-50 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{component.emoji}</div>
                    <div 
                      className="w-8 h-3 rounded-full shadow-sm"
                      style={{ backgroundColor: component.color }}
                    />
                    <div>
                      <div className="font-bold text-gray-800 text-lg">{component.name}</div>
                      <div className="text-sm text-gray-600 font-medium">{component.value}Ω</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-yellow-700 mb-4 flex items-center gap-2">
              💡 LEDs
            </h3>
            <div className="space-y-3">
              {components.filter(c => c.type === 'led').map((component) => (
                <button
                  key={component.id}
                  onClick={() => handleComponentClick(component)}
                  className={`w-full p-4 rounded-xl border-3 text-left transition-all duration-200 transform hover:scale-105 ${
                    selectedComponent?.id === component.id
                      ? 'border-yellow-500 bg-yellow-100 shadow-lg'
                      : 'border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{component.emoji}</div>
                    <div 
                      className="w-6 h-6 rounded-full shadow-sm"
                      style={{ backgroundColor: component.color }}
                    />
                    <div className="font-bold text-gray-800 text-lg">{component.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
              🔘 Switches
            </h3>
            <div className="space-y-3">
              {components.filter(c => c.type === 'switch').map((component) => (
                <button
                  key={component.id}
                  onClick={() => handleComponentClick(component)}
                  className={`w-full p-4 rounded-xl border-3 text-left transition-all duration-200 transform hover:scale-105 ${
                    selectedComponent?.id === component.id
                      ? 'border-purple-500 bg-purple-100 shadow-lg'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{component.emoji}</div>
                    <div 
                      className="w-6 h-6 rounded-sm shadow-sm"
                      style={{ backgroundColor: component.color }}
                    />
                    <div className="font-bold text-gray-800 text-lg">{component.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
              🔌 Wires
            </h3>
            <div className="space-y-3">
              {components.filter(c => c.type === 'wire').map((component) => (
                <button
                  key={component.id}
                  onClick={() => handleComponentClick(component)}
                  className={`w-full p-4 rounded-xl border-3 text-left transition-all duration-200 transform hover:scale-105 ${
                    selectedComponent?.id === component.id
                      ? 'border-red-500 bg-red-100 shadow-lg'
                      : 'border-gray-200 hover:border-red-300 hover:bg-red-50 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{component.emoji}</div>
                    <div 
                      className="w-8 h-2 rounded-full shadow-sm"
                      style={{ backgroundColor: component.color }}
                    />
                    <div className="font-bold text-gray-800 text-lg">{component.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          </div>
        </div>

        {(selectedComponent || isDeleteMode) && (
          <div className="flex-shrink-0 p-6">
            {isDeleteMode ? (
              <div className="p-5 bg-red-100 rounded-xl border-2 border-red-300">
                <h4 className="font-bold text-red-800 mb-2 text-lg flex items-center gap-2">
                  🗑️ Delete Mode:
                </h4>
                <p className="text-red-700 font-semibold text-lg">Remove Components</p>
                <div className="mt-3 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-700 font-medium">
                    🎯 Click on any component to delete it!
                  </p>
                </div>
              </div>
            ) : selectedComponent && (
              <div className="p-5 bg-yellow-100 rounded-xl border-2 border-yellow-300">
                <h4 className="font-bold text-yellow-800 mb-2 text-lg flex items-center gap-2">
                  ✨ Selected:
                </h4>
                <p className="text-yellow-700 font-semibold text-lg">{selectedComponent.name}</p>
                <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-700 font-medium">
                    {selectedComponent.type === 'wire' && isPlacingWire
                      ? '🎯 Click on the second hole to finish the wire!'
                      : selectedComponent.type === 'resistor' && isPlacingResistor
                      ? '🎯 Click exactly 2 holes away to finish the resistor!'
                      : selectedComponent.type === 'led' && isPlacingLED
                      ? '🎯 Click exactly 1 hole away to finish the LED!'
                      : selectedComponent.type === 'switch' && isPlacingSwitch
                      ? '🎯 Click on any hole to place the switch!'
                      : selectedComponent.type === 'resistor'
                      ? '🎯 Click on two holes that are 2 spaces apart!'
                      : selectedComponent.type === 'led'
                      ? '🎯 Click on two holes that are 1 space apart!'
                      : selectedComponent.type === 'switch'
                      ? '🎯 Click on any hole to place the switch!'
                      : '🎯 Click on any hole in the protoboard to place it!'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="absolute -right-12 top-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-r-xl shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all text-xl"
        >
          🔧
        </button>
      )}
    </div>
  )
}