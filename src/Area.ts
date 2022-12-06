import { Composite } from 'matter-js';
import { Container } from 'pixi.js';
import { GameObject } from './GameObject';
import { world } from './Physics';
import { Body } from './Scripts/Body';
import { Display } from './Scripts/Display';
import { removeFromArray } from './utils';

export class Area {
	static mount(area: GameObject[], container: Container) {
		area.forEach((i) => {
			i.getScripts(Display).forEach((d) => {
				container.addChild(d.container);
			});
			i.getScripts(Body).forEach((b) => {
				Composite.add(world, b.body);
			});
			GameObject.gameObjects.push(i);
		});
	}

	static unmount(area: GameObject[]) {
		area.forEach((i) => {
			i.getScripts(Display).forEach((d) => {
				d.container.parent?.removeChild(d.container);
			});
			i.getScripts(Body).forEach((b) => {
				Composite.remove(world, b.body);
			});
			removeFromArray(GameObject.gameObjects, i);
		});
	}

	static add(area: GameObject[], ...objects: GameObject[]) {
		objects.forEach((object) => {
			this.remove(area, object);
			area.push(object);
		});
	}

	static remove(area: GameObject[], object: GameObject) {
		removeFromArray(area, object);
	}
}
