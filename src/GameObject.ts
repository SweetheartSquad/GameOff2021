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

	static initScript(s: Script) {
		return s.init?.();
	}

	init(): void {
		this.scripts.forEach(GameObject.initScript);
	}
	static updateScript(s: Script) {
		return s.update?.();
	}

	update(): void {
		this.scripts.forEach(GameObject.updateScript);
	}

	static destroyScript(s: Script) {
		return s.destroy?.();
	}

	destroy(): void {
		this.scripts.forEach(GameObject.destroyScript);
		removeFromArray(GameObject.gameObjects, this);
	}

	static updateObject(s: GameObject) {
		return s.update();
	}

	static update(): void {
		GameObject.gameObjects.forEach(GameObject.updateObject);
	}
}

window.gameObjects = GameObject.gameObjects;
