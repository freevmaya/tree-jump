// scripts/core/RendererManager.js
import * as THREE from 'three';

export class RendererManager {
  constructor(container) {
    this.container = container;
    this.renderer = null;
    this.width = container.clientWidth;
    this.height = container.clientHeight;
  }
  
  init() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    this.container.appendChild(this.renderer.domElement);
    return this.renderer;
  }
  
  resize() {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.renderer.setSize(this.width, this.height);
  }
  
  render(scene, camera) {
    this.renderer.render(scene, camera);
  }
  
  getRenderer() {
    return this.renderer;
  }
  
  getAspectRatio() {
    return this.width / this.height;
  }
}