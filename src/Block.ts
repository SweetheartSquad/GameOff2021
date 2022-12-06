import { BODY_ENVIRONMENT, BODY_PLAYER } from './collision';
import { GameObject } from './GameObject';
import { Body } from './Scripts/Body';

export class Block extends GameObject {
	body: Body;

	constructor({
		x = 0,
		y = 0,
		type = 'rectangle',
		width = 10,
		height = 10,
		radius = 5,
		verts = [],
	}: {
		x?: number;
		y?: number;
		type?: ConstructorParameters<typeof Body>[1]['type'];
		width?: ConstructorParameters<typeof Body>[1]['width'];
		height?: ConstructorParameters<typeof Body>[1]['height'];
		radius?: ConstructorParameters<typeof Body>[1]['radius'];
		verts?: ConstructorParameters<typeof Body>[1]['verts'];
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
					verts,
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
