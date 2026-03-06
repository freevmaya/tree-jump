// scripts/models/RotatePlatform.js
import { Platform } from './Platform.js';

import { 
  PLATFORM_DISTANCE
} from '../constants.js';

export class RotatePlatform extends Platform {
  constructor(parentMesh, theta, y, isKiller = false, speed = 0.3) {
    super(parentMesh, theta, y, isKiller);
    this.speed = speed;
  }

  update(dt) {
    super.update(dt);
    this.theta += Math.PI * this.speed * dt;
    this.group.position.copy(this.tree.getPointOnTrunk(this.group.position.y, PLATFORM_DISTANCE, this.theta));
  }
}