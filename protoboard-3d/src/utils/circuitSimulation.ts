export interface PlacedComponent {
  id: string
  type: 'wire' | 'resistor' | 'led'
  position: [number, number, number]
  color?: string
  value?: string
  startPosition?: [number, number, number]
  endPosition?: [number, number, number]
  polarity?: 'normal' | 'reversed'
}

export interface CircuitNode {
  id: string
  position: [number, number, number]
  connections: string[]
  voltage: number
  isConnected: boolean
}

export interface CircuitComponent {
  id: string
  type: 'wire' | 'resistor' | 'led' | 'battery'
  startNode: string
  endNode: string
  resistance?: number
  voltage?: number
  forwardVoltage?: number
  color?: string
  value?: string
  isReversed?: boolean
  position?: [number, number, number]
  endPosition?: [number, number, number]
  startPosition?: [number, number, number]
}

export interface CircuitSimulationResult {
  isComplete: boolean
  hasShortCircuit: boolean
  components: {
    [componentId: string]: {
      current: number
      voltage: number
      power: number
      isOn: boolean
      isBurned: boolean
    }
  }
  nodes: {
    [nodeId: string]: {
      voltage: number
    }
  }
  errors: string[]
  warnings: string[]
}

export class CircuitSimulator {
  private nodes: Map<string, CircuitNode> = new Map()
  private components: Map<string, CircuitComponent> = new Map()
  private batteryVoltage = 9

  constructor() {
    this.initializeBatteryNodes()
  }

  private initializeBatteryNodes() {
    this.nodes.set('battery-positive', {
      id: 'battery-positive',
      position: [6.15, 1.07, 0],
      connections: [],
      voltage: this.batteryVoltage,
      isConnected: true
    })

    this.nodes.set('battery-negative', {
      id: 'battery-negative', 
      position: [5.85, 1.07, 0],
      connections: [],
      voltage: 0,
      isConnected: true
    })
  }

  private positionToNodeId(position: [number, number, number]): string {
    return `node-${position[0]}-${position[1]}-${position[2]}`
  }

  private getOrCreateNode(position: [number, number, number]): CircuitNode {
    const id = this.positionToNodeId(position)
    
    if (!this.nodes.has(id)) {
      this.nodes.set(id, {
        id,
        position,
        connections: [],
        voltage: 0,
        isConnected: false
      })
    }
    
    return this.nodes.get(id)!
  }

  private getResistanceValue(valueStr: string): number {
    const value = parseInt(valueStr)
    return value || 220
  }

  private getLEDForwardVoltage(color: string): number {
    switch (color.toLowerCase()) {
      case '#ff0000': return 2.0 // Red
      case '#00ff00': return 2.1 // Green  
      case '#0000ff': return 3.2 // Blue
      case '#ffff00': return 2.0 // Yellow
      default: return 2.0
    }
  }


  loadCircuit(placedComponents: PlacedComponent[]): void {
    this.nodes.clear()
    this.components.clear()
    this.initializeBatteryNodes()

    placedComponents.forEach(component => {
      if (component.type === 'wire' && component.startPosition && component.endPosition) {
        const startNode = this.getOrCreateNode(component.startPosition)
        const endNode = this.getOrCreateNode(component.endPosition)
        
        startNode.connections.push(endNode.id)
        endNode.connections.push(startNode.id)
        
        this.components.set(component.id, {
          id: component.id,
          type: 'wire',
          startNode: startNode.id,
          endNode: endNode.id,
          resistance: 0.01,
          color: component.color,
          startPosition: component.startPosition,
          endPosition: component.endPosition
        })
      } else if (component.type === 'resistor' && component.position && component.endPosition) {
        const startNode = this.getOrCreateNode(component.position)
        const endNode = this.getOrCreateNode(component.endPosition)
        
        startNode.connections.push(endNode.id)
        endNode.connections.push(startNode.id)
        
        this.components.set(component.id, {
          id: component.id,
          type: 'resistor',
          startNode: startNode.id,
          endNode: endNode.id,
          resistance: this.getResistanceValue(component.value || '220'),
          color: component.color,
          value: component.value
        })
      } else if (component.type === 'led' && component.position && component.endPosition) {
        const startNode = this.getOrCreateNode(component.position)
        const endNode = this.getOrCreateNode(component.endPosition)
        
        startNode.connections.push(endNode.id)
        endNode.connections.push(startNode.id)
        
        this.components.set(component.id, {
          id: component.id,
          type: 'led',
          startNode: startNode.id,
          endNode: endNode.id,
          resistance: 20, // Much lower resistance for realistic LED behavior
          forwardVoltage: this.getLEDForwardVoltage(component.color || '#ff0000'),
          color: component.color
        })
      }
    })

    this.connectBatteryTerminals()
  }

