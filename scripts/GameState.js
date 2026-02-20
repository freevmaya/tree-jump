// scripts/GameState.js

export const GAME_STATE = {
  PLAYING: 'playing',
  GAME_OVER: 'gameOver'
};

export class GameState {
  constructor() {
    this.state = GAME_STATE.PLAYING;
    this.gameOverCallbacks = [];
    this.resetCallbacks = [];
  }
  
  isPlaying() {
    return this.state === GAME_STATE.PLAYING;
  }
  
  isGameOver() {
    return this.state === GAME_STATE.GAME_OVER;
  }
  
  gameOver() {
    if (this.state !== GAME_STATE.GAME_OVER) {
      this.state = GAME_STATE.GAME_OVER;
      this.gameOverCallbacks.forEach(callback => callback());
    }
  }
  
  reset() {
    this.state = GAME_STATE.PLAYING;
    this.resetCallbacks.forEach(callback => callback());
  }
  
  onGameOver(callback) {
    this.gameOverCallbacks.push(callback);
  }
  
  onReset(callback) {
    this.resetCallbacks.push(callback);
  }
}