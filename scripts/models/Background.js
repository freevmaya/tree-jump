// scripts/models/Background.js
import * as THREE from 'three';
import { textureLoader } from '../utils/TextureLoader.js';

export class Background {
  constructor(scene) {
    this.scene = scene;
    this.mesh = null;
    this.texture = null;
  }

  /**
   * Инициализация фонового изображения
   * @param {string} imagePath - путь к изображению
   * @param {Object} options - дополнительные параметры
   */
  init(imagePath = 'textures/background.jpg', options = {}) {
    const defaultOptions = {
      size: 100, // Размер плоскости фона
      opacity: 1.0, // Прозрачность
      rotation: 0, // Поворот
      repeat: { x: 1, y: 1 } // Повторение текстуры
    };

    const mergedOptions = { ...defaultOptions, ...options };

    // Загружаем текстуру
    textureLoader.loadTexture(
      imagePath,
      (texture) => {
        this.texture = texture;
        this.createBackground(mergedOptions);
      },
      (error) => {
        console.warn('Не удалось загрузить фоновое изображение:', error);
        this.createFallbackBackground(mergedOptions);
      },
      {
        repeat: mergedOptions.repeat,
        anisotropy: 8
      }
    );

    return this;
  }

  /**
   * Создает фоновую плоскость с текстурой
   */
  createBackground(options) {
    const { size, opacity, rotation } = options;

    // Создаем геометрию плоскости
    const geometry = new THREE.PlaneGeometry(size / 0.75, size);
    
    // Создаем материал с текстурой
    const material = new THREE.MeshBasicMaterial({
      map: this.texture,
      color: 0x888888,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: opacity,
      depthWrite: false,
      depthTest: true
    });

    // Создаем меш
    this.mesh = new THREE.Mesh(geometry, material);
    
    // Позиционируем фон позади сцены
    this.mesh.position.set(0, 0, -20);
    
    // Поворачиваем чтобы смотрела на камеру
    this.mesh.rotation.y = rotation;
    
    // Отключаем тени для фона
    this.mesh.castShadow = false;
    this.mesh.receiveShadow = false;

    this.scene.add(this.mesh);
    
    console.log('Фоновое изображение создано');
  }

  /**
   * Создает запасной фон (градиент) если изображение не загрузилось
   */
  createFallbackBackground(options) {
    const { size, opacity } = options;

    // Создаем canvas с градиентом
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Создаем градиент неба
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a237e');   // Темно-синий сверху
    gradient.addColorStop(0.4, '#3949ab'); // Синий
    gradient.addColorStop(0.7, '#5c6bc0'); // Светло-синий
    gradient.addColorStop(1, '#7986cb');   // Очень светло-синий снизу

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Добавляем облака
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height * 0.6;
      const w = 100 + Math.random() * 200;
      const h = 40 + Math.random() * 60;
      
      ctx.beginPath();
      ctx.ellipse(x, y, w/2, h/2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Добавляем звезды (мелкие точки)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const r = Math.random() * 2;
      
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const fallbackTexture = new THREE.CanvasTexture(canvas);
    fallbackTexture.colorSpace = THREE.SRGBColorSpace;

    // Создаем материал с запасной текстурой
    const geometry = new THREE.PlaneGeometry(size, size);
    const material = new THREE.MeshStandardMaterial({
      map: fallbackTexture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: opacity,
      emissive: 0x000000,
      emissiveIntensity: 0,
      roughness: 1,
      metalness: 0,
      depthWrite: false,
      depthTest: true,
      fog: false
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(0, 0, -20);
    this.mesh.rotation.y = options.rotation;
    this.mesh.castShadow = false;
    this.mesh.receiveShadow = false;

    this.scene.add(this.mesh);
    
    console.log('Создан запасной градиентный фон');
  }

  /**
   * Обновление фона (если нужно)
   * @param {number} deltaTime - время между кадрами
   */
  update(deltaTime) {
    // Можно добавить эффекты, например легкое вращение или параллакс
    /*
    if (this.mesh) {
       this.mesh.rotation.y += 0.1 * deltaTime;
    }
    */
  }

  /**
   * Изменение прозрачности фона
   * @param {number} opacity - новое значение прозрачности (0-1)
   */
  setOpacity(opacity) {
    if (this.mesh && this.mesh.material) {
      this.mesh.material.opacity = Math.max(0, Math.min(1, opacity));
    }
  }

  /**
   * Изменение позиции фона (для эффекта параллакса)
   * @param {number} x - смещение по X
   * @param {number} y - смещение по Y
   */
  setPosition(x, y) {
    if (this.mesh) {
      this.mesh.position.x = x;
      this.mesh.position.y = y;
    }
  }

  /**
   * Смена фонового изображения
   * @param {string} newImagePath - путь к новому изображению
   */
  changeImage(newImagePath) {
    textureLoader.loadTexture(
      newImagePath,
      (texture) => {
        this.texture = texture;
        if (this.mesh && this.mesh.material) {
          this.mesh.material.map = texture;
          this.mesh.material.needsUpdate = true;
        }
      },
      (error) => {
        console.warn('Не удалось загрузить новое фоновое изображение:', error);
      }
    );
  }

  /**
   * Освобождение ресурсов
   */
  dispose() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      
      if (this.mesh.geometry) {
        this.mesh.geometry.dispose();
      }
      
      if (this.mesh.material) {
        if (Array.isArray(this.mesh.material)) {
          this.mesh.material.forEach(m => m.dispose());
        } else {
          this.mesh.material.dispose();
        }
      }
    }
    
    if (this.texture) {
      this.texture.dispose();
    }
  }
}