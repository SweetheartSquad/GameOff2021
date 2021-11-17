/* eslint-disable import/no-import-module-exports */
import { Application } from 'pixi.js';
import main from './assets/main.strand';
import { DEBUG } from './debug';

export { main };

export function enableHotReload(app: Application) {
	// allow hot-reloading main.strand
	if (DEBUG) {
		// @ts-ignore
		if (module.hot) {
			// @ts-ignore
			module.hot.accept('./assets/main.strand', () => {
				app.loader.reset();
				app.loader.add('main', main);
				app.loader.onComplete.once(() => {
					// @ts-ignore
					window.scene.strand.setSource(app.loader.resources.main.data);
					// @ts-ignore
					if (window.scene.strand.currentPassage?.title) {
						// @ts-ignore
						window.scene.strand.goto(window.scene.strand.currentPassage.title);
					}
				});
				app.loader.load();
			});
		}
	}
}
