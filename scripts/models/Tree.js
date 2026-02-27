// scripts/models/Tree.js
import * as THREE from 'three';
import { 
  TREE_COLOR, TREE_HEIGHT, MAIN_RADIUS, STICK_OUT, 
  PLATFORM_RADIUS, PLATFORM_HEIGHT, PLATFORM_COUNT,
  CYLINDER_HALF_HEIGHT, WIREFRAME_COLOR, BARK_TEXTURE_PATH,
  KILLER_PLATFORM_PERCENTAGE, ROTATION_SMOOTH,
  BRANCH_COUNT, BRANCH_MIN_LENGTH, BRANCH_MAX_LENGTH
} from '../constants.js';
import { Platform } from './Platform.js';
import { Branch } from './Branch.js';
import { textureLoader } from '../utils/TextureLoader.js';

export class Tree {
  constructor(scene) {
    this.scene = scene;
    this.mesh = null;
    this.platforms = [];
    this.branches = []; // Добавляем массив для хранения веток
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
    
    // Создание веток
    this.createBranches();
    
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
      const platformData = platform.create(this.calcDistance(y));
      
      this.platforms.push(platformData);
      
      previousTheta = theta;
    }
    
    console.log(`Создано платформ: всего ${PLATFORM_COUNT}, убийц: ${killerCount}`);
  }
  
  createBranches() {
    // Очищаем массив веток
    this.branches = [];
    
    // Рассчитываем количество веток (реже чем платформы)
    // Используем BRANCH_COUNT из констант
    
    console.log(`Создание веток: ${BRANCH_COUNT} шт.`);
    
    // Создаем массив для хранения занятых позиций по Y
    // Чтобы ветки не мешали платформам, размещаем их между платформами
    
    const platformYPositions = this.platforms.map(p => p.localY);
    platformYPositions.sort((a, b) => a - b);
    
    let branchCreated = 0;
    let attempts = 0;
    const maxAttempts = 1000;
    
    while (branchCreated < BRANCH_COUNT && attempts < maxAttempts) {
      attempts++;
      
      // Выбираем случайную высоту
      const y = (Math.random() - 0.5) * TREE_HEIGHT * 0.9;
      
      // Проверяем, что высота не слишком близка к платформам
      let tooClose = false;
      for (const platformY of platformYPositions) {
        if (Math.abs(platformY - y) < 0.6) { // Минимальное расстояние до платформы
          tooClose = true;
          break;
        }
      }
      
      // Также проверяем расстояние до других веток
      for (const branch of this.branches) {
        if (Math.abs(branch.localY - y) < 0.8) {
          tooClose = true;
          break;
        }
      }
      
      if (!tooClose) {
        // Генерируем угол для ветки
        const theta = (Math.random() - 0.5) * Math.PI * 2;
        
        // Рассчитываем радиус ствола на этой высоте
        const distance = this.calcDistance(y) * 0.6;
        
        // Определяем масштаб ветки (чем выше, тем меньше)
        const heightFactor = (CYLINDER_HALF_HEIGHT - y) / TREE_HEIGHT;
        const scaleFactor = 0.6 + heightFactor * 0.8; // Ветки внизу крупнее
        
        // Создаем ветку
        const branch = new Branch(this.mesh, theta, y, scaleFactor);
        const branchData = branch.create(distance);
        
        // Сохраняем данные ветки
        this.branches.push({
          group: branchData.group,
          meshes: branchData.meshes,
          localY: branchData.localY,
          branch: branch // Сохраняем ссылку на объект Branch для возможного обновления
        });
        
        branchCreated++;
      }
    }
    
    console.log(`Создано веток: ${branchCreated} из ${BRANCH_COUNT} запланированных`);
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