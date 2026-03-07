// scripts/physics/BallPhysics.js
import * as THREE from 'three';
import { 
  BALL_RADIUS, PLATFORM_HEIGHT, GRAVITY, BOUNCE_SPEED, MAX_VELOCITY,
  MAIN_RADIUS, TREE_HEIGHT, CYLINDER_HALF_HEIGHT
} from '../constants.js';
import { GameState, GAME_STATE } from '../GameState.js';
import { eventBus } from '../utils/EventEmitter.js';

export class BallPhysics {
  constructor(ball, tree, gameState) {
    this.ball = ball;
    this.tree = tree;
    this.gameState = gameState;
    this.gravity = GRAVITY;
    this.bounceSpeed = BOUNCE_SPEED;
    this.maxVelocity = MAX_VELOCITY;
    this.baseBounceY = - this.tree.half_height;
    this.victoryY = this.tree.half_height;
    this.dirt = false;
  }
  
  update(dt) {
    // Не обновляем физику, если игра в IDLE
    if (this.gameState.isIdle()) return;
    
    if (!this.dirt) {
      // Применение гравитации
      this.ball.applyGravity(dt, this.gravity);
      this.ball.limitVelocity(this.maxVelocity);
      this.ball.updatePosition(dt);
      
      // Проверка достижения вершины дерева (победа)
      this.checkVictory();
      
      // Проверка столкновения с базовой платформой
      this.checkBasePlatformCollision();
      
      // Проверка столкновения с платформами на дереве
      this.checkTreePlatformsCollision();
    } else {
      let pos = this.dirt.object.getPosition().add(this.dirt.offset);
      this.ball.setPosition(pos.x, pos.y, pos.z);
    }
  }
  
  checkVictory() {
    const ballPos = this.ball.getPosition();
    
    // Если шарик достиг высоты вершины дерева (с учетом радиуса)
    if (ballPos.y + BALL_RADIUS >= this.victoryY) {
      console.log("ПОБЕДА! Шарик достиг вершины дерева!");
      this.gameState.victory();
    }
  }
  
  checkBasePlatformCollision() {
    const ballPos = this.ball.getPosition();
    if (ballPos.y - BALL_RADIUS <= this.baseBounceY) {
      this.ball.bounce(this.baseBounceY, this.bounceSpeed);
    }
  }
  
  checkTreePlatformsCollision() {
    const ballPos = this.ball.getPosition();
    const platforms = this.tree.getPlatforms();
    
    // Обновление мировой матрицы дерева
    this.tree.mesh.updateMatrixWorld(true);
    
    for (const platformData of platforms) {
      const worldPos = new THREE.Vector3();
      platformData.mesh.getWorldPosition(worldPos);
      const platformWorldY = worldPos.y;
      const platformTop = platformWorldY + PLATFORM_HEIGHT / 2;
      const platformBottom = platformWorldY - PLATFORM_HEIGHT / 2;
      
      const dx = ballPos.x - worldPos.x;
      const dz = ballPos.z - worldPos.z;
      const distance2D = Math.sqrt(dx * dx + dz * dz);
      
      // Проверка горизонтального расстояния
      if (distance2D < platformData.radius + BALL_RADIUS) {
        
        // Проверка столкновения с ВЕРХНЕЙ поверхностью платформы
        if (ballPos.y - BALL_RADIUS <= platformTop && 
            ballPos.y + BALL_RADIUS >= platformTop &&
            ballPos.y > platformTop &&
            this.ball.velocity.y < 0) {
          
          // Если это платформа-убийца - заканчиваем игру (ТОЛЬКО ПРИ УДАРЕ СВЕРХУ)
          if (platformData.checkDamage()) {
            console.log("Платформа-убийца! Игра окончена (удар сверху).");
            eventBus.emit('dirt');
            this.dirt = {
              object: platformData,
              offset: ballPos.sub(platformData.getPosition())
            };
            setTimeout(()=>{
              this.gameState.gameOver();
            }, 1000);
            return; // Прерываем проверку
          }
          
          // Обычный отскок от верхней поверхности (летим вверх)
          this.ball.bounce(platformTop, this.bounceSpeed);
          break;
        }
        
        // Проверка столкновения с НИЖНЕЙ поверхностью платформы
        if (ballPos.y + BALL_RADIUS >= platformBottom && 
            ballPos.y - BALL_RADIUS <= platformBottom &&
            ballPos.y < platformBottom &&
            this.ball.velocity.y > 0) {
          
          // Если это платформа-убийца - НЕ заканчиваем игру при ударе снизу
          if (platformData.isKiller) {
            console.log("Платформа-убийца: удар снизу - безопасно");
            // Обычный отскок от нижней поверхности для платформы-убийцы
            this.ball.bounce(platformBottom, -this.bounceSpeed);
            break;
          }
          
          // Обычный отскок от нижней поверхности - летим ВНИЗ (отрицательная скорость)
          this.ball.bounce(platformBottom, -this.bounceSpeed);
          break;
        }
      }
    }
  }
  
  setGravity(gravity) {
    this.gravity = gravity;
  }
  
  setBounceSpeed(speed) {
    this.bounceSpeed = speed;
  }
}