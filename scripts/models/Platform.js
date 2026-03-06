// scripts/models/Platform.js
import * as THREE from 'three';
import { 
  STICK_OUT, PLATFORM_RADIUS, PLATFORM_HEIGHT, 
  PLATFORM_NORMAL_COLOR, PLATFORM_KILLER_COLOR,
  PLATFORM_TEXTURE_PATH, KILLER_PLATFORM_TEXTURE_PATH
} from '../constants.js';
import { textureLoader } from '../utils/TextureLoader.js';
import { When } from '../utils/Utils.js';

export class Platform {
  constructor(tree, theta, y, isKiller = false) {
    this.tree = tree;
    this.theta = theta;
    this.y = y;
    this.isKiller = isKiller;
    this.group = null;
    this.mesh = null;
    this.texture = null;

    this.platformGeometry = new THREE.CylinderGeometry(PLATFORM_RADIUS, PLATFORM_RADIUS * 0.8, PLATFORM_HEIGHT, 8);

    textureLoader.rotateUV(this.platformGeometry, Math.PI * 0.5);
    
    // Выбираем цвет в зависимости от типа платформы
    const platformColor = isKiller ? PLATFORM_KILLER_COLOR : PLATFORM_NORMAL_COLOR;
    
    this.material = new THREE.MeshStandardMaterial({
      color: platformColor,
      metalness: isKiller ? 0.3 : 0.0,
      roughness: isKiller ? 0.4 : 0.9,
      emissive: isKiller ? new THREE.Color(0x330000) : new THREE.Color(0x000000),
    });

    let distance = 0.9;
    this.group = new THREE.Group();
    this.group.position.set(distance * Math.cos(this.theta), this.y, distance * Math.sin(this.theta));
    this.group.rotation.y = -this.theta;
    
    // Создание площадки
    this.mesh = new THREE.Mesh(this.platformGeometry, this.material);
    this.mesh.position.set(0, 0, 0);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.group.add(this.mesh);
    
    // Загружаем текстуру для платформы
    this.loadTexture();
    
    // Добавляем шипы для платформ-убийц
    if (this.isKiller) {
      this.addSpikes();
    }
    
    this.tree.mesh.add(this.group);
  }
  
  loadTexture() {
    const texturePath = this.isKiller ? KILLER_PLATFORM_TEXTURE_PATH : PLATFORM_TEXTURE_PATH;
    
    textureLoader.loadTexture(
      texturePath,
      (texture) => {
        // Настраиваем текстуру для платформы
        texture.repeat.set(2, 1); // Повторяем текстуру 2 раза по X
        
        // Применяем текстуру к материалу
        this.material.map = texture;
        this.material.color.setHex(0xffffff); // Сбрасываем цвет на белый для корректного отображения текстуры
        this.material.needsUpdate = true;
        this.texture = texture;
      },
      (error) => {
        console.warn(`Не удалось загрузить текстуру для платформы: ${texturePath}`);
        // Если не удалось загрузить текстуру, создаем заглушку
        if (this.isKiller) {
          this.material.map = textureLoader.createKillerTexture();
        } else {
          this.material.map = textureLoader.createWoodTexture();
        }
        this.material.needsUpdate = true;
      },
      {
        repeat: { x: 2, y: 1 },
        anisotropy: 8
      }
    );
  }
  
  addSpikes() {
    const spikeCount = 6; // Количество шипов
    const spikeRadius = PLATFORM_RADIUS * 0.7; // Радиус размещения шипов
    const spikeHeight = PLATFORM_HEIGHT * 0.4; // Высота шипа
    
    // Создаем материал для шипов (более яркий красный)
    const spikeMaterial = new THREE.MeshStandardMaterial({
      color: 0xFF5555,
      emissive: 0x220000,
      metalness: 0.1,
      roughness: 0.3
    });
    
    /*
    // Загружаем текстуру для шипов
    textureLoader.loadTexture(
      'textures/spike.jpg',
      (texture) => {
        spikeMaterial.map = texture;
        spikeMaterial.needsUpdate = true;
      },
      () => {
        // Игнорируем ошибку, используем цвет
      }
    );*/
    
    for (let i = 0; i < spikeCount; i++) {
      // Угол для размещения шипа по кругу
      const angle = (i / spikeCount) * Math.PI * 2;
      
      // Создаем конус (пирамидку) для шипа
      const spikeGeometry = new THREE.ConeGeometry(PLATFORM_RADIUS * 0.1, spikeHeight, 8);
      const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
      
      // Позиционируем шип на краю платформы
      spike.position.set(
        STICK_OUT + Math.cos(angle) * spikeRadius,
        PLATFORM_HEIGHT / 2 + spikeHeight / 2,
        Math.sin(angle) * spikeRadius
      );
      
      spike.castShadow = true;
      spike.receiveShadow = true;
      
      this.group.add(spike);
    }
    
    // Добавляем один центральный шип для большей угрозы
    const centerSpikeGeometry = new THREE.ConeGeometry(PLATFORM_RADIUS * 0.1, spikeHeight * 1.2, 8);
    const centerSpike = new THREE.Mesh(centerSpikeGeometry, spikeMaterial);
    centerSpike.position.set(STICK_OUT, PLATFORM_HEIGHT / 2 + spikeHeight * 1.2 / 2, 0);
    centerSpike.castShadow = true;
    centerSpike.receiveShadow = true;
    this.group.add(centerSpike);
    
    // Добавляем маленькие шипы на выступе (боксе)
    const boxSpikeCount = 3;
    for (let i = 0; i < boxSpikeCount; i++) {
      const boxSpikeGeometry = new THREE.ConeGeometry(PLATFORM_RADIUS * 0.15, spikeHeight * 0.8, 6);
      const boxSpike = new THREE.Mesh(boxSpikeGeometry, spikeMaterial);
      
      const offset = (i - 1) * PLATFORM_RADIUS * 0.3;
      boxSpike.position.set(
        -PLATFORM_RADIUS - PLATFORM_RADIUS * 0.2,
        PLATFORM_HEIGHT / 2 + spikeHeight * 0.8 / 2,
        offset
      );
      
      boxSpike.castShadow = true;
      boxSpike.receiveShadow = true;
      this.group.add(boxSpike);
    }
  }
  
  updateTexture(texture) {
    if (texture && !this.isKiller) {
      this.material.map = texture;
      this.material.color.setHex(0xffffff);
      this.material.needsUpdate = true;
    }
  }
  
  /**
   * Обновляет параметры текстуры платформы
   * @param {Object} options - параметры текстуры
   */
  updateTextureOptions(options = {}) {
    if (this.texture) {
      if (options.repeat) {
        this.texture.repeat.set(options.repeat.x || 1, options.repeat.y || 1);
      }
      if (options.offset) {
        this.texture.offset.set(options.offset.x || 0, options.offset.y || 0);
      }
      this.texture.needsUpdate = true;
    }
  }
  
  /**
   * Удаляет платформу и освобождает ресурсы
   */
  dispose() {
    if (this.group) {
      this.group.removeFromParent();
    }
    // Материалы и геометрии удаляются автоматически сборщиком мусора
  }

  update(dt) {

  }
}