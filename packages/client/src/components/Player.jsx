import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Player = ({ player, isLocalPlayer, updatePosition }) => {
  const groupRef = useRef();
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false
  });
  
  // Set up keyboard controls for local player
  useEffect(() => {
    if (!isLocalPlayer) return;
    
    const handleKeyDown = (e) => {
      switch(e.key) {
        case 'w': case 'ArrowUp':
          keys.current.forward = true;
          break;
        case 's': case 'ArrowDown':
          keys.current.backward = true;
          break;
        case 'a': case 'ArrowLeft':
          keys.current.left = true;
          break;
        case 'd': case 'ArrowRight':
          keys.current.right = true;
          break;
      }
    };
    
    const handleKeyUp = (e) => {
      switch(e.key) {
        case 'w': case 'ArrowUp':
          keys.current.forward = false;
          break;
        case 's': case 'ArrowDown':
          keys.current.backward = false;
          break;
        case 'a': case 'ArrowLeft':
          keys.current.left = false;
          break;
        case 'd': case 'ArrowRight':
          keys.current.right = false;
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isLocalPlayer]);
  
  // Update player position based on keyboard input
  useFrame(() => {
    if (!isLocalPlayer || !groupRef.current) return;
    
    const speed = 0.1;
    const rotationSpeed = 0.05;
    
    if (keys.current.forward) {
      groupRef.current.position.z += Math.cos(groupRef.current.rotation.y) * speed;
      groupRef.current.position.x += Math.sin(groupRef.current.rotation.y) * speed;
    }
    if (keys.current.backward) {
      groupRef.current.position.z -= Math.cos(groupRef.current.rotation.y) * speed;
      groupRef.current.position.x -= Math.sin(groupRef.current.rotation.y) * speed;
    }
    if (keys.current.left) {
      groupRef.current.rotation.y += rotationSpeed;
    }
    if (keys.current.right) {
      groupRef.current.rotation.y -= rotationSpeed;
    }
    
    // Send position update to server
    updatePosition({
      x: groupRef.current.position.x,
      y: groupRef.current.position.y,
      z: groupRef.current.position.z
    }, {
      x: groupRef.current.rotation.x,
      y: groupRef.current.rotation.y,
      z: groupRef.current.rotation.z
    });
  });
  
  // Update position for non-local players
  useEffect(() => {
    if (!groupRef.current || !player.position) return;
    
    // Set initial position for both local and remote players
    groupRef.current.position.set(
      player.position.x,
      player.position.y,
      player.position.z
    );
    
    if (player.rotation) {
      groupRef.current.rotation.set(
        player.rotation.x,
        player.rotation.y,
        player.rotation.z
      );
    }
  }, [player.position, player.rotation]);
  
  return (
    <group ref={groupRef}>
      {/* Body (slightly squashed sphere) */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.5, 16, 16]} scale={[1, 1.2, 1]} />
        <meshLambertMaterial color={player.color ? new THREE.Color(player.color) : 0x00ff00} />
      </mesh>
      
      {/* Visor (small blue rectangle on front of body) */}
      <mesh position={[0, 0.6, 0.45]}>
        <boxGeometry args={[0.4, 0.2, 0.1]} />
        <meshLambertMaterial color={0x99ccff} />
      </mesh>
      
      {/* Legs */}
      <mesh position={[-0.25, -0.25, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.5]} />
        <meshLambertMaterial color={player.color ? new THREE.Color(player.color) : 0x00ff00} />
      </mesh>
      
      <mesh position={[0.25, -0.25, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.5]} />
        <meshLambertMaterial color={player.color ? new THREE.Color(player.color) : 0x00ff00} />
      </mesh>
      
      {/* Name tag for non-local players */}
      {!isLocalPlayer && (
        <sprite position={[0, 1.5, 0]} scale={[2, 0.5, 1]}>
          <spriteMaterial>
            <canvasTexture attach="map" image={createNameTag(player.name || `Player ${player.id.substring(0, 4)}`)} />
          </spriteMaterial>
        </sprite>
      )}
    </group>
  );
};

// Helper function to create name tag texture
function createNameTag(playerName) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 256;
  canvas.height = 64;
  context.font = '48px Arial';
  context.fillStyle = 'white';
  context.textAlign = 'center';
  context.fillText(playerName, 128, 48);
  return canvas;
}

export default Player;