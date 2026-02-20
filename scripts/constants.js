// scripts/constants.js

// ========== КОНСТАНТЫ ==========
// Дерево
export const TREE_COLOR = 0xA67C52;
export const TREE_HEIGHT = 70;
export const TEXTURE_SCALE_Y = 1.5;
export const MAIN_RADIUS = 1;
export const MAIN_DIAMETER = MAIN_RADIUS * 2;

// Выступы и площадки на дереве
export const STICK_OUT = 0.1 * MAIN_DIAMETER;
export const PLATFORM_RADIUS = MAIN_DIAMETER * 0.4 / 2;
export const PLATFORM_HEIGHT = 0.02 * MAIN_DIAMETER;
export const CYLINDER_HALF_HEIGHT = TREE_HEIGHT / 2;
export const PLATFORM_DENSITY = 0.5;
export const PLATFORM_COUNT = Math.floor(TREE_HEIGHT * PLATFORM_DENSITY);

// Базовая платформа
export const BASE_PLATFORM_SIZE = 20;
export const BASE_PLATFORM_TOP_Y = -2.8 + 0.075;

// Шарик
export const BALL_RADIUS = 0.15;

// Физика шарика
export const GRAVITY = -9.8;
export const BOUNCE_SPEED = 7.5;
export const MAX_VELOCITY = 15;

// Камера
export const CAMERA_FOLLOW_SPEED = 0.06;
export const CAMERA_HEIGHT_OFFSET = 2.8;
export const CAMERA_START_Y = 0;

// Управление мышью
export const ROTATION_SPEED = 0.005;
export const INERTIA = 0.92;

// Цвета
export const FLOOR_COLOR = 0x1e1b2e;
export const BASE_PLATFORM_COLOR = 0x4a5568;
export const BALL_COLOR = 0xff6b6b;
export const AMBIENT_LIGHT_COLOR = 0x404080;
export const KEY_LIGHT_COLOR = 0xffffff;
export const FILL_LIGHT_COLOR = 0x6366f1;
export const RIM_LIGHT_COLOR = 0x818cf8;
export const WIREFRAME_COLOR = 0xC4956A;

// Свет
export const AMBIENT_LIGHT_INTENSITY = 0.5;
export const KEY_LIGHT_INTENSITY = 1.2;
export const FILL_LIGHT_INTENSITY = 0.4;
export const RIM_LIGHT_INTENSITY = 0.6;
export const RIM_LIGHT_DISTANCE = 12;

// Пути к текстурам
export const BARK_TEXTURE_PATH = 'textures/bark.jpg';

// Игровые параметры
export const GAME_OVER_Y_OFFSET = -5; // Смещение относительно камеры для конца игры
export const RESET_POSITION_X = 0;
export const RESET_POSITION_Z = MAIN_RADIUS * 1.3;
export const RESET_POSITION_Y = BASE_PLATFORM_TOP_Y + BALL_RADIUS;
export const RESET_VELOCITY_Y = BOUNCE_SPEED;