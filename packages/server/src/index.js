import { serve } from 'bun';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { PLAYER_COLORS, generateRoomCode } from '@imposter3d/shared';

// Get the directory name of the current module
const __dirname = dirname(fileURLToPath(import.meta.url));

// Create HTTP server
const httpServer = createServer();
const io = new Server(httpServer);

// Game state
const rooms = {};

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);
  let currentRoom = null;
  
  // Create a new game room
  socket.on('createRoom', (customization) => {
    const roomCode = generateRoomCode();
    
    // Create the room
    rooms[roomCode] = {
      players: {},
      host: socket.id,
      gameStarted: false
    };
    
    // Add the player to the room
    currentRoom = roomCode;
    socket.join(roomCode);
    
    // Add player to room data with customization
    rooms[roomCode].players[socket.id] = {
      name: customization?.name || 'Player',
      color: customization?.color || PLAYER_COLORS[0],
      isImpostor: false
    };
    
    // Notify the client that the room was created
    socket.emit('roomCreated', roomCode);
  });
  
  // Join an existing room
  socket.on('joinRoom', (roomCode, customization) => {
    // Check if the room exists
    if (!rooms[roomCode]) {
      socket.emit('error', 'Room does not exist');
      return;
    }
    
    // Check if the game has already started
    if (rooms[roomCode].gameStarted) {
      socket.emit('error', 'Game already in progress');
      return;
    }
    
    // Check if the room is full (max 10 players)
    const playerCount = Object.keys(rooms[roomCode].players).length;
    if (playerCount >= 10) {
      socket.emit('error', 'Room is full');
      return;
    }
    
    // Add the player to the room
    currentRoom = roomCode;
    socket.join(roomCode);
    
    // Assign customization to the player
    rooms[roomCode].players[socket.id] = {
      name: customization?.name || 'Player',
      color: customization?.color || PLAYER_COLORS[playerCount],
      isImpostor: false
    };
    
    // Notify the client that they joined the room
    socket.emit('joinedRoom', roomCode, rooms[roomCode].players);
    
    // Notify other players in the room
    socket.to(roomCode).emit('playerJoined', socket.id, {
      name: rooms[roomCode].players[socket.id].name,
      color: rooms[roomCode].players[socket.id].color
    });
  });
  
  // Start the game
  socket.on('startGame', () => {
    // Check if the player is in a room
    if (!currentRoom || !rooms[currentRoom]) {
      return;
    }
    
    // Check if the player is the host
    if (rooms[currentRoom].host !== socket.id) {
      return;
    }
    
    // Check if there are at least 2 players
    const playerCount = Object.keys(rooms[currentRoom].players).length;
    if (playerCount < 2) {
      return;
    }
    
    // Start the game
    rooms[currentRoom].gameStarted = true;
    
    // Randomly assign impostor(s)
    const playerIds = Object.keys(rooms[currentRoom].players);
    const impostorCount = Math.max(1, Math.floor(playerCount / 5));
    
    // Shuffle player IDs
    for (let i = playerIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [playerIds[i], playerIds[j]] = [playerIds[j], playerIds[i]];
    }
    
    // Assign impostors
    for (let i = 0; i < impostorCount; i++) {
      rooms[currentRoom].players[playerIds[i]].isImpostor = true;
    }
    
    // Notify all players that the game has started
    io.to(currentRoom).emit('gameStarted');
    
    // Send role assignments to each player
    playerIds.forEach(playerId => {
      io.to(playerId).emit('roleAssigned', {
        isImpostor: rooms[currentRoom].players[playerId].isImpostor
      });
    });
  });
  
  // Handle player customization updates
  socket.on('updateCustomization', (customization) => {
    if (currentRoom && rooms[currentRoom] && rooms[currentRoom].players[socket.id]) {
      // Update player customization
      rooms[currentRoom].players[socket.id].name = customization.name || rooms[currentRoom].players[socket.id].name;
      rooms[currentRoom].players[socket.id].color = customization.color || rooms[currentRoom].players[socket.id].color;
      
      // Notify other players about the update
      socket.to(currentRoom).emit('playerUpdated', socket.id, {
        name: rooms[currentRoom].players[socket.id].name,
        color: rooms[currentRoom].players[socket.id].color
      });
    }
  });
  
  // Leave the current room
  socket.on('leaveRoom', () => {
    if (currentRoom && rooms[currentRoom]) {
      // Remove the player from the room
      socket.leave(currentRoom);
      
      // Notify other players
      socket.to(currentRoom).emit('playerLeft', socket.id);
      
      // Remove player from room data
      delete rooms[currentRoom].players[socket.id];
      
      // If the room is empty, delete it
      if (Object.keys(rooms[currentRoom].players).length === 0) {
        delete rooms[currentRoom];
      }
      // If the host left, assign a new host
      else if (rooms[currentRoom].host === socket.id) {
        rooms[currentRoom].host = Object.keys(rooms[currentRoom].players)[0];
      }
      
      currentRoom = null;
    }
  });
  
  // Player position update
  socket.on('updatePlayer', (data) => {
    if (currentRoom && rooms[currentRoom]) {
      // Update player position in room state
      if (rooms[currentRoom].players[socket.id]) {
        rooms[currentRoom].players[socket.id].position = data.position;
        rooms[currentRoom].players[socket.id].rotation = data.rotation;
      }
      
      // Broadcast player position to other players in the room
      socket.to(currentRoom).emit('playerUpdate', socket.id, data.position, data.rotation);
    }
  });
  
  // Handle player kill action
  socket.on('killPlayer', (targetId) => {
    if (!currentRoom || !rooms[currentRoom]) return;
    
    // Check if the player is an impostor
    if (!rooms[currentRoom].players[socket.id]?.isImpostor) return;
    
    // Check if the target exists in the room
    if (!rooms[currentRoom].players[targetId]) return;
    
    // Check if the game is in progress
    if (!rooms[currentRoom].gameStarted) return;
    
    // Mark the player as dead
    rooms[currentRoom].players[targetId].isDead = true;
    
    // Notify all players about the kill
    io.to(currentRoom).emit('playerKilled', targetId);
    
    // Check win conditions
    checkWinConditions(currentRoom);
  });
  
  // Handle task completion
  socket.on('completeTask', (taskId) => {
    if (!currentRoom || !rooms[currentRoom]) return;
    
    // Check if the game is in progress
    if (!rooms[currentRoom].gameStarted) return;
    
    // Check if the player is not an impostor
    if (rooms[currentRoom].players[socket.id]?.isImpostor) return;
    
    // Initialize tasks array if it doesn't exist
    if (!rooms[currentRoom].completedTasks) {
      rooms[currentRoom].completedTasks = [];
    }
    
    // Add task to completed tasks
    rooms[currentRoom].completedTasks.push({
      taskId,
      playerId: socket.id
    });
    
    // Notify all players about task completion
    io.to(currentRoom).emit('taskCompleted', taskId, socket.id);
    
    // Check win conditions
    checkWinConditions(currentRoom);
  });
  
  // Disconnect handling
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    
    // Handle the same way as leaveRoom
    if (currentRoom && rooms[currentRoom]) {
      // Notify other players
      socket.to(currentRoom).emit('playerLeft', socket.id);
      
      // Remove player from room data
      delete rooms[currentRoom].players[socket.id];
      
      // If the room is empty, delete it
      if (Object.keys(rooms[currentRoom].players).length === 0) {
        delete rooms[currentRoom];
      }
      // If the host left, assign a new host
      else if (rooms[currentRoom].host === socket.id) {
        rooms[currentRoom].host = Object.keys(rooms[currentRoom].players)[0];
      }
    }
  });
});

