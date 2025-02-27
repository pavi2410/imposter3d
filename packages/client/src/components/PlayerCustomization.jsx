import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { PLAYER_COLORS } from '@imposter3d/shared';

// Component for player preview in customization screen
const PlayerPreview = ({ playerName, playerColor }) => {
  return (
    <div className="player-preview">
      <Canvas shadows camera={{ position: [0, 0, 2], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        
        <group>
          {/* Body (slightly squashed sphere) */}
          <mesh position={[0, 0.5, 0]} castShadow>
            <sphereGeometry args={[0.5, 16, 16]} scale={[1, 1.2, 1]} />
            <meshLambertMaterial color={new THREE.Color(playerColor)} />
          </mesh>
          
          {/* Visor (small blue rectangle on front of body) */}
          <mesh position={[0, 0.6, 0.45]}>
            <boxGeometry args={[0.4, 0.2, 0.1]} />
            <meshLambertMaterial color={0x99ccff} />
          </mesh>
          
          {/* Legs */}
          <mesh position={[-0.25, -0.25, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.5]} />
            <meshLambertMaterial color={new THREE.Color(playerColor)} />
          </mesh>
          
          <mesh position={[0.25, -0.25, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.5]} />
            <meshLambertMaterial color={new THREE.Color(playerColor)} />
          </mesh>
          
          {/* Name tag */}
          <sprite position={[0, 1.5, 0]} scale={[2, 0.5, 1]}>
            <spriteMaterial>
              <canvasTexture attach="map" image={createNameTag(playerName)} />
            </spriteMaterial>
          </sprite>
        </group>
      </Canvas>
    </div>
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
  context.fillText(playerName || 'Player', 128, 48);
  return canvas;
}

const PlayerCustomization = ({ onCustomizationComplete }) => {
  const [playerName, setPlayerName] = useState('Player');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [showCustomization, setShowCustomization] = useState(true);
  
  const handleNameChange = (e) => {
    setPlayerName(e.target.value);
  };
  
  const handleColorSelect = (index) => {
    setSelectedColorIndex(index);
  };
  
  const handleSubmit = () => {
    onCustomizationComplete({
      name: playerName,
      color: PLAYER_COLORS[selectedColorIndex]
    });
    setShowCustomization(false);
  };
  
  if (!showCustomization) return null;
  
  return (
    <div className="customization-container menu">
      <h2>Customize Your Character</h2>
      
      <div className="customization-preview">
        <PlayerPreview 
          playerName={playerName} 
          playerColor={PLAYER_COLORS[selectedColorIndex]} 
        />
      </div>
      
      <div className="customization-controls">
        <div className="name-input">
          <label htmlFor="player-name">Name:</label>
          <input 
            type="text" 
            id="player-name" 
            value={playerName} 
            onChange={handleNameChange} 
            maxLength={10} 
          />
        </div>
        
        <div className="color-selection">
          <label>Color:</label>
          <div className="color-grid">
            {PLAYER_COLORS.map((color, index) => (
              <div 
                key={index}
                className={`color-option ${selectedColorIndex === index ? 'selected' : ''}`}
                style={{ backgroundColor: `#${color.toString(16).padStart(6, '0')}` }}
                onClick={() => handleColorSelect(index)}
              />
            ))}
          </div>
        </div>
      </div>
      
      <button className="confirm-button" onClick={handleSubmit}>Confirm</button>
    </div>
  );
};

export default PlayerCustomization;