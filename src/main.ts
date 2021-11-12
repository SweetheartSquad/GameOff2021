import { Axes, Buttons, Gamepads } from 'input-gamepads.js';
import { game } from './Game';
import { keys, KEYS } from './input-keys';
import { Mouse } from './input-mouse';
import { PhysicsScene } from './PhysicsScene';
import { clamp } from './utils';

const gamepads = new Gamepads();
let mouse: Mouse;
let activeScene: PhysicsScene | undefined;
let newScene: PhysicsScene | undefined;

export function getActiveScene(): PhysicsScene | undefined {
	return activeScene;
}

export function setScene(scene?: PhysicsScene): void {
	newScene = scene;
}

export function getInput(): {
	move: {
		x: number;
		y: number;
	};
	justMoved: {
		x: number;
		y: number;
	};
	interact: boolean;
} {
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
			game.app.stage.addChildAt(activeScene.camera.display.container, 0);
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

	setScene(new PhysicsScene());

	// start main loop
	game.app.ticker.add(update);
	game.app.ticker.update();
}