  private connectBatteryTerminals(): void {
    const positiveTerminal = this.nodes.get('battery-positive')!
    const negativeTerminal = this.nodes.get('battery-negative')!

    console.log('Battery terminal positions:', {
      positive: positiveTerminal.position,
      negative: negativeTerminal.position
    })

    // Check all components (especially wires) that connect to battery terminals
    for (const [componentId, component] of this.components) {
      if (component.type === 'wire' && component.startPosition && component.endPosition) {
        console.log(`Checking wire ${componentId}:`, {
          startPosition: component.startPosition,
          endPosition: component.endPosition,
          startNearPos: this.isPositionNear(component.startPosition, positiveTerminal.position),
          endNearPos: this.isPositionNear(component.endPosition, positiveTerminal.position),
          startNearNeg: this.isPositionNear(component.startPosition, negativeTerminal.position),
          endNearNeg: this.isPositionNear(component.endPosition, negativeTerminal.position)
        })
        
        // Check if wire starts or ends at battery terminal
        if (this.isPositionNear(component.startPosition, positiveTerminal.position)) {
          const endNode = this.nodes.get(component.endNode)
          if (endNode) {
            positiveTerminal.connections.push(component.endNode)
            endNode.connections.push('battery-positive')
            console.log(`Connected positive terminal to node ${component.endNode}`)
          }
        }
        if (this.isPositionNear(component.endPosition, positiveTerminal.position)) {
          const startNode = this.nodes.get(component.startNode)
          if (startNode) {
            positiveTerminal.connections.push(component.startNode)
            startNode.connections.push('battery-positive')
            console.log(`Connected positive terminal to node ${component.startNode}`)
          }
        }
        if (this.isPositionNear(component.startPosition, negativeTerminal.position)) {
          const endNode = this.nodes.get(component.endNode)
          if (endNode) {
            negativeTerminal.connections.push(component.endNode)
            endNode.connections.push('battery-negative')
            console.log(`Connected negative terminal to node ${component.endNode}`)
          }
        }
        if (this.isPositionNear(component.endPosition, negativeTerminal.position)) {
          const startNode = this.nodes.get(component.startNode)
          if (startNode) {
            negativeTerminal.connections.push(component.startNode)
            startNode.connections.push('battery-negative')
            console.log(`Connected negative terminal to node ${component.startNode}`)
          }
        }
      }
    }
  }

  private isPositionNear(pos1: [number, number, number], pos2: [number, number, number]): boolean {
    const threshold = 0.1 // Increased threshold for better matching
    const distance = Math.sqrt(
      Math.pow(pos1[0] - pos2[0], 2) + 
      Math.pow(pos1[1] - pos2[1], 2) + 
      Math.pow(pos1[2] - pos2[2], 2)
    )
    return distance < threshold
  }

  private findConnectedNodes(startNodeId: string): Set<string> {
    const visited = new Set<string>()
    const queue = [startNodeId]
    
    while (queue.length > 0) {
      const currentNodeId = queue.shift()!
      
      if (visited.has(currentNodeId)) continue
      visited.add(currentNodeId)
      
      const node = this.nodes.get(currentNodeId)
      if (!node) continue
      
      for (const connectedNodeId of node.connections) {
        if (!visited.has(connectedNodeId)) {
          queue.push(connectedNodeId)
        }
      }
    }
    
    return visited
  }

