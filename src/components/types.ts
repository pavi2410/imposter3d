import { Player } from '../db';
import { PlayerColor } from '../shared/constants';

export interface PlayersMap {
  [key: string]: Player & { isLocal: boolean };
}

export interface PlayerCustomizationData {
  name: string;
  color: PlayerColor;
}

export interface UIProps {
  gameState: 'menu' | 'customization' | 'lobby' | 'game' | 'gameOver';
  playerCount: number;
  onEditCustomization: () => void;
  onJoinWorld: () => void;
  onJoinGame: (code: string) => void;
  onStartGame: () => void;
  onLeaveGame: () => void;
  isHost: boolean;
  players: PlayersMap;
}

export interface WorldSceneProps {
  players: PlayersMap;
  localPlayerId: string | null;
}

export interface PlayerCustomizationProps {
  onCustomizationComplete: (() => void) | ((data: PlayerCustomizationData) => Promise<void>);
  onCancel: () => void;
}

export interface EscapeMenuProps {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  onLeaveGame: () => void;
} 