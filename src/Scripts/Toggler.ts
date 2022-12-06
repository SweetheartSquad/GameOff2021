import { Container, Sprite } from 'pixi.js';
import { GameObject } from '../GameObject';
import { Tween, TweenManager } from '../Tweens';
import { delay, tex } from '../utils';
import { Animator } from './Animator';
import { Script } from './Script';

export class Toggler extends Script {
	container: Container;

	sprA: Sprite;

	sprB: Sprite;

	animatorA: Animator;

	animatorB: Animator;

	active: Animator;

	inactive: Animator;

	tweens: Tween[] = [];

	constructor(gameObject: GameObject) {
		super(gameObject);
		this.container = new Container();
		this.sprA = new Sprite(tex('blank'));
		this.sprB = new Sprite(tex('blank'));
		this.sprA.anchor.x =
			this.sprA.anchor.y =
			this.sprB.anchor.x =
			this.sprB.anchor.y =
				0.5;
		this.sprA.alpha = 0;
		this.sprB.alpha = 0;
		gameObject.scripts.push(
			(this.active = this.animatorA =
				new Animator(gameObject, { spr: this.sprA }))
		);
		gameObject.scripts.push(
			(this.inactive = this.animatorB =
				new Animator(gameObject, { spr: this.sprB }))
		);
		this.container.addChild(this.sprA, this.sprB);
	}

	show(
		texture?: string,
		{
			duration = 1000,
			x = 0,
			y = 0,
			scale = 1,
			animate = true,
			freq = 1 / 400,
			alpha = 1,
			flip = false,
		}: {
			duration?: number;
			x?: number;
			y?: number;
			scale?: number;
			animate?: boolean;
			freq?: number;
			alpha?: number;
			flip?: boolean;
		} = {}
	) {
		if (texture !== this.active.animation) {
			this.inactive =
				this.active === this.animatorA ? this.animatorB : this.animatorA;
			this.inactive.setAnimation(texture || 'blank');
			this.container.addChild(this.inactive.spr);
			[this.inactive, this.active] = [this.active, this.inactive];
			this.tweens.forEach((i) => TweenManager.finish(i));
			this.tweens.length = 0;
			if (duration) {
				this.tweens.push(
					TweenManager.tween(this.active.spr, 'alpha', alpha, duration),
					TweenManager.tween(this.inactive.spr, 'alpha', 0, duration)
				);
			} else {
				this.active.spr.alpha = alpha;
				this.inactive.spr.alpha = 0;
			}
		}
		this.active.spr.position.x = x;
		this.active.spr.position.y = y;
		this.active.spr.scale.x = this.active.spr.scale.y = scale;
		if (flip) this.active.spr.scale.x *= -1;
		this.active.active = animate;
		this.active.freq = freq;
		return delay(duration);
	}

	destroy() {
		this.container.destroy({ children: true });
	}
}
