import React from 'react';
import * as THREE from 'three';
import { TaskManager } from './Tasks';
import { Text } from '@react-three/drei';

const GameMap = () => {
  return (
    <group>
      {/* Spaceship Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color={0x333344} roughness={0.6} metalness={0.5} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Ceiling with lights */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 2.5, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color={0x222233} roughness={0.7} metalness={0.6} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Ceiling lights */}
      <CeilingLights />
      
      {/* Main Corridor */}
      <SpaceshipCorridor />
      
      {/* Medical Bay (with blue cross) */}
      <MedicalBay position={[-10, 0, -10]} />
      
      {/* Engine Room */}
      <EngineRoom position={[10, 0, -10]} />
      
      {/* Navigation Room */}
      <NavigationRoom position={[-10, 0, 10]} />
      
      {/* Electrical Room */}
      <ElectricalRoom position={[10, 0, 10]} />
      
      {/* Central Meeting Area */}
      <MeetingArea position={[0, 0, 0]} />
    </group>
  );
};

// Spaceship Wall component with metallic look and colored stripe
const Wall = ({ position, width, height, rotation = [0, 0, 0], color = 0x1a3b5c, stripeColor = 0xffcc00, hasStripe = true }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Main wall */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.2]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.7} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Colored stripe */}
      {hasStripe && (
        <mesh position={[0, 0, 0.11]} castShadow>
          <boxGeometry args={[width, height * 0.1, 0.02]} />
          <meshStandardMaterial color={stripeColor} roughness={0.3} metalness={0.5} emissive={stripeColor} emissiveIntensity={0.2} side={THREE.DoubleSide} />
        </mesh>
      )}
      
      {/* Wall details - rivets/panels */}
      <WallDetails width={width} height={height} />
    </group>
  );
};

