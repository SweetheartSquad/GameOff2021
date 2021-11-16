import { Body, Composite, Events, Runner } from 'matter-js';
import { Container, DisplayObject, Graphics, Texture } from 'pixi.js';
import { Area } from './Area';
import { Border } from './Border';
import { Camera } from './Camera';
import { game, resources } from './Game';
import { GameObject } from './GameObject';
import { engine, world } from './Physics';
import { Player } from './Player';
import { ScreenFilter } from './ScreenFilter';
import { StrandE } from './StrandE';
import { TweenManager } from './Tweens';
import { UIDialogue } from './UIDialogue';
import { delay, removeFromArray } from './utils';
import { add, V } from './VMath';

let player: Player;

function depthCompare(a: DisplayObject, b: DisplayObject): number {
	return a.y - b.y;
}

export class PhysicsScene {
	container = new Container();

	graphics = new Graphics();

	camera = new Camera();

	dialogue: UIDialogue;

	screenFilter: ScreenFilter;

	strand: StrandE;

	border: Border;

	interactionFocus?: V;

	areas: Record<string, GameObject[]> = {
		root: [],
	};

	area?: string;

	player: Player;

	onCollisionStart: (e: Matter.IEventCollision<Matter.Engine>) => void;

	onCollisionEnd: (e: Matter.IEventCollision<Matter.Engine>) => void;

	constructor() {
		this.container.addChildAt(this.graphics, 0);

		this.player = player = new Player({});
		this.container.addChild(player.display.container);

		this.strand = new StrandE({
			source: resources.main.data,
			renderer: {
				displayPassage: (passage) => {
					if (passage.title === 'close') {
						this.dialogue.close();
						player.canMove = true;
						player.followers.forEach((i) => {
							i.roam.active = true;
						});
						this.strand.voice = 'Default';
						return Promise.resolve();
					}
					player.canMove = false;
					player.followers.forEach((i) => {
						i.roam.active = false;
					});
					const program = this.strand.execute(passage.program);
					this.dialogue.voice = this.strand.voice;
					const text: string[] = [];
					const actions: (typeof program[number] & {
						name: 'action';
					})['value'][] = [];
					program.forEach((node) => {
						switch (node.name) {
							case 'text':
								text.push(node.value);
								break;
							case 'action':
								actions.push(node.value);
								break;
							default:
								throw new Error('unrecognized node type');
						}
					});
					this.dialogue.say(
						text.join('').trim(),
						actions.map((i) => ({
							text: i.text,
							action: () => this.strand.eval(i.action),
						}))
					);
					return Promise.resolve();
				},
			},
		});
		this.strand.scene = this;
		this.strand.debug = process.env.NODE_ENV === 'development';
		this.dialogue = new UIDialogue(this.strand);
		game.app.stage.addChild(this.dialogue.display.container);

		this.border = new Border();
		this.border.init();

		const interactions: Body[] = [];

		const updateInteractions = async () => {
			const interrupt = interactions.find((i) => i.plugin.interrupt);
			if (interrupt) {
				interactions.length = 0;
				this.strand.gameObject = interrupt.plugin.gameObject as GameObject;
				this.strand.goto(interrupt.plugin.interrupt.passage);
				return;
			}
			const goto = interactions.find((i) => i.plugin.goto);
			if (goto) {
				interactions.length = 0;
				const { transition = true } = goto.plugin.goto;
				const collidesWith = player.bodySensor.body.collisionFilter.mask;
				if (transition) {
					player.bodySensor.body.collisionFilter.mask = 0;
					this.dialogue.scrim(1, 300);
					await delay(300);
				}
				this.goto(goto.plugin.goto);
				this.camera.setTarget(player.camPoint, true);
				if (transition) {
					this.dialogue.scrim(0, 100);
					await delay(100);
					player.bodySensor.body.collisionFilter.mask = collidesWith;
				}
				return;
			}
			const top = interactions
				.slice()
				.reverse()
				.find((i) => i.plugin.passage);
			if (!top) {
				this.dialogue.prompt();
				this.interactionFocus = undefined;
			} else {
				const { passage, label = 'talk', focus, gameObject } = top.plugin;
				this.interactionFocus = focus ? add(top.position, focus) : top.position;
				this.dialogue.prompt(`< ${label.toUpperCase()} >`, () => {
					this.strand.gameObject = gameObject;
					this.strand.goto(passage);
				});
			}
		};
		Events.on(
			engine,
			'collisionStart',
			(this.onCollisionStart = ({ pairs }) => {
				pairs.forEach(({ bodyA, bodyB }) => {
					if (bodyA === player.bodySensor.body) {
						interactions.push(bodyB);
						updateInteractions();
					} else if (bodyB === player.bodySensor.body) {
						interactions.push(bodyA);
						updateInteractions();
					}
				});
			})
		);
		Events.on(
			engine,
			'collisionEnd',
			(this.onCollisionEnd = ({ pairs }) => {
				pairs.forEach(({ bodyA, bodyB }) => {
					if (bodyA === player.bodySensor.body) {
						removeFromArray(interactions, bodyB);
						updateInteractions();
					} else if (bodyB === player.bodySensor.body) {
						removeFromArray(interactions, bodyA);
						updateInteractions();
					}
				});
			})
		);

		this.take(this.player);
		this.take(this.dialogue);
		this.take(this.border);
		this.take(this.camera);

		this.screenFilter = new ScreenFilter();
		game.app.stage.filters = [this.screenFilter];

		this.camera.display.container.addChild(this.container);
		this.camera.setTarget(player.camPoint);

		this.strand.history.push('close');

		this.dialogue.toggler.active.texture = resources.black.texture as Texture;
		this.border.display.container.alpha = 0;
		this.strand.goto('start');

		const runner = Runner.create({
			isFixed: true,
		});
		Runner.start(runner, engine);
	}

