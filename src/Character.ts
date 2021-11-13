import Matter, { IChamferableBodyDefinition } from 'matter-js';
import { Sprite } from 'pixi.js';
import { game, resources } from './Game';
import { GameObject } from './GameObject';
import { Animator } from './Scripts/Animator';
import { Body } from './Scripts/Body';
import { Display } from './Scripts/Display';
import { Transform } from './Scripts/Transform';
import { lerp, tex } from './utils';

const FLIP_ESPILON = 0.01;

let offset = 0;

export class Character extends GameObject {
	bodyCollision: Body;

	bodySensor: Body;

	body: string;

	rawScale: number;

	s: number;

	freq: number;

	offset: number;

	bounce: number;

	flipped: boolean;

	shadow: Sprite;

	spr: Sprite;

	animatorBody: Animator;

	running: boolean;

	moving: {
		x: number;
		y: number;
	};

	colliderSize: number;

	transform: Transform;

	display: Display;

	animation: 'Idle' | 'Run';

	constructor({
		body = 'basicAnt',
		x = 0,
		y = 0,
		scale = 0.3,
		bodyCollision,
		bodySensor: { radius, ...bodySensor } = {},
	}: {
		body?: string;
		x?: number;
		y?: number;
		scale?: number;
		bodyCollision?: Partial<IChamferableBodyDefinition>;
		bodySensor?: Partial<IChamferableBodyDefinition> & { radius?: number };
	}) {
		super();

		this.scripts.push((this.transform = new Transform(this)));
		this.scripts.push((this.display = new Display(this)));

		this.body = body;
		this.rawScale = scale;
		this.s = 1.0;
		this.freq = 1 / 200;
		this.offset = ++offset;
		this.bounce = 1;
		this.running = false;
		this.flipped = false;

		this.shadow = new Sprite(resources.shadows.texture);
		this.shadow.anchor.x = 0.5;
		this.shadow.anchor.y = 0.75;
		this.animation = 'Idle';
		this.spr = new Sprite(tex(`${body}Idle`));

		this.spr.anchor.x = 0.5;
		this.spr.anchor.y = 1.0;
		this.display.container.addChild(this.shadow);
		this.display.container.addChild(this.spr);
		this.spr.scale.x = this.spr.scale.y = this.getScale() * this.rawScale;

		this.moving = { x: 0, y: 0 };

		// physics
		this.colliderSize = this.spr.width / 4;
		this.bodyCollision = new Body(
			this,
			{
				type: 'rectangle',
				width: this.colliderSize * 2,
				height: this.colliderSize,
			},
			{
				restitution: 0,
				frictionAir: 0.2,
				inertia: Infinity, // prevent rotation
				chamfer: { radius: this.colliderSize / 2, quality: 10 },
				...bodyCollision,
				position: { x, y },
			}
		);
		this.bodySensor = new Body(
			this,
			{
				type: 'circle',
				radius: radius || this.colliderSize * 2,
			},
			{
				restitution: 0,
				friction: 0,
				frictionAir: 0,
				inertia: Infinity,
				isSensor: true,
				density: 0.000000001,
				...bodySensor,
				plugin: {
					...bodySensor?.plugin,
					gameObject: this,
				},
			}
		);

		this.transform.x = this.bodyCollision.body.position.x;
		this.transform.y = this.bodyCollision.body.position.y;
		this.scripts.push(this.bodyCollision);
		this.scripts.push(this.bodySensor);
		this.scripts.push(
			(this.animatorBody = new Animator(this, { spr: this.spr }))
		);

		this.init();
		this.update();
	}

	getScale(): number {
		return 0.8 + (0 + 250) / 300;
		// return 0.8 + (this.display.container.y + 250) / 300;
	}

	update(): void {
		const curTime = game.app.ticker.lastTime;
		if (
			Math.abs(this.bodyCollision.body.velocity.x) +
				Math.abs(this.bodyCollision.body.velocity.y) >
			1 - Math.abs(this.moving.x) - Math.abs(this.moving.y)
		) {
			this.running = true;
		} else if (this.running) {
			this.running = false;
			this.animation = 'Idle';
			this.animatorBody.setAnimation(`${this.body}Idle`);
		}
		this.animatorBody.freq = 1 / ((this.running ? 0.5 : 1.0) * 200);
		if (this.running) {
			this.animation = 'Run';
			this.animatorBody.setAnimation(`${this.body}Run`);
			if (Math.abs(this.moving.x) > FLIP_ESPILON) {
				this.flipped = this.moving.x < 0;
			}
			this.spr.anchor.y =
				1 +
				Math.abs(Math.sin(curTime * this.freq + this.offset * 0.5) ** 2) / 20;
		} else {
			this.spr.anchor.y = 1;
		}

		this.updateScale();
		this.updatePosition();
		super.update();
	}

	updateScale(): void {
		const curTime = game.app.ticker.lastTime * this.freq;
		this.s = lerp(this.s, this.getScale(), 0.3);
		this.spr.scale.y =
			(this.s +
				(Math.sin(curTime + this.offset) / 50 +
					Math.abs(Math.sin(curTime + this.offset) / 30))) *
			this.rawScale;
		this.spr.scale.x = (this.flipped ? -this.s : this.s) * this.rawScale;
		this.spr.skew.x = -this.bodyCollision.body.velocity.x / 50;
		this.shadow.width =
			this.spr.width / 2 -
			((Math.sin(curTime + this.offset) / 30 +
				Math.abs(Math.sin(curTime + this.offset) / 10)) *
				this.spr.width) /
				2;
		this.shadow.height = this.spr.height * 0.1;
	}

	updatePosition() {
		this.transform.x = this.bodyCollision.body.position.x;
		this.transform.y = this.bodyCollision.body.position.y;
		this.display.updatePosition();
		Matter.Body.setPosition(this.bodySensor.body, this.transform);
	}

	move(x: number, y: number) {
		this.bodyCollision.move(x, y);
		this.updatePosition();
	}
}
