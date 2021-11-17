import { Axes, Buttons, Gamepads } from 'input-gamepads.js';
import { Sprite, Texture } from 'pixi.js';
import { game } from './Game';
import { GameScene } from './GameScene';
import { keys, KEYS } from './input-keys';
import { Mouse } from './input-mouse';
import { size } from './size';
import { clamp } from './utils';

const gamepads = new Gamepads();
let mouse: Mouse;
let activeScene: GameScene | undefined;
let newScene: GameScene | undefined;

export function getActiveScene(): GameScene | undefined {
	return activeScene;
}

export function setScene(scene?: GameScene): void {
	newScene = scene;
}

export function getInput() {
	const res = {
		move: {
			x: gamepads.getAxis(Axes.LSTICK_H),
			y: gamepads.getAxis(Axes.LSTICK_V),
		},
		justMoved: {
			x:
				(gamepads.axisJustPast(Axes.LSTICK_H, 0.5, 1) && 1) ||
				(gamepads.axisJustPast(Axes.LSTICK_H, -0.5, -1) && -1) ||
				0,
			y:
				(gamepads.axisJustPast(Axes.LSTICK_V, 0.5, 1) && 1) ||
				(gamepads.axisJustPast(Axes.LSTICK_V, -0.5, -1) && -1) ||
				0,
		},
		interact:
			gamepads.isJustDown(Buttons.A) ||
			gamepads.isJustDown(Buttons.B) ||
			gamepads.isJustDown(Buttons.X) ||
			gamepads.isJustDown(Buttons.Y) ||
			keys.isJustDown(KEYS.SPACE) ||
			keys.isJustDown(KEYS.E) ||
			keys.isJustDown(KEYS.Z) ||
			keys.isJustDown(KEYS.X) ||
			keys.isJustDown(KEYS.ENTER),
		menu:
			keys.isJustDown(KEYS.ESCAPE) ||
			gamepads.isJustDown(Buttons.START) ||
			gamepads.isJustDown(Buttons.BACK),
	};

	if (
		keys.isDown(KEYS.A) ||
		keys.isDown(KEYS.LEFT) ||
		gamepads.isDown(Buttons.DPAD_LEFT)
	) {
		res.move.x -= 1;
		if (
			keys.isJustDown(KEYS.A) ||
			keys.isJustDown(KEYS.LEFT) ||
			gamepads.isJustDown(Buttons.DPAD_LEFT)
		) {
			res.justMoved.x = -1;
		}
	}
	if (
		keys.isDown(KEYS.D) ||
		keys.isDown(KEYS.RIGHT) ||
		gamepads.isDown(Buttons.DPAD_RIGHT)
	) {
		res.move.x += 1;
		if (
			keys.isJustDown(KEYS.D) ||
			keys.isJustDown(KEYS.RIGHT) ||
			gamepads.isJustDown(Buttons.DPAD_RIGHT)
		) {
			res.justMoved.x = 1;
		}
	}
	if (
		keys.isDown(KEYS.W) ||
		keys.isDown(KEYS.UP) ||
		gamepads.isDown(Buttons.DPAD_UP)
	) {
		res.move.y -= 1;
		if (
			keys.isJustDown(KEYS.W) ||
			keys.isJustDown(KEYS.UP) ||
			gamepads.isJustDown(Buttons.DPAD_UP)
		) {
			res.justMoved.y = -1;
		}
	}
	if (
		keys.isDown(KEYS.S) ||
		keys.isDown(KEYS.DOWN) ||
		gamepads.isDown(Buttons.DPAD_DOWN)
	) {
		res.move.y += 1;
		if (
			keys.isJustDown(KEYS.S) ||
			keys.isJustDown(KEYS.DOWN) ||
			gamepads.isJustDown(Buttons.DPAD_DOWN)
		) {
			res.justMoved.y = 1;
		}
	}

	res.move.x = clamp(-1.0, res.move.x, 1.0);
	res.move.y = clamp(-1.0, res.move.y, 1.0);

	return res;
}

function update(): void {
	// switch scene
	if (newScene && activeScene !== newScene) {
		activeScene?.destroy();
		// @ts-ignore
		window.scene = activeScene = newScene;
		newScene = undefined;
		if (activeScene) {
			game.app.stage.addChildAt(activeScene.camera.display.container, 1);
		}
	}

	// update
	activeScene?.update();

	// update input managers
	gamepads.update();
	keys.update();
	mouse.update();
}

export function init(): void {
	// initialize input managers
	keys.init({
		capture: [
			KEYS.LEFT,
			KEYS.RIGHT,
			KEYS.UP,
			KEYS.DOWN,
			KEYS.SPACE,
			KEYS.ENTER,
		],
	});
	mouse = new Mouse(game.app.view, false);

	const fill = new Sprite(Texture.WHITE);
	fill.tint = 0x000000;
	fill.width = size.x;
	fill.height = size.x;
	game.app.stage.addChildAt(fill, 0);
	setScene(new GameScene());

	// start main loop
	game.app.ticker.add(update);
	game.app.ticker.update();
}
