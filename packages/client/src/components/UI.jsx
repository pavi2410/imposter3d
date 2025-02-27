import React, { useState } from 'react';
import './UI.css';

const UI = ({
  gameState,
  roomCode,
  playerCount,
  onCreateGame,
  onJoinGame,
  onStartGame,
  onLeaveGame,
  onEditCustomization,
  isHost,
  players = {}
}) => {
  const handleJoinGame = () => {
    const code = prompt('Enter room code:');
    if (code && code.length > 0) {
      onJoinGame(code);
    }
  };

  return (
    <div id="ui-container">
      {/* Main Menu */}
      {gameState === 'menu' && (
        <div id="main-menu" className="menu">
          <h1>IMPOSTER3D</h1>
          <button onClick={handleJoinGame}>Join Game</button>
          <button onClick={onCreateGame}>Create Game</button>
        </div>
      )}
      
      {/* Lobby Menu */}
      {gameState === 'lobby' && (
        <div id="lobby-menu" className="menu">
          <h1>LOBBY</h1>
          <div id="room-code">Room Code: <span id="room-code-value">{roomCode}</span></div>
          <div id="player-list">Players: <span id="player-count">{playerCount}/10</span></div>
          
          {/* Player list display */}
          <div className="player-names-list">
            {Object.values(players).map(player => (
              <div key={player.id} className={`player-entry ${player.isReady ? 'ready' : ''} ${Object.keys(players)[0] === player.id ? 'host' : ''}`}>
                <span className="player-name">{player.name || `Player ${player.id.substring(0, 4)}`}</span>
                {Object.keys(players)[0] === player.id && <span className="host-badge">Host</span>}
                <span className="ready-status">{player.isReady ? '✓ Ready' : 'Not Ready'}</span>
              </div>
            ))}
          </div>
          
          <div className="ready-count">Ready: <span>{Object.values(players).filter(p => p.isReady).length}/{playerCount}</span></div>
          
          <button onClick={onEditCustomization}>Edit Character</button>
          <button 
            onClick={onStartGame} 
            disabled={!isHost || playerCount < 2}
          >
            Start Game
          </button>
          <button onClick={onLeaveGame}>Leave</button>
        </div>
      )}
      
      {/* In-Game UI */}
      {gameState === 'game' && (
        <div className="game-ui">
          {/* Add in-game UI elements here */}
        </div>
      )}
    </div>
  );
};

export default UI;