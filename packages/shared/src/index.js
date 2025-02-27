// Shared code between client and server

// This file will contain code that can be used by both client and server
// For example, game constants, shared types, utility functions, etc.

// Example: Game constants
export const MAX_PLAYERS = 10;
export const PLAYER_COLORS = [
  0xff0000, // red
  0x00ff00, // green
  0x0000ff, // blue
  0xffff00, // yellow
  0xff00ff, // magenta
  0x00ffff, // cyan
  0xff8000, // orange
  0x8000ff, // purple
  0x00ff80, // mint
  0xff0080  // pink
];

// Example: Room code generator
export function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}