// Task component - now styled as spaceship control panels
const Task = ({ position }) => {
  return (
    <group position={position}>
      {/* Control panel base */}
      <mesh castShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[1.5, 1, 1]} />
        <meshStandardMaterial color={0x333344} roughness={0.4} metalness={0.7} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Screen */}
      <mesh position={[0, 0.7, 0.51]} castShadow>
        <boxGeometry args={[1.2, 0.6, 0.05]} />
        <meshStandardMaterial color={0x00ff88} emissive={0x00ff88} emissiveIntensity={0.5} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Control buttons */}
      <mesh position={[0.4, 0.3, 0.51]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.1, 16]} />
        <meshStandardMaterial color={0xff0000} emissive={0xff0000} emissiveIntensity={0.5} side={THREE.DoubleSide} />
      </mesh>
      
      <mesh position={[0, 0.3, 0.51]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.1, 16]} />
        <meshStandardMaterial color={0x00ff00} emissive={0x00ff00} emissiveIntensity={0.5} side={THREE.DoubleSide} />
      </mesh>
      
      <mesh position={[-0.4, 0.3, 0.51]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.1, 16]} />
        <meshStandardMaterial color={0x0088ff} emissive={0x0088ff} emissiveIntensity={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// Ceiling lights component
const CeilingLights = () => {
  const lights = [];
  for (let x = -12; x <= 12; x += 6) {
    for (let z = -12; z <= 12; z += 6) {
      lights.push(
        <group key={`light-${x}-${z}`} position={[x, 2.45, z]}>
          {/* Light fixture */}
          <mesh>
            <boxGeometry args={[1, 0.1, 1]} />
            <meshStandardMaterial color={0x333344} roughness={0.5} metalness={0.8} side={THREE.DoubleSide} />
          </mesh>
          
          {/* Light panel */}
          <mesh position={[0, -0.05, 0]}>
            <boxGeometry args={[0.8, 0.02, 0.8]} />
            <meshStandardMaterial color={0xffffff} emissive={0xffffff} emissiveIntensity={1} side={THREE.DoubleSide} />
          </mesh>
          
          {/* Add point light */}
          <pointLight position={[0, -0.5, 0]} intensity={0.5} distance={8} decay={2} castShadow />
        </group>
      );
    }
  }
  return <>{lights}</>;
};

// Spaceship corridor
const SpaceshipCorridor = () => {
  return (
    <group>
      {/* Main corridor walls */}
      <Wall position={[0, 1, -8]} width={5} height={3} color={0x1a3b5c} stripeColor={0xff3366} />
      <Wall position={[0, 1, 8]} width={5} height={3} color={0x1a3b5c} stripeColor={0xff3366} />
      
      {/* Side corridors */}
      <Wall position={[-8, 1, 0]} width={5} height={3} rotation={[0, Math.PI / 2, 0]} color={0x1a3b5c} stripeColor={0x33ff66} />
      <Wall position={[8, 1, 0]} width={5} height={3} rotation={[0, Math.PI / 2, 0]} color={0x1a3b5c} stripeColor={0x33ff66} />
      
      {/* Corridor ceiling details */}
      {[-6, -3, 0, 3, 6].map((z, i) => (
        <mesh key={`ceiling-detail-${i}`} position={[0, 2.4, z]} rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[3, 0.1, 0.2]} />
          <meshStandardMaterial color={0x444455} roughness={0.5} metalness={0.7} side={THREE.DoubleSide} />
        </mesh>
      ))}
      
      {/* Floor markings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.49, 0]}>
        <planeGeometry args={[2, 20]} />
        <meshStandardMaterial color={0xffffff} roughness={0.8} metalness={0.2} opacity={0.2} transparent side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// Wall details like rivets and panels
const WallDetails = ({ width, height }) => {
  const panelWidth = 1;
  const panelHeight = 0.8;
  const panels = [];
  
  // Calculate how many panels we can fit
  const panelsX = Math.floor(width / panelWidth) - 1;
  const panelsY = Math.floor(height / panelHeight) - 1;
  
  // Create panels
  for (let x = 0; x < panelsX; x++) {
    for (let y = 0; y < panelsY; y++) {
      const xPos = -width / 2 + panelWidth / 2 + x * panelWidth + panelWidth / 2;
      const yPos = -height / 2 + panelHeight / 2 + y * panelHeight + panelHeight / 2;
      
      panels.push(
        <mesh key={`panel-${x}-${y}`} position={[xPos, yPos, 0.11]} castShadow>
          <boxGeometry args={[panelWidth - 0.1, panelHeight - 0.1, 0.01]} />
          <meshStandardMaterial color={0x111122} roughness={0.5} metalness={0.8} side={THREE.DoubleSide} />
        </mesh>
      );
      
      // Add rivets at corners
      [-1, 1].forEach(dx => {
        [-1, 1].forEach(dy => {
          panels.push(
            <mesh key={`rivet-${x}-${y}-${dx}-${dy}`} position={[xPos + dx * (panelWidth/2 - 0.1), yPos + dy * (panelHeight/2 - 0.1), 0.12]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 0.03, 8]} rotation={[Math.PI / 2, 0, 0]} />
              <meshStandardMaterial color={0x888899} roughness={0.3} metalness={0.9} side={THREE.DoubleSide} />
            </mesh>
          );
        });
      });
    }
  }
  
  return <>{panels}</>;
};

// Medical Bay with blue cross symbol
const MedicalBay = ({ position }) => {
  return (
    <group position={position}>
      {/* Room walls */}
      <Wall position={[0, 1, -3]} width={6} height={3} color={0x1a3b5c} stripeColor={0x3399ff} />
      <Wall position={[0, 1, 3]} width={6} height={3} color={0x1a3b5c} stripeColor={0x3399ff} />
      <Wall position={[-3, 1, 0]} width={6} height={3} rotation={[0, Math.PI / 2, 0]} color={0x1a3b5c} stripeColor={0x3399ff} />
      <Wall position={[3, 1, 0]} width={6} height={3} rotation={[0, Math.PI / 2, 0]} color={0x1a3b5c} stripeColor={0x3399ff} />
      
      {/* Medical symbol (blue cross) */}
      <mesh position={[0, 1.5, -2.9]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.8, 0.2, 0.1]} />
        <meshStandardMaterial color={0x3399ff} emissive={0x3399ff} emissiveIntensity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 1.5, -2.9]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.8, 0.2, 0.1]} />
        <meshStandardMaterial color={0x3399ff} emissive={0x3399ff} emissiveIntensity={0.5} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Medical equipment */}
      <Task position={[0, 0, 0]} />
    </group>
  );
};

