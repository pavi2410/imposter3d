import { useEffect } from 'react';

interface EscapeMenuProps {
  onLeaveGame: () => void;
  isVisible: boolean;
  setIsVisible: (visible: boolean | ((prev: boolean) => boolean)) => void;
}

const EscapeMenu = ({ onLeaveGame, isVisible, setIsVisible }: EscapeMenuProps) => {
  // Handle escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).id === 'escape-menu-overlay') {
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