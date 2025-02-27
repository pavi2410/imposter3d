import React, { useEffect, useState } from 'react';

const EscapeMenu = ({ onLeaveGame, isVisible, setIsVisible }) => {
  // Handle escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsVisible(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setIsVisible]);
  
  // Handle click outside to close menu
  const handleBackgroundClick = (e) => {
    if (e.target.id === 'escape-menu-overlay') {
      setIsVisible(false);
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <div 
      id="escape-menu-overlay" 
      className="menu-overlay"
      onClick={handleBackgroundClick}
    >
      <div className="escape-menu menu">
        <h2>Game Menu</h2>
        <button onClick={() => setIsVisible(false)}>Resume Game</button>
        <button onClick={onLeaveGame}>Leave Game</button>
      </div>
    </div>
  );
};

export default EscapeMenu;