  private hasDirectShortCircuit(): boolean {
    // Check if there's a path from battery positive to battery negative that goes only through wires
    // (no resistors or LEDs to limit current)
    
    // Get all components that form a path from positive to negative
    const pathComponents = this.findPathComponents('battery-positive', 'battery-negative')
    
    if (pathComponents.length === 0) return false
    
    // Check if the path contains only wires (no resistors or LEDs)
    const hasOnlyWires = pathComponents.every(component => component.type === 'wire')
    
    return hasOnlyWires
  }

  private findPathComponents(startNodeId: string, endNodeId: string): CircuitComponent[] {
    const visited = new Set<string>()
    const queue = [{ nodeId: startNodeId, path: [] as CircuitComponent[] }]
    
    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!
      
      if (visited.has(nodeId)) continue
      visited.add(nodeId)
      
      if (nodeId === endNodeId) {
        return path
      }
      
      // Check all components connected to this node
      for (const [, component] of this.components) {
        let connectedNodeId: string | null = null
        
        if (component.startNode === nodeId) {
          connectedNodeId = component.endNode
        } else if (component.endNode === nodeId) {
          connectedNodeId = component.startNode
        }
        
        if (connectedNodeId && !visited.has(connectedNodeId)) {
          queue.push({ 
            nodeId: connectedNodeId, 
            path: [...path, component] 
          })
        }
      }
    }
    
