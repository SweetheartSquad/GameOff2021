import { Container, Sprite } from 'pixi.js';
import { resources } from '../Game';
import { GameObject } from '../GameObject';
import { TweenManager } from '../Tweens';
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

	constructor(gameObject: GameObject) {
		super(gameObject);
		this.container = new Container();
		this.sprA = new Sprite(resources.blank.texture);
		this.sprB = new Sprite(resources.blank.texture);
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

	show(tex?: string, duration = 1000) {
		if (tex === this.active.animation) return;
		this.inactive =
			this.active === this.animatorA ? this.animatorB : this.animatorA;
		this.inactive.setAnimation(tex || 'blank');
		this.container.addChild(this.inactive.spr);
		[this.inactive, this.active] = [this.active, this.inactive];
		TweenManager.tween(this.active.spr, 'alpha', 1, duration);
		TweenManager.tween(this.inactive.spr, 'alpha', 0, duration);
	}

	destroy() {
		this.container.destroy({ children: true });
	}
}
