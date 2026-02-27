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
      console.log("GameState.gameOver() вызван, колбэков:", this.gameOverCallbacks.length);
      this.gameOverCallbacks.forEach(callback => callback());
    }
  }
  
  reset() {
    this.state = GAME_STATE.PLAYING;
    console.log("GameState.reset() вызван, колбэков:", this.resetCallbacks.length);
    this.resetCallbacks.forEach(callback => callback());
  }
  
  onGameOver(callback) {
    this.gameOverCallbacks.push(callback);
  }
  
  onReset(callback) {
    this.resetCallbacks.push(callback);
  }
}