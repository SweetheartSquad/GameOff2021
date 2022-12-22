/* eslint-disable import/no-import-module-exports */
import { Application } from 'pixi.js';
import mainen from './assets/main-en.strand';
import maines419 from './assets/main-es-419.strand';
import mainfr from './assets/main-fr.strand';
import { DEBUG } from './debug';

export { mainen, maines419, mainfr };

export function enableHotReload(app: Application) {
	function onHotReload() {
		app.loader.reset();
		app.loader.add('main-en', mainen);
		app.loader.add('main-es-419', maines419);
		app.loader.add('main-fr', mainfr);
		app.loader.onComplete.once(() => {
			if (!window.scene) throw new Error('Could not find scene');
			window.scene.strand.setSource(
				app.loader.resources[`main-${window.scene.strand.language || 'en'}`]
					.data
			);
			if (window.scene.strand.currentPassage?.title) {
				window.scene.strand.goto(window.scene.strand.currentPassage.title);
			}
		});
		app.loader.load();
	}
	// allow hot-reloading main.strand
	if (DEBUG) {
		if (module.hot) {
			module.hot.accept('./assets/main-en.strand', onHotReload);
			module.hot.accept('./assets/main-es-419.strand', onHotReload);
			module.hot.accept('./assets/main-fr.strand', onHotReload);
		}
	}
}
