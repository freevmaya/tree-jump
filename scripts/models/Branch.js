// scripts/models/Branch.js
import * as THREE from 'three';
import { 
  BRANCH_MIN_RADIUS, BRANCH_MAX_RADIUS, BRANCH_MIN_LENGTH, BRANCH_MAX_LENGTH,
  BRANCH_ANGLE_MIN, BRANCH_ANGLE_MAX, BRANCH_CURVE_STRENGTH, BRANCH_SEGMENTS,
  STICK_OUT, BARK_TEXTURE_PATH, TREE_COLOR
} from '../constants.js';
import { textureLoader } from '../utils/TextureLoader.js';

export class Branch {
  constructor(parentMesh, theta, y, scaleFactor = 1.0) {
    this.parentMesh = parentMesh;
    this.theta = theta;
    this.y = y;
    this.scaleFactor = scaleFactor;
    this.group = null;
    this.branchMesh = null;
    this.barkTexture = null;
    
    // Рассчитываем параметры ветки с вариациями
    this.length = BRANCH_MIN_LENGTH + Math.random() * (BRANCH_MAX_LENGTH - BRANCH_MIN_LENGTH);
    this.length *= scaleFactor;
    
    // Начальный радиус ветки (у основания)
    this.startRadius = BRANCH_MIN_RADIUS + Math.random() * (BRANCH_MAX_RADIUS - BRANCH_MIN_RADIUS);
    this.startRadius *= scaleFactor;
    
    // Конечный радиус ветки (на кончике) - плавно уменьшается
    this.endRadius = this.startRadius * 0.2; // Уменьшаем до 20% от начального
    
    // Угол наклона ветки (от горизонтали)
    this.angle = BRANCH_ANGLE_MIN + Math.random() * (BRANCH_ANGLE_MAX - BRANCH_ANGLE_MIN);
    // Добавляем случайное отклонение вверх или вниз
    //this.angle *= (Math.random() > 0.4 ? 1 : -0.7); // Чаще вверх, иногда вниз
    
    // Сила изгиба
    this.curveStrength = BRANCH_CURVE_STRENGTH * (0.5 + Math.random() * 0.8);
    
    // Направление изгиба
    this.curveDirection = (Math.random() - 0.5) * BRANCH_CURVE_STRENGTH;
  }
  
  create(distance) {
    this.group = new THREE.Group();
    
    // Базовая позиция ветки на стволе
    const baseX = (distance + STICK_OUT) * Math.cos(this.theta);
    const baseZ = (distance + STICK_OUT) * Math.sin(this.theta);
    
    this.group.position.set(baseX, this.y, baseZ);
    
    // Поворачиваем группу так, чтобы ветка росла наружу от ствола
    this.group.rotation.y = -this.theta;
    
    // Создаем изогнутую ветку
    this.createCurvedBranch();
    
    // Загружаем текстуру
    this.loadTexture();
    
    this.parentMesh.add(this.group);
    
    return {
      group: this.group,
      mesh: this.branchMesh,
      localY: this.y
    };
  }
  
  createCurvedBranch() {
    const segments = BRANCH_SEGMENTS;
    const points = [];
    
    // Создаем контрольные точки для изогнутой кривой
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      
      // Прогрессия вдоль ветки
      const progress = t * this.length;
      
      // Базовое направление (наружу от ствола)
      const baseX = progress;
      
      // Изгиб вверх или вниз
      const curveY = Math.sin(t * Math.PI) * this.curveStrength * this.length * this.curveDirection;
      
      // Добавляем небольшой изгиб в стороны для реалистичности
      const curveZ = Math.sin(t * Math.PI * 1.5) * this.curveStrength * this.length * 0.2;
      
      // Учитываем угол наклона ветки
      const yOffset = progress * Math.tan(this.angle);
      
      points.push(new THREE.Vector3(
        baseX + curveZ * 0.3, // X - вперед (от ствола)
        yOffset + curveY,      // Y - вверх/вниз
        curveZ                 // Z - в стороны
      ));
    }
    
