import { Area } from './Area';
import { game } from './Game';
import { GameObject } from './GameObject';
import { getActiveScene } from './main';
import { Prop } from './Prop';

export class Poof extends Prop {
	time: number;

	area: GameObject[];

	constructor({
		time,
		...options
	}: ConstructorParameters<typeof Prop>[0] & {
		time?: number;
	}) {
		super(options);
		if (this.animator) {
			this.set(`${options.texture}.1`);
		}

		this.time = time || -1;
		const scene = getActiveScene();
		// @ts-ignore
		this.area = scene?.areas[scene.area];
		Area.add(this.area, this);
		// @ts-ignore
		Area.mount([this], scene?.container);
		this.display.container.parent.addChildAt(this.display.container, 0);
		this.display.updatePosition();
	}

	destroy(): void {
		Area.remove(this.area, this);
		Area.unmount([this]);
		super.destroy();
	}

	update(): void {
		super.update();
		if (this.time > 0) {
			this.time -= game.app.ticker.deltaMS;
			if (this.time <= 0) {
				this.destroy();
			}
		} else if (
			this.animator &&
			this.animator.frame >= this.animator.frameCount - 1
		) {
			this.destroy();
		}
	}
}
