import { DisplayObject } from 'pixi.js';
import { game } from './Game';
import { GameObject } from './GameObject';
import { Display } from './Scripts/Display';
import { size } from './size';
import { zero } from './utils';
import * as VMath from './VMath';

export class Camera extends GameObject {
	display: Display;

	private target?: DisplayObject;

	private targetPivot: VMath.V = { x: 0, y: 0 };

	constructor() {
		super();
		this.scripts.push((this.display = new Display(this)));
		this.display.container.position.set(
			Math.floor(size.x / 2),
			Math.floor(size.y / 2)
		);
	}

	setTarget(newTarget: DisplayObject, updateTarget = true): void {
		this.target = newTarget;
		if (updateTarget) {
			this.updateTarget();
			VMath.copy(this.display.container.pivot, this.targetPivot);
		}
	}

	private updateTarget(): void {
		if (!this.target) {
			return;
		}
		const targetPoint = this.target.toLocal(zero, this.display.container);
		this.targetPivot = VMath.multiply(targetPoint, -1);
	}

	update(): void {
		this.updateTarget();

		const dt = 1 - Math.exp(-game.app.ticker.deltaTime * 0.16);
		VMath.copy(
			this.display.container.pivot,
			VMath.add(
				VMath.multiply(
					VMath.subtract(this.targetPivot, this.display.container.pivot),
					dt
				),
				this.display.container.pivot
			)
		);
	}
}
