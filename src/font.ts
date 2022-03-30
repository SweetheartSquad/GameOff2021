import type { ITextStyle } from 'pixi.js';

export const fontDialogue: Partial<ITextStyle> = {
	fontFamily: 'font',
	fontSize: 24,
	fill: 0xffffff,
	align: 'left',
	lineHeight: 26,
	letterSpacing: -1,
	padding: 30,
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
	padding: 30,
};
export const fontIngame: Partial<ITextStyle> = {
	fontFamily: 'font',
	fontSize: 18,
	fill: 0xffffff,
	align: 'center',
	lineHeight: 20,
	letterSpacing: -1,
	padding: 30,
};
