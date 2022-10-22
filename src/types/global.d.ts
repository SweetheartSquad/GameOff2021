import { Engine } from 'matter-js';
import { Text } from 'pixi.js';
import { Game } from '../Game';
import { GameObject } from '../GameObject';
import { GameScene } from '../GameScene';
import { Player } from '../Player';
import { ScreenFilter } from '../ScreenFilter';

declare global {
	interface Window {
		// various globals for debugging, quick hacks, etc
		scene?: GameScene;
		debugPhysics?: boolean;
		text?: Text;
		screenFilter?: ScreenFilter;
		engine?: Engine;
		gameObjects?: typeof GameObject['gameObjects'];
		game?: Game;
		player?: Player;
	}

	type Maybe<T> = T | undefined;
}
