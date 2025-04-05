import React, { useState, useEffect } from 'react';
// We're not using these directly in the component
// import { Canvas } from '@react-three/fiber';
// import { OrbitControls } from '@react-three/drei';
import { PLAYER_COLORS, PlayerColor } from './shared/constants';
import { db, tx, Player as PlayerType, Position } from './db';

// Components
// Import JSX components with type any since we haven't converted them yet
// import Player from './components/Player';
// import GameMap from './components/GameMap';
// @ts-ignore
import UI from './components/UI';
// import ImpostorActions from './components/ImpostorActions';
// import { TaskManager } from './components/Tasks';
// @ts-ignore
import PlayerCustomization from './components/PlayerCustomization';
// import SpaceBackground from './components/SpaceBackground';
// @ts-ignore
import EscapeMenu from './components/EscapeMenu';
// @ts-ignore
import WorldScene from './components/WorldScene';

// Hooks
// import useQueryParam from './hooks/useQueryParam';

// Types
interface Task {
  id: string;
  position: [number, number, number];
  type: string;
}

interface PlayerCustomizationData {
  name: string;
  color: PlayerColor;
}

interface PlayersMap {
  [key: string]: PlayerType & { isLocal: boolean };
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<'menu' | 'customization' | 'lobby' | 'game' | 'gameOver'>('menu');
  const [localPlayerId, setLocalPlayerId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [gameResult, setGameResult] = useState<'crewmates' | 'impostors' | null>(null);
  const [pendingAction, setPendingAction] = useState<'create' | 'join' | 'edit' | 'world' | null>(null);
  const [playerCustomization, setPlayerCustomization] = useState<PlayerCustomizationData>({
    name: 'Player',
    color: PLAYER_COLORS[0]
  });
  const [escapeMenuVisible, setEscapeMenuVisible] = useState<boolean>(false);
  const [players, setPlayers] = useState<PlayersMap>({});
  const [roomCode, setRoomCode] = useState<string>('');

  // Initialize tasks
  useEffect(() => {
    setTasks([
      { id: 'task1', position: [-10, 0, -10], type: 'simple' },
      { id: 'task2', position: [10, 0, -10], type: 'simple' },
      { id: 'task3', position: [-10, 0, 10], type: 'simple' },
      { id: 'task4', position: [10, 0, 10], type: 'simple' },
      { id: 'task5', position: [0, 0, 0], type: 'simple' }
    ]);
  }, []);

  // Subscribe to game state changes
  useEffect(() => {
    if (!roomCode) return;
    
    // @ts-ignore - InstantDB API changed and types don't match yet
    const unsubscribe = db.subscribe({
      games: { 
        where: { id: roomCode }
      }
    }, (data: any) => {
      const game = data?.games?.[0];
      if (game) {
        setGameState(game.state);
        setGameResult(game.result);
      }
    });

    return () => unsubscribe();
  }, [roomCode]);

  // Subscribe to players in the current game
  useEffect(() => {
    if (!roomCode) return;

    // @ts-ignore - InstantDB API changed and types don't match yet
    const unsubscribe = db.subscribe({
      players: {
        where: { gameId: roomCode }
      }
    }, (data: any) => {
      if (data?.players) {
        const playersMap: PlayersMap = {};
        data.players.forEach((player: any) => {
          playersMap[player.id] = {
            ...player,
            isLocal: player.id === localPlayerId
          };
        });
        setPlayers(playersMap);
      }
    });

    return () => unsubscribe();
  }, [roomCode, localPlayerId]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const createGame = async (): Promise<void> => {
    setPendingAction('create');
    setGameState('customization');
  };

  const handleJoinWorld = async (): Promise<void> => {
    setPendingAction('world');
    setGameState('customization');
  };

  const joinGame = async (_code: string): Promise<void> => {
    setPendingAction('join');
    setGameState('customization');
  };

  const startGame = async (): Promise<void> => {
    // @ts-ignore - InstantDB API changed and types don't match yet
    await db.transact(
      db.tx.games[roomCode].update({
        state: 'game'
      })
    );
  };

  const leaveGame = async (): Promise<void> => {
    if (localPlayerId) {
      // @ts-ignore - InstantDB API changed and types don't match yet
      await db.transact(
        db.tx.players[localPlayerId].delete()
      );
    }
    setGameState('menu');
    setPlayers({});
    setRoomCode('');
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updatePlayerPosition = async (position: Position, rotation: Position): Promise<void> => {
    if (gameState === 'game' && localPlayerId) {
      // @ts-ignore - InstantDB API changed and types don't match yet
      await db.transact(
        db.tx.players[localPlayerId].update({
          position, 
          rotation, 
          lastUpdate: Date.now()
        })
      );
    }
  };

  const handleCustomizationComplete = async (customization: PlayerCustomizationData): Promise<void> => {
    setPlayerCustomization(customization);

    if (pendingAction === 'create') {
      // @ts-ignore - InstantDB API changed and types don't match yet
      const result: any = await db.transact(
        db.tx.games[db.id()].update({
          state: 'lobby',
          createdAt: Date.now(),
          players: []
        })
      );
      
      // Get the ID from the result
      const newGameId = Object.keys(result.games)[0];
      setRoomCode(newGameId);
      await joinGame(newGameId);
    } else if (pendingAction === 'join') {
      await joinGame(roomCode);
    }
  };

  // Handle edit customization from lobby
  const handleEditCustomization = (): void => {
    setGameState('customization');
    setPendingAction('edit');
  };

  // Apply customization changes when editing from lobby
  const applyCustomizationChanges = (): void => {
    if (localPlayerId) {
      // @ts-ignore - InstantDB API changed and types don't match yet
      db.transact(
        db.tx.players[localPlayerId].update({
          name: playerCustomization.name,
          color: playerCustomization.color
        })
      );
      setGameState('lobby');
    }
  };

  return (
    <>
      {/* UI Layer - Always visible */}
      <UI
        gameState={gameState}
        playerCount={Object.keys(players).length}
        onEditCustomization={handleEditCustomization}
        onJoinWorld={handleJoinWorld}
        onJoinGame={joinGame}
        onStartGame={startGame}
        onLeaveGame={leaveGame}
        isHost={localPlayerId && players[localPlayerId] &&
          Object.keys(players)[0] === localPlayerId}
        players={players}
      />

      {/* Player Customization */}
      {gameState === 'customization' && (
        <PlayerCustomization
          onCustomizationComplete={pendingAction === 'edit' ? applyCustomizationChanges : handleCustomizationComplete}
          onCancel={() => setGameState('menu')}
        />
      )}

      {/* 3D Game World */}
      {(gameState === 'game' || gameState === 'lobby') && (
        <WorldScene
          players={players}
          localPlayerId={localPlayerId}
        />
      )}

      {/* Escape Menu - Only in game state */}
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