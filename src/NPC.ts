// eslint-disable-next-line max-classes-per-file
import { Character } from './Character';
import {
	BODY_ENVIRONMENT,
	BODY_PLAYER,
	SENSOR_INTERACTION,
	SENSOR_PLAYER,
} from './collision';
import { game } from './Game';
import { GameObject } from './GameObject';
import { Script } from './Scripts/Script';
import { randRange } from './utils';
import * as VMath from './VMath';

class Roam extends Script {
	active: boolean;

	target: VMath.V = { x: 0, y: 0 };

	private offset: VMath.V = { x: 0, y: 0 };

	range = [0, 200] as [number, number];

	speed: number = Math.random() * 0.2 + 0.8;

	private changeOffset = 0;

	freq = {
		value: 8000,
		range: 5000,
	};

	constructor(gameObject: GameObject) {
		super(gameObject);
		this.active = true;
	}

	update(): void {
		if (!this.active) return;

		const curTime = game.app.ticker.lastTime;
		if (curTime > this.changeOffset) {
			this.offset.x = randRange(...this.range) * Math.sign(Math.random() - 0.5);
			this.offset.y = randRange(...this.range) * Math.sign(Math.random() - 0.5);
			this.changeOffset =
				curTime + (Math.random() * 2 - 1) * this.freq.range + this.freq.value;
		}

		const npc = this.gameObject as NPC;
		const d = VMath.subtract(
			VMath.add(this.target, this.offset),
			npc.transform
		);
		const l = VMath.clone(d);
		l.x = Math.abs(l.x);
		l.y = Math.abs(l.y);
		l.x /= 50;
		l.y /= 50;
		npc.bodyCollision.body.force.x +=
			Math.sign(d.x) *
			npc.bodyCollision.body.mass *
			0.004 *
			this.speed *
			Math.min(1, l.x);
		npc.bodyCollision.body.force.y +=
			Math.sign(d.y) *
			npc.bodyCollision.body.mass *
			0.002 *
			this.speed *
			Math.min(1, l.y);
	}
}

export class NPC extends Character {
	roam: Roam;

	constructor({
		passage,
		focus,
		...options
	}: ConstructorParameters<typeof Character>[0] & {
		passage?: string;
		focus?: VMath.V;
	}) {
		super({
			...options,
			bodyCollision: {
				...options.bodyCollision,
				collisionFilter: {
					category: BODY_ENVIRONMENT,
					mask: BODY_PLAYER | BODY_ENVIRONMENT,
				},
			},
			bodySensor: {
				...options.bodySensor,
				collisionFilter: {
					category: SENSOR_INTERACTION,
					mask: SENSOR_PLAYER,
				},
				plugin: {
					...options.bodySensor?.plugin,
					passage,
					focus,
				},
			},
		});
		this.scripts.push((this.roam = new Roam(this)));
		this.roam.target.x = this.transform.x;
		this.roam.target.y = this.transform.y;
	}

	update(): void {
		this.moving.x = this.bodyCollision.body.velocity.x;
		this.moving.y = this.bodyCollision.body.velocity.y;
		super.update();
	}
}
