import { SCALE_MODES, Sprite } from 'pixi.js';
import { GameObject } from './GameObject';
import { Animator } from './Scripts/Animator';
import { Display } from './Scripts/Display';
import { Transform } from './Scripts/Transform';
import { tex } from './utils';

export class Prop extends GameObject {
	spr: Sprite;

	animator?: Animator;

	transform: Transform;

	display: Display;

	constructor({
		texture,
		x = 0,
		y = 0,
		alpha = 1,
		angle = 0,
		scale = 1,
		animate = true,
		flip,
		blur,
		offset,
		freq = 1 / 400,
	}: {
		texture: string;
		x?: number;
		y?: number;
		alpha?: number;
		angle?: number;
		scale?: number;
		blur?: boolean;
		flip?: boolean;
		animate?: boolean;
		offset?: number;
		freq?: number;
	}) {
		super();

		const t = tex(texture);
		this.spr = new Sprite(t);
		if (blur) {
			this.spr.texture.baseTexture.scaleMode = SCALE_MODES.LINEAR;
		}
		this.spr.anchor.x = 0.5;
		this.spr.anchor.y = 1.0;
		this.spr.alpha = alpha;
		this.spr.scale.x = this.spr.scale.y = scale;
		if (flip) {
			this.spr.scale.x *= -1;
		}

		this.scripts.push((this.transform = new Transform(this)));
		this.scripts.push((this.display = new Display(this)));
		if (animate && t.textureCacheIds[0].match(/\.\d+$/)) {
			this.scripts.push(
				(this.animator = new Animator(this, {
					spr: this.spr,
					freq,
				}))
			);
			this.animator.offset = Math.random() * 10000;
		}

		this.display.container.addChild(this.spr);
		this.display.container.angle = angle;
		this.transform.x = x;
		this.transform.y = y;

		if (offset) {
			this.spr.y -= offset;
			this.transform.y += offset;
		}

		this.display.updatePosition();
		this.init();
	}
}
