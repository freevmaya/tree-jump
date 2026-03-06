// scripts/main.js
import * as THREE from 'three';
import { 
  GRAVITY, BASE_PLATFORM_SIZE, AMBIENT_LIGHT_COLOR, AMBIENT_LIGHT_INTENSITY,
  KEY_LIGHT_COLOR, KEY_LIGHT_INTENSITY, FILL_LIGHT_COLOR,
  FILL_LIGHT_INTENSITY, RIM_LIGHT_COLOR, RIM_LIGHT_INTENSITY,
  RIM_LIGHT_DISTANCE, TREE_HEIGHT, MAIN_RADIUS,
  GAME_OVER_Y_OFFSET, RESET_POSITION_X, RESET_POSITION_Y,
  RESET_POSITION_Z, RESET_VELOCITY_Y, CAMERA_START_Y,
  BACKGROUND_IMAGE_PATH, GRASS_IMAGE_PATH, GAME_PARAMS, START_GAME
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
import { Background } from './models/Background.js';
import { textureLoader } from './utils/TextureLoader.js';
import { eventBus } from './utils/EventEmitter.js';
import { soundManager } from './audio/SoundManager.js';
import { Grass } from './models/Grass.js';
import { Ground } from './models/Ground.js';


// Bootstrap доступен глобально через window.bootstrap
const bootstrap = window.bootstrap;

function collectPaths(obj) {
  const paths = [];
  
  function recursiveCollect(current) {
    if (current && typeof current === 'object') {
      Object.entries(current).forEach(([key, value]) => {
        // Проверяем, оканчивается ли ключ на _PATH (регистронезависимо)
        if (key.toUpperCase().endsWith('_PATH') && typeof value === 'string') {
          paths.push(value);
        }
        // Рекурсивно обходим вложенные объекты
        if (value && typeof value === 'object') {
          recursiveCollect(value);
        }
      });
    }
  }
  
  recursiveCollect(obj);
  return paths;
}

class Game {
  constructor() {
    this.game_container = document.getElementById('game-container');
    this.container = document.getElementById('canvas-container');
    this.sceneManager = new SceneManager();
    this.rendererManager = new RendererManager(this.container);
    this.cameraController = null;
    this.tree = null;
    this.ball = null;
    this.physics = null;
    this.mouseControl = null;
    this.joystickControl = null;
    this.scoreIndicatorElement = document.getElementById('score-indicator');
    this.currentScoreElement = document.getElementById('current-score');
    this.gameHintElement = document.getElementById('game-hint');
    this.killerIndicatorElement = document.getElementById('killer-indicator');
    this.lastTime = performance.now();
    this.crystal = null;
    this.background = null;
    this.grass = null;
    this.ground = null;
    this.currentScore = 0;
    this.soundsLoaded = false;
    this.gameStarted = false; // Флаг, что игра была запущена
    this.testResult = this.quickGPUTest();

    console.log(this.testResult);
    
    // Создаем gameState
    this.gameState = new GameState();
    this.lights = [];
    this.setGameIndex(START_GAME);
    
    // Инициализация Bootstrap модальных окон
    this.initModals();
    
    // Загрузка звуков
    this.initAudio();

    if (!DEV)
      window.addEventListener('blur', () => {
        if (this.gameState.isPlaying())
          this.gameState.pause();
      });
  }

  quickGPUTest() {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    
    const startTime = performance.now();
    
    // Рисуем 10000 прямоугольников
    for (let i = 0; i < 10000; i++) {
      ctx.fillStyle = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
      ctx.fillRect(
        Math.random() * 1000,
        Math.random() * 1000,
        50 + Math.random() * 50,
        50 + Math.random() * 50
      );
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`Canvas 2D тест: ${duration.toFixed(2)}ms`);
    return duration;
  }
  
  async initAudio() {
    try {
      console.log('Загрузка звуков...');
      await soundManager.loadAllSounds();
      this.soundsLoaded = true;
      console.log('Звуки успешно загружены');
    } catch (error) {
      console.warn('Ошибка загрузки звуков:', error);
    }
  }
  
  initModals() {
    this.initStartModal();
    this.initGameOverModal();
    this.initVictoryModal();
    this.initPauseModal();

    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('shown.bs.modal', () => {
        this.game_container.classList.add('hide');
      });
      
      modal.addEventListener('hide.bs.modal', () => {
        this.game_container.classList.remove('hide');
      });
    });
    
    // Настройка обработчика нажатия клавиш
    window.addEventListener('keydown', (e) => {
      // Перезапуск по клавише R (в любом состоянии, кроме IDLE)
      if ((e.key === 'r' || e.key === 'R') && !this.gameState.isIdle()) {
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
      
      // Клавиша M для отключения звука
      if (e.key === 'm' || e.key === 'M') {
        soundManager.setMuted(!soundManager.muted);
        console.log(`Звук ${soundManager.muted ? 'выключен' : 'включен'}`);
      }
    });
    
    // Подписка на события состояния игры
    this.gameState.onGameOver(() => {
      console.log("Game Over callback вызван");
      this.hideScoreIndicator();
      this.hideGameHint();
      this.hideKillerIndicator();
      this.showGameOverModal();
      this.disableControls();
    });
    
    this.gameState.onVictory(() => {
      console.log("Victory callback вызван");
      this.Victory();
    });
    
    this.gameState.onPause(() => {
      console.log("Pause callback вызван");
      this.showPauseModal();
      this.disableControls();
    });
    
    this.gameState.onResume(() => {
      console.log("Resume callback вызван");
      this.hidePauseModal();
      this.enableControls();
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
      this.hideScoreIndicator();
      this.showGameHint();
      this.showKillerIndicator();
      this.enableControls();
    });

    // Подписка на старт игры
    this.gameState.onStart(() => {
      console.log("Start callback вызван");
      this.hideStartModal();
      this.showGameHint();
      this.showKillerIndicator();
      this.enableControls();
      this.gameStarted = true;
    });
  }

  Victory() {
      this.calculateScore();
      this.showVictoryModal();
      this.disableControls();
      this.nextGameIndex();
  }

  nextGameIndex() {
    let keys = Object.keys(GAME_PARAMS);
    this.setGameIndex(keys[(keys.indexOf(this.paramsIndex) + 1) % keys.length]);
  }

  setGameIndex(value) {
    this.paramsIndex = value;
    this.loadLevelTextures();
  }

  loadLevelTextures(onComplete) {

    let textures = collectPaths(GAME_PARAMS[this.paramsIndex]);
    textureLoader.loadTexturesParallel(textures, onComplete);
  }
  
  initStartModal() {
    // Получаем элемент модального окна Start
    this.startModalElement = document.getElementById('startModal');

    document.getElementById('testResult').textContent = Math.round(this.testResult);
    
    if (this.startModalElement && bootstrap) {
      // Создаем экземпляр Bootstrap модального окна
      this.startModal = new bootstrap.Modal(this.startModalElement, {
        backdrop: 'static',
        keyboard: false
      });
      
      // Обработчик для кнопки старта
      const startBtn = document.getElementById('startGameButton');
      if (startBtn) {
        startBtn.addEventListener('click', () => {
          this.gameState.start();
        });
      }
    }
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
  
  showStartModal() {
    if (this.startModal) {
      this.startModal.show();
    }
  }
  
  hideStartModal() {
    if (this.startModal) {
      this.startModal.hide();
    }
  }
  
  showGameOverModal() {
    // Обновляем статистику в модальном окне
    const finalBounceElement = document.getElementById('finalBounceCount');
    
    if (finalBounceElement && this.ball) {
      finalBounceElement.textContent = this.ball.getBounceCount();
    }
    
    // Показываем модальное окно
    if (this.gameOverModal) {
      this.gameOverModal.show();
    }
  }
  
  showVictoryModal() {
    // Обновляем статистику в модальном окне победы
    const victoryBounceElement = document.getElementById('victoryBounceCount');
    const victoryScoreElement = document.getElementById('victoryScore');
    
    if (victoryBounceElement && this.ball) {
      victoryBounceElement.textContent = this.ball.getBounceCount();
    }
    
    if (victoryScoreElement) {
      victoryScoreElement.textContent = this.currentScore;
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
  
  showScoreIndicator() {
    if (this.scoreIndicatorElement) {
      this.scoreIndicatorElement.style.display = 'block';
    }
  }
  
  hideScoreIndicator() {
    if (this.scoreIndicatorElement) {
      this.scoreIndicatorElement.style.display = 'none';
    }
  }
  
  showGameHint() {
    if (this.gameHintElement) {
      this.gameHintElement.style.display = 'block';
    }
  }
  
  hideGameHint() {
    if (this.gameHintElement) {
      this.gameHintElement.style.display = 'none';
    }
  }
  
  showKillerIndicator() {
    if (this.killerIndicatorElement) {
      this.killerIndicatorElement.style.display = 'block';
    }
  }
  
  hideKillerIndicator() {
    if (this.killerIndicatorElement) {
      this.killerIndicatorElement.style.display = 'none';
    }
  }
  
  disableControls() {
    if (this.mouseControl) {
      this.mouseControl.destroy();
      this.mouseControl = null;
    }
    if (this.joystickControl) {
      this.joystickControl.destroy();
      this.joystickControl = null;
    }
  }
  
  enableControls() {
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

    this.cameraController.begin();
  }
  
  updateScoreIndicator() {
    if (this.currentScoreElement) {
      this.currentScoreElement.textContent = this.currentScore;
    }
  }
  
  calculateScore() {
    if (!this.ball) return;
    
    const bounceCount = this.ball.getBounceCount();
    // Формула: чем меньше отскоков, тем больше очков
    // Максимум 1000 очков при 0 отскоков, минимум 100 при максимальном количестве
    const MAX_BOUNCES = 30; // Ожидаемое максимальное количество отскоков
    const MAX_SCORE = 1000;
    const MIN_SCORE = 100;
    
    if (bounceCount >= MAX_BOUNCES) {
      this.currentScore = MIN_SCORE;
    } else {
      // Линейная интерполяция: больше отскоков = меньше очков
      this.currentScore = Math.floor(
        MAX_SCORE - (bounceCount / MAX_BOUNCES) * (MAX_SCORE - MIN_SCORE)
      );
    }
    
    this.updateScoreIndicator();
  }
  
  init() {
    // Инициализация сцены
    const scene = this.sceneManager.init();
    
    // Инициализация рендерера
    this.rendererManager.init();
    
    // Создание освещения
    this.createLights(scene);
    
    // Создание игровых объектов (но не активируем физику)
    this.createGameObjects();
    
    // Инициализация камеры
    this.cameraController = new CameraController(this);
    
    // Запуск анимации
    this.animate();
    
    // Настройка обработчика изменения размера окна
    window.addEventListener('resize', this.onResize.bind(this));
    
    // Показываем стартовое модальное окно
    this.showStartModal();
    
    // Скрываем подсказки до старта игры
    this.hideGameHint();
    this.hideKillerIndicator();
    this.hideScoreIndicator();
    
    // Добавляем подсказку по управлению звуком
    console.log('Нажмите M для отключения/включения звука');
  }
  
  createGameObjects() {
    const scene = this.sceneManager.getScene();
    let env = GAME_PARAMS[this.paramsIndex].ENV;
    
    // Создание дерева
    this.tree = new Tree(scene);
    this.tree.init(GAME_PARAMS[this.paramsIndex].TREE);
    
    // Создание кристалла на вершине дерева
    this.createCrystal();
    
    // Создание шарика
    this.ball = new Ball(scene, this.tree);

    this.background = new Background(scene);
    this.background.init(env.BACKGROUND_IMAGE_PATH, {
      size: 50,
      opacity: 1.0,
      rotation: 0,
      repeat: { x: 1, y: 1 }
    });

    this.grass = new Grass(scene, this.tree);
    this.grass.init(env.GRASS_IMAGE_PATH);

    this.ground = new Ground(scene, this.tree);
    this.ground.init(env.GROUND_IMAGE_PATH);
    
    // Инициализация физики с передачей gameState
    this.physics = new BallPhysics(this.ball, this.tree, this.gameState);
    
    // Сброс счета
    this.currentScore = 0;
    this.updateScoreIndicator();
  }

  clearGameObject() {
    // Удаляем все объекты окружения из сцены
    const scene = this.sceneManager.getScene();

    if (this.background) {
      this.background.dispose();
      this.background = null;
    }
    
    // Удаляем старое дерево
    if (this.tree && this.tree.mesh) {
      scene.remove(this.tree.mesh);
      this.tree = null;
    }
    
    // Удаляем старый шарик
    if (this.ball) {
      this.ball.dispose();
      this.ball = null;
    }
    
    // Удаляем кристалл
    if (this.crystal) {
      this.crystal.dispose();
      this.crystal = null;
    }

    if (this.grass) {
      this.grass.dispose();
      this.grass = null;
    }

    if (this.ground) {
      this.ground.dispose();
      this.ground = null;
    }
  }
  
  resetGame() {
    console.log("Сброс игры...");

    this.clearGameObject();
    this.createGameObjects();
    
    // Сброс камеры
    if (this.cameraController)
      this.cameraController.reset();
    
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
    
    // Сброс счета
    this.currentScore = 0;
    this.updateScoreIndicator();
  }
  
  createLights(scene) {
    // Очищаем старые источники света
    this.lights.forEach(light => {
      if (light.parent) {
        scene.remove(light);
      }
    });
    this.lights = [];

    let env = GAME_PARAMS[this.paramsIndex].ENV;

    scene.background = new THREE.Color(env.BACKGROUND_COLOR);
    scene.fog = new THREE.Fog(env.BACKGROUND_COLOR, 12, 28);
    
    const ambient = new THREE.AmbientLight(env.AMBIENT_LIGHT_COLOR, env.AMBIENT_LIGHT_INTENSITY);
    scene.add(ambient);
    this.lights.push(ambient);
    
    const keyLight = new THREE.DirectionalLight(env.KEY_LIGHT_COLOR, env.KEY_LIGHT_INTENSITY);
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
    
    const fillLight = new THREE.DirectionalLight(env.FILL_LIGHT_COLOR, env.FILL_LIGHT_INTENSITY);
    fillLight.position.set(-3, 2, 3);
    scene.add(fillLight);
    this.lights.push(fillLight);
    
    const rimLight = new THREE.PointLight(env.RIM_LIGHT_COLOR, env.RIM_LIGHT_INTENSITY, RIM_LIGHT_DISTANCE);
    rimLight.position.set(-2, -1, 4);
    scene.add(rimLight);
    this.lights.push(rimLight);
  }
  
  onResize() {
    this.rendererManager.resize();
    this.cameraController.resize(this.rendererManager.getAspectRatio());
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
    
    // Обновление физики только если игра активна (не на паузе, не закончена и не в IDLE)
    if (this.gameState.isPlaying() && this.ball && this.physics) {
      this.tree.update(dt);
      this.physics.update(dt);
    
      // Обновление фона
      if (this.background) {
        this.background.update(dt);
      }

      // Обновление травы
      if (this.grass) {
        this.grass.update(dt);
      }
    
      // Обновление грунта (если нужно)
      if (this.ground) {
        this.ground.update(dt);
      }
      
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
      
      // Показываем индикатор очков при приближении к вершине
      if (this.ball && this.ball.getPosition().y > this.tree.half_height - 2) {
        this.showScoreIndicator();
        this.calculateScore();
      }
    
      // Обновление кристалла
      this.updateCrystal(dt);
      
      // Обновление камеры (всегда, чтобы камера не улетала)
      if (this.ball) {
        this.cameraController.update(this.ball.getLastBounceY());
      }
      
      // Рендеринг (всегда, чтобы видеть сцену)
      if (this.sceneManager.getScene() && this.cameraController) {
        this.rendererManager.render(this.sceneManager.getScene(), this.cameraController.getCamera());
      }

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
  window.game = new Game();
  window.game.init();
});