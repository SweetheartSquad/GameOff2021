import { BODY_ENVIRONMENT, BODY_PLAYER } from './collision';
import { GameObject } from './GameObject';
import { Body } from './Scripts/Body';

export class Poly extends GameObject {
	bodies: Body[] = [];

	constructor(
		{
			x = 0,
			y = 0,
			width = 20,
			verts = [],
		}: {
			x?: number;
			y?: number;
			width?: number;
			verts?: number[];
		},
		def?: ConstructorParameters<typeof Body>[2]
	) {
		super();
		for (let i = 0; i < verts.length - 2; i += 2) {
			const x1 = verts[i];
			const y1 = verts[i + 1];
			const x2 = verts[i + 2];
			const y2 = verts[i + 3];
			const dx = x2 - x1;
			const dy = y2 - y1;
			const d = Math.sqrt(dx ** 2 + dy ** 2);
			const a = Math.atan2(dy, dx) + Math.PI / 2;
			const rect = new Body(
				this,
				{
					type: 'rectangle',
					width,
					height: d,
				},
				{
					isStatic: true,
					collisionFilter: {
						category: BODY_ENVIRONMENT,
						mask: BODY_PLAYER | BODY_ENVIRONMENT,
					},
					position: {
						x: x + x1 + dx / 2,
						y: y + y1 + dy / 2,
					},
					angle: a,
					...def,
				}
			);
			const circ = new Body(
				this,
				{
					type: 'circle',
					radius: width / 2,
				},
				{
					isStatic: true,
					collisionFilter: {
						category: BODY_ENVIRONMENT,
						mask: BODY_PLAYER | BODY_ENVIRONMENT,
					},
					position: {
						x: x + x1,
						y: y + y1,
					},
					...def,
				}
			);
			this.scripts.push(rect, circ);
			this.bodies.push(rect, circ);
		}
		const circEnd = new Body(
			this,
			{
				type: 'circle',
				radius: width / 2,
			},
			{
				isStatic: true,
				collisionFilter: {
					category: BODY_ENVIRONMENT,
					mask: BODY_PLAYER | BODY_ENVIRONMENT,
				},
				position: {
					x: x + verts[verts.length - 2],
					y: y + verts[verts.length - 1],
				},
				...def,
			}
		);
		this.scripts.push(circEnd);
		this.bodies.push(circEnd);
		this.init();
	}
}
