// scripts/core/SceneManager.js
import * as THREE from 'three';

export class SceneManager {
  constructor() {
    this.scene = null;
    this.fogColor = 0xB0E0E6;
    this.backgroundColor = 0x87CEEB;
  }
  
  init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.backgroundColor);
    this.scene.fog = new THREE.Fog(this.fogColor, 12, 28);
    return this.scene;
  }
  
  getScene() {
    return this.scene;
  }
  
  add(object) {
    this.scene.add(object);
  }
  
  remove(object) {
    this.scene.remove(object);
  }
}