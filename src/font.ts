import type { ITextStyle } from 'pixi.js';

export const fontDialogue: Partial<ITextStyle> = {
	fontFamily: 'font',
	fontSize: 24,
	fill: 0xffffff,
	align: 'left',
	lineHeight: 26,
	letterSpacing: -1,
};
export const fontPrompt: Partial<ITextStyle> = {
	fontFamily: 'font',
	fontSize: 24,
	fill: 0xffffff,
	stroke: 0,
	strokeThickness: 8,
	lineJoin: 'round',
	align: 'center',
	lineHeight: 26,
	letterSpacing: 3,
};
