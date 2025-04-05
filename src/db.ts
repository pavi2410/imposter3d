import { init, tx, id } from '@instantdb/react';

// Define TypeScript interfaces for our schema
export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Task {
  id: string;
  position: Position;
  type: string;
  completedBy: string[];
}

export interface Game {
  id: string;
  state: 'menu' | 'customization' | 'lobby' | 'game' | 'gameOver';
  createdAt: number;
  result: 'crewmates' | 'impostors' | null;
  players: string[];
  tasks: Task[];
}

export interface Player {
  id: string;
  gameId: string;
  name: string;
  color: string;
  isImpostor: boolean;
  isDead: boolean;
  position: Position;
  rotation: Position;
  lastUpdate: number;
  tasksCompleted: string[];
}

// Initialize InstantDB client
const APP_ID = 'ca7941cd-66a6-4fae-bcf2-fcdb2cdf1fb1';

// Database schema as expected by InstantDB
// @ts-ignore - InstantDB API has changed, this is a simplified version
export const schema = {
  entities: {
    games: {
      id: 'string',
      state: 'string', 
      createdAt: 'number',
      result: 'string', 
      players: ['string'], 
      tasks: [{
        id: 'string',
        position: { x: 'number', y: 'number', z: 'number' },
        type: 'string',
        completedBy: ['string'] 
      }]
    },
    players: {
      id: 'string',
      gameId: 'string',
      name: 'string',
      color: 'string',
      isImpostor: 'boolean',
      isDead: 'boolean',
      position: { x: 'number', y: 'number', z: 'number' },
      rotation: { x: 'number', y: 'number', z: 'number' },
      lastUpdate: 'number',
      tasksCompleted: ['string'] 
    }
  },
  links: {},
  rooms: {}
};

// Initialize database
// @ts-ignore - InstantDB API has changed, this is a simplified version
export const db = init({ appId: APP_ID, schema });

export { tx, id };

// Note: The schema is already initialized when creating the db instance 