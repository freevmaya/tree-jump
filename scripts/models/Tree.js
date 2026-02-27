// scripts/models/Tree.js
import * as THREE from 'three';
import { 
  TREE_COLOR, TREE_HEIGHT, MAIN_RADIUS, STICK_OUT, 
  PLATFORM_RADIUS, PLATFORM_HEIGHT, PLATFORM_COUNT,
  CYLINDER_HALF_HEIGHT, WIREFRAME_COLOR, BARK_TEXTURE_PATH,
  KILLER_PLATFORM_PERCENTAGE, ROTATION_SMOOTH
} from '../constants.js';
import { Platform } from './Platform.js';
import { textureLoader } from '../utils/TextureLoader.js';

export class Tree {
  constructor(scene) {
    this.scene = scene;
    this.mesh = null;
    this.platforms = [];
    this.barkTexture = null;
    this.targetRotation = 0;
    this.minRadius = MAIN_RADIUS * 0.5;
    this.maxRadius = MAIN_RADIUS;
  }
  
  init() {
    // Создание ствола
    const cylinderGeometry = new THREE.CylinderGeometry(this.minRadius, this.maxRadius, TREE_HEIGHT, 32);
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
    
    // Загрузка текстуры с помощью утилиты
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
    // Используем утилиту для загрузки текстуры
    textureLoader.loadTexture(
      BARK_TEXTURE_PATH,
      (texture) => {
        // Настройки текстуры для дерева
        texture.repeat.set(2, TREE_HEIGHT / 1.5);
        material.map = texture;
        material.color.setHex(0xffffff);
        material.needsUpdate = true;
        this.barkTexture = texture;
      },
      (error) => {
        console.warn('Текстура не загружена: ' + BARK_TEXTURE_PATH);
        // Создаем текстуру-заглушку
        const fallbackTexture = textureLoader.createFallbackTexture(0xA67C52);
        material.map = fallbackTexture;
        material.needsUpdate = true;
      },
      {
        repeat: { x: 2, y: TREE_HEIGHT / 1.5 },
        anisotropy: 16
      }
    );
  }

  calcDistance(y) {
    let k = (TREE_HEIGHT - (CYLINDER_HALF_HEIGHT + y)) / TREE_HEIGHT; 
    return this.minRadius * (1 - k) + this.maxRadius * k;
  }
  
  createPlatforms() {
    // Очищаем массив платформ перед созданием новых
    this.platforms = [];
    
    // Рассчитываем количество платформ-убийц (10% согласно константе)
    const killerCount = Math.floor(PLATFORM_COUNT * KILLER_PLATFORM_PERCENTAGE);
    
    // Создаем массив булевых значений для определения типа каждой платформы
    const platformTypes = new Array(PLATFORM_COUNT).fill(false);
    
    // Случайно выбираем индексы для платформ-убийц
    for (let i = 0; i < killerCount; i++) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * PLATFORM_COUNT);
      } while (platformTypes[randomIndex] === true); // Ищем свободный индекс
      platformTypes[randomIndex] = true;
    }
    
    let base_y = CYLINDER_HALF_HEIGHT / PLATFORM_COUNT;
    let previousTheta = null; // Переменная для хранения предыдущего угла
    
    // Создаем платформы с соответствующими типами
    for (let i = 0; i < PLATFORM_COUNT; i++) {
      const y = base_y + (i / PLATFORM_COUNT * 2 - 1) * (CYLINDER_HALF_HEIGHT - base_y);
      
      // Генерируем угол с проверкой на минимальное отличие от предыдущего
      let theta;
      const MIN_ANGLE_DIFF = Math.PI / 3; // Минимальная разница в 60 градусов
      
      if (previousTheta === null) {
        // Для первой платформы - случайный угол
        theta = (Math.random() - 0.5) * Math.PI * 2;
      } else {
        // Для последующих - генерируем угол, отличающийся от предыдущего не менее чем на MIN_ANGLE_DIFF
        let attempts = 0;
        const maxAttempts = 100; // Предотвращаем бесконечный цикл
        
        do {
          theta = (Math.random() - 0.5) * Math.PI * 2;
          attempts++;
          
          // Если не получается найти подходящий угол за много попыток,
          // добавляем MIN_ANGLE_DIFF к предыдущему углу со случайным направлением
          if (attempts > maxAttempts) {
            const direction = Math.random() > 0.5 ? 1 : -1;
            theta = previousTheta + direction * MIN_ANGLE_DIFF;
            // Нормализуем угол в диапазон [-PI, PI]
            while (theta > Math.PI) theta -= Math.PI * 2;
            while (theta < -Math.PI) theta += Math.PI * 2;
            break;
          }
        } while (Math.abs(theta - previousTheta) < MIN_ANGLE_DIFF);
      }
      
      const isKiller = platformTypes[i]; // Используем реальные типы
      
      const platform = new Platform(this.mesh, theta, y, isKiller);
      const platformData = platform.create(this.calcDistance(y));
      
      this.platforms.push(platformData);
      
      // Сохраняем текущий угол для следующей итерации
      previousTheta = theta;
    }
    
    console.log(`Создано платформ: всего ${PLATFORM_COUNT}, убийц: ${killerCount}`);
  }
  
  getPlatforms() {
    return this.platforms;
  }
  
  rotate(yDelta) {
    if (this.mesh) {
      this.targetRotation += yDelta;
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

  update() {
      this.setRotation(this.mesh.rotation.y + (this.targetRotation - this.mesh.rotation.y) * ROTATION_SMOOTH);
  }
}