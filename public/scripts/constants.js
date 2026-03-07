// scripts/constants.js

// ========== КОНСТАНТЫ ==========
// Дерево
export const TREE_COLOR = 0xA67C52;
export const TREE_HEIGHT = 20;
export const TEXTURE_SCALE_Y = 1.5;
export const MAIN_RADIUS = 0.8;
export const MAIN_DIAMETER = MAIN_RADIUS * 2;

// Параметры изгиба ствола
export const TRUNK_CURVE_STRENGTH = 0.5; // Сила максимального изгиба ствола
export const TRUNK_SEGMENTS = 12; // Количество сегментов на весь ствол (больше = более плавный изгиб)

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

// Параметры хвои (иголок)
export const NEEDLE_COUNT_PER_BRANCH = 3; // Количество пучков хвои на ветку
export const NEEDLE_TEXTURE_PATH = 'textures/needle.png'; // Путь к текстуре хвои с альфа-каналом
export const NEEDLE_SIZE = 1.5; // Размер плоскости с хвоей
export const NEEDLE_COLOR_VARIATION = 0.2; // Вариация цвета хвои (0-1)

// Выступы и площадки на дереве
export const STICK_OUT = 0.1 * MAIN_DIAMETER;
export const PLATFORM_RADIUS = 0.5;
export const PLATFORM_HEIGHT = 0.2;
export const CYLINDER_HALF_HEIGHT = TREE_HEIGHT / 2;
export const PLATFORM_DENSITY = 0.6;
export const PLATFORM_COUNT = Math.floor(TREE_HEIGHT * PLATFORM_DENSITY);
export const PLATFORM_DISTANCE = 1.3;

// Базовая платформа
export const BASE_PLATFORM_SIZE = 20;
export const BASE_PLATFORM_TOP_Y = -CYLINDER_HALF_HEIGHT;

// Шарик
export const BALL_RADIUS = 0.15;

// Физика шарика
export const GRAVITY = -7.5;
export const BOUNCE_SPEED = 7;
export const MAX_VELOCITY = 5.2;

// Камера
export const CAMERA_FOLLOW_SPEED = 0.06;
export const CAMERA_HEIGHT_OFFSET = 4;
export const CAMERA_START_Y = -CYLINDER_HALF_HEIGHT;

// Управление мышью
export const ROTATION_SPEED = 0.025;
export const ROTATION_SMOOTH = 0.5;
export const INERTIA = 0.6;

// Цвета
export const BALL_COLOR = 0xff6b6b;
export const AMBIENT_LIGHT_COLOR = 0x88FFFF;
export const KEY_LIGHT_COLOR = 0xffffff;
export const FILL_LIGHT_COLOR = 0x63a188;
export const RIM_LIGHT_COLOR = 0x818cf8;
export const WIREFRAME_COLOR = 0xC4956A;
export const BACKGROUND_COLOR = 0xBBBBFF;

// Свет
export const AMBIENT_LIGHT_INTENSITY = 1;
export const KEY_LIGHT_INTENSITY = 3;
export const FILL_LIGHT_INTENSITY = 2;
export const RIM_LIGHT_INTENSITY = 0.6;
export const RIM_LIGHT_DISTANCE = 12;

// Пути к текстурам
export const BARK_TEXTURE_PATH = 'textures/bark.jpg';
export const BARK_NORMAL_PATH = 'textures/bark-normal.jpg';
export const PLATFORM_TEXTURE_PATH = 'textures/platform.jpg';
export const KILLER_PLATFORM_TEXTURE_PATH = 'textures/killer_platform.jpg';
export const BACKGROUND_IMAGE_PATH = 'images/bk1.jpg';
export const GRASS_IMAGE_PATH = 'textures/grass-s.png';
export const GROUND_IMAGE_PATH = 'textures/ground.jpg';

// Игровые параметры
export const GAME_OVER_Y_OFFSET = -7; // Смещение относительно камеры для конца игры
export const RESET_POSITION_X = 0;
export const RESET_POSITION_Z = MAIN_RADIUS * 1.3;
export const RESET_POSITION_Y = BASE_PLATFORM_TOP_Y + BALL_RADIUS;
export const RESET_VELOCITY_Y = BOUNCE_SPEED;

// Цвета для платформ
export const PLATFORM_NORMAL_COLOR = 0xA67C52; // Используем существующий TREE_COLOR для обычных платформ
export const PLATFORM_KILLER_COLOR = 0xFF3333; // Ярко-красный для платформ-убийц

export const START_GAME = 'DEFAULT';

