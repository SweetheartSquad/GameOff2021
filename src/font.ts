import type { ITextStyle } from 'pixi.js';

export const fontDialogue: Partial<ITextStyle> = {
	fontFamily: 'font',
	fontSize: 18,
	fill: 0xffffff,
	align: 'left',
	lineHeight: 20,
	letterSpacing: 1,
};
export const fontPrompt: Partial<ITextStyle> = {
	fontFamily: 'font',
	fontWeight: 'bold',
	fontSize: 18,
	fill: 0xffffff,
	stroke: 0,
	strokeThickness: 8,
	lineJoin: 'round',
	align: 'center',
	lineHeight: 20,
	letterSpacing: 3,
};