	destroy(): void {
		if (this.area && this.areas[this.area]) {
			Area.unmount(this.areas[this.area]);
		}
		Events.off(engine, 'collisionStart', this.onCollisionStart);
		Events.off(engine, 'collisionEnd', this.onCollisionEnd);
		Object.values(this.areas).forEach((a) => a.forEach((o) => o.destroy()));
		this.container.destroy({
			children: true,
		});
	}

	goto({
		area = this.area,
		x = 0,
		y = 0,
	}: {
		area?: string;
		x?: number;
		y?: number;
	}) {
		this.gotoArea(area);
		player.setPosition(x, y);
		this.camera.setTarget(player.camPoint, true);
	}

	gotoArea(area?: string) {
		if (this.area && this.areas[this.area]) {
			Area.unmount(this.areas[this.area]);
		}
		this.area = area;
		if (this.area && this.areas[this.area]) {
			Area.mount(this.areas[this.area], this.container);
		} else {
			throw new Error(`Area "${area}" does not exist`);
		}
	}

	update(): void {
		const curTime = game.app.ticker.lastTime;
		this.screenFilter.uniforms.curTime = curTime;
		this.screenFilter.uniforms.camPos = [
			this.camera.display.container.pivot.x,
			-this.camera.display.container.pivot.y,
		];

		// depth sort
		this.container.children.sort(depthCompare);
		this.container.addChild(this.graphics);

		// adjust camera based on dialogue state
		const p = this.dialogue.progress();
		player.camPoint.y +=
			(this.dialogue.height() / 2 / this.camera.display.container.scale.y) * p;
		this.camera.display.container.scale.x =
			this.camera.display.container.scale.y = 1 + p * 0.1;

		if (this.interactionFocus) {
			player.camPoint.y +=
				(this.interactionFocus.y - player.transform.y) *
				(this.dialogue.isOpen ? 0.8 : 0.4);
			player.camPoint.x +=
				(this.interactionFocus.x - player.transform.x) *
				(this.dialogue.isOpen ? 0.8 : 0.4);
		}

		this.screenFilter.update();

		const g = this.graphics;

		// test bg
		g.clear();
		// draw physics
		// @ts-ignore
		if (process.env.NODE_ENV === 'development' && window.debugPhysics) {
			Composite.allBodies(world).forEach(this.debugDraw);
		}

		GameObject.update();
		TweenManager.update();
	}

	debugDraw = (body: Body): void => {
		const g = this.graphics;

		if (body.isSensor) {
			g.beginFill(0xff0000, 0.1);
		} else if (body.isStatic) {
			g.beginFill(0x0000ff, 0.1);
		} else {
			g.beginFill(0xffffff, 0.2);
		}
		g.lineStyle(1, 0xffffff, 0.5);
		g.moveTo(
			body.vertices[body.vertices.length - 1].x,
			body.vertices[body.vertices.length - 1].y
		);

		body.vertices.forEach(({ x, y }) => g.lineTo(x, y));

		g.endFill();
	};

	take(gameObject: GameObject) {
		if (this.area && this.areas[this.area]) {
			Area.remove(this.areas[this.area], gameObject);
		}
		Area.add(this.areas.root, gameObject);
	}

	drop(gameObject: GameObject) {
		Area.remove(this.areas.root, gameObject);
		if (this.area && this.areas[this.area]) {
			Area.add(this.areas[this.area], gameObject);
		}
	}
}
