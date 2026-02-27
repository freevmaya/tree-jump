// scripts/controls/MouseRotationControl.js
import { ROTATION_SPEED, INERTIA } from '../constants.js';

export class MouseRotationControl {
  constructor(tree, container) {
    this.tree = tree;
    this.container = container;
    this.isDragging = false;
    this.previousX = 0;
    this.velocityY = 0;
    this.rotationSpeed = ROTATION_SPEED;
    this.inertia = INERTIA;
    
    // Привязываем методы для мыши
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseLeave = this.onMouseUp.bind(this);
    
    // Привязываем методы для тачскрина
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onTouchCancel = this.onTouchEnd.bind(this);
  }
  
  init() {
    // События мыши
    this.container.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('mouseleave', this.onMouseLeave);
    
    // События тачскрина
    this.container.addEventListener('touchstart', this.onTouchStart, { passive: false });
    window.addEventListener('touchmove', this.onTouchMove, { passive: false });
    window.addEventListener('touchend', this.onTouchEnd);
    window.addEventListener('touchcancel', this.onTouchCancel);
    
    // Запрещаем скролл страницы при касании canvas
    this.container.style.touchAction = 'none';
  }
  
  destroy() {
    // Удаляем события мыши
    this.container.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('mouseleave', this.onMouseLeave);
    
    // Удаляем события тачскрина
    this.container.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);
    window.removeEventListener('touchcancel', this.onTouchCancel);
    
    // Возвращаем стандартное поведение
    this.container.style.touchAction = '';
  }
  
  // Обработчики для мыши
  onMouseDown(e) {
    e.preventDefault();
    this.startDrag(e.clientX);
  }
  
  onMouseMove(e) {
    if (!this.isDragging) return;
    e.preventDefault();
    this.drag(e.clientX);
  }
  
  onMouseUp() {
    this.stopDrag();
  }
  
  // Обработчики для тачскрина
  onTouchStart(e) {
    e.preventDefault();
    if (e.touches.length === 1) {
      this.startDrag(e.touches[0].clientX);
    }
  }
  
  onTouchMove(e) {
    if (!this.isDragging || e.touches.length !== 1) return;
    e.preventDefault();
    this.drag(e.touches[0].clientX);
  }
  
  onTouchEnd(e) {
    e.preventDefault();
    this.stopDrag();
  }
  
  onTouchCancel(e) {
    e.preventDefault();
    this.stopDrag();
  }
  
  // Общие методы для начала, выполнения и остановки перетаскивания
  startDrag(clientX) {
    this.isDragging = true;
    this.previousX = clientX;
    this.velocityY = 0;
  }
  
  drag(currentX) {
    const dx = currentX - this.previousX;
    this.velocityY = dx * this.rotationSpeed;
    this.tree.rotate(this.velocityY);
    this.previousX = currentX;
  }
  
  stopDrag() {
    this.isDragging = false;
  }
  
  update() {
    if (!this.isDragging) {
      this.velocityY *= this.inertia;
      if (Math.abs(this.velocityY) > 0.0001) {
        this.tree.rotate(this.velocityY);
      }
    }
  }
  
  reset() {
    this.isDragging = false;
    this.velocityY = 0;
  }
}