import { SENSOR_INTERACTION, SENSOR_PLAYER } from './collision';
import { GameObject } from './GameObject';
import { Body } from './Scripts/Body';

export class Goto extends GameObject {
	constructor(
		goto: { area?: string; x?: number; y?: number; transition?: number },
		{
			type = 'rectangle',
			width = 80,
			height = 80,
			radius = 40,
			verts = [],
			x = 0,
			y = 0,
		}: {
			type?: ConstructorParameters<typeof Body>[1]['type'];
			width?: ConstructorParameters<typeof Body>[1]['width'];
			height?: ConstructorParameters<typeof Body>[1]['height'];
			radius?: ConstructorParameters<typeof Body>[1]['radius'];
			verts?: ConstructorParameters<typeof Body>[1]['verts'];
			x?: number;
			y?: number;
		} = {}
	) {
		super();
		this.scripts.push(
			new Body(
				this,
				{
					type,
					width,
					height,
					radius,
					verts,
				},
				{
					position: { x, y },
					plugin: {
						goto,
					},
					collisionFilter: {
						category: SENSOR_INTERACTION,
						mask: SENSOR_PLAYER,
					},
				}
			)
		);
	}
}
