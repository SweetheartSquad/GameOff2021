import type { EventEmitter } from '@pixi/utils';
import { cubicIn, cubicOut } from 'eases';
import { Howl } from 'howler';
import { Container, Sprite, Text, Texture } from 'pixi.js';
import Strand from 'strand-core';
import { fontDialogue, fontPrompt } from './font';
import { game, resources } from './Game';
import { GameObject } from './GameObject';
import { KEYS, keys } from './input-keys';
import { getInput } from './main';
import { Animator } from './Scripts/Animator';
import { Display } from './Scripts/Display';
import { Toggler } from './Scripts/Toggler';
import { Transform } from './Scripts/Transform';
import { size } from './size';
import { Tween, TweenManager } from './Tweens';
import { lerp, tex } from './utils';

export class UIDialogue extends GameObject {
	sprScrim: Sprite;

	tweenScrim?: Tween;

	sprBg: Sprite;

	sprEdge: Sprite;

	transform: Transform;

	display: Display;

	toggler: Toggler;

	isOpen: boolean;

	textText: Text;

	textPrompt: Text;

	fnPrompt?: () => void;

	choices: (Text & EventEmitter)[];

	selected: number | undefined;

	containerChoices: Container;

	strText: string;

	strPrompt: string;

	strand: Strand;

	private pos: number;

	private posTime: number;

	private posDelay: number;

	voice = 'Default' as string | undefined;

	height() {
		return this.sprBg.height + this.sprEdge.height;
	}

	openY() {
		return size.y;
	}

	closeY() {
		return size.y + this.height();
	}

	progress() {
		return (
			Math.abs(this.sprBg.y - this.closeY()) /
			Math.abs(this.openY() - this.closeY())
		);
	}

	constructor(strand: Strand) {
		super();

		this.strand = strand;
		this.isOpen = false;
		this.scripts.push((this.transform = new Transform(this)));
		this.scripts.push((this.display = new Display(this)));
		this.display.container.interactiveChildren = true;
		this.sprScrim = new Sprite(Texture.WHITE);
		this.sprScrim.tint = 0x000000;
		this.sprScrim.width = size.x;
		this.sprScrim.height = size.y;
		this.sprScrim.alpha = 1;
		this.sprBg = new Sprite(tex('dialogueBg'));
		this.sprEdge = new Sprite(tex('dialogueEdge'));
		this.sprBg.anchor.y = 1.0;
		this.sprEdge.anchor.y = 1.0;
		this.sprEdge.y = -this.sprBg.height;
		this.transform.x = 0;

		this.scripts.push((this.toggler = new Toggler(this)));
		this.display.container.addChild(this.sprScrim);
		this.display.container.addChild(this.toggler.container);
		this.toggler.container.x += size.x / 2;
		this.toggler.container.y = size.y / 2 - this.sprBg.height / 2;

		this.display.container.addChild(this.sprBg);
		this.strText = '';
		this.strPrompt = '';
		this.pos = 0;
		this.posTime = 0;
		this.posDelay = 2;
		this.selected = undefined;
		this.textText = new Text(this.strText, fontDialogue);
		this.textPrompt = new Text(this.strPrompt, fontPrompt);
		this.textPrompt.alpha = 0;
		this.textPrompt.x = size.x / 2;
		this.textPrompt.y = 20;
		this.textPrompt.anchor.x = 0.5;
		this.display.container.addChild(this.textPrompt);
		this.display.container.accessible = true;
		this.display.container.interactive = true;
		(this.display.container as EventEmitter).on('click', () => {
			this.complete();
		});
		this.containerChoices = new Container();
		this.sprBg.addChild(this.containerChoices);
		this.choices = [];
		this.sprBg.addChild(this.sprEdge);
		this.sprBg.addChild(this.textText);
		// @ts-ignore
		window.text = this.textText;
		this.textText.y -= this.sprBg.height;
		this.textText.y += 20;
		this.textText.x = 20;
		this.containerChoices.x = this.textText.x;
		this.textText.style.wordWrap = true;
		this.textText.style.wordWrapWidth = this.sprBg.width - 50;
		this.sprBg.alpha = 0;
		this.sprBg.y = this.closeY();

		this.scripts.push(new Animator(this, { spr: this.sprEdge, freq: 1 / 200 }));

		this.init();
	}

