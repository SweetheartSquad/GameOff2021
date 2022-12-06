import * as Matter from 'matter-js';
import {
	Bodies,
	Body as MatterBody,
	Composite,
	IChamferableBodyDefinition,
} from 'matter-js';
import { GameObject } from '../GameObject';
import { world } from '../Physics';
import { chunks } from '../utils';
import { Script } from './Script';

export class Body extends Script {
	static type = 'Body';

	body: MatterBody;

	constructor(
		gameObject: GameObject,
		shape: {
			type: 'rectangle' | 'circle' | 'poly';
			radius?: number;
			width?: number;
			height?: number;
			verts?: number[];
		},
		bodyDef: IChamferableBodyDefinition
	) {
		super(gameObject);
		switch (shape.type) {
			case 'rectangle':
				this.body = Bodies.rectangle(
					0,
					0,
					shape.width || 0,
					shape.height || 0,
					bodyDef
				);
				break;
			case 'circle':
				this.body = Bodies.circle(0, 0, shape.radius || 0, bodyDef, 1);
				break;
			case 'poly': {
				const v = chunks(shape.verts || [], 2).map(([x, y]) =>
					Matter.Vector.create(x, y)
				);
				const b = Matter.Bounds.create(v);
				this.body = Bodies.fromVertices(0, 0, [v], bodyDef);
				this.move(
					b.min.x - this.body.bounds.min.x,
					b.min.y - this.body.bounds.min.y
				);
				break;
			}
			default:
				throw new Error(`Unrecognized body type: ${shape.type}`);
		}
	}

	init() {
		Composite.add(world, this.body);
	}

	destroy() {
		Composite.remove(world, this.body);
	}

	move(x: number, y: number) {
		this.setPosition(this.body.position.x + x, this.body.position.y + y);
	}

	setPosition(x: number, y: number) {
		Matter.Body.setPosition(this.body, { x, y });
	}

	rotate(angle: number) {
		Matter.Body.rotate(this.body, angle);
	}

	setAngle(angle: number) {
		Matter.Body.setAngle(this.body, angle);
	}

	scale(scaleX: number, scaleY: number) {
		Matter.Body.scale(this.body, scaleX, scaleY);
	}
}
