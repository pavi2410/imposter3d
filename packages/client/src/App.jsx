import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { io } from 'socket.io-client';
import { PLAYER_COLORS } from '@imposter3d/shared';

// Components
import Player from './components/Player';
import GameMap from './components/GameMap';
import UI from './components/UI';
import ImpostorActions from './components/ImpostorActions';
import { TaskManager } from './components/Tasks';
import PlayerCustomization from './components/PlayerCustomization';
import SpaceBackground from './components/SpaceBackground';
import EscapeMenu from './components/EscapeMenu';

// Hooks
import useQueryParam from './hooks/useQueryParam';

const App = () => {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState('menu'); // menu, customization, lobby, game
  const [players, setPlayers] = useState({});
  const [localPlayerId, setLocalPlayerId] = useState(null);
  const [roomCode, setRoomCode] = useQueryParam('room', '');
  const [tasks, setTasks] = useState([]);
  const [gameResult, setGameResult] = useState(null); // null, 'crewmates', 'impostors'
  const [pendingAction, setPendingAction] = useState(null); // null, 'create', 'join'
  const [pendingRoomCode, setPendingRoomCode] = useState('');
  const [playerCustomization, setPlayerCustomization] = useState({
    name: 'Player',
    color: PLAYER_COLORS[0]
  });
  const [escapeMenuVisible, setEscapeMenuVisible] = useState(false);
  
  // Initialize socket connection once when component mounts
  useEffect(() => {
    // Initialize tasks
    setTasks([
      { id: 'task1', position: [-10, 0, -10], type: 'simple' },
      { id: 'task2', position: [10, 0, -10], type: 'simple' },
      { id: 'task3', position: [-10, 0, 10], type: 'simple' },
      { id: 'task4', position: [10, 0, 10], type: 'simple' },
      { id: 'task5', position: [0, 0, 0], type: 'simple' }
    ]);
    
    // Initialize socket connection - only once when component mounts
    const socketInstance = io(import.meta.env.VITE_SERVER_URL);
    setSocket(socketInstance);
    
    socketInstance.on('connect', () => {
      console.log('Connected to server with ID:', socketInstance.id);
    });
    
    socketInstance.on('playerJoined', (playerId, playerData) => {
      console.log('Player joined:', playerId);
      setPlayers(prevPlayers => ({
        ...prevPlayers,
        [playerId]: {
          ...playerData,
          id: playerId
        }
      }));
    });
    
    socketInstance.on('playerLeft', (playerId) => {
      console.log('Player left:', playerId);
      setPlayers(prevPlayers => {
        const newPlayers = { ...prevPlayers };
        delete newPlayers[playerId];
        return newPlayers;
      });
    });
    
    socketInstance.on('roomCreated', (code) => {
      console.log('Room created:', code);
      setGameState('lobby');
      setRoomCode(code); // This will update the URL automatically
      setLocalPlayerId(socketInstance.id);
      setPlayers(prevPlayers => ({
        ...prevPlayers,
        [socketInstance.id]: {
          id: socketInstance.id,
          name: playerCustomization.name,
          color: playerCustomization.color,
          isLocal: true,
          isImpostor: false,
          position: { x: 0, y: 0, z: -3 } // Default position inside the main corridor
        }
      }));
    });
    
    socketInstance.on('joinedRoom', (code, roomPlayers) => {
      console.log('Joined room:', code);
      setGameState('lobby');
      setRoomCode(code);
      setLocalPlayerId(socketInstance.id);
      
      // Add all existing players
      const newPlayers = {};
      Object.keys(roomPlayers).forEach(playerId => {
        newPlayers[playerId] = {
          ...roomPlayers[playerId],
          id: playerId,
          isLocal: playerId === socketInstance.id
        };
      });
      
      // Add local player with customization
      if (socketInstance.id in newPlayers) {
        newPlayers[socketInstance.id] = {
          ...newPlayers[socketInstance.id],
          name: playerCustomization.name,
          color: playerCustomization.color
        };
      }
      
      setPlayers(newPlayers);
    });
    
    socketInstance.on('gameStarted', () => {
      console.log('Game started');
      setGameState('game');
    });
    
    socketInstance.on('roleAssigned', (role) => {
      setPlayers(prevPlayers => ({
        ...prevPlayers,
        [socketInstance.id]: {
          ...prevPlayers[socketInstance.id],
          isImpostor: role.isImpostor,
          position: role.position
        }
      }));
    });
    
    socketInstance.on('playerUpdate', (playerId, position, rotation) => {
      setPlayers(prevPlayers => {
        if (!prevPlayers[playerId] || playerId === localPlayerId) return prevPlayers;
        
        return {
          ...prevPlayers,
          [playerId]: {
            ...prevPlayers[playerId],
            position,
            rotation
          }
        };
      });
    });
    
    socketInstance.on('error', (message) => {
      console.error('Server error:', message);
      alert(message);
    });
    
    // Handle player killed event
    socketInstance.on('playerKilled', (playerId) => {
      console.log('Player killed:', playerId);
      setPlayers(prevPlayers => ({
        ...prevPlayers,
        [playerId]: {
          ...prevPlayers[playerId],
          isDead: true
        }
      }));
    });
    
    // Handle task completion
    socketInstance.on('taskCompleted', (taskId, playerId) => {
      console.log('Task completed:', taskId, 'by player:', playerId);
    });
    
    // Handle game over
    socketInstance.on('gameOver', (data) => {
      console.log('Game over! Winner:', data.winner);
      setGameResult(data.winner);
      // Show game over screen after a delay
      setTimeout(() => {
        setGameState('gameOver');
      }, 3000);
    });
    
    // Room code handling is now done at the end of this effect
    
    // If there's a room code in the URL, check if the room exists before joining
    const roomCodeFromUrl = roomCode;
    if (roomCodeFromUrl) {
      // First, check if the room exists
      socketInstance.emit('checkRoomExists', roomCodeFromUrl, (exists) => {
        if (exists) {
          setPendingAction('join');
          setPendingRoomCode(roomCodeFromUrl);
          setGameState('customization');
        } else {
          setRoomCode(''); // Clear the invalid room code from URL first
          // Add a small delay before showing the alert to ensure the UI updates first
          setTimeout(() => {
            alert('Room does not exist');
          }, 100);
        }
      });
    }
    
    return () => {
      socketInstance.disconnect();
    };
  }, []); // Empty dependency array ensures this effect runs only once when component mounts
  
  const createGame = () => {
    setPendingAction('create');
    setGameState('customization');
  };
  
  const joinGame = (code) => {
    setPendingAction('join');
    setPendingRoomCode(code);
    setGameState('customization');
  };
  
  const startGame = () => {
    socket.emit('startGame');
  };
  
  const leaveGame = () => {
    socket.emit('leaveRoom');
    setGameState('menu');
    setPlayers({});
    setRoomCode(''); // This will remove the room code from URL automatically
  };
  
  const updatePlayerPosition = (position, rotation) => {
    if (gameState === 'game' && socket) {
      socket.emit('updatePlayer', { position, rotation });
    }
  };
  
  // Handle customization completion
  const handleCustomizationComplete = (customization) => {
    setPlayerCustomization(customization);
    
    // Proceed with the pending action
    if (pendingAction === 'create') {
      socket.emit('createRoom', customization);
    } else if (pendingAction === 'join') {
      socket.emit('joinRoom', pendingRoomCode, customization);
    }
    
    // Reset pending states
    setPendingAction(null);
    setPendingRoomCode('');
  };
  
  // Handle edit customization from lobby
  const handleEditCustomization = () => {
    setGameState('customization');
    setPendingAction('edit');
  };
  
  // Apply customization changes when editing from lobby
  const applyCustomizationChanges = () => {
    if (socket && localPlayerId) {
      socket.emit('updateCustomization', playerCustomization);
      
      // Update local player data
      setPlayers(prevPlayers => ({
        ...prevPlayers,
        [localPlayerId]: {
          ...prevPlayers[localPlayerId],
          name: playerCustomization.name,
          color: playerCustomization.color
        }
      }));
      
      setGameState('lobby');
    }
  };
  
  return (
    <>
      <Canvas shadows>
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 10, 7.5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        
        {/* Space Background */}
        <SpaceBackground />
        
        {/* Game world */}
        <GameMap />
        
        {/* Tasks */}
        {gameState === 'game' && (
          <TaskManager 
            tasks={tasks} 
            playerPosition={players[localPlayerId]?.position}
            onTaskComplete={(taskId) => socket.emit('completeTask', taskId)}
            isImpostor={players[localPlayerId]?.isImpostor}
          />
        )}
        
        {/* Players */}
        {Object.values(players).map(player => (
          <Player
            key={player.id}
            player={player}
            isLocalPlayer={player.id === localPlayerId}
            updatePosition={updatePlayerPosition}
          />
        ))}
        
        {/* Impostor Actions */}
        {gameState === 'game' && players[localPlayerId]?.isImpostor && (
          <ImpostorActions
            isImpostor={players[localPlayerId]?.isImpostor}
            socket={socket}
            players={players}
            localPlayerId={localPlayerId}
            playerPosition={players[localPlayerId]?.position}
          />
        )}
        
        {/* First-person perspective is now handled by the Player component */}
      </Canvas>
      
      {/* Player Customization */}
      {gameState === 'customization' && (
        <PlayerCustomization 
          onCustomizationComplete={pendingAction === 'edit' ? applyCustomizationChanges : handleCustomizationComplete}
        />
      )}
      
      {/* UI Layer */}
      <UI
        gameState={gameState}
        roomCode={roomCode}
        playerCount={Object.keys(players).length}
        onCreateGame={createGame}
        onJoinGame={joinGame}
        onStartGame={startGame}
        onLeaveGame={leaveGame}
        onEditCustomization={handleEditCustomization}
        isHost={localPlayerId && players[localPlayerId] && 
               Object.keys(players)[0] === localPlayerId}
      />
      
      {/* Escape Menu */}
      {gameState === 'game' && (
        <EscapeMenu 
          isVisible={escapeMenuVisible} 
          setIsVisible={setEscapeMenuVisible} 
          onLeaveGame={leaveGame} 
        />
      )}
    </>
  );
};

export default App;