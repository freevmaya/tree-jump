// scripts/models/Tree.js
import * as THREE from 'three';
import { 
  TREE_COLOR, TREE_HEIGHT, MAIN_RADIUS, STICK_OUT, 
  PLATFORM_RADIUS, PLATFORM_HEIGHT, PLATFORM_COUNT,
  CYLINDER_HALF_HEIGHT, WIREFRAME_COLOR, BARK_TEXTURE_PATH
} from '../constants.js';
import { Platform } from './Platform.js';

export class Tree {
  constructor(scene) {
    this.scene = scene;
    this.mesh = null;
    this.platforms = [];
    this.textureLoader = new THREE.TextureLoader();
    this.barkTexture = null;
  }
  
  init() {
    // Создание ствола
    const cylinderGeometry = new THREE.CylinderGeometry(MAIN_RADIUS * 0.5, MAIN_RADIUS, TREE_HEIGHT, 32);
    const cylinderMaterial = new THREE.MeshStandardMaterial({
      color: TREE_COLOR,
      metalness: 0.0,
      roughness: 0.9,
      envMapIntensity: 0,
    });
    
    this.mesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.position.set(0, 0, 0);
    
    // Добавление подсветки граней
    this.addWireframe(cylinderGeometry);
    
    // Загрузка текстуры
    this.loadTexture(cylinderMaterial);
    
    // Создание платформ
    this.createPlatforms();
    
    this.scene.add(this.mesh);
    return this.mesh;
  }
  
  addWireframe(geometry) {
    const wireGeometry = new THREE.EdgesGeometry(geometry, 15);
    const wireMaterial = new THREE.LineBasicMaterial({
      color: WIREFRAME_COLOR,
      transparent: true,
      opacity: 0.35,
    });
    const wireframe = new THREE.LineSegments(wireGeometry, wireMaterial);
    this.mesh.add(wireframe);
  }
  
  loadTexture(material) {
    this.textureLoader.load(
      BARK_TEXTURE_PATH,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(2, TREE_HEIGHT / 1.5);
        material.map = tex;
        material.color.setHex(0xffffff);
        material.needsUpdate = true;
      },
      undefined,
      () => console.warn('Текстура не загружена: ' + BARK_TEXTURE_PATH)
    );
  }
  
  createPlatforms() {
    // Очищаем массив платформ перед созданием новых
    this.platforms = [];
    
    for (let i = 0; i < PLATFORM_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const y = (i / PLATFORM_COUNT * 2 - 1) * CYLINDER_HALF_HEIGHT;
      
      const platform = new Platform(this.mesh, theta, y);
      const platformData = platform.create();
      this.platforms.push(platformData);
    }
  }
  
  getPlatforms() {
    return this.platforms;
  }
  
  rotate(yDelta) {
    if (this.mesh) {
      this.mesh.rotation.y += yDelta;
    }
  }
  
  setRotation(y) {
    if (this.mesh) {
      this.mesh.rotation.y = y;
    }
  }
  
  getRotationY() {
    return this.mesh ? this.mesh.rotation.y : 0;
  }
}