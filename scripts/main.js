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
import { JoystickControl } from './controls/JoystickControl.js';
import { GameState, GAME_STATE } from './GameState.js';
import { Crystal } from './models/Crystal.js';

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
    this.joystickControl = null;
    this.bounceCounterElement = document.getElementById('bounce-counter');
    this.lastTime = performance.now();
    this.crystal = null;
    
    // Создаем gameState
    this.gameState = new GameState();
    
    // Хранилище для созданных объектов окружения
    this.environmentObjects = [];
    this.lights = [];
    
    // Инициализация Bootstrap модальных окон
    this.initModals();
  }
  
  initModals() {
    this.initGameOverModal();
    this.initVictoryModal();
    this.initPauseModal();
    
    // Настройка обработчика нажатия клавиш
    window.addEventListener('keydown', (e) => {
      // Перезапуск по клавише R (в любом состоянии)
      if (e.key === 'r' || e.key === 'R') {
        this.resetGame();
      }
      
      // Пауза по ESC (только если игра активна и не на паузе)
      if (e.key === 'Escape') {
        if (this.gameState.isPlaying()) {
          this.gameState.pause();
        } else if (this.gameState.isPaused()) {
          this.gameState.resume();
        }
      }
    });
    
    // Подписка на события состояния игры
    this.gameState.onGameOver(() => {
      console.log("Game Over callback вызван");
      this.showGameOverModal();
      if (this.mouseControl) {
        this.mouseControl.destroy();
      }
      if (this.joystickControl) {
        this.joystickControl.destroy();
      }
    });
    
    this.gameState.onVictory(() => {
      console.log("Victory callback вызван");
      this.showVictoryModal();
      if (this.mouseControl) {
        this.mouseControl.destroy();
      }
      if (this.joystickControl) {
        this.joystickControl.destroy();
      }
    });
    
    this.gameState.onPause(() => {
      console.log("Pause callback вызван");
      this.showPauseModal();
      if (this.mouseControl) {
        this.mouseControl.destroy();
      }
      if (this.joystickControl) {
        this.joystickControl.destroy();
      }
    });
    
    this.gameState.onResume(() => {
      console.log("Resume callback вызван");
      this.hidePauseModal();
      if (this.mouseControl) {
        this.mouseControl.init();
      }
      if (this.joystickControl) {
        // Джойстик не нужно реинициализировать, он сам восстанавливается
      }
    });
    
    this.gameState.onReset(() => {
      console.log("Reset callback вызван");
      if (this.gameOverModal) {
        this.gameOverModal.hide();
      }
      if (this.victoryModal) {
        this.victoryModal.hide();
      }
      if (this.pauseModal) {
        this.pauseModal.hide();
      }
    });
  }
  
  initGameOverModal() {
    // Получаем элемент модального окна Game Over
    this.gameOverModalElement = document.getElementById('gameOverModal');
    
    if (this.gameOverModalElement && bootstrap) {
      // Создаем экземпляр Bootstrap модального окна
      this.gameOverModal = new bootstrap.Modal(this.gameOverModalElement, {
        backdrop: 'static',
        keyboard: false
      });
      
      // Обработчик для кнопки рестарта в Game Over
      const restartBtn = document.getElementById('restartButton');
      if (restartBtn) {
        restartBtn.addEventListener('click', () => {
          this.resetGame();
        });
      }
      
      // Обработчик для закрытия модального окна
      this.gameOverModalElement.addEventListener('hidden.bs.modal', () => {
        if (this.gameState.isGameOver()) {
          this.resetGame();
        }
      });
    }
  }
  
  initVictoryModal() {
    // Получаем элемент модального окна Victory
    this.victoryModalElement = document.getElementById('victoryModal');
    
    if (this.victoryModalElement && bootstrap) {
      // Создаем экземпляр Bootstrap модального окна
      this.victoryModal = new bootstrap.Modal(this.victoryModalElement, {
        backdrop: 'static',
        keyboard: false
      });
      
      // Обработчик для кнопки рестарта в Victory
      const victoryRestartBtn = document.getElementById('victoryRestartButton');
      if (victoryRestartBtn) {
        victoryRestartBtn.addEventListener('click', () => {
          this.resetGame();
        });
      }
      
      // Обработчик для закрытия модального окна
      this.victoryModalElement.addEventListener('hidden.bs.modal', () => {
        if (this.gameState.isVictory()) {
          this.resetGame();
        }
      });
    }
  }
  
  initPauseModal() {
    // Получаем элемент модального окна Pause
    this.pauseModalElement = document.getElementById('pauseModal');
    
    if (this.pauseModalElement && bootstrap) {
      // Создаем экземпляр Bootstrap модального окна
      this.pauseModal = new bootstrap.Modal(this.pauseModalElement, {
        backdrop: 'static',
        keyboard: false
      });
      
      // Обработчик для кнопки продолжения
      const resumeBtn = document.getElementById('resumeButton');
      if (resumeBtn) {
        resumeBtn.addEventListener('click', () => {
          this.gameState.resume();
        });
      }
      
      // Обработчик для кнопки рестарта в паузе
      const pauseRestartBtn = document.getElementById('pauseRestartButton');
      if (pauseRestartBtn) {
        pauseRestartBtn.addEventListener('click', () => {
          this.resetGame();
        });
      }
    }
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
  
  showVictoryModal() {
    // Обновляем статистику в модальном окне победы
    const victoryBounceElement = document.getElementById('victoryBounceCount');
    const victoryHeightElement = document.getElementById('victoryHeight');
    
    if (victoryBounceElement && this.ball) {
      victoryBounceElement.textContent = this.ball.getBounceCount();
    }
    
    if (victoryHeightElement && this.ball) {
      const ballPos = this.ball.getPosition();
      victoryHeightElement.textContent = ballPos.y.toFixed(1) + 'м';
    }
    
    // Показываем модальное окно
    if (this.victoryModal) {
      this.victoryModal.show();
    }
  }
  
  showPauseModal() {
    if (this.pauseModal) {
      this.pauseModal.show();
    }
  }
  
  hidePauseModal() {
    if (this.pauseModal) {
      this.pauseModal.hide();
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
    
    // Удаляем кристалл
    if (this.crystal) {
      this.crystal.dispose();
      this.crystal = null;
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
    
    // Создание кристалла на вершине дерева
    this.createCrystal();
    
    // Создание шарика
    this.ball = new Ball(scene);
    this.ball.init(this.tree);
    
    // Инициализация физики с передачей gameState
    this.physics = new BallPhysics(this.ball, this.tree, this.gameState);
    
    // Инициализация управления мышью (для верхнего блока)
    if (this.mouseControl) {
      this.mouseControl.destroy();
    }
    this.mouseControl = new MouseRotationControl(this.tree, this.container);
    this.mouseControl.init();
    
    // Инициализация управления джойстиком (для нижнего блока)
    if (this.joystickControl) {
      this.joystickControl.destroy();
    }
    const joystickPad = document.getElementById('joystick-pad');
    const joystickThumb = document.getElementById('joystick-thumb');
    if (joystickPad && joystickThumb) {
      this.joystickControl = new JoystickControl(this.tree, joystickPad, joystickThumb);
    }
    
    // Создание пола и базовой платформы
    this.createEnvironment(scene);
  }
  
  resetGame() {
    console.log("Сброс игры...");
  
    // Очищаем старое окружение
    this.clearEnvironment();
    
    // Удаляем кристалл
    if (this.crystal) {
      this.crystal.dispose();
      this.crystal = null;
    }
    
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
    
    // Сброс джойстика
    if (this.joystickControl) {
      this.joystickControl.reset();
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
    keyLight.position.set(20, 20, 20);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 1000;
    keyLight.shadow.camera.left = -20;
    keyLight.shadow.camera.right = 20;
    keyLight.shadow.camera.top = 20;
    keyLight.shadow.camera.bottom = -20;
    keyLight.shadow.bias = 0;
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
    const floorGeometry = new THREE.CircleGeometry(100, 64);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: FLOOR_COLOR,
      metalness: 0.1,
      roughness: 0.8,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -TREE_HEIGHT / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    this.environmentObjects.push(floor);

    
    /*
    // Базовая платформа
    const basePlatformGeometry = new THREE.BoxGeometry(BASE_PLATFORM_SIZE, 0.01, BASE_PLATFORM_SIZE);
    const basePlatformMaterial = new THREE.MeshStandardMaterial({
      color: BASE_PLATFORM_COLOR,
      metalness: 0.1,
      roughness: 0.85,
    });
    const basePlatform = new THREE.Mesh(basePlatformGeometry, basePlatformMaterial);
    basePlatform.position.set(0, -TREE_HEIGHT / 2, 0);
    basePlatform.receiveShadow = true;
    basePlatform.castShadow = true;
    scene.add(basePlatform);
    this.environmentObjects.push(basePlatform);*/
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
    
    // Обновление физики только если игра активна (не на паузе и не закончена)
    if (this.gameState.isPlaying() && this.ball && this.physics) {
      this.tree.update();
      this.physics.update(dt);
      
      // Обновление вращения мыши
      if (this.mouseControl) {
        this.mouseControl.update();
      }
      
      // Обновление джойстика
      if (this.joystickControl) {
        this.joystickControl.update();
      }
      
      // Проверка конца игры
      this.checkGameOver();
    } else if (this.gameState.isPaused()) {
      // На паузе ничего не обновляем, но дерево может продолжать вращаться по инерции?
      // Для чистоты эксперимента - останавливаем всё
      if (this.mouseControl) {
        this.mouseControl.velocityY = 0;
      }
      if (this.joystickControl) {
        this.joystickControl.normalizedDirect = 0;
      }
    }
    
    // Обновление кристалла
    this.updateCrystal(dt);
    
    // Обновление камеры (всегда, чтобы камера не улетала)
    if (this.ball) {
      this.cameraController.update(this.ball.getLastBounceY());
    }
    
    // Обновление счетчика отскоков
    this.updateBounceCounter();
    
    // Рендеринг (всегда, чтобы видеть паузу)
    if (this.sceneManager.getScene() && this.cameraController) {
      this.rendererManager.render(this.sceneManager.getScene(), this.cameraController.getCamera());
    }
  }

  createCrystal() {
    if (!this.tree) return;
    
    // Удаляем старый кристалл если есть
    if (this.crystal) {
      this.crystal.dispose();
      this.crystal = null;
    }
    
    // Создаем кристалл на вершине дерева
    this.crystal = new Crystal(
      this.sceneManager.getScene(),
      this.tree
    );
    this.crystal.init();
    
    console.log("Кристалл создан на вершине дерева");
  }

  updateCrystal(dt) {
    if (this.crystal && this.gameState.isPlaying()) {
      this.crystal.update(dt);
    }
  }
}

// Запуск игры
document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  game.init();
});