// scripts/physics/BallPhysics.js
import * as THREE from 'three';
import { 
  BALL_RADIUS, PLATFORM_RADIUS, PLATFORM_HEIGHT, 
  BASE_PLATFORM_TOP_Y, GRAVITY, BOUNCE_SPEED, MAX_VELOCITY,
  MAIN_RADIUS
} from '../constants.js';

export class BallPhysics {
  constructor(ball, tree) {
    this.ball = ball;
    this.tree = tree;
    this.gravity = GRAVITY;
    this.bounceSpeed = BOUNCE_SPEED;
    this.maxVelocity = MAX_VELOCITY;
    this.baseBounceY = BASE_PLATFORM_TOP_Y;
  }
  
  update(dt) {
    // Применение гравитации
    this.ball.applyGravity(dt, this.gravity);
    this.ball.limitVelocity(this.maxVelocity);
    this.ball.updatePosition(dt);
    
    // Проверка столкновения с базовой платформой
    this.checkBasePlatformCollision();
    
    // Проверка столкновения с платформами на дереве
    this.checkTreePlatformsCollision();
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
      if (distance2D < PLATFORM_RADIUS + BALL_RADIUS) {
        
        // Проверка столкновения с ВЕРХНЕЙ поверхностью платформы
        if (ballPos.y - BALL_RADIUS <= platformTop && 
            ballPos.y + BALL_RADIUS >= platformTop &&
            ballPos.y > platformTop &&
            this.ball.velocity.y < 0) {
          
          // Отскок от верхней поверхности (летим вверх)
          this.ball.bounce(platformTop, this.bounceSpeed);
          break;
        }
        
        // Проверка столкновения с НИЖНЕЙ поверхностью платформы
        if (ballPos.y + BALL_RADIUS >= platformBottom && 
            ballPos.y - BALL_RADIUS <= platformBottom &&
            ballPos.y < platformBottom &&
            this.ball.velocity.y > 0) {
          
          // Отскок от нижней поверхности - летим ВНИЗ (отрицательная скорость)
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