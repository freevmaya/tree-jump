// scripts/audio/SoundManager.js
import { eventBus } from '../utils/EventEmitter.js';

export class SoundManager {
  constructor(gameState) {
    this.sounds = new Map(); // Коллекция загруженных звуков
    this.activated = false; // Активирован ли звук пользователем
    this.muted = false;
    this.masterVolume = 0.7;
    this.gameState = gameState;
    
    // Настраиваем активацию по клику
    this.setupActivation();
    
    // Подписываемся на события звуков
    this.setupEventListeners();
    
    console.log('SoundManager: Инициализирован (ожидает активации)');
  }
  
  /**
   * Настройка активации по первому клику
   */
  setupActivation() {
    const activate = () => {
      if (!this.activated) {
        this.activated = true;
        console.log('SoundManager: Активирован пользователем');
        
        // Воспроизводим тихий звук для разблокировки Audio в браузерах
        const silentAudio = new Audio();
        silentAudio.volume = 0.01;
        silentAudio.play().catch(() => {});
        
        // Удаляем обработчики после активации
        document.removeEventListener('click', activate);
        document.removeEventListener('touchstart', activate);
        document.removeEventListener('keydown', activate);
      }
    };
    
    document.addEventListener('click', activate);
    document.addEventListener('touchstart', activate);
    document.addEventListener('keydown', activate);
  }
  
  /**
   * Подписка на события из eventBus
   */
  setupEventListeners() {

    this.gameState.onGameOver(() => {
      this.play('fail');
      this.loadSound('fail-music', 'sounds/fail-music.mp3')
        .then(()=>{
            this.play('fail-music')
        });
    });

    this.gameState.onVictory(() => {
      this.loadSound('win-music', 'sounds/win-music.mp3')
        .then(()=>{
            this.play('win-music')
        });
    });

    this.gameState.onReset(()=>{
      this.stop('fail-music');
      this.stop('win-music');
    });
    
    eventBus.on('blade', (data) => {
      this.play('blade', { 
        volume: 0.5,
        playbackRate: 0.9 + Math.random() * 0.2 // Случайная высота звука для разнообразия
      });
    });
    
    eventBus.on('dirt', (data) => {
      this.play('dirt', { 
        volume: 0.5,
        playbackRate: 0.9 + Math.random() * 0.2 // Случайная высота звука для разнообразия
      });
    });
    
    eventBus.on('bounce', (data) => {
      this.play('bounce', { 
        volume: 0.5,
        playbackRate: 0.9 + Math.random() * 0.2 // Случайная высота звука для разнообразия
      });
    });

    // Слушаем все события, которые начинаются с 'sound:'
    eventBus.on('sound:play', (data) => {
      this.play(data.id, data);
    });
    
    // Можно добавить и другие события
    eventBus.on('sound:stop', (data) => {
      this.stop(data.id);
    });
    
    eventBus.on('sound:volume', (data) => {
      this.setMasterVolume(data.volume);
    });
    
    eventBus.on('sound:mute', (data) => {
      this.setMuted(data.muted);
    });
  }
  
  /**
   * Загрузка звука
   * @param {string} id - идентификатор звука
   * @param {string} url - путь к файлу
   * @param {Object} options - опции (volume, loop)
   */
  loadSound(id, url, options = {}) {

    return new Promise((resolve, reject) => {

      let audio = this.sounds.get(id);
      if (audio) {
        resolve(audio);
        return;

      } else audio = new Audio();

      audio.src = url;
      audio.preload = 'auto';
      audio.volume = (options.volume || 1.0) * this.masterVolume;
      audio.loop = options.loop || false;
      
      audio.addEventListener('canplaythrough', () => {
        console.log(`SoundManager: Звук "${id}" загружен`);
        this.sounds.set(id, {
          audio,
          options,
          url
        });
        
        // Сообщаем о загрузке
        eventBus.emit('sound:loaded', { id, success: true });
        resolve(audio);
      }, { once: true });
      
      audio.addEventListener('error', (e) => {
        console.warn(`SoundManager: Ошибка загрузки "${id}"`, e);
        eventBus.emit('sound:error', { id, error: e.message });
        reject(e);
      });
      
      audio.load();
    });
  }
  
  /**
   * Воспроизведение звука
   * @param {string} id - идентификатор звука
   * @param {Object} options - параметры воспроизведения
   */
  play(id, options = {}) {
    // Проверяем активацию
    if (!this.activated) {
      console.log(`SoundManager: Звук "${id}" не воспроизведен (ожидание активации)`);
      return false;
    }
    
    // Проверяем наличие звука
    if (!this.sounds.has(id)) {
      console.warn(`SoundManager: Звук "${id}" не найден`);
      return false;
    }
    
    if (this.muted) return false;
    
    try {
      const sound = this.sounds.get(id);
      
      // Создаем копию для параллельного воспроизведения
      const audio = sound.audio;
      audio.volume = (options.volume || 1.0) * this.masterVolume;
      audio.loop = options.loop || sound.options.loop || false;
      audio.playbackRate = options.playbackRate || 1.0;
      audio.currentTime = 0;
      
      // Воспроизводим
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.warn(`SoundManager: Ошибка воспроизведения "${id}":`, e);
        });
      }
      
      // Удаляем элемент после окончания
      audio.addEventListener('ended', () => {
        audio.remove();
      });
      
      // Сообщаем о воспроизведении
      eventBus.emit('sound:played', { 
        id, 
        time: Date.now(),
        options 
      });
      
      return true;
    } catch (e) {
      console.warn(`SoundManager: Ошибка при воспроизведении "${id}":`, e);
      return false;
    }
  }
  
  /**
   * Остановка звука (если он играет)
   */
  stop(id) {

    let sound = this.sounds.get(id);
    if (sound)
      sound.audio.pause();
    
    // Останавливаем все копии? Сложно отследить
    // Можно добавить функциональность позже при необходимости
    eventBus.emit('sound:stopped', { id });
  }
  
  /**
   * Загрузка всех звуков игры
   */
  loadAllSounds() {
    const sounds = [
      { id: 'bounce', url: 'sounds/bounce.mp3', options: { volume: 0.5 }},
      { id: 'fail', url: 'sounds/fail-2.mp3', options: { volume: 0.5 }},
      { id: 'dirt', url: 'sounds/dirt.mp3', options: { volume: 0.5 }},
      { id: 'blade', url: 'sounds/blade.mp3', options: { volume: 0.5 }}
    ];
    
    return Promise.allSettled(
      sounds.map(s => this.loadSound(s.id, s.url, s.options))
    );
  }
  
  /**
   * Установка громкости
   */
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    eventBus.emit('sound:volumeChanged', { volume: this.masterVolume, muted: this.muted });
  }
  
  /**
   * Включение/выключение звука
   */
  setMuted(muted) {
    this.muted = muted;
    eventBus.emit('sound:muteChanged', { muted: this.muted });
  }
  
  /**
   * Проверка активации
   */
  isActivated() {
    return this.activated;
  }
}