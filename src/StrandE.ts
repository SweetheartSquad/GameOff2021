/* eslint-disable class-methods-use-this */
import browserLang from 'browser-lang';
import ease from 'eases';
import { Text, TextStyle } from 'pixi.js';
import Strand from 'strand-core';
import { Area } from './Area';
import { music, sfx } from './Audio';
import { Block } from './Block';
import { fontIngame } from './font';
import { resources } from './Game';
import { GameObject } from './GameObject';
import { GameScene } from './GameScene';
import { Goto } from './Goto';
import { Interrupt } from './Interrupt';
import { setScene } from './main';
import { NPC } from './NPC';
import { Poly } from './Poly';
import { Prop } from './Prop';
import { PropParallax } from './PropParallax';
import { Display } from './Scripts/Display';
import { Transform } from './Scripts/Transform';
import { TweenManager } from './Tweens';
import { chunks, removeFromArray, shuffle } from './utils';

let autolink = 0;
const promptDefault = '...';
export class StrandE extends Strand {
	public scene!: GameScene;

	public debug?: boolean;

	public gameObject?: GameObject;

	public voice?: string;

	ease = ease;

	language?: string;

	setSource(src: string) {
		autolink = 0;
		super.setSource(
			src
				// replacer link sugar
				.replace(
					/\[{2}(.*?)>(.*?)\]{2}/gm,
					(_: string, label: string, target: string) =>
						`[[${label || promptDefault}|this.goto(\`${target}\`)]]`
				)
				// auto link sugar
				.replace(/^>(.*)/gm, (_: string, link: string) =>
					link === '>'
						? `>${link}`
						: `[[${
								link || promptDefault
						  }|this.goto('auto-${++autolink}')]]\n\n::auto-${autolink}\n`
				)
				// auto link escape
				.replace(/^\\>/gm, '>')
				// voice sugar
				.replace(
					/^voice(\w+)$/gm,
					(_: string, voice: string) => `<<do this.voice='${voice}'>>`
				)
		);

		// create passage select for debugging purposes
		const passages = Object.keys(this.passages)
			.filter((i) => !i.match(/\d/))
			.map((i) => `[[${i}]]`);
		const pages = chunks(passages, 23);
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

		// create language select for debugging purposes
		const languageLabels: Partial<{ [key: string]: string }> = {
			en: 'English',
		};
		const languages = Object.keys(resources)
			.filter((i) => i.startsWith('main-'))
			.map((i) => i.split('-').slice(1).join('-'));

		this.language = languages.includes(this.language || '')
			? this.language
			: browserLang({
				languages,
				fallback: 'en',
			  });
		document.documentElement.lang = this.language || 'en';

		this.passages['language select'] = {
			title: 'language select',
			body: languages
				.map(
					(i) =>
						`[[${
							languageLabels[i] || i
						}|this.language='${i}';this.setSource(game.app.loader.resources['main-${i}'].data);this.back();]]`
				)
				.concat('[[back|this.back()]]')
				.join('\n'),
		};
	}

	show(...args: Parameters<typeof this.scene['dialogue']['show']>) {
		return this.scene.dialogue.show(...args);
	}

	tween(...args: Parameters<typeof TweenManager['tween']>) {
		// just a pass-through
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		return TweenManager.tween(...args);
	}

	shuffle(...args: Parameters<typeof shuffle>) {
		return shuffle(...args);
	}

	scrim(...args: Parameters<typeof this.scene['dialogue']['scrim']>) {
		this.scene.dialogue.scrim(...args);
	}

	sfx(...args: Parameters<typeof sfx>) {
		return sfx(...args);
	}

	music(...args: Parameters<typeof music>) {
		return music(...args);
	}

	destroy(gameObject: GameObject) {
		gameObject.destroy();
		Object.values(this.scene.areas).forEach((i) => {
			removeFromArray(i, gameObject);
		});
	}

	restart() {
		const p = this.scene.screenFilter.targetPalette;
		const newScene = new GameScene();
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

	PropParallax(...args: ConstructorParameters<typeof PropParallax>) {
		return new PropParallax(...args);
	}

	Text(
		str: string,
		{
			x = 0,
			y = 0,
			font,
		}: { x?: number; y?: number; font?: Partial<TextStyle> } = {}
	) {
		const go = new GameObject();
		const transform = new Transform(go);
		go.scripts.push(transform);
		const display = new Display(go);
		go.scripts.push(display);
		const text = new Text(str, { ...fontIngame, ...font });
		display.container.addChild(text);
		display.container.x = transform.x = x;
		display.container.y = transform.y = y;
		return go;
	}

	Block(...args: ConstructorParameters<typeof Block>) {
		return new Block(...args);
	}

	Poly(...args: ConstructorParameters<typeof Poly>) {
		return new Poly(...args);
	}

	Interrupt(...args: ConstructorParameters<typeof Interrupt>) {
		return new Interrupt(...args);
	}
}
