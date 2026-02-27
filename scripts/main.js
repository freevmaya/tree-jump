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

// Bootstrap доступен глобально через window.bootstrap
const bootstrap = window.bootstrap;

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
    
    // Создаем gameState
    this.gameState = new GameState();
    
    // Хранилище для созданных объектов окружения
    this.environmentObjects = [];
    this.lights = [];
    
    // Инициализация Bootstrap модального окна
    this.initGameOverModal();
  }
  
  initGameOverModal() {
    // Получаем элемент модального окна
    this.gameOverModalElement = document.getElementById('gameOverModal');
    
    if (this.gameOverModalElement && bootstrap) {
      // Создаем экземпляр Bootstrap модального окна
      this.gameOverModal = new bootstrap.Modal(this.gameOverModalElement, {
        backdrop: 'static', // Запрещаем закрытие по клику вне модального окна
        keyboard: false // Запрещаем закрытие по ESC
      });
      
      // Обработчик для кнопки рестарта
      const restartBtn = document.getElementById('restartButton');
      if (restartBtn) {
        restartBtn.addEventListener('click', () => {
          this.resetGame();
        });
      }
      
      // Обработчик для закрытия модального окна (если пользователь нажмет X)
      this.gameOverModalElement.addEventListener('hidden.bs.modal', () => {
        // Если игра закончена и модальное окно закрыли, но не через рестарт
        if (this.gameState.isGameOver()) {
          this.resetGame();
        }
      });
    } else {
      console.warn('Bootstrap модальное окно не найдено или Bootstrap не загружен');
    }
    
    // Настройка обработчика нажатия клавиши R для перезапуска
    window.addEventListener('keydown', (e) => {
      if (e.key === 'r' || e.key === 'R') {
        this.resetGame();
      }
    });
    
    // Подписка на события состояния игры
    this.gameState.onGameOver(() => {
      console.log("Game Over callback вызван");
      this.showGameOverModal();
      if (this.mouseControl) {
        this.mouseControl.destroy(); // Отключаем управление при окончании игры
      }
    });
    
    this.gameState.onReset(() => {
      console.log("Reset callback вызван");
      if (this.gameOverModal) {
        this.gameOverModal.hide();
      }
    });
  }
  
  showGameOverModal() {
    // Обновляем статистику в модальном окне
    const finalBounceElement = document.getElementById('finalBounceCount');
    const finalHeightElement = document.getElementById('finalHeight');
    
    if (finalBounceElement && this.ball) {
      finalBounceElement.textContent = this.ball.getBounceCount();
    }
    
    if (finalHeightElement && this.ball) {
      const ballPos = this.ball.getPosition();
      finalHeightElement.textContent = ballPos.y.toFixed(1) + 'м';
    }
    
    // Показываем модальное окно
    if (this.gameOverModal) {
      this.gameOverModal.show();
    }
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
    
    // Инициализация физики с передачей gameState
    this.physics = new BallPhysics(this.ball, this.tree, this.gameState);
    
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
    console.log("Сброс игры...");
    
    // Очищаем старое окружение
    this.clearEnvironment();
    
    // Создаем новые игровые объекты с новыми случайными платформами
    this.createGameObjects();
    
    // Сброс камеры
    if (this.cameraController) {
      this.cameraController.setPosition(2, CAMERA_START_Y, 9);
    }
    
    // Сброс счетчика отскоков
    if (this.ball) {
      this.ball.resetBounceCount();
    }
    
    // Сброс состояния игры (это вызовет onReset колбэки)
    if (this.gameState) {
      this.gameState.reset();
    }
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
      this.bounceCounterElement.innerHTML = `<i class="bi bi-fire"></i> Отскоков: ${this.ball.getBounceCount()}`;
    }
  }
  
  checkGameOver() {
    if (!this.gameState.isPlaying() || !this.ball) return;
    
    const ballPos = this.ball.getPosition();
    const cameraY = this.cameraController.getCamera().position.y;
    
    // Если шарик упал ниже камеры на заданное смещение
    if (ballPos.y < cameraY + GAME_OVER_Y_OFFSET) {
      console.log("Game Over по падению");
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
      this.tree.update();
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