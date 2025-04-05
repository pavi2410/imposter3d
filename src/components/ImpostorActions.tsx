import { useState, useEffect } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { Position } from '../db';

interface Player {
  id: string;
  position?: Position;
  isImpostor?: boolean;
}

interface Socket {
  emit: (event: string, data: any) => void;
}

interface ImpostorActionsProps {
  isImpostor: boolean;
  socket: Socket;
  players: Record<string, Player>;
  localPlayerId: string;
  playerPosition: Position;
}

const ImpostorActions = ({ isImpostor, socket, players, localPlayerId, playerPosition }: ImpostorActionsProps) => {
  const [killCooldown, setKillCooldown] = useState(0);
  const [nearbyPlayers, setNearbyPlayers] = useState<string[]>([]);
  const killDistance = 2; // How close impostor needs to be to kill
  const maxCooldown = 30; // 30 seconds cooldown between kills
  
  // Check for nearby players that can be killed
  useEffect(() => {
    if (!isImpostor || killCooldown > 0 || !playerPosition) return;
    
    const localPlayerPos = new THREE.Vector3(
      playerPosition.x,
      playerPosition.y,
      playerPosition.z
    );
    
    // Find players within kill distance
    const nearby = Object.values(players).filter(player => {
      // Skip if it's the local player or another impostor
      if (player.id === localPlayerId || player.isImpostor) return false;
      
      // Skip if player has no position data
      if (!player.position) return false;
      
      const otherPlayerPos = new THREE.Vector3(
        player.position.x,
        player.position.y,
        player.position.z
      );
      
      return localPlayerPos.distanceTo(otherPlayerPos) < killDistance;
    }).map(player => player.id);
    
    setNearbyPlayers(nearby);
  }, [isImpostor, killCooldown, playerPosition, players, localPlayerId]);
  
  // Handle kill cooldown
  useEffect(() => {
    let cooldownInterval: NodeJS.Timeout | undefined;
    
    if (killCooldown > 0) {
      cooldownInterval = setInterval(() => {
        setKillCooldown(prev => {
          if (prev <= 1) {
            if (cooldownInterval) clearInterval(cooldownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (cooldownInterval) clearInterval(cooldownInterval);
    };
  }, [killCooldown]);
  
  // Handle kill action
  const handleKill = (targetId: string) => {
    if (killCooldown === 0 && nearbyPlayers.includes(targetId)) {
      socket.emit('killPlayer', targetId);
      setKillCooldown(maxCooldown);
    }
  };
  
  // Handle kill key press
  useEffect(() => {
    if (!isImpostor) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'q' && nearbyPlayers.length > 0 && killCooldown === 0) {
        // Kill the closest player
        handleKill(nearbyPlayers[0]);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isImpostor, nearbyPlayers, killCooldown]);
  
  // Render kill button and cooldown UI
  return isImpostor ? (
    <group>
      {/* Kill cooldown indicator (only visible when cooldown is active) */}
      {killCooldown > 0 && (
        <Text
          position={[0, -1, -5]} // Position in bottom center of screen
          fontSize={0.5}
          color="red"
          anchorX="center"
          anchorY="middle"
          renderOrder={1000}
        >
          Kill: {killCooldown}s
        </Text>
      )}
      
      {/* Kill available indicator */}
      {killCooldown === 0 && nearbyPlayers.length > 0 && (
        <Text
          position={[0, -1, -5]} // Position in bottom center of screen
          fontSize={0.5}
          color="red"
          anchorX="center"
          anchorY="middle"
          renderOrder={1000}
        >
          Press Q to Kill
        </Text>
      )}
    </group>
  ) : null;
};

export default ImpostorActions;