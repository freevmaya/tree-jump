// scripts/constants.js

// ========== КОНСТАНТЫ ==========
// Дерево
export const TREE_COLOR = 0xA67C52;
export const TREE_HEIGHT = 15;
export const TEXTURE_SCALE_Y = 1.5;
export const MAIN_RADIUS = 1;
export const MAIN_DIAMETER = MAIN_RADIUS * 2;

// Ветки
export const BRANCH_DENSITY = 1; // Плотность веток (меньше чем у платформ)
export const BRANCH_COUNT = Math.floor(TREE_HEIGHT * BRANCH_DENSITY); // Количество веток
export const BRANCH_MIN_RADIUS = 0.1; // Минимальная толщина ветки у основания
export const BRANCH_MAX_RADIUS = 0.3; // Максимальная толщина ветки у основания
export const BRANCH_MIN_LENGTH = 2; // Минимальная длина ветки
export const BRANCH_MAX_LENGTH = 3; // Максимальная длина ветки
export const BRANCH_ANGLE_MIN = 0.2; // Минимальный угол наклона ветки (от горизонтали)
export const BRANCH_ANGLE_MAX = 0.5; // Максимальный угол наклона ветки (от горизонтали)
export const BRANCH_CURVE_STRENGTH = 0.5; // Сила изгиба ветки
export const BRANCH_SEGMENTS = 5; // Количество сегментов для изогнутой ветки

// Выступы и площадки на дереве
export const STICK_OUT = 0.1 * MAIN_DIAMETER;
export const PLATFORM_RADIUS = 0.5;
export const PLATFORM_HEIGHT = 0.2;
export const CYLINDER_HALF_HEIGHT = TREE_HEIGHT / 2;
export const PLATFORM_DENSITY = 0.6;
export const PLATFORM_COUNT = Math.floor(TREE_HEIGHT * PLATFORM_DENSITY);

// Базовая платформа
export const BASE_PLATFORM_SIZE = 20;
export const BASE_PLATFORM_TOP_Y = -CYLINDER_HALF_HEIGHT;

// Шарик
export const BALL_RADIUS = 0.15;

// Физика шарика
export const GRAVITY = -7.5;
export const BOUNCE_SPEED = 7;
export const MAX_VELOCITY = 15;

// Камера
export const CAMERA_FOLLOW_SPEED = 0.06;
export const CAMERA_HEIGHT_OFFSET = 2.8;
export const CAMERA_START_Y = -CYLINDER_HALF_HEIGHT;

// Управление мышью
export const ROTATION_SPEED = 0.03;
export const ROTATION_SMOOTH = 0.5;
export const INERTIA = 0.92;

// Цвета
export const FLOOR_COLOR = 0x332211;
export const BASE_PLATFORM_COLOR = 0x4a5568;
export const BALL_COLOR = 0xff6b6b;
export const AMBIENT_LIGHT_COLOR = 0x404080;
export const KEY_LIGHT_COLOR = 0xffffff;
export const FILL_LIGHT_COLOR = 0x6366f1;
export const RIM_LIGHT_COLOR = 0x818cf8;
export const WIREFRAME_COLOR = 0xC4956A;
export const BACKGROUND_COLOR = 0x113344;

// Свет
export const AMBIENT_LIGHT_INTENSITY = 0.5;
export const KEY_LIGHT_INTENSITY = 1.2;
export const FILL_LIGHT_INTENSITY = 0.4;
export const RIM_LIGHT_INTENSITY = 0.6;
export const RIM_LIGHT_DISTANCE = 12;

// Пути к текстурам
export const BARK_TEXTURE_PATH = 'textures/bark.jpg';
export const PLATFORM_TEXTURE_PATH = 'textures/platform.jpg';
export const KILLER_PLATFORM_TEXTURE_PATH = 'textures/killer_platform.jpg';
export const BACKGROUND_IMAGE_PATH = 'images/5Wn5OGu.png';

// Игровые параметры
export const GAME_OVER_Y_OFFSET = -7; // Смещение относительно камеры для конца игры
export const RESET_POSITION_X = 0;
export const RESET_POSITION_Z = MAIN_RADIUS * 1.3;
export const RESET_POSITION_Y = BASE_PLATFORM_TOP_Y + BALL_RADIUS;
export const RESET_VELOCITY_Y = BOUNCE_SPEED;

// Цвета для платформ
export const PLATFORM_NORMAL_COLOR = 0xA67C52; // Используем существующий TREE_COLOR для обычных платформ
export const PLATFORM_KILLER_COLOR = 0xFF3333; // Ярко-красный для платформ-убийц

// Процент платформ-убийц
export const KILLER_PLATFORM_PERCENTAGE = 0.3; // 10%