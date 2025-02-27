import React from 'react';
import * as THREE from 'three';
import { TaskManager } from './Tasks';

const GameMap = () => {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color={0x444444} roughness={0.8} metalness={0.2} />
      </mesh>
      
      {/* Outer walls */}
      {/* North wall */}
      <Wall position={[0, 1, -15]} width={30} height={3} />
      
      {/* South wall */}
      <Wall position={[0, 1, 15]} width={30} height={3} />
      
      {/* East wall */}
      <Wall position={[15, 1, 0]} width={30} height={3} rotation={[0, Math.PI / 2, 0]} />
      
      {/* West wall */}
      <Wall position={[-15, 1, 0]} width={30} height={3} rotation={[0, Math.PI / 2, 0]} />
      
      {/* Interior walls */}
      <Wall position={[-5, 1, -5]} width={10} height={3} />
      <Wall position={[5, 1, 5]} width={10} height={3} rotation={[0, Math.PI / 2, 0]} />
      
      {/* Tasks */}
      <Task position={[-10, 0, -10]} />
      <Task position={[10, 0, -10]} />
      <Task position={[-10, 0, 10]} />
      <Task position={[10, 0, 10]} />
      <Task position={[0, 0, 0]} />
    </group>
  );
};

// Wall component
const Wall = ({ position, width, height, rotation = [0, 0, 0] }) => {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={[width, height, 0.2]} />
      <meshStandardMaterial color={0x666666} roughness={0.7} metalness={0.2} />
    </mesh>
  );
};

// Task component
const Task = ({ position }) => {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={0x00ff00} />
    </mesh>
  );
};

export default GameMap;