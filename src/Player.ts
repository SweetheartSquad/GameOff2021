import { Howl } from 'howler';
import { IChamferableBodyDefinition } from 'matter-js';
import { Container, DisplayObject } from 'pixi.js';
import { Character, speed } from './Character';
import {
	BODY_ENVIRONMENT,
	BODY_PLAYER,
	SENSOR_INTERACTION,
	SENSOR_PLAYER,
} from './collision';
import { resources } from './Game';
import { getInput } from './main';
import { NPC } from './NPC';
import { size } from './size';
import { removeFromArray } from './utils';
import { multiply } from './VMath';

const playerSpeedX = 0.004 * speed;
const playerSpeedY = 0.002 * speed;

export class Player extends Character {
	camPoint: DisplayObject;

	canMove: boolean;

	followers: NPC[] = [];

	step: number;

	constructor({
		bodyCollision,
		bodySensor,
	}: {
		bodyCollision?: Partial<IChamferableBodyDefinition>;
		bodySensor?: Partial<IChamferableBodyDefinition>;
	}) {
		super({
			bodyCollision: {
				...bodyCollision,
				restitution: 0.8,
				frictionAir: 0.2,
				collisionFilter: {
					category: BODY_PLAYER,
					mask: BODY_ENVIRONMENT,
					...bodyCollision?.collisionFilter,
				},
			},
			bodySensor: {
				...bodySensor,
				radius: 10,
				collisionFilter: {
					category: SENSOR_PLAYER,
					mask: SENSOR_INTERACTION,
					...bodySensor?.collisionFilter,
				},
			},
		});
		this.camPoint = new Container();
		this.camPoint.visible = false;
		this.display.container.addChild(this.camPoint);
		this.canMove = true;
		this.step = 0;

		// @ts-ignore
		window.player = this;
	}

	update(): void {
		const step = this.spr.texture.textureCacheIds[0] === 'defaultRun1' ? 1 : 0;
		if (step === 1 && step !== this.step) {
			const sfxStep = resources.step.data as Howl;
			const id = sfxStep.play();
			sfxStep.rate(Math.random() * 0.2 + 0.9, id);
		}
		this.step = step;
		this.updateCamPoint();

		const input = getInput();
		input.move = multiply(input.move, this.canMove ? 1 : 0);
		// update player
		this.bodyCollision.body.force.x +=
			input.move.x * playerSpeedX * this.bodyCollision.body.mass;
		this.bodyCollision.body.force.y +=
			input.move.y * playerSpeedY * this.bodyCollision.body.mass;
		this.moving = {
			x: input.move.x,
			y: input.move.y,
		};
		super.update();
	}

	updateCamPoint() {
		if (this.camPoint) {
			this.camPoint.x = this.bodyCollision.body.velocity.x * size.x * 0.01;
			this.camPoint.y =
				this.bodyCollision.body.velocity.y * size.y * 0.01 -
				this.spr.height / 2;
		}
	}

	setPosition(x: number, y: number) {
		super.setPosition(x, y);
		this.followers.forEach((i) => {
			i.setPosition(x, y);
		});
		this.updateCamPoint();
	}

	follow(npc: NPC) {
		npc.roam.target = this.transform;
		npc.roam.range[0] = 100;
		npc.roam.range[1] = 50;
		npc.bodyCollision.body.collisionFilter.mask = BODY_ENVIRONMENT;
		removeFromArray(this.followers, npc);
		this.followers.push(npc);
	}

	stopFollow(npc: NPC) {
		npc.roam.target = {
			x: npc.transform.x,
			y: npc.transform.y,
		};
		npc.bodyCollision.body.collisionFilter.mask =
			BODY_PLAYER | BODY_ENVIRONMENT;
		removeFromArray(this.followers, npc);
	}
}
