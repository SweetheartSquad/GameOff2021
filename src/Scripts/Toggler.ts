import { Container, Sprite, Texture } from 'pixi.js';
import { resources } from '../Game';
import { GameObject } from '../GameObject';
import { TweenManager } from '../Tweens';
import { Script } from './Script';

export class Toggler extends Script {
	container: Container;

	a: Sprite;

	b: Sprite;

	active: Sprite;

	inactive: Sprite;

	constructor(gameObject: GameObject) {
		super(gameObject);
		this.container = new Container();
		this.active = this.a = new Sprite(resources.blank.texture);
		this.inactive = this.b = new Sprite(resources.blank.texture);
		this.a.anchor.x = this.a.anchor.y = this.b.anchor.x = this.b.anchor.y = 0.5;
		this.a.alpha = 1;
		this.b.alpha = 0;
		this.container.addChild(this.a, this.b);
	}

	show(texture?: Texture, duration = 1000) {
		this.inactive = this.active === this.a ? this.b : this.a;
		this.inactive.texture = texture || (resources.blank.texture as Texture);
		this.container.addChild(this.inactive);
		[this.inactive, this.active] = [this.active, this.inactive];
		TweenManager.tween(this.active, 'alpha', 1, duration);
		TweenManager.tween(this.inactive, 'alpha', 0, duration);
	}

	destroy() {
		this.container.destroy({ children: true });
	}
}
