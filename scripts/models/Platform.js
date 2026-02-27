// scripts/models/Platform.js
import * as THREE from 'three';
import { 
  TREE_COLOR, STICK_OUT, PLATFORM_RADIUS, PLATFORM_HEIGHT, 
  MAIN_RADIUS, PLATFORM_NORMAL_COLOR, PLATFORM_KILLER_COLOR
} from '../constants.js';

export class Platform {
  constructor(parentMesh, theta, y, isKiller = false) {
    this.parentMesh = parentMesh;
    this.theta = theta;
    this.y = y;
    this.isKiller = isKiller;
    this.group = null;
    this.box = null;
    this.platformMesh = null;
    
    const boxWidth = STICK_OUT * 3;
    const boxHeight = STICK_OUT * 0.6;
    const boxDepth = STICK_OUT * 0.6;
    
    this.boxGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    this.platformGeometry = new THREE.CylinderGeometry(PLATFORM_RADIUS, PLATFORM_RADIUS, PLATFORM_HEIGHT, 16);
    
    // Выбираем цвет в зависимости от типа платформы
    const platformColor = isKiller ? PLATFORM_KILLER_COLOR : PLATFORM_NORMAL_COLOR;
    
    this.material = new THREE.MeshStandardMaterial({
      color: platformColor,
      metalness: isKiller ? 0.3 : 0.0,
      roughness: isKiller ? 0.4 : 0.9,
      emissive: isKiller ? new THREE.Color(0x330000) : new THREE.Color(0x000000),
    });
  }
  
  create() {
    this.group = new THREE.Group();
    this.group.position.set(MAIN_RADIUS * Math.cos(this.theta), this.y, MAIN_RADIUS * Math.sin(this.theta));
    this.group.rotation.y = -this.theta;
    
    // Создание выступа (бокса)
    this.box = new THREE.Mesh(this.boxGeometry, this.material);
    this.box.position.set(-PLATFORM_RADIUS, 0, 0);
    this.box.castShadow = true;
    this.group.add(this.box);
    
    // Создание площадки
    this.platformMesh = new THREE.Mesh(this.platformGeometry, this.material);
    this.platformMesh.position.set(STICK_OUT, 0, 0);
    this.platformMesh.castShadow = true;
    this.group.add(this.platformMesh);
    
    // Добавляем шипы для платформ-убийц
    if (this.isKiller) {
      this.addSpikes();
    }
    
    this.parentMesh.add(this.group);
    
    return {
      mesh: this.platformMesh,
      group: this.group,
      localY: this.y,
      isKiller: this.isKiller
    };
  }
  
  addSpikes() {
    const spikeCount = 6; // Количество шипов
    const spikeRadius = PLATFORM_RADIUS * 0.7; // Радиус размещения шипов
    const spikeHeight = PLATFORM_HEIGHT * 3; // Высота шипа
    
    // Создаем материал для шипов (более яркий красный)
    const spikeMaterial = new THREE.MeshStandardMaterial({
      color: 0xFF5555,
      emissive: 0x220000,
      metalness: 0.1,
      roughness: 0.3
    });
    
    for (let i = 0; i < spikeCount; i++) {
      // Угол для размещения шипа по кругу
      const angle = (i / spikeCount) * Math.PI * 2;
      
      // Создаем конус (пирамидку) для шипа
      const spikeGeometry = new THREE.ConeGeometry(PLATFORM_RADIUS * 0.2, spikeHeight, 8);
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
    const centerSpikeGeometry = new THREE.ConeGeometry(PLATFORM_RADIUS * 0.25, spikeHeight * 1.2, 8);
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
}