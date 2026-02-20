// scripts/main.js
import * as THREE from 'three';
import { 
  GRAVITY, BASE_PLATFORM_SIZE, BASE_PLATFORM_COLOR,
  FLOOR_COLOR, AMBIENT_LIGHT_COLOR, AMBIENT_LIGHT_INTENSITY,
  KEY_LIGHT_COLOR, KEY_LIGHT_INTENSITY, FILL_LIGHT_COLOR,
  FILL_LIGHT_INTENSITY, RIM_LIGHT_COLOR, RIM_LIGHT_INTENSITY,
  RIM_LIGHT_DISTANCE, TREE_HEIGHT, MAIN_RADIUS,
  GAME_OVER_Y_OFFSET, RESET_POSITION_X, RESET_POSITION_Y,
  RESET_POSITION_Z, RESET_VELOCITY_Y, CAMERA_START_Y
} from './constants.js';

import { SceneManager } from './core/SceneManager.js';
import { RendererManager } from './core/RendererManager.js';
import { CameraController } from './core/CameraController.js';
import { Tree } from './models/Tree.js';
import { Ball } from './models/Ball.js';
import { BallPhysics } from './physics/BallPhysics.js';
import { MouseRotationControl } from './controls/MouseRotationControl.js';
import { GameState, GAME_STATE } from './GameState.js';

class Game {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.sceneManager = new SceneManager();
    this.rendererManager = new RendererManager(this.container);
    this.cameraController = null;
    this.tree = null;
    this.ball = null;
    this.physics = null;
    this.mouseControl = null;
    this.bounceCounterElement = document.getElementById('bounce-counter');
    this.lastTime = performance.now();
    this.gameState = new GameState();
    
    // Хранилище для созданных объектов окружения
    this.environmentObjects = [];
    this.lights = [];
    
