/* eslint-disable class-methods-use-this */
import ease from 'eases';
import Strand from 'strand-core';
import { Area } from './Area';
import { Block } from './Block';
import { GameObject } from './GameObject';
import { Goto } from './Goto';
import { Interrupt } from './Interrupt';
import { setScene } from './main';
import { NPC } from './NPC';
import { PhysicsScene } from './PhysicsScene';
import { Prop } from './Prop';
import { TweenManager } from './Tweens';
import { chunks } from './utils';

let autolink = 0;
export class StrandE extends Strand {
	public scene!: PhysicsScene;

	public debug?: boolean;

	public gameObject?: GameObject;

	public voice?: string;

	ease = ease;

	setSource(src: string) {
		autolink = 0;
		super.setSource(
			src
				// replacer link sugar
				.replace(
					/\[{2}(.*?)>(.*?)\]{2}/gm,
					// @ts-ignore
					(_: never, label: string, target: string) =>
						`[[${label || '...'}|this.goto(\`${target}\`)]]`
				)
				// auto link sugar
				.replace(
					/^>(.*)/gm,
					// @ts-ignore
					(_: never, link: string) =>
						link === '>'
							? `>${link}`
							: `[[${
								link || '...'
							  }|this.goto('auto-${++autolink}')]]\n\n::auto-${autolink}\n`
				)
		);

		// create passage select for debugging purposes
		const passages = Object.keys(this.passages)
			.filter((i) => !i.match(/\d/))
			.map((i) => `[[${i}]]`);
		const pages = chunks(passages, 25);
		pages.forEach((i, idx) => {
			if (pages.length > 1) {
				i.push(`[[passage select ${(idx + 1) % pages.length}]]`);
			}
			i.push('[[back|this.back()]]');
			this.passages[`passage select ${idx}`] = {
				title: `passage select ${idx}`,
				body: i.join('\n'),
			};
		});
		this.passages['passage select'] = this.passages['passage select 0'];
	}

	show(image: string, duration?: number) {
		this.scene.dialogue.show(image, duration);
	}

	tween(...args: Parameters<typeof TweenManager['tween']>) {
		// @ts-ignore
		TweenManager.tween(...args);
	}

	restart() {
		const p = this.scene.screenFilter.targetPalette;
		const newScene = new PhysicsScene();
		newScene.screenFilter.targetPalette = p;
		setScene(newScene);
	}

	Area(name: string, objects: GameObject[]) {
		this.scene.areas[name] = objects;
		Area.unmount(objects);
	}

	Npc(...args: ConstructorParameters<typeof NPC>) {
		return new NPC(...args);
	}

	Goto(...args: ConstructorParameters<typeof Goto>) {
		return new Goto(...args);
	}

	Prop(...args: ConstructorParameters<typeof Prop>) {
		return new Prop(...args);
	}

	Block(...args: ConstructorParameters<typeof Block>) {
		return new Block(...args);
	}

	Interrupt(...args: ConstructorParameters<typeof Interrupt>) {
		return new Interrupt(...args);
	}
}