	update(): void {
		super.update();
		this.textPrompt.alpha = lerp(
			this.textPrompt.alpha,
			!this.isOpen && this.fnPrompt ? 1 : 0,
			0.1
		);
		const input = getInput();

		if (!this.isOpen && input.interact && this.fnPrompt) {
			this.fnPrompt();
		}

		// early return (still opening)
		if (this.progress() < 0.9) return;

		if (this.isOpen && this.choices.length) {
			if (this.containerChoices.alpha > 0.5) {
				if (input.justMoved.y) {
					if (this.selected !== undefined) {
						this.choices[this.selected].alpha = 1;
					}
					if (this.selected === undefined) {
						this.selected = 0;
					} else if (input.justMoved.y > 0) {
						this.selected =
							this.selected < this.choices.length - 1 ? this.selected + 1 : 0;
					} else if (input.justMoved.y < 0) {
						this.selected =
							this.selected > 0 ? this.selected - 1 : this.choices.length - 1;
					}
					this.choices[this.selected].alpha = 0.75;
				} else if (input.interact && this.selected !== undefined) {
					this.choices[this.selected].emit('click');
				} else if (input.interact) {
					this.complete();
				} else {
					this.choices
						.find((_, idx) => keys.isJustDown(KEYS.ONE + idx))
						?.emit('click');
				}
			} else if (input.interact) {
				this.complete();
			}
		}

		this.containerChoices.alpha = lerp(
			this.containerChoices.alpha,
			this.pos > this.strText.length ? 1 : 0,
			0.1
		);

		// early return (animation complete)
		if (this.pos > this.strText.length) return;
		this.posTime += game.app.ticker.deltaTime;
		const prevPos = this.pos;
		while (this.posTime > this.posDelay) {
			this.pos += 1;
			this.posTime -= this.posDelay;
		}
		if (prevPos !== this.pos) {
			const letter = this.strText?.[this.pos]?.replace(/[^\w]/, '');
			if (this.pos % 2 && letter && this.voice !== 'None') {
				const voice = (resources[`voice${this.voice}`]?.data ||
					resources.voiceDefault.data) as Howl;
				const id = voice.play();
				voice.rate((letter.charCodeAt(0) % 30) / 30 + 0.5, id);
			}
			this.textText.text =
				this.strText.substr(0, this.pos) +
				this.strText.substr(this.pos).replace(/[^\s]/g, '\u00A0');
		}
	}

	say(text: string, actions?: { text: string; action: () => void }[]) {
		this.selected = undefined;
		this.strText = text;
		this.textText.text = '';
		this.display.container.accessibleHint = text;
		this.choices.forEach((i) => i.destroy());
		this.choices = (actions || []).map((i, idx) => {
			const strText = `${idx + 1}. ${i.text}`;
			const t = new Text(strText, {
				...this.textText.style,
				wordWrapWidth: (this.textText.style.wordWrapWidth || 0) - 2,
			}) as Text & EventEmitter;
			t.accessible = true;
			t.accessibleHint = strText;
			t.interactive = true;
			t.buttonMode = true;
			t.tabIndex = 0;

			t.on('pointerover', () => {
				t.alpha = 0.75;
				this.selected = idx;
			});
			t.on('pointerout', () => {
				t.alpha = 1;
				this.selected = undefined;
			});
			t.on('click', () => {
				if (this.containerChoices.alpha > 0.5) {
					i.action();
				}
			});
			t.y += this.containerChoices.height;
			this.containerChoices.addChild(t);
			return t;
		});
		this.containerChoices.y = -this.containerChoices.height - 40;
		this.containerChoices.alpha = 0.0;
		this.open();
		this.pos = 0;
		this.posTime = 0;
	}

	show(image: string, duration?: number) {
		this.toggler.show(resources[image]?.texture, duration);
	}

	prompt(label: string = this.strPrompt, action?: () => void) {
		this.strPrompt = label;
		this.textPrompt.text = label;
		this.fnPrompt = action;
	}

	complete() {
		if (this.pos >= this.strText.length) return;
		this.pos = this.strText.length;
		this.textText.text = this.strText;
	}

	private open() {
		if (!this.isOpen) {
			this.isOpen = true;
			this.scrim(0.5, 500);
			TweenManager.tween(this.sprBg, 'alpha', 1, 500);
			TweenManager.tween(
				this.sprBg,
				'y',
				this.openY(),
				500,
				undefined,
				cubicOut
			);
		}
	}

	close() {
		if (this.isOpen) {
			this.isOpen = false;
			this.scrim(0, 500);
			TweenManager.tween(this.sprBg, 'alpha', 0, 500);
			TweenManager.tween(
				this.sprBg,
				'y',
				this.closeY(),
				500,
				undefined,
				cubicIn
			);
		}
	}

	scrim(amount: number, duration: number) {
		if (this.tweenScrim) TweenManager.abort(this.tweenScrim);
		this.tweenScrim = TweenManager.tween(
			this.sprScrim,
			'alpha',
			amount,
			duration
		);
	}
}