    return []
  }

  private calculateNodeVoltages(): void {
    // Reset all node voltages
    for (const [, node] of this.nodes) {
      node.voltage = 0
      node.isConnected = false
    }
    
    // Set battery terminal voltages
    const positiveTerminal = this.nodes.get('battery-positive')
    const negativeTerminal = this.nodes.get('battery-negative')
    
    if (positiveTerminal) {
      positiveTerminal.voltage = this.batteryVoltage
      positiveTerminal.isConnected = true
    }
    
    if (negativeTerminal) {
      negativeTerminal.voltage = 0
      negativeTerminal.isConnected = true
    }
    
    // Propagate voltages separately for positive and negative terminals
    this.propagateVoltageFromTerminal('battery-positive', this.batteryVoltage)
    this.propagateVoltageFromTerminal('battery-negative', 0)
  }

  private propagateVoltageFromTerminal(terminalId: string, voltage: number): void {
    const queue = [terminalId]
    const visited = new Set<string>()
    
    while (queue.length > 0) {
      const nodeId = queue.shift()!
      
      if (visited.has(nodeId)) continue
      visited.add(nodeId)
      
      const node = this.nodes.get(nodeId)
      if (!node) continue
      
      // Set voltage for this node
      node.voltage = voltage
      node.isConnected = true
      
      // Process direct connections from battery terminals
      for (const connectedNodeId of node.connections) {
        if (!visited.has(connectedNodeId)) {
          queue.push(connectedNodeId)
        }
      }
      
      // Find all wires connected to this node
      for (const [, component] of this.components) {
        if (component.type === 'wire') {
          let connectedNodeId: string | null = null
          
          if (component.startNode === nodeId) {
            connectedNodeId = component.endNode
          } else if (component.endNode === nodeId) {
            connectedNodeId = component.startNode
          }
          
          if (connectedNodeId && !visited.has(connectedNodeId)) {
            queue.push(connectedNodeId)
          }
        }
      }
    }
  }


  private calculateCurrent(component: CircuitComponent): number {
    if (component.type === 'led') {
      // Force voltage to battery voltage if circuit is complete
      const voltageDiff = this.batteryVoltage
      const forwardVoltage = component.forwardVoltage || 2.0
      
      if (voltageDiff < forwardVoltage) return 0
      
      // Check if there's a resistor in the circuit
      const resistorInPath = this.findResistorInLEDPath()
      let totalResistance = component.resistance || 20 // LED internal resistance
      
      if (resistorInPath) {
        totalResistance += resistorInPath.resistance || 220
        console.log(`LED ${component.id} has resistor ${resistorInPath.resistance}Ω in path`)
      } else {
        console.log(`LED ${component.id} has NO RESISTOR - will burn out!`)
      }
      
      return (voltageDiff - forwardVoltage) / totalResistance
    }
    
    return 0.01 // Default for other components
  }

  private findResistorInLEDPath(): CircuitComponent | null {
    // Find all resistors in the circuit that are between battery terminals
    const resistorsInCircuit = Array.from(this.components.values()).filter(c => c.type === 'resistor')
    
    for (const resistor of resistorsInCircuit) {
      // Check if this resistor is in the path between LED and battery
      const resistorConnectedToPositive = this.isConnectedToBattery(resistor.startNode, 'positive') || 
                                         this.isConnectedToBattery(resistor.endNode, 'positive')
      const resistorConnectedToNegative = this.isConnectedToBattery(resistor.startNode, 'negative') || 
                                         this.isConnectedToBattery(resistor.endNode, 'negative')
      
      if (resistorConnectedToPositive && resistorConnectedToNegative) {
        return resistor
      }
    }
    
    return null
  }

  private isConnectedToBattery(nodeId: string, terminal: 'positive' | 'negative'): boolean {
    const terminalId = terminal === 'positive' ? 'battery-positive' : 'battery-negative'
    const visited = new Set<string>()
    const queue = [nodeId]
    
    while (queue.length > 0) {
      const currentNodeId = queue.shift()!
      
      if (visited.has(currentNodeId)) continue
      visited.add(currentNodeId)
      
      if (currentNodeId === terminalId) return true
      
      const node = this.nodes.get(currentNodeId)
      if (!node) continue
      
      // Check direct connections
      for (const connectedNodeId of node.connections) {
        if (!visited.has(connectedNodeId)) {
          queue.push(connectedNodeId)
        }
      }
      
      // Check wire connections
      for (const [, component] of this.components) {
        if (component.type === 'wire') {
          let connectedNodeId: string | null = null
          
          if (component.startNode === currentNodeId) {
            connectedNodeId = component.endNode
          } else if (component.endNode === currentNodeId) {
            connectedNodeId = component.startNode
          }
          
          if (connectedNodeId && !visited.has(connectedNodeId)) {
            queue.push(connectedNodeId)
          }
        }
      }
    }
    
    return false
  }

  simulate(): CircuitSimulationResult {
    const result: CircuitSimulationResult = {
      isComplete: false,
      hasShortCircuit: false,
      components: {},
      nodes: {},
      errors: [],
      warnings: []
    }

    this.calculateNodeVoltages()

    const positiveConnected = this.findConnectedNodes('battery-positive')
    const negativeConnected = this.findConnectedNodes('battery-negative')
    
    const hasCompletePath = positiveConnected.size > 1 && negativeConnected.size > 1
    
    // Check for short circuit - direct wire connection between battery terminals
    const hasShortCircuit = this.hasDirectShortCircuit()
    
    result.isComplete = hasCompletePath && !hasShortCircuit
    result.hasShortCircuit = hasShortCircuit

    // Debug logging
    console.log('Circuit Analysis:', {
      positiveConnected: positiveConnected.size,
      negativeConnected: negativeConnected.size,
      hasCompletePath,
      hasShortCircuit,
      components: this.components.size,
      nodes: this.nodes.size
    })
    
    // Debug battery connections
    const posTerminal = this.nodes.get('battery-positive')
    const negTerminal = this.nodes.get('battery-negative')
    console.log('Battery Connections:', {
      positive: {
        voltage: posTerminal?.voltage,
        connections: posTerminal?.connections
      },
      negative: {
        voltage: negTerminal?.voltage,
        connections: negTerminal?.connections
      }
    })
    
    // Debug all components
    console.log('All Components:', Array.from(this.components.values()).map(c => ({
      id: c.id,
      type: c.type,
      startNode: c.startNode,
      endNode: c.endNode,
      startPosition: c.startPosition,
      endPosition: c.endPosition
    })))

    if (hasShortCircuit) {
      result.errors.push('⚠️ Short circuit detected! Battery terminals are directly connected.')
    }

    for (const [componentId, component] of this.components) {
      const current = this.calculateCurrent(component)
      const startNode = this.nodes.get(component.startNode)
      const endNode = this.nodes.get(component.endNode)
      
      if (startNode && endNode) {
        let voltage = Math.abs(startNode.voltage - endNode.voltage)
        let power = voltage * current
        
        let isOn = false
        let isBurned = false
        
        if (component.type === 'led') {
          const forwardVoltage = component.forwardVoltage || 2.0
          
          // Check if this specific LED has a complete path to both battery terminals
          const hasPathToPositive = this.isConnectedToBattery(component.startNode, 'positive') || 
                                   this.isConnectedToBattery(component.endNode, 'positive')
          const hasPathToNegative = this.isConnectedToBattery(component.startNode, 'negative') || 
                                   this.isConnectedToBattery(component.endNode, 'negative')
          
          const hasCompleteLEDPath = hasPathToPositive && hasPathToNegative
          
          // For LEDs, use forced voltage for display and logic
          const actualVoltage = this.batteryVoltage
          
          // LED is on ONLY if it has a complete path AND current is sufficient
          isOn = hasCompleteLEDPath && current > 0.001 && actualVoltage >= forwardVoltage
          
          // LED burns ONLY if it has a complete path AND current exceeds safe threshold (30mA for typical LEDs)
          isBurned = hasCompleteLEDPath && current > 0.030
          
          // Check for reverse polarity (high voltage but no current)
          const isReverseBiased = actualVoltage > 3.0 && current < 0.001
          
          // Debug logging for LED
          console.log(`LED ${componentId}:`, {
            voltage: actualVoltage.toFixed(2) + 'V',
            current: (current * 1000).toFixed(1) + 'mA',
            forwardVoltage: forwardVoltage.toFixed(2) + 'V',
            resistance: component.resistance + 'Ω',
            isOn,
            isBurned,
            startVoltage: startNode.voltage.toFixed(2) + 'V (ignored)',
            endVoltage: endNode.voltage.toFixed(2) + 'V (ignored)'
          })
          
          // Override voltage for component result
          voltage = actualVoltage
          power = voltage * current
          
          if (isBurned) {
            result.warnings.push(`💥 LED burned out! Current too high: ${(current * 1000).toFixed(1)}mA (max: 30mA)`)
          }
          
          if (isReverseBiased) {
            result.warnings.push(`⚠️ LED may be connected backwards! Check polarity.`)
          }
        }
        
        result.components[componentId] = {
          current,
          voltage,
          power,
          isOn,
          isBurned
        }
      }
    }

    for (const [nodeId, node] of this.nodes) {
      result.nodes[nodeId] = {
        voltage: node.voltage
      }
    }

    if (!hasCompletePath && this.components.size > 0) {
      result.errors.push('🔌 Circuit is not complete. Make sure to connect positive and negative terminals.')
    }

    return result
  }

  getInstructionsForKids(): string[] {
    return [
      "🔋 Step 1: Connect a wire from the RED battery terminal (+) to start your circuit",
      "💡 Step 2: Add an LED - remember the long leg goes to positive (+)!",
      "⚡ Step 3: Add a resistor to protect your LED (220Ω is perfect)",
      "🔌 Step 4: Connect everything back to the BLACK battery terminal (-)",
      "▶️ Step 5: Press 'Run Circuit' to see your LED light up!",
      "",
      "🎯 Pro Tips:",
      "• LEDs must be 1 hole apart (anode to cathode)",
      "• Resistors must be 2 holes apart",
      "• Always use a resistor with LEDs to prevent burning!",
      "• Red terminal (+) = positive, Black terminal (-) = negative"
    ]
  }
}