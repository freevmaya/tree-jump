// scripts/utils/TextureLoader.js
import * as THREE from 'three';

export class TextureLoaderUtil {
  constructor() {
    this.loader = new THREE.TextureLoader();
    this.cubeLoader = new THREE.CubeTextureLoader();
    this.cache = new Map();
  }

  /**
   * Загружает текстуру с обработкой ошибок
   * @param {string} path - путь к текстуре
   * @param {function} onLoad - колбэк при успешной загрузке
   * @param {function} onError - колбэк при ошибке
   * @param {object} options - дополнительные параметры текстуры
   */
  loadTexture(path, onLoad, onError, options = {}) {
    // Проверяем кэш
    if (this.cache.has(path)) {
      const cachedTexture = this.cache.get(path);
      if (onLoad) onLoad(cachedTexture);
      return cachedTexture;
    }

    const defaultOptions = {
      colorSpace: THREE.SRGBColorSpace,
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.RepeatWrapping,
      repeat: { x: 1, y: 1 },
      anisotropy: 16 // Добавляем анизотропную фильтрацию для лучшего качества
    };

    const mergedOptions = { ...defaultOptions, ...options };

    return this.loader.load(
      path,
      (texture) => {
        // Применяем настройки
        texture.colorSpace = mergedOptions.colorSpace;
        texture.wrapS = mergedOptions.wrapS;
        texture.wrapT = mergedOptions.wrapT;
        texture.repeat.set(mergedOptions.repeat.x, mergedOptions.repeat.y);
        texture.anisotropy = mergedOptions.anisotropy;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;

        // Сохраняем в кэш
        this.cache.set(path, texture);

        if (onLoad) onLoad(texture);
      },
      undefined,
      (error) => {
        console.warn(`Текстура не загружена: ${path}`, error);
        if (onError) onError(error);
      }
    );
  }

  /**
   * Загружает кубическую текстуру (для skybox)
   * @param {string[]} paths - массив путей к 6 текстурам
   * @param {function} onLoad - колбэк при успешной загрузке
   * @param {function} onError - колбэк при ошибке
   */
  loadCubeTexture(paths, onLoad, onError) {
    const cacheKey = paths.join('|');
    
    if (this.cache.has(cacheKey)) {
      const cachedTexture = this.cache.get(cacheKey);
      if (onLoad) onLoad(cachedTexture);
      return cachedTexture;
    }

    return this.cubeLoader.load(
      paths,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        this.cache.set(cacheKey, texture);
        if (onLoad) onLoad(texture);
      },
      undefined,
      (error) => {
        console.warn('Кубическая текстура не загружена:', error);
        if (onError) onError(error);
      }
    );
  }

  /**
   * Загружает несколько текстур параллельно
   * @param {Object.<string, string>} textureMap - объект с путями к текстурам
   * @param {function} onComplete - колбэк после загрузки всех текстур
   */
  loadTexturesParallel(textureMap, onComplete) {
    const entries = Object.entries(textureMap);
    const results = {};
    let loadedCount = 0;

    entries.forEach(([key, path]) => {
      this.loadTexture(
        path,
        (texture) => {
          results[key] = texture;
          loadedCount++;
          if (loadedCount === entries.length && onComplete) {
            onComplete(results);
          }
        },
        (error) => {
          console.warn(`Ошибка загрузки текстуры ${key}:`, error);
          results[key] = this.createFallbackTexture();
          loadedCount++;
          if (loadedCount === entries.length && onComplete) {
            onComplete(results);
          }
        }
      );
    });
  }

  /**
   * Создает текстуру-заглушку
   * @param {number|string} color - цвет в HEX формате или CSS цвет
   * @returns {THREE.CanvasTexture} текстура-заглушка
   */
  createFallbackTexture(color = 0xcccccc) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Преобразуем HEX в CSS цвет если нужно
    let cssColor;
    if (typeof color === 'number') {
      cssColor = '#' + color.toString(16).padStart(6, '0');
    } else {
      cssColor = color;
    }

    // Рисуем узор в клетку
    ctx.fillStyle = cssColor;
    ctx.fillRect(0, 0, 128, 128);

    ctx.fillStyle = '#999999';
    for (let i = 0; i < 128; i += 16) {
      for (let j = 0; j < 128; j += 16) {
        if ((i + j) % 32 === 0) {
          ctx.fillRect(i, j, 8, 8);
        }
      }
    }

    // Добавляем текст для отладки
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.fillText('NO TEXTURE', 20, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    return texture;
  }

  /**
   * Создает текстуру с деревом (для платформ)
   * @returns {THREE.CanvasTexture} текстура дерева
   */
  createWoodTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Базовый цвет дерева
    ctx.fillStyle = '#8B5A2B';
    ctx.fillRect(0, 0, 256, 256);

    // Рисуем годичные кольца
    ctx.strokeStyle = '#6B3E1A';
    ctx.lineWidth = 4;
    for (let i = 0; i < 5; i++) {
      const radius = 40 + i * 30;
      ctx.beginPath();
      ctx.ellipse(128, 128, radius, radius * 0.8, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Добавляем текстуру дерева
    ctx.strokeStyle = '#5A3A1A';
    ctx.lineWidth = 2;
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 20, y + 20);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    
    return texture;
  }

  /**
   * Создает текстуру для платформы-убийцы
   * @returns {THREE.CanvasTexture} текстура с шипами
   */
  createKillerTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Красный фон
    ctx.fillStyle = '#CC0000';
    ctx.fillRect(0, 0, 128, 128);

    // Рисуем шипы
    ctx.fillStyle = '#FF6666';
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const x = i * 16 + 8;
        const y = j * 16 + 8;
        
        ctx.beginPath();
        ctx.moveTo(x, y - 8);
        ctx.lineTo(x + 6, y + 4);
        ctx.lineTo(x - 6, y + 4);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Добавляем черные контуры
    ctx.strokeStyle = '#330000';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    return texture;
  }

  /**
   * Очищает кэш текстур
   */
  clearCache() {
    this.cache.forEach(texture => texture.dispose());
    this.cache.clear();
  }

  /**
   * Удаляет конкретную текстуру из кэша
   * @param {string} path - путь к текстуре
   */
  removeFromCache(path) {
    if (this.cache.has(path)) {
      this.cache.get(path).dispose();
      this.cache.delete(path);
    }
  }

  /**
   * Получает текстуру из кэша
   * @param {string} path - путь к текстуре
   * @returns {THREE.Texture|null} текстура или null
   */
  getFromCache(path) {
    return this.cache.get(path) || null;
  }
}

// Создаем и экспортируем синглтон для использования во всем приложении
export const textureLoader = new TextureLoaderUtil();