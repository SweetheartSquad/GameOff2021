import { Texture, WRAP_MODES } from 'pixi.js';
import { CustomFilter } from './CustomFilter';
import { resources } from './Game';
import { contrastDiff, lerp, reduceGrayscale } from './utils';

export class ScreenFilter extends CustomFilter<{
	whiteout: number;
	invert: number;
	curTime: number;
	camPos: [number, number];
	fg: [number, number, number];
	bg: [number, number, number];
	ditherGridMap: Texture;
}> {
	targetPalette: [[number, number, number], [number, number, number]];

	constructor() {
		super(resources.frag.data);
		this.uniforms.whiteout = 0;
		this.uniforms.invert = 0;
		this.uniforms.curTime = 0;
		this.uniforms.camPos = [0, 0];
		this.uniforms.fg = [255, 255, 255];
		this.uniforms.bg = [0, 0, 0];
		this.targetPalette = [this.uniforms.bg, this.uniforms.fg];
		(resources.ditherGrid.texture as Texture).baseTexture.wrapMode =
			WRAP_MODES.REPEAT;
		this.uniforms.ditherGridMap = resources.ditherGrid.texture as Texture;
		this.padding = 150;
		// @ts-ignore
		window.screenFilter = this;
	}

	palette(bg = this.uniforms.bg, fg = this.uniforms.fg) {
		this.targetPalette = [
			bg.map((i) => i) as [number, number, number],
			fg.map((i) => i) as [number, number, number],
		];
	}

	randomizePalette() {
		do {
			let fg = new Array(3)
				.fill(0)
				.map(() => Math.floor(Math.random() * 255)) as [number, number, number];
			let bg = new Array(3)
				.fill(0)
				.map(() => Math.floor(Math.random() * 255)) as [number, number, number];
			// reduce chance of darker fg than bg
			if (
				fg.reduce(reduceGrayscale, 0) < bg.reduce(reduceGrayscale, 0) &&
				Math.random() > 0.33
			) {
				[fg, bg] = [bg, fg];
			}
			this.palette(bg, fg);
		} while (contrastDiff(this.targetPalette[0], this.targetPalette[1]) < 50);
	}

	paletteToString() {
		return JSON.stringify(
			this.targetPalette.map((i) => i.map((c) => Math.floor(c)))
		);
	}

	update() {
		const [bg, fg] = this.targetPalette;
		this.uniforms.fg = fg.map((i, idx) =>
			lerp(this.uniforms.fg[idx], i, 0.1)
		) as [number, number, number];
		this.uniforms.bg = bg.map((i, idx) =>
			lerp(this.uniforms.bg[idx], i, 0.1)
		) as [number, number, number];
		document.body.style.backgroundColor = `rgb(${this.uniforms.bg
			.map((i) => Math.floor(i))
			.join(',')})`;
	}
}
