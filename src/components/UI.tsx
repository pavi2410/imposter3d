import React, { useState, useRef } from 'react';
import './UI.css';

const UI = ({
  gameState,
  playerCount,
  onEditCustomization,
  onJoinWorld,
  onJoinGame,
  onStartGame,
  onLeaveGame,
  isHost,
  players = {}
}) => {
  return (
    <div id="ui-container">
      <div id="main-menu" className="menu">
        <h1>IMPOSTER3D</h1>
        <button onClick={onJoinWorld}>Enter World</button>
        <button onClick={onEditCustomization}>Customize Character</button>
        <div className="player-count">Online Players: {playerCount}</div>
      </div>

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