// Check win conditions after kills or task completions
function checkWinConditions(roomCode) {
  if (!rooms[roomCode]) return;
  
  const players = rooms[roomCode].players;
  const playerIds = Object.keys(players);
  
  // Count alive impostors and crewmates
  let aliveImpostors = 0;
  let aliveCrewmates = 0;
  
  playerIds.forEach(id => {
    if (!players[id].isDead) {
      if (players[id].isImpostor) {
        aliveImpostors++;
      } else {
        aliveCrewmates++;
      }
    }
  });
  
  // Check if impostors have won (equal or more impostors than crewmates)
  if (aliveImpostors >= aliveCrewmates) {
    io.to(roomCode).emit('gameOver', { winner: 'impostors' });
    rooms[roomCode].gameStarted = false;
    return;
  }
  
  // Check if all impostors are dead
  if (aliveImpostors === 0) {
    io.to(roomCode).emit('gameOver', { winner: 'crewmates' });
    rooms[roomCode].gameStarted = false;
    return;
  }
  
  // Check if all tasks are completed
  // First, count total required tasks (one per crewmate)
  const totalCrewmates = playerIds.filter(id => !players[id].isImpostor).length;
  const requiredTasks = totalCrewmates * 3; // Assuming 3 tasks per crewmate
  
  // Check if enough tasks are completed
  if (rooms[roomCode].completedTasks && rooms[roomCode].completedTasks.length >= requiredTasks) {
    io.to(roomCode).emit('gameOver', { winner: 'crewmates' });
    rooms[roomCode].gameStarted = false;
    return;
  }
}

// Start the server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});