// Engine Room with machinery
const EngineRoom = ({ position }) => {
  return (
    <group position={position}>
      {/* Room walls */}
      <Wall position={[0, 1, -3]} width={6} height={3} color={0x1a3b5c} stripeColor={0xff6600} />
      <Wall position={[0, 1, 3]} width={6} height={3} color={0x1a3b5c} stripeColor={0xff6600} />
      <Wall position={[-3, 1, 0]} width={6} height={3} rotation={[0, Math.PI / 2, 0]} color={0x1a3b5c} stripeColor={0xff6600} />
      <Wall position={[3, 1, 0]} width={6} height={3} rotation={[0, Math.PI / 2, 0]} color={0x1a3b5c} stripeColor={0xff6600} />
      
      {/* Engine core */}
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[1, 1.2, 2, 16]} />
        <meshStandardMaterial color={0x444455} roughness={0.3} metalness={0.9} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Glowing energy core */}
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 2.2, 16]} />
        <meshStandardMaterial color={0xff3300} emissive={0xff3300} emissiveIntensity={0.8} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Engine control panel */}
      <Task position={[2, 0, 0]} />
    </group>
  );
};

// Navigation Room with controls
const NavigationRoom = ({ position }) => {
  return (
    <group position={position}>
      {/* Room walls */}
      <Wall position={[0, 1, -3]} width={6} height={3} color={0x1a3b5c} stripeColor={0x66ff66} />
      <Wall position={[0, 1, 3]} width={6} height={3} color={0x1a3b5c} stripeColor={0x66ff66} />
      <Wall position={[-3, 1, 0]} width={6} height={3} rotation={[0, Math.PI / 2, 0]} color={0x1a3b5c} stripeColor={0x66ff66} />
      <Wall position={[3, 1, 0]} width={6} height={3} rotation={[0, Math.PI / 2, 0]} color={0x1a3b5c} stripeColor={0x66ff66} />
      
      {/* Navigation console */}
      <mesh position={[0, 0.5, -1.5]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[3, 1, 1]} />
        <meshStandardMaterial color={0x333344} roughness={0.4} metalness={0.7} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Console screens */}
      <mesh position={[0, 1, -1.5]} rotation={[-Math.PI / 4, 0, 0]} castShadow>
        <boxGeometry args={[2.8, 0.1, 0.8]} />
        <meshStandardMaterial color={0x00aaff} emissive={0x00aaff} emissiveIntensity={0.3} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Navigation task */}
      <Task position={[0, 0, 1]} />
    </group>
  );
};

// Electrical Room with wiring
const ElectricalRoom = ({ position }) => {
  return (
    <group position={position}>
      {/* Room walls */}
      <Wall position={[0, 1, -3]} width={6} height={3} color={0x1a3b5c} stripeColor={0xffff00} />
      <Wall position={[0, 1, 3]} width={6} height={3} color={0x1a3b5c} stripeColor={0xffff00} />
      <Wall position={[-3, 1, 0]} width={6} height={3} rotation={[0, Math.PI / 2, 0]} color={0x1a3b5c} stripeColor={0xffff00} />
      <Wall position={[3, 1, 0]} width={6} height={3} rotation={[0, Math.PI / 2, 0]} color={0x1a3b5c} stripeColor={0xffff00} />
      
      {/* Electrical panels */}
      <mesh position={[-2, 1, -2.8]} castShadow>
        <boxGeometry args={[2, 2, 0.3]} />
        <meshStandardMaterial color={0x333344} roughness={0.4} metalness={0.7} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Wiring */}
      {[0, 0.5, 1].map((y, i) => (
        <mesh key={`wire-${i}`} position={[-2, y, -2.65]} castShadow>
          <boxGeometry args={[1.8, 0.05, 0.05]} />
          <meshStandardMaterial color={i === 0 ? 0xff0000 : i === 1 ? 0x00ff00 : 0x0000ff} side={THREE.DoubleSide} />
        </mesh>
      ))}
      
      {/* Electrical task */}
      <Task position={[1, 0, 0]} />
    </group>
  );
};

// Central Meeting Area
const MeetingArea = ({ position }) => {
  return (
    <group position={position}>
      {/* Central table */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[2, 2, 0.2, 16]} />
        <meshStandardMaterial color={0x3366cc} roughness={0.4} metalness={0.6} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Table top details */}
      <mesh position={[0, 0.51, 0]} castShadow>
        <cylinderGeometry args={[1.8, 1.8, 0.05, 16]} />
        <meshStandardMaterial color={0x1a3b5c} roughness={0.3} metalness={0.8} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Emergency button */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.15, 16]} />
        <meshStandardMaterial color={0xff0000} emissive={0xff0000} emissiveIntensity={0.3} side={THREE.DoubleSide} />
      </mesh>
      
      <Text position={[0, 0.7, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.2} color="white" anchorX="center" anchorY="middle">
        EMERGENCY
      </Text>
    </group>
  );
};

export default GameMap;