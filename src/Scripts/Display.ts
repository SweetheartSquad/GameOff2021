import { Container } from 'pixi.js';
import { GameObject } from '../GameObject';
import { Script } from './Script';
import { Transform } from './Transform';

export class Display extends Script {
	transform?: Transform;

	container: Container;

	constructor(gameObject: GameObject) {
		super(gameObject);
		this.container = new Container();
		this.container.interactiveChildren = false;
	}

	init(): void {
		this.transform = this.gameObject.getScript(Transform);
	}

	update(): void {
		this.updatePosition();
	}

	updatePosition(): void {
		if (this.transform) {
			this.container.position.x = Math.floor(this.transform.x);
			this.container.position.y = Math.floor(this.transform.y);
		}
	}

	destroy(): void {
		this.container.destroy({ children: true });
	}
}
