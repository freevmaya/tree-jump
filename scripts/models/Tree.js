// scripts/models/Tree.js
import * as THREE from 'three';
import { 
  TREE_COLOR, TREE_HEIGHT, MAIN_RADIUS, STICK_OUT, 
  PLATFORM_RADIUS, PLATFORM_HEIGHT, PLATFORM_COUNT,
  CYLINDER_HALF_HEIGHT, WIREFRAME_COLOR, BARK_TEXTURE_PATH,
  KILLER_PLATFORM_PERCENTAGE, ROTATION_SMOOTH,
  BRANCH_COUNT, BRANCH_MIN_LENGTH, BRANCH_MAX_LENGTH, BRANCH_DENSITY
} from '../constants.js';
import { Platform } from './Platform.js';
import { Branch } from './Branch.js';
import { textureLoader } from '../utils/TextureLoader.js';

export class Tree {
  constructor(scene) {
    this.scene = scene;
    this.mesh = null;
    this.platforms = [];
    this.branches = []; // Массив для хранения веток
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
    
    // Создание веток под платформами
    this.createBranchesUnderPlatforms();
    
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
    
    // Рассчитываем количество платформ-убийц
    const killerCount = Math.floor(PLATFORM_COUNT * KILLER_PLATFORM_PERCENTAGE);
    
    // Создаем массив для хранения типов платформ
    const platformTypes = new Array(PLATFORM_COUNT).fill(false);
    
    // Распределяем платформы-убийцы равномерно между обычными платформами
    if (killerCount > 0) {
      // Вычисляем интервал между платформами-убийцами
      const interval = Math.floor(PLATFORM_COUNT / (killerCount + 1));
      
      // Размещаем платформы-убийцы с равными промежутками
      for (let i = 0; i < killerCount; i++) {
        let position = interval * (i + 1);
        
        if (position >= PLATFORM_COUNT) {
          position = PLATFORM_COUNT - 1;
        }
        
        platformTypes[position] = true;
      }
      
      console.log(`Платформы-убийцы распределены равномерно: ${platformTypes.filter(t => t).length} шт.`);
    }
    
    let base_y = CYLINDER_HALF_HEIGHT / PLATFORM_COUNT;
    let previousTheta = null;
    const MIN_ANGLE_DIFF = Math.PI / 3;
    
    for (let i = 0; i < PLATFORM_COUNT; i++) {
      const y = base_y + (i / PLATFORM_COUNT * 2 - 1) * (CYLINDER_HALF_HEIGHT - base_y);
      
      let theta;
      
      if (previousTheta === null) {
        theta = (Math.random() - 0.5) * Math.PI * 2;
      } else {
        let attempts = 0;
        const maxAttempts = 100;
        
        do {
          theta = (Math.random() - 0.5) * Math.PI * 2;
          attempts++;
          
          if (attempts > maxAttempts) {
            const direction = Math.random() > 0.5 ? 1 : -1;
            theta = previousTheta + direction * MIN_ANGLE_DIFF;
            while (theta > Math.PI) theta -= Math.PI * 2;
            while (theta < -Math.PI) theta += Math.PI * 2;
            break;
          }
        } while (Math.abs(theta - previousTheta) < MIN_ANGLE_DIFF);
      }
      
      const isKiller = platformTypes[i];
      
      const platform = new Platform(this.mesh, theta, y, isKiller);
      platform.create(this.calcDistance(y));
      
      this.platforms.push(platform);
      
      previousTheta = theta;
    }
    
    console.log(`Создано платформ: всего ${PLATFORM_COUNT}, убийц: ${killerCount}`);
  }
  
  createBranchesUnderPlatforms() {
    // Очищаем массив веток
    this.branches = [];
    
    if (this.platforms.length === 0) return;
    
    // Рассчитываем количество веток на основе плотности
    const targetBranchCount = Math.floor(PLATFORM_COUNT * BRANCH_DENSITY);
    console.log(`Создание веток под платформами: ${targetBranchCount} шт. (плотность ${BRANCH_DENSITY})`);
    
    // Сортируем платформы по высоте
    const sortedPlatforms = [...this.platforms].sort((a, b) => a.y - b.y);
    
    // Выбираем случайные платформы для размещения веток под ними
    const selectedPlatformIndices = new Set();
    let attempts = 0;
    const maxAttempts = 1000;
    
    while (selectedPlatformIndices.size < targetBranchCount && attempts < maxAttempts) {
      attempts++;
      
      // Выбираем случайную платформу
      const platformIndex = Math.floor(Math.random() * sortedPlatforms.length);
      
      // Проверяем, не выбрана ли уже эта платформа
      if (!selectedPlatformIndices.has(platformIndex)) {
        const platform = sortedPlatforms[platformIndex];
        
        // Проверяем, что под платформой достаточно места для ветки
        const platformY = platform.y;
        
        // Проверяем расстояние до других веток
        let tooClose = false;
        for (const branch of this.branches) {
          if (Math.abs(branch.y - platformY) < 0.8) {
            tooClose = true;
            break;
          }
        }
        
        // Также проверяем расстояние до других платформ (чтобы ветка не мешала)
        for (const otherPlatform of sortedPlatforms) {
          if (otherPlatform !== platform && Math.abs(otherPlatform.y - platformY) < 0.6) {
            tooClose = true;
            break;
          }
        }
        
        if (!tooClose) {
          // Добавляем платформу в выбранные
          selectedPlatformIndices.add(platformIndex);
        }
      }
    }
    
    // Создаем ветки под выбранными платформами
    selectedPlatformIndices.forEach(platformIndex => {
      const platform = sortedPlatforms[platformIndex];
      
      // Высота ветки - чуть ниже платформы
      const branchY = platform.y - PLATFORM_HEIGHT / 2 - 0.5;   

      const distance = this.calcDistance(branchY) * 0.6;
      
      // Определяем масштаб ветки (чем выше, тем меньше)
      const heightFactor = (CYLINDER_HALF_HEIGHT - branchY) / TREE_HEIGHT;
      const scaleFactor = 0.6 + heightFactor * 0.8; // Ветки внизу крупнее
      
      // Создаем ветку
      const branch = new Branch(this.mesh, platform.theta, branchY, scaleFactor);
      const branchData = branch.create(distance);
      
      // Сохраняем данные ветки
      this.branches.push({
        group: branchData.group,
        mesh: branchData.mesh,
        localY: branchData.y,
        branch: branch, // Сохраняем ссылку на объект Branch для возможного обновления
        platformIndex: platformIndex // Сохраняем индекс платформы, под которой создана ветка
      });
    });
    
    console.log(`Создано веток под платформами: ${this.branches.length} из ${targetBranchCount} запланированных`);
  }
  
  getPlatforms() {
    return this.platforms;
  }
  
  getBranches() {
    return this.branches;
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