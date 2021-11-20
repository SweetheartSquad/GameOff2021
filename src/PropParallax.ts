import { SCALE_MODES, TilingSprite } from 'pixi.js';
import { Camera } from './Camera';
import { GameObject } from './GameObject';
import { Animator } from './Scripts/Animator';
import { Display } from './Scripts/Display';
import { Transform } from './Scripts/Transform';
import { tex } from './utils';
import { V } from './VMath';

export class PropParallax extends GameObject {
	spr: TilingSprite;

	animator?: Animator;

	transform: Transform;

	display: Display;

	mult: number;

	tileOffset: V;

	offset: number;

	constructor({
		texture,
		x = 0,
		y = 0,
		alpha = 1,
		scale = 1,
		animate = true,
		flip,
		blur,
		offset = 0,
		mult = 1,
		freq = 1 / 400,
	}: {
		texture: string;
		x?: number;
		y?: number;
		alpha?: number;
		scale?: number;
		blur?: boolean;
		flip?: boolean;
		animate?: boolean;
		offset?: number;
		mult?: number;
		freq?: number;
	}) {
		super();

		const t = tex(texture);
		this.spr = new TilingSprite(t, t.width, t.height);
		if (blur) {
			this.spr.texture.baseTexture.scaleMode = SCALE_MODES.LINEAR;
		}
		this.spr.anchor.x = 0.5;
		this.spr.anchor.y = 0.5;
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

		this.offset = offset;
		this.spr.y -= offset;
		this.transform.y += offset;

		this.mult = mult;
		this.tileOffset = {
			x,
			y,
		};
		this.display.updatePosition();
		this.init();
	}

	update() {
		// @ts-ignore
		const camera = window.scene.camera as Camera;
		this.transform.x = camera.display.container.pivot.x;
		this.transform.y = camera.display.container.pivot.y + this.offset;
		this.spr.tilePosition.x =
			(-camera.display.container.pivot.x * this.mult) / this.spr.scale.x +
			this.tileOffset.x;
		this.spr.tilePosition.y =
			(-camera.display.container.pivot.y * this.mult) / this.spr.scale.y +
			this.tileOffset.y;
		super.update();
	}
}