    // Создаем кривую
    const curve = new THREE.CatmullRomCurve3(points);
    
    // Функция для изменения радиуса вдоль ветки (плавное уменьшение)
    const radiusFunction = (t) => {
      // t от 0 до 1, где 0 - основание, 1 - кончик
      // Плавно уменьшаем радиус от startRadius до endRadius
      return this.startRadius * (1 - t * 0.8); // Линейное уменьшение на 80%
    };
    
    // Создаем геометрию трубки с переменным радиусом
    const tubeGeometry = this.createVariableRadiusTube(curve, radiusFunction, 64, 8);
    
    // Создаем материал с текстурой коры
    const material = new THREE.MeshStandardMaterial({
      color: TREE_COLOR,
      roughness: 0.8,
      metalness: 0.1
    });
    
    this.branchMesh = new THREE.Mesh(tubeGeometry, material);
    this.branchMesh.castShadow = true;
    this.branchMesh.receiveShadow = true;
    
    this.group.add(this.branchMesh);
  }
  
  createVariableRadiusTube(curve, radiusFunction, tubularSegments = 64, radialSegments = 8) {
    // Создаем геометрию трубки с переменным радиусом вручную
    const frames = curve.computeFrenetFrames(tubularSegments, false);
    const vertices = [];
    const normals = [];
    const uvs = [];
    const indices = [];
    
    const generateSegment = (i) => {
      const t = i / tubularSegments;
      const radius = radiusFunction(t);
      
      const point = curve.getPoint(t);
      const tangent = frames.tangents[i];
      const normal = frames.normals[i];
      const binormal = frames.binormals[i];
      
      for (let j = 0; j <= radialSegments; j++) {
        const u = (j / radialSegments) * Math.PI * 2;
        const cosU = Math.cos(u);
        const sinU = Math.sin(u);
        
        const radialVector = normal.clone().multiplyScalar(cosU).add(binormal.clone().multiplyScalar(sinU));
        const vertex = point.clone().add(radialVector.multiplyScalar(radius));
        
        vertices.push(vertex.x, vertex.y, vertex.z);
        
        // Нормаль
        normals.push(radialVector.x, radialVector.y, radialVector.z);
        
        // UV координаты
        uvs.push(i / tubularSegments, j / radialSegments);
      }
    };
    
    // Генерируем вершины для всех сегментов
    for (let i = 0; i <= tubularSegments; i++) {
      generateSegment(i);
    }
    
    // Генерируем индексы для треугольников
    for (let i = 0; i < tubularSegments; i++) {
      for (let j = 0; j < radialSegments; j++) {
        const a = i * (radialSegments + 1) + j;
        const b = i * (radialSegments + 1) + j + 1;
        const c = (i + 1) * (radialSegments + 1) + j;
        const d = (i + 1) * (radialSegments + 1) + j + 1;
        
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    
    return geometry;
  }
  
  loadTexture() {
    textureLoader.loadTexture(
      BARK_TEXTURE_PATH,
      (texture) => {
        if (this.branchMesh && this.branchMesh.material) {
          this.branchMesh.material.map = texture;
          this.branchMesh.material.color.setHex(0xffffff);
          this.branchMesh.material.needsUpdate = true;
        }
        this.barkTexture = texture;
      },
      (error) => {
        console.warn('Не удалось загрузить текстуру для ветки');
      },
      {
        repeat: { x: 1, y: 2 },
        anisotropy: 8
      }
    );
  }
  
  dispose() {
    if (this.group) {
      this.group.removeFromParent();
      
      if (this.branchMesh) {
        if (this.branchMesh.geometry) this.branchMesh.geometry.dispose();
        if (this.branchMesh.material) {
          if (Array.isArray(this.branchMesh.material)) {
            this.branchMesh.material.forEach(m => m.dispose());
          } else {
            this.branchMesh.material.dispose();
          }
        }
      }
    }
  }
}