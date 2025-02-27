import React from 'react';

const UI = ({
  gameState,
  roomCode,
  playerCount,
  onCreateGame,
  onJoinGame,
  onStartGame,
  onLeaveGame,
  onEditCustomization,
  isHost
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