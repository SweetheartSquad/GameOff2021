import * as Matter from 'matter-js';
import {
	Bodies,
	Body as MatterBody,
	IChamferableBodyDefinition,
	World,
} from 'matter-js';
import { GameObject } from '../GameObject';
import { world } from '../Physics';
import { Script } from './Script';

export class Body extends Script {
	static type = 'Body';

	body: MatterBody;

	constructor(
		gameObject: GameObject,
		shape: {
			type: 'rectangle' | 'circle';
			radius?: number;
			width?: number;
			height?: number;
		},
		bodyDef: IChamferableBodyDefinition
	) {
		super(gameObject);
		if (shape.type === 'rectangle') {
			this.body = Bodies.rectangle(
				0,
				0,
				shape.width || 0,
				shape.height || 0,
				bodyDef
			);
		} else {
			this.body = Bodies.circle(0, 0, shape.radius || 0, bodyDef, 1);
		}
	}

	init() {
		World.add(world, this.body);
	}

	destroy() {
		World.remove(world, this.body);
	}

	move(x: number, y: number) {
		Matter.Body.setPosition(this.body, { x, y });
	}
}
