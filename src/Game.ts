import HowlerMiddleware from 'howler-pixi-loader-middleware';
import {
	Application,
	Loader,
	Renderer,
	SCALE_MODES,
	settings,
	Text,
} from 'pixi.js';
import assets from './assets.txt';
import frag from './assets/postprocess.frag.glsl';
import * as fonts from './font';
import { enableHotReload, mainen, maines419 } from './GameHotReload';
import { init } from './main';
import { size } from './size';

// PIXI configuration stuff
settings.SCALE_MODE = SCALE_MODES.NEAREST;
settings.ROUND_PIXELS = true;

function cacheBust(url: string) {
	const urlObj = new URL(url, window.location.href);
	// @ts-ignore
	urlObj.searchParams.set('t', process.env.HASH);
	return urlObj.toString();
}

class Game {
	app: Application;

	startTime: number;

	constructor() {
		const canvas = document.createElement('canvas');
		this.app = new Application({
			view: canvas,
			width: size.x,
			height: size.y,
			antialias: false,
			backgroundAlpha: 1,
			resolution: 1,
			clearBeforeRender: true,
			backgroundColor: 0x000000,
		});
		this.startTime = Date.now();

		this.app.loader.pre(HowlerMiddleware);
	}

	load({
		onLoad,
		onComplete,
		onError,
	}: {
		onLoad: Loader.OnLoadSignal;
		onComplete: () => void;
		onError: (error: Error) => void;
	}): void {
		this.app.loader.onError.add(onError);
		this.app.loader.add({ name: 'assets', url: cacheBust(assets) });
		this.app.loader.onComplete.once(() => {
			const assetResources = (this.app.loader.resources.assets.data as string)
				.trim()
				.split(/\r?\n/)
				.flatMap((i) => {
					if (i.match(/\.x\d+\./)) {
						const [base, count, ext] = i.split(/\.x(\d+)\./);
						return new Array(parseInt(count, 10))
							.fill('')
							.map((_, idx) => `${base}.${idx + 1}.${ext}`);
					}
					return i;
				})
				.filter((i) => i && !i.startsWith('//'))
				.map((i) => ({
					url: cacheBust(i.startsWith('http') ? i : `assets/${i}`),
					name: i.split('/').pop()?.split('.').slice(0, -1).join('.') || i,
				}));
			this.app.loader.reset();
			this.app.loader.add(assetResources);
			this.app.loader.add({ name: 'frag', url: cacheBust(frag) });
			this.app.loader.add({ name: 'main-en', url: cacheBust(mainen) });
			this.app.loader.add({ name: 'main-es-419', url: cacheBust(maines419) });
			this.app.loader.onLoad.add(onLoad);
			this.app.loader.onComplete.once(onComplete);
			this.app.loader.onComplete.once(init);
			this.app.loader.load();
			// eslint-disable-next-line @typescript-eslint/no-use-before-define
			resources = this.app.loader.resources;

			// preload fonts
			Object.values(fonts).forEach((i) => {
				const t = new Text('preload', i);
				t.alpha = 0;
				this.app.stage.addChild(t);
				this.app.stage.render(this.app.renderer as Renderer);
				this.app.stage.removeChild(t);
			});
		});
		this.app.loader.load();
	}
}

export const game = new Game();
// @ts-ignore
window.game = game;
// eslint-disable-next-line import/no-mutable-exports
export let resources: Loader['resources'];

enableHotReload(game.app);
