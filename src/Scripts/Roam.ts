import { Character } from '../Character';
import { game } from '../Game';
import { randRange } from '../utils';
import * as VMath from '../VMath';
import { Script } from './Script';

export class Roam extends Script {
	gameObject!: Character;

	active: boolean;

	target: VMath.V = { x: 0, y: 0 };

	private offset: VMath.V = { x: 0, y: 0 };

	range = [0, 0] as [number, number];

	speed: { x: number; y: number };

	private changeOffset = 0;

	freq = {
		value: 8000,
		range: 5000,
	};

	constructor(gameObject: Character) {
		super(gameObject);
		this.active = true;
		const s = Math.random() * 0.1 + 0.4;
		this.speed = {
			x: s,
			y: s,
		};
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

		const character = this.gameObject;
		const d = VMath.subtract(
			VMath.add(this.target, this.offset),
			character.transform
		);
		const a = Math.atan2(d.y, d.x);
		const v = { x: Math.cos(a), y: Math.sin(a) };
		const l = VMath.clone(VMath.multiply(v, VMath.magnitude(d)));
		l.x = Math.abs(l.x);
		l.y = Math.abs(l.y);
		l.x /= 50;
		l.y /= 50;
		character.bodyCollision.body.force.x +=
			character.bodyCollision.body.mass *
			v.x *
			this.speed.x *
			Math.min(1, l.x) *
			character.speed;
		character.bodyCollision.body.force.y +=
			character.bodyCollision.body.mass *
			v.y *
			this.speed.y *
			Math.min(1, l.y) *
			character.speed;
	}
}
