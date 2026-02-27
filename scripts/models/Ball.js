// scripts/models/Ball.js
import * as THREE from 'three';
import { BALL_RADIUS, BALL_COLOR, BASE_PLATFORM_TOP_Y, BOUNCE_SPEED, MAIN_RADIUS } from '../constants.js';

export class Ball {
  constructor(scene) {
    this.scene = scene;
    this.mesh = null;
    this.velocity = new THREE.Vector3(0, BOUNCE_SPEED, 0);
    this.lastBounceY = BASE_PLATFORM_TOP_Y;
    this.bounceCount = 0;
    this.k_distance = 1.3;
    this.tree = null;
  }
  
  init(tree) {

    this.tree = tree;
    const geometry = new THREE.SphereGeometry(BALL_RADIUS, 16, 16);
    const material = new THREE.MeshStandardMaterial({
      color: BALL_COLOR,
      metalness: 0.3,
      roughness: 0.4,
    });
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(0, BASE_PLATFORM_TOP_Y + BALL_RADIUS, this.tree.maxRadius * this.k_distance);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    
    this.scene.add(this.mesh);
    return this.mesh;
  }
  
  setPosition(x, y, z) {
    this.mesh.position.set(x, y, this.tree.calcDistance(y) * this.k_distance);
  }
  
  getPosition() {
    return this.mesh.position.clone();
  }
  
  getWorldPosition() {
    const pos = new THREE.Vector3();
    this.mesh.getWorldPosition(pos);
    return pos;
  }
  
  setVelocity(y) {
    this.velocity.y = y;
  }
  
  getVelocity() {
    return this.velocity.clone();
  }
  
  applyGravity(dt, gravity) {
    this.velocity.y += gravity * dt;
  }
  
  limitVelocity(maxVelocity) {
    this.velocity.y = Math.max(-maxVelocity, Math.min(maxVelocity, this.velocity.y));
  }
  
  updatePosition(dt) {
    let v = this.getPosition().add(this.velocity.clone().multiplyScalar(dt));
    this.setPosition(v.x, v.y, v.z);
  }
  
  bounce(bounceY, bounceSpeed) {
    this.mesh.position.y = bounceY + BALL_RADIUS * Math.sign(bounceSpeed);
    this.velocity.y = bounceSpeed;
    this.lastBounceY = bounceY;
    this.bounceCount++;
    return this.bounceCount;
  }
  
  getLastBounceY() {
    return this.lastBounceY;
  }
  
  getBounceCount() {
    return this.bounceCount;
  }
  
  resetBounceCount() {
    this.bounceCount = 0;
  }

  dispose() {
    this.scene.remove(this.mesh);
  }
}