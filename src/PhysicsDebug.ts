import { Body, Composite } from 'matter-js';
import { Graphics } from 'pixi.js';
import { GameObject } from './GameObject';
import { world } from './Physics';
import { Display } from './Scripts/Display';
import { partition } from './utils';

export class PhysicsDebug extends GameObject {
	graphics = new Graphics();

	graphicsStatic = new Graphics();

	lastStatic = 0;

	display: Display;

	constructor() {
		super();
		this.scripts.push((this.display = new Display(this)));
		this.display.container.addChild(this.graphicsStatic);
		this.display.container.addChild(this.graphics);
		this.graphicsStatic.cacheAsBitmapResolution = 0.5;
	}

	update() {
		super.update();
		this.graphics.clear();
		this.graphicsStatic.clear();
		if (window.debugPhysics) {
			const [staticBodies, rest] = partition(
				Composite.allBodies(world),
				(i) => i.isStatic && !i.plugin.interactive
			);
			if (this.lastStatic !== staticBodies.length) {
				this.graphicsStatic.cacheAsBitmap = false;
				this.lastStatic = staticBodies.length;
				this.graphicsStatic.clear();
				this.graphicsStatic.beginFill(0x0000ff, 0.1);
				this.graphicsStatic.lineStyle(1, 0xffffff, 0.5);
				staticBodies.forEach(this.debugDrawStatic);
				this.graphicsStatic.endFill();
				this.graphicsStatic.cacheAsBitmap = true;
			}
			rest.forEach(this.debugDraw);
		} else {
			this.graphicsStatic.cacheAsBitmap = false;
		}
	}

	debugDrawStatic = (body: Body): void => {
		const g = this.graphicsStatic;
		g.moveTo(
			body.vertices[body.vertices.length - 1].x,
			body.vertices[body.vertices.length - 1].y
		);
		body.vertices.forEach(({ x, y }) => g.lineTo(x, y));
	};

	debugDraw = (body: Body): void => {
		const g = this.graphics;

		if (body.isSensor) {
			g.beginFill(0xff0000, 0.1);
		} else {
			g.beginFill(0xffffff, 0.2);
		}
		g.lineStyle(1, 0xffffff, 0.5);
		g.moveTo(
			body.vertices[body.vertices.length - 1].x,
			body.vertices[body.vertices.length - 1].y
		);

		body.vertices.forEach(({ x, y }) => g.lineTo(x, y));

		g.endFill();
	};
}
