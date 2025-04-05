import { Canvas } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import Player from './Player';
import GameMap from './GameMap';
import { Position } from '../db';

interface PlayerData {
  id: string;
  position: Position;
  rotation: Position;
  color: string;
  isImpostor?: boolean;
}

interface LobbySceneProps {
  players: Record<string, PlayerData>;
  localPlayerId: string;
}

const LobbyScene = ({ players, localPlayerId }: LobbySceneProps) => {
  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 0 }}>
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={0.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        
        {/* Render all players */}
        {Object.entries(players).map(([playerId, playerData]) => (
          <Player
            key={playerId}
            player={playerData}
            isLocalPlayer={playerId === localPlayerId}
            updatePosition={() => {}}
          />
        ))}
        
        {/* Render the game map */}
        <GameMap />
        
        {/* Add controls for local player */}
        {localPlayerId && <PointerLockControls />}
      </Canvas>
    </div>
  );
};

export default LobbyScene;