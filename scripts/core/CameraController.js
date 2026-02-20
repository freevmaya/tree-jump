// scripts/core/CameraController.js
import * as THREE from 'three';
import { CAMERA_FOLLOW_SPEED, CAMERA_HEIGHT_OFFSET, CAMERA_START_Y } from '../constants.js';

export class CameraController {
  constructor(aspectRatio) {
    this.camera = new THREE.PerspectiveCamera(50, aspectRatio, 0.1, 100);
    this.camera.position.set(2, CAMERA_START_Y, 9);
    this.targetY = 0;
    this.followSpeed = CAMERA_FOLLOW_SPEED;
    this.heightOffset = CAMERA_HEIGHT_OFFSET;
  }
  
  update(targetY) {
    this.targetY = targetY + this.heightOffset;
    this.camera.position.y += (this.targetY - this.camera.position.y) * this.followSpeed;
    this.camera.lookAt(0, this.camera.position.y, 0);
  }
  
  setPosition(x, y, z) {
    this.camera.position.set(x, y, z);
  }
  
  getCamera() {
    return this.camera;
  }
  
  resize(aspectRatio) {
    this.camera.aspect = aspectRatio;
    this.camera.updateProjectionMatrix();
  }
}