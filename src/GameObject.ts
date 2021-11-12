import { Script } from './Scripts/Script';
import { removeFromArray } from './utils';

export class GameObject {
	static gameObjects: GameObject[] = [];

	scripts: Script[] = [];

	constructor() {
		GameObject.gameObjects.push(this);
	}

	getScript<T extends typeof Script>(type: T): Maybe<InstanceType<T>> {
		return this.scripts.find(
			(script: Script): boolean => script instanceof type
		) as Maybe<InstanceType<T>>;
	}

	getScripts<T extends typeof Script>(type: T): InstanceType<T>[] {
		return this.scripts.filter(
			(script: Script): boolean => script instanceof type
		) as InstanceType<T>[];
	}

	init(): void {
		this.scripts.forEach((s) => s.init && s.init());
	}

	update(): void {
		this.scripts.forEach((s) => s.update && s.update());
	}

	destroy(): void {
		this.scripts.forEach((s) => s.destroy && s.destroy());
		removeFromArray(GameObject.gameObjects, this);
	}

	static update(): void {
		GameObject.gameObjects.forEach((s) => s.update());
	}
}

// @ts-ignore
window.gameObjects = GameObject.gameObjects;
