// scripts/core/SceneManager.js
import * as THREE from 'three';

import { 
  BACKGROUND_COLOR
} from '../constants.js';

export class SceneManager {
  constructor() {
    this.scene = null;
    this.fogColor = BACKGROUND_COLOR;
    this.backgroundColor = BACKGROUND_COLOR;
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