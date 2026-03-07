
import { SparkEffect } from './effects/SparkEffect.js';

import { 
  GRAVITY, BASE_PLATFORM_SIZE, AMBIENT_LIGHT_COLOR, AMBIENT_LIGHT_INTENSITY,
  KEY_LIGHT_COLOR, KEY_LIGHT_INTENSITY, FILL_LIGHT_COLOR,
  FILL_LIGHT_INTENSITY, RIM_LIGHT_COLOR, RIM_LIGHT_INTENSITY,
  RIM_LIGHT_DISTANCE, TREE_HEIGHT, MAIN_RADIUS,
  GAME_OVER_Y_OFFSET, RESET_POSITION_X, RESET_POSITION_Y,
  RESET_POSITION_Z, RESET_VELOCITY_Y, CAMERA_START_Y,
  BACKGROUND_IMAGE_PATH, GRASS_IMAGE_PATH, GAME_PARAMS, START_GAME
} from './constants.js';

function VictoryTest() {

	setTimeout(()=>{
		window.game.gameState.start();
	}, 1000);

	setTimeout(()=>{
		window.game.currentScore = 1000;
		window.game.gameState.victory();
	}, 3000);
}

function sparkTest() {
	document.addEventListener('click', (e) => {
	  new SparkEffect({
	    x: e.clientX,
	    y: e.clientY,
	    count: 20,
	    colors: ['#FFF', '#FAF', '#FF0', '#0FF'],
	    sizes: [4, 8],
	    speeds: [1, 3],
	    gravity: 0.04,
	    baseRadius: 50
	  });
	});
}

function MoreKiller() {
	GAME_PARAMS[START_GAME].TREE.KILLER_DENSITY = 0.5;
}

//VictoryTest();
//sparkTest();

MoreKiller();