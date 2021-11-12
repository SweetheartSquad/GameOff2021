import { Sprite, utils } from 'pixi.js';
import { game, resources } from '../Game';
import { GameObject } from '../GameObject';
import { Script } from './Script';

function getFrameCount(animation: string): number {
	let count = 0;
	// eslint-disable-next-line no-empty
	while (resources[`${animation}${++count + 1}`]?.texture) {}
	return count;
}

let offset = 0;

export class Animator extends Script {
	spr: Sprite;

	freq: number;

	offset: number;

	frameCount: number;

	frame: number;

	animation: string;

	constructor(
		gameObject: GameObject,
		{ spr, freq = 1 / 200 }: { spr: Sprite; freq?: number }
	) {
		super(gameObject);
		this.spr = spr;
		this.freq = freq;
		this.offset = ++offset;
		this.frame = 0;
		this.animation = this.spr.texture.textureCacheIds[0].slice(0, -1);
		this.frameCount = getFrameCount(this.animation);
	}

	setAnimation(animation: string) {
		if (this.animation === animation) return;
		this.animation = animation;
		this.frameCount = getFrameCount(this.animation);
		this.frame = 0;
	}

	update(): void {
		const curTime = game.app.ticker.lastTime;
		this.frame =
			Math.floor(curTime * this.freq + this.offset * 0.5) % this.frameCount;
		const tex = utils.TextureCache[`${this.animation}${this.frame + 1}`];
		this.spr.texture = tex;
	}
}
