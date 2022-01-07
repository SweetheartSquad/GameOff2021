/* eslint-disable import/no-import-module-exports */
import { Application } from 'pixi.js';
import mainen from './assets/main-en.strand';
import maines419 from './assets/main-es-419.strand';
import { DEBUG } from './debug';

export { mainen, maines419 };

export function enableHotReload(app: Application) {
	function onHotReload() {
		app.loader.reset();
		app.loader.add('main-en', mainen);
		app.loader.add('main-es-419', maines419);
		app.loader.onComplete.once(() => {
			// @ts-ignore
			window.scene.strand.setSource(
				// @ts-ignore
				app.loader.resources[`main-${window.scene.strand.language || 'en'}`]
					.data
			);
			// @ts-ignore
			if (window.scene.strand.currentPassage?.title) {
				// @ts-ignore
				window.scene.strand.goto(window.scene.strand.currentPassage.title);
			}
		});
		app.loader.load();
	}
	// allow hot-reloading main.strand
	if (DEBUG) {
		// @ts-ignore
		if (module.hot) {
			// @ts-ignore
			module.hot.accept('./assets/main-en.strand', onHotReload);
			// @ts-ignore
			module.hot.accept('./assets/main-es-419.strand', onHotReload);
		}
	}
}
