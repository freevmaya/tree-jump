// scripts/core/CameraController.js
import * as THREE from 'three';
import { CAMERA_FOLLOW_SPEED, CAMERA_HEIGHT_OFFSET, CAMERA_START_Y } from '../constants.js';

export class CameraController {

  constructor(game) {

    this.targetFocus = game.rendererManager.renderer.domElement.clientWidth < 500 ? 70 : 50;
    this.game = game;
    this.camera = new THREE.PerspectiveCamera(this.targetFocus, this.game.rendererManager.getAspectRatio(), 0.1, 100);
    this.targetY = 0;
    this.followSpeed = CAMERA_FOLLOW_SPEED;
    this.heightOffset = CAMERA_HEIGHT_OFFSET;
    this.reset();
  }

  setFocus(f) {
    this.camera.fov = f; // меньше значение = больше приближение
    this.camera.updateProjectionMatrix();
  }

  begin() {
    this.camera.fov = this.targetFocus * 2;
  }

  reset() {
    this.camera.position.set(0, CAMERA_HEIGHT_OFFSET - this.game.tree.half_height, 12);
  }
  
  update(targetY) {
    this.targetY = targetY + this.heightOffset;
    this.camera.position.y += (this.targetY - this.camera.position.y) * this.followSpeed;
    this.camera.lookAt(0, this.camera.position.y, 0);
    let diff = this.targetFocus - this.camera.fov;
    if (Math.abs(diff) > 0.1)
      this.setFocus(this.camera.fov + diff * 0.05);
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