import { SENSOR_INTERACTION, SENSOR_PLAYER } from './collision';
import { GameObject } from './GameObject';
import { Body } from './Scripts/Body';

export class Interrupt extends GameObject {
	constructor({
		passage,
		type = 'rectangle',
		width = 80,
		height = 80,
		radius = 40,
		x,
		y,
	}: {
		passage?: string;
		type?: ConstructorParameters<typeof Body>[1]['type'];
		width?: ConstructorParameters<typeof Body>[1]['width'];
		height?: ConstructorParameters<typeof Body>[1]['height'];
		radius?: ConstructorParameters<typeof Body>[1]['radius'];
		x: number;
		y: number;
	}) {
		super();
		this.scripts.push(
			new Body(
				this,
				{
					type,
					width,
					height,
					radius,
				},
				{
					position: { x, y },
					plugin: {
						interrupt: { passage },
						gameObject: this,
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
