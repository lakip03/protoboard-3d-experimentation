# 3D Protoboard Circuit Simulator

An experimental 3D circuit simulator for building and testing electronic circuits on a virtual protoboard. This project explores the intersection of 3D web development and circuit simulation using React Three Fiber and Next.js.

> **⚠️ Experimental Project Notice**  
> This is a proof-of-concept created during a week-long exploration of 3D web technologies. The project contains known bugs, incomplete features, and various limitations. It is not intended for production use and serves purely as a learning experiment.

## Features (Experimental)

- **3D Interactive Protoboard**: Build circuits in a 3D environment (with placement quirks)
- **Electronic Components**: 
  - LEDs with lighting effects (may not always respond correctly)
  - Resistors with color-coded bands
  - Batteries for power supply
  - Switches for circuit control (toggling may be inconsistent)
  - Transistors (limited functionality)
  - Connecting wires (connection detection can be unreliable)
- **Circuit Simulation**: Electrical simulation with basic voltage calculations (results may vary)
- **Component Placement**: Drag-and-drop interface (positioning can be finicky)
- **Visual Effects**: LED lighting and smoke effects (when they work)

## Technology Stack

- **Frontend**: Next.js 15 with React 19
- **3D Graphics**: React Three Fiber with Three.js
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Development**: Turbopack for fast development builds

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd protoboard-3d
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage (Your Mileage May Vary)

1. **Adding Components**: Use the side menu to select components - placement may require multiple attempts
2. **Connecting Circuits**: Click and drag to create wires - connections might not always register
3. **Running Simulation**: Use controls to start/stop simulation - results can be unpredictable
4. **Component Interaction**: Click switches to toggle - may need several clicks to register

## Known Issues & Limitations

- **Circuit Analysis**: Simulation logic has numerous edge cases and bugs
- **Component Placement**: Positioning can be inconsistent and frustrating
- **Wire Connections**: Connection detection is unreliable
- **3D Interactions**: Mouse/touch events may not always register properly
- **Performance**: Can be sluggish with complex circuits
- **Mobile**: Not optimized for mobile devices
- **State Management**: Component states may not persist correctly
- **Visual Glitches**: 3D rendering artifacts and inconsistent lighting

## Project Structure

```
src/
├── app/                    # Next.js app directory
├── components/            # 3D component implementations
│   ├── Battery3D.tsx     # 3D battery component
│   ├── LED3D.tsx         # 3D LED with lighting effects
│   ├── Protoboard.tsx    # Main protoboard grid
│   ├── ProtoboardScene.tsx # 3D scene setup
│   ├── Resistor3D.tsx    # 3D resistor component
│   ├── SideMenu.tsx      # Component selection menu
│   ├── Switch3D.tsx      # 3D switch component
│   ├── Transistor3D.tsx  # 3D transistor component
│   └── Wire3D.tsx        # 3D wire connections
├── contexts/             # React context for state management
│   └── ComponentContext.tsx
└── utils/               # Utility functions
    └── circuitSimulation.ts # Circuit simulation logic
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production version (may have build warnings)
- `npm run start` - Start production server
- `npm run lint` - Run ESLint (expect some warnings)

## What I Learned

This week-long experiment taught me:
- React Three Fiber basics and 3D scene management
- Complex state management across 3D components
- Circuit simulation algorithms (Ohm's Law, voltage calculations)
- The challenges of 3D user interaction design
- Why production 3D applications require much more time and testing

## About This Project

Created as a fun week-long dive into 3D web development and circuit simulation. While it doesn't work perfectly (or sometimes at all), it was an excellent learning experience in modern web technologies and 3D graphics programming.

**This project will not receive updates or bug fixes** - it exists as a snapshot of a week's worth of experimentation and learning. Feel free to explore the code, but don't expect it to be production-ready!

## License

MIT License - see LICENSE file for details.