// scripts/controls/MouseRotationControl.js
import { ROTATION_SPEED, INERTIA } from '../constants.js';

export class MouseRotationControl {
  constructor(tree, container) {
    this.tree = tree;
    this.container = container;
    this.isDragging = false;
    this.previousMouseX = 0;
    this.velocityY = 0;
    this.rotationSpeed = ROTATION_SPEED;
    this.inertia = INERTIA;
    
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseLeave = this.onMouseUp.bind(this);
  }
  
  init() {
    this.container.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('mouseleave', this.onMouseLeave);
  }
  
  destroy() {
    this.container.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('mouseleave', this.onMouseLeave);
  }
  
  onMouseDown(e) {
    this.isDragging = true;
    this.previousMouseX = e.clientX;
    this.velocityY = 0;
  }
  
  onMouseMove(e) {
    if (!this.isDragging) return;
    const dx = e.clientX - this.previousMouseX;
    this.velocityY = dx * this.rotationSpeed;
    this.tree.rotate(this.velocityY);
    this.previousMouseX = e.clientX;
  }
  
  onMouseUp() {
    this.isDragging = false;
  }
  
  update() {
    if (!this.isDragging) {
      this.velocityY *= this.inertia;
      if (Math.abs(this.velocityY) > 0.0001) {
        this.tree.rotate(this.velocityY);
      }
    }
  }
  
  reset() {
    this.isDragging = false;
    this.velocityY = 0;
  }
}