    // Создание UI для конца игры
    this.createGameOverUI();
  }
  
  createGameOverUI() {
    // Создаем элемент для отображения конца игры
    this.gameOverElement = document.createElement('div');
    this.gameOverElement.style.position = 'fixed';
    this.gameOverElement.style.top = '50%';
    this.gameOverElement.style.left = '50%';
    this.gameOverElement.style.transform = 'translate(-50%, -50%)';
    this.gameOverElement.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    this.gameOverElement.style.color = 'white';
    this.gameOverElement.style.padding = '30px 50px';
    this.gameOverElement.style.borderRadius = '20px';
    this.gameOverElement.style.fontSize = '32px';
    this.gameOverElement.style.fontWeight = 'bold';
    this.gameOverElement.style.textAlign = 'center';
    this.gameOverElement.style.zIndex = '200';
    this.gameOverElement.style.backdropFilter = 'blur(5px)';
    this.gameOverElement.style.border = '2px solid rgba(255, 255, 255, 0.3)';
    this.gameOverElement.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
    this.gameOverElement.style.display = 'none';
    this.gameOverElement.innerHTML = `
      <div>💀 ИГРА ОКОНЧЕНА 💀</div>
      <div style="font-size: 18px; margin-top: 20px; color: #ff6b6b;">Нажмите R для перезапуска</div>
    `;
    document.body.appendChild(this.gameOverElement);
    
    // Настройка обработчика нажатия клавиши R для перезапуска
    window.addEventListener('keydown', (e) => {
      if (e.key === 'r' || e.key === 'R') {
        this.resetGame();
      }
    });
    
    // Подписка на события состояния игры
    this.gameState.onGameOver(() => {
      this.gameOverElement.style.display = 'block';
      this.mouseControl.destroy(); // Отключаем управление при окончании игры
    });
    
    this.gameState.onReset(() => {
      this.gameOverElement.style.display = 'none';
    });
  }
  
  clearEnvironment() {
    // Удаляем все объекты окружения из сцены
    const scene = this.sceneManager.getScene();
    
    this.environmentObjects.forEach(obj => {
      if (obj.parent) {
        scene.remove(obj);
      }
    });
    this.environmentObjects = [];
    
    // Удаляем старое дерево
    if (this.tree && this.tree.mesh) {
      scene.remove(this.tree.mesh);
      this.tree = null;
    }
    
    // Удаляем старый шарик
    if (this.ball && this.ball.mesh) {
      scene.remove(this.ball.mesh);
      this.ball = null;
    }
    
    // Освещение не удаляем, оно остается
  }
  
  init() {
    // Инициализация сцены
    const scene = this.sceneManager.init();
    
    // Инициализация рендерера
    this.rendererManager.init();
    
    // Инициализация камеры
    this.cameraController = new CameraController(this.rendererManager.getAspectRatio());
    
    // Создание освещения (только один раз)
    this.createLights(scene);
    
    // Создание игровых объектов
    this.createGameObjects();
    
    // Запуск анимации
    this.animate();
    
    // Настройка обработчика изменения размера окна
    window.addEventListener('resize', this.onResize.bind(this));
  }
  
  createGameObjects() {
    const scene = this.sceneManager.getScene();
    
    // Создание дерева
    this.tree = new Tree(scene);
    this.tree.init();
    
    // Создание шарика
    this.ball = new Ball(scene);
    this.ball.init();
    
    // Инициализация физики
    this.physics = new BallPhysics(this.ball, this.tree);
    
    // Инициализация управления мышью
    if (this.mouseControl) {
      this.mouseControl.destroy();
    }
    this.mouseControl = new MouseRotationControl(this.tree, this.container);
    this.mouseControl.init();
    
    // Создание пола и базовой платформы
    this.createEnvironment(scene);
  }
  
  resetGame() {
    // Очищаем старое окружение
    this.clearEnvironment();
    
    // Создаем новые игровые объекты с новыми случайными платформами
    this.createGameObjects();
    
    // Сброс камеры
    this.cameraController.setPosition(2, CAMERA_START_Y, 9);
    
    // Сброс состояния игры
    this.gameState.reset();
    
    // Включаем управление обратно
    this.mouseControl.init();
  }
  
  createLights(scene) {
    // Очищаем старые источники света
    this.lights.forEach(light => {
      if (light.parent) {
        scene.remove(light);
      }
    });
    this.lights = [];
    
    const ambient = new THREE.AmbientLight(AMBIENT_LIGHT_COLOR, AMBIENT_LIGHT_INTENSITY);
    scene.add(ambient);
    this.lights.push(ambient);
    
    const keyLight = new THREE.DirectionalLight(KEY_LIGHT_COLOR, KEY_LIGHT_INTENSITY);
    keyLight.position.set(4, 6, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.camera.left = -5;
    keyLight.shadow.camera.right = 5;
    keyLight.shadow.camera.top = 5;
    keyLight.shadow.camera.bottom = -5;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);
    this.lights.push(keyLight);
    
    const fillLight = new THREE.DirectionalLight(FILL_LIGHT_COLOR, FILL_LIGHT_INTENSITY);
    fillLight.position.set(-3, 2, 3);
    scene.add(fillLight);
    this.lights.push(fillLight);
    
    const rimLight = new THREE.PointLight(RIM_LIGHT_COLOR, RIM_LIGHT_INTENSITY, RIM_LIGHT_DISTANCE);
    rimLight.position.set(-2, -1, 4);
    scene.add(rimLight);
    this.lights.push(rimLight);
  }
  
  createEnvironment(scene) {
    // Пол
    const floorGeometry = new THREE.CircleGeometry(6, 64);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: FLOOR_COLOR,
      metalness: 0.1,
      roughness: 0.8,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -TREE_HEIGHT / 2 - 0.01;
    floor.receiveShadow = true;
    scene.add(floor);
    this.environmentObjects.push(floor);
    
    // Базовая платформа
    const basePlatformGeometry = new THREE.BoxGeometry(BASE_PLATFORM_SIZE, 0.15, BASE_PLATFORM_SIZE);
    const basePlatformMaterial = new THREE.MeshStandardMaterial({
      color: BASE_PLATFORM_COLOR,
      metalness: 0.1,
      roughness: 0.85,
    });
    const basePlatform = new THREE.Mesh(basePlatformGeometry, basePlatformMaterial);
    basePlatform.position.set(0, -2.8, 0);
    basePlatform.receiveShadow = true;
    basePlatform.castShadow = true;
    scene.add(basePlatform);
    this.environmentObjects.push(basePlatform);
  }
  
  onResize() {
    this.rendererManager.resize();
    this.cameraController.resize(this.rendererManager.getAspectRatio());
  }
  
  updateBounceCounter() {
    if (this.bounceCounterElement && this.ball) {
      this.bounceCounterElement.textContent = `🔥 Отскоков: ${this.ball.getBounceCount()}`;
    }
  }
  
  checkGameOver() {
    if (!this.gameState.isPlaying() || !this.ball) return;
    
    const ballPos = this.ball.getPosition();
    const cameraY = this.cameraController.getCamera().position.y;
    
    // Если шарик упал ниже камеры на заданное смещение
    if (ballPos.y < cameraY + GAME_OVER_Y_OFFSET) {
      this.gameState.gameOver();
    }
  }
  
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    const time = performance.now();
    const dt = (time - this.lastTime) / 1000;
    this.lastTime = time;
    
    if (this.gameState.isPlaying() && this.ball && this.physics) {
      // Обновление физики только если игра активна
      this.physics.update(dt);
      
      // Обновление вращения мыши
      if (this.mouseControl) {
        this.mouseControl.update();
      }
      
      // Проверка конца игры
      this.checkGameOver();
    }
    
    // Обновление камеры (всегда, чтобы камера не улетала)
    if (this.ball) {
      this.cameraController.update(this.ball.getLastBounceY());
    }
    
    // Обновление счетчика отскоков
    this.updateBounceCounter();
    
    // Рендеринг
    if (this.sceneManager.getScene() && this.cameraController) {
      this.rendererManager.render(this.sceneManager.getScene(), this.cameraController.getCamera());
    }
  }
}

// Запуск игры
document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  game.init();
});