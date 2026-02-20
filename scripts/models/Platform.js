// scripts/models/Platform.js
import * as THREE from 'three';
import { 
  TREE_COLOR, STICK_OUT, PLATFORM_RADIUS, PLATFORM_HEIGHT, MAIN_RADIUS
} from '../constants.js';

export class Platform {
  constructor(parentMesh, theta, y) {
    this.parentMesh = parentMesh;
    this.theta = theta;
    this.y = y;
    this.group = null;
    this.box = null;
    this.platformMesh = null;
    
    const boxWidth = STICK_OUT * 3;
    const boxHeight = STICK_OUT * 0.6;
    const boxDepth = STICK_OUT * 0.6;
    
    this.boxGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    this.platformGeometry = new THREE.CylinderGeometry(PLATFORM_RADIUS, PLATFORM_RADIUS, PLATFORM_HEIGHT, 16);
    
    this.material = new THREE.MeshStandardMaterial({
      color: TREE_COLOR,
      metalness: 0.0,
      roughness: 0.9,
    });
  }
  
  create() {
    this.group = new THREE.Group();
    this.group.position.set(MAIN_RADIUS * Math.cos(this.theta), this.y, MAIN_RADIUS * Math.sin(this.theta));
    this.group.rotation.y = -this.theta;
    
    // Создание выступа (бокса)
    this.box = new THREE.Mesh(this.boxGeometry, this.material);
    this.box.position.set(-PLATFORM_RADIUS, 0, 0);
    this.box.castShadow = true;
    this.group.add(this.box);
    
    // Создание площадки
    this.platformMesh = new THREE.Mesh(this.platformGeometry, this.material);
    this.platformMesh.position.set(STICK_OUT, 0, 0);
    this.platformMesh.castShadow = true;
    this.group.add(this.platformMesh);
    
    this.parentMesh.add(this.group);
    
    return {
      mesh: this.platformMesh,
      group: this.group,
      localY: this.y
    };
  }
  
  updateTexture(texture) {
    if (texture) {
      this.material.map = texture;
      this.material.color.setHex(0xffffff);
      this.material.needsUpdate = true;
    }
  }
}