import { BODY_ENVIRONMENT, BODY_PLAYER } from './collision';
import { GameObject } from './GameObject';
import { Body } from './Scripts/Body';

export class Block extends GameObject {
	body: Body;

	constructor({
		x,
		y,
		width = 10,
		height = 10,
		radius = 5,
		type = 'rectangle',
	}: {
		x: number;
		y: number;
		width?: number;
		height?: number;
		radius?: number;
		type?: 'rectangle' | 'circle';
	}) {
		super();
		this.scripts.push(
			(this.body = new Body(
				this,
				{
					type,
					radius,
					width,
					height,
				},
				{
					isStatic: true,
					collisionFilter: {
						category: BODY_ENVIRONMENT,
						mask: BODY_PLAYER | BODY_ENVIRONMENT,
					},
					position: {
						x,
						y,
					},
				}
			))
		);
		this.init();
	}
}
