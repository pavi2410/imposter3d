import React from 'react';
import { Canvas } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import Player from './Player';
import GameMap from './GameMap';

const WorldScene = ({ players, localPlayerId }) => {
  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 0 }}>
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 60 }}>
        <ambientLight intensity={1.2} />
        <directionalLight
          position={[10, 15, 10]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[4096, 4096]}
        />
        
        {/* Render all players */}
        {Object.entries(players).map(([playerId, playerData]) => (
          <Player
            key={playerId}
            position={playerData.position}
            rotation={playerData.rotation}
            color={playerData.color}
            isLocal={playerId === localPlayerId}
            isImpostor={false}
          />
        ))}
        
        {/* Render the game map */}
        <GameMap />
        
        {/* Add controls for local player */}
        {localPlayerId && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: '24px',
            zIndex: 1000,
            pointerEvents: 'none'
          }}>
            Click to Start
          </div>
        )}
        {localPlayerId && (
          <PointerLockControls
            selector={() => document.querySelector('canvas')}
            onLock={() => {
              console.log('Controls activated');
              document.querySelector('.click-prompt').style.display = 'none';
            }}
            onUnlock={() => console.log('Controls released')}
          />
        )}
      </Canvas>
    </div>
  );
};

export default WorldScene;