# Imposter3D

A 3D multiplayer game inspired by Among Us, built with React Three Fiber and Socket.IO.

## Project Structure

This project uses a monorepo structure with the following packages:

### packages/client

The frontend application built with:
- React 19
- Three.js
- React Three Fiber (@react-three/fiber)
- React Three Drei (@react-three/drei)
- Socket.IO Client
- Vite as the build tool

The client handles game rendering, player movement, tasks, and impostor actions.

### packages/server

The backend server built with:
- Node.js
- Socket.IO

The server manages game rooms, player connections, game state, and synchronizes player actions across clients.

### packages/shared

Shared code and constants used by both client and server, including:
- Player colors
- Game configuration
- Shared types and interfaces

## Socket.IO Protocol

The game uses Socket.IO for real-time communication between clients and server. Here are the main events:

### Client to Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `joinWorld` | `{ name, color }` | Enters the persistent world with player customization |
| `startGame` | - | Starts the game (host only) |
| `updatePlayer` | `{ position, rotation }` | Updates player position and rotation |
| `killPlayer` | `targetId` | Impostor action to kill another player |
| `completeTask` | `taskId` | Marks a task as completed |
| `updateCustomization` | `{ name, color }` | Updates player customization |

### Server to Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `worldState` | `players` | Sends complete world state on connection |
| `playerJoined` | `playerId, playerData` | Notifies when a new player joins |
| `playerLeft` | `playerId` | Notifies when a player leaves |
| `gameStarted` | - | Notifies that the game has started |
| `roleAssigned` | `{ isImpostor }` | Assigns player role (impostor or crewmate) |
| `playerUpdate` | `playerId, position, rotation` | Updates other players' positions |
| `playerKilled` | `playerId` | Notifies when a player is killed |
| `taskCompleted` | `taskId, playerId` | Notifies when a task is completed |
| `gameOver` | `{ winner }` | Notifies game end with winner ('crewmates' or 'impostors') |
| `error` | `message` | Sends error messages to client |

## Installation

### Prerequisites

- [Bun](https://bun.sh/) (JavaScript runtime and package manager)

### Setup

1. Clone the repository

```bash
git clone https://github.com/yourusername/imposter3d.git
cd imposter3d
```

2. Install dependencies

```bash
bun install
```

This will install dependencies for all packages in the workspace.

## Running the Application

### Development Mode

1. Start the server:

```bash
bun run server
```

2. In a separate terminal, start the client:

```bash
bun run dev
```

The client will be available at http://localhost:5173

### Production Build

1. Build the client:

```bash
bun run build
```

2. Preview the production build:

```bash
bun run preview
```

## Game Controls

- WASD: Move player
- Mouse: Look around
- E: Interact with tasks
- Q: Kill (Impostor only)

## Features

- 3D multiplayer gameplay
- Player customization (name and color)
- Impostor and crewmate roles
- Task completion system
- Kill mechanics for impostors
- Room-based matchmaking