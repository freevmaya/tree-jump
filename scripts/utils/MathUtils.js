// scripts/utils/MathUtils.js

export class MathUtils {
  static clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  
  static lerp(start, end, amount) {
    return start + (end - start) * amount;
  }
  
  static randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }
  
  static degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
  }
  
  static radiansToDegrees(radians) {
    return radians * 180 / Math.PI;
  }
}