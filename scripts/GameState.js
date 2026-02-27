// scripts/GameState.js

export const GAME_STATE = {
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'gameOver',
  VICTORY: 'victory'
};

export class GameState {
  constructor() {
    this.state = GAME_STATE.PLAYING;
    this._gameOverCallbacks = [];
    this._victoryCallbacks = [];
    this.pauseCallbacks = [];
    this.resumeCallbacks = [];
    this.resetCallbacks = [];
  }
  
  isPlaying() {
    return this.state === GAME_STATE.PLAYING;
  }
  
  isPaused() {
    return this.state === GAME_STATE.PAUSED;
  }
  
  isGameOver() {
    return this.state === GAME_STATE.GAME_OVER;
  }
  
  isVictory() {
    return this.state === GAME_STATE.VICTORY;
  }
  
  gameOver() {
    if (this.state !== GAME_STATE.GAME_OVER && this.state !== GAME_STATE.VICTORY) {
      this.state = GAME_STATE.GAME_OVER;
      console.log("GameState.gameOver() вызван, колбэков:", this._gameOverCallbacks.length);
      this._gameOverCallbacks.forEach(callback => callback());
    }
  }
  
  victory() {
    if (this.state !== GAME_STATE.VICTORY && this.state !== GAME_STATE.GAME_OVER) {
      this.state = GAME_STATE.VICTORY;
      console.log("GameState.victory() вызван, колбэков:", this._victoryCallbacks.length);
      this._victoryCallbacks.forEach(callback => callback());
    }
  }
  
  pause() {
    if (this.state === GAME_STATE.PLAYING) {
      this.state = GAME_STATE.PAUSED;
      console.log("GameState.pause() вызван, колбэков:", this.pauseCallbacks.length);
      this.pauseCallbacks.forEach(callback => callback());
    }
  }
  
  resume() {
    if (this.state === GAME_STATE.PAUSED) {
      this.state = GAME_STATE.PLAYING;
      console.log("GameState.resume() вызван, колбэков:", this.resumeCallbacks.length);
      this.resumeCallbacks.forEach(callback => callback());
    }
  }
  
  reset() {
    this.state = GAME_STATE.PLAYING;
    console.log("GameState.reset() вызван, колбэков:", this.resetCallbacks.length);
    this.resetCallbacks.forEach(callback => callback());
  }
  
  onGameOver(callback) {
    this._gameOverCallbacks.push(callback);
  }
  
  onVictory(callback) {
    this._victoryCallbacks.push(callback);
  }
  
  onPause(callback) {
    this.pauseCallbacks.push(callback);
  }
  
  onResume(callback) {
    this.resumeCallbacks.push(callback);
  }
  
  onReset(callback) {
    this.resetCallbacks.push(callback);
  }
}