import React, { useState, useRef } from 'react';
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

  const [copySuccess, setCopySuccess] = useState(false);
  
  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy room code:', err);
      });
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
          <div id="room-code" className="room-code-container">
            Room Code: 
            <span 
              id="room-code-value" 
              className="room-code-value" 
              onClick={handleCopyRoomCode}
              title="Click to copy"
            >
              {roomCode}
            </span>
            {copySuccess && <span className="copy-tooltip">Copied!</span>}
          </div>
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