export const GAME_PARAMS = {
	DEFAULT: 
		{
			NAME: 'Ознакомительный',
			ENV: {
				BACKGROUND_COLOR: 0xBBBBFF,
				KEY_LIGHT_COLOR: 0xffffff,
				RIM_LIGHT_COLOR: 0x818cf8,
				FILL_LIGHT_COLOR: 0x63a188,
				BACKGROUND_IMAGE_PATH: 'images/bk1.jpg',
				GRASS_IMAGE_PATH: 'textures/grass-s.png',
				GROUND_IMAGE_PATH:'textures/ground.jpg',
				AMBIENT_LIGHT_INTENSITY: 1,
				KEY_LIGHT_INTENSITY: 3,
				FILL_LIGHT_INTENSITY: 2,
				RIM_LIGHT_INTENSITY: 0.6
			},
			TREE: {
				BARK_TEXTURE_REPEAT: {x: 4, y: 1},
				BARK_TEXTURE_PATH: 'textures/oak-bark.jpg',
				BARK_NORMAL_PATH: 'textures/bark-d-normal.jpg',
				KILLER_PLATFORM_TEXTURE_PATH: 'textures/killer_platform.jpg',
				NEEDLE_TEXTURE_PATH: 'textures/oak-leaves.png',
				TREE_HEIGHT: 15,
				PLATFORM_STEP: 1.6,
				KILLER_DENSITY: 0.1,
				PLATFORM_ROTATE_DENSITY: 0.2,
				PLATFORM_RADIUS: { MIN: 0.5, MAX: 0.5 }
			}
		},
	DARK: {
			NAME: 'Начинаются сложности',
			ENV: {
				BACKGROUND_COLOR: 0x93b1ff,
				KEY_LIGHT_COLOR: 0xffffff,
				RIM_LIGHT_COLOR: 0x818cf8,
				FILL_LIGHT_COLOR: 0x63a188,
				BACKGROUND_IMAGE_PATH: 'images/dark-bg.jpg',
				GRASS_IMAGE_PATH: 'textures/grass-s.png',
				GROUND_IMAGE_PATH:'textures/ground.jpg',
				AMBIENT_LIGHT_INTENSITY: 1,
				KEY_LIGHT_INTENSITY: 3,
				FILL_LIGHT_INTENSITY: 2,
				RIM_LIGHT_INTENSITY: 0.6
			},
			TREE: {
				BARK_TEXTURE_REPEAT: {x: 2, y: 1},
				BARK_TEXTURE_PATH: 'textures/pine-bark.jpg',
				BARK_NORMAL_PATH: 'textures/bark-normal.jpg',
				KILLER_PLATFORM_TEXTURE_PATH: 'textures/killer_platform.jpg',
				NEEDLE_TEXTURE_PATH: 'textures/needle.png',
				TREE_HEIGHT: 20,
				PLATFORM_STEP: 1.6,
				KILLER_DENSITY: 0.3,
				PLATFORM_ROTATE_DENSITY: 0.3,
				PLATFORM_RADIUS: { MIN: 0.38, MAX: 0.5 }
			}
		},
	BIRCH: {
			NAME: 'Придется постараться',
			ENV: {
				BACKGROUND_COLOR: 0xBBBBFF,
				KEY_LIGHT_COLOR: 0xffffff,
				RIM_LIGHT_COLOR: 0x818cf8,
				FILL_LIGHT_COLOR: 0x63a188,
				BACKGROUND_IMAGE_PATH: 'images/bk1.jpg',
				GRASS_IMAGE_PATH: 'textures/grass-s.png',
				GROUND_IMAGE_PATH:'textures/ground.jpg',
				AMBIENT_LIGHT_INTENSITY: 0.5,
				KEY_LIGHT_INTENSITY: 3,
				FILL_LIGHT_INTENSITY: 2,
				RIM_LIGHT_INTENSITY: 0.6
			},
			TREE: {
				BARK_TEXTURE_REPEAT: {x: 2, y: 1},
				BARK_TEXTURE_PATH: 'textures/birch.jfif',
				BARK_NORMAL_PATH: 'textures/bark-d-normal.jpg',
				KILLER_PLATFORM_TEXTURE_PATH: 'textures/bark-b.jpg',
				NEEDLE_TEXTURE_PATH: 'textures/birch-leaves.png',
				TREE_HEIGHT: 20,
				PLATFORM_STEP: 1.6,
				KILLER_DENSITY: 0.7,
				PLATFORM_ROTATE_DENSITY: 0.5,
				PLATFORM_RADIUS: { MIN: 0.3, MAX: 0.4 }
			}
		}
}