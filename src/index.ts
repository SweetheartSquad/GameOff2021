// eslint-disable-next-line import/extensions
import pkg from '../package.json';
import './assets/style.css';
import { Resizer, ScaleModes } from './Resizer';
import { size } from './size';

let preloaded = false;

// 0 = preload doesn't visually affect loader progress
// 1 = asset load doesn't visually affect loader progress
// .5 = preload and asset load equally visually affect loader progress
const preloadWeight = 0.25;
let progress = 0;

function makeStr(mask: number) {
	return `${pkg.description}\n${(mask * 100).toFixed(0)}%`;
}

const progressEl = document.createElement('p');
progressEl.setAttribute('role', 'progressbar');
progressEl.setAttribute('aria-valuemin', '0');
progressEl.setAttribute('aria-valuemax', '100');
progressEl.textContent = makeStr(0);

// try to auto-focus and make sure the game can be focused with a click if run from an iframe
window.focus();
document.body.addEventListener('mousedown', () => {
	window.focus();
});

const resizer = new Resizer(size.x, size.y, ScaleModes.MULTIPLES);
document.body.appendChild(resizer.element);

const playEl = document.createElement('button');
playEl.id = 'play';
playEl.textContent = makeStr(0);
resizer.appendChild(playEl);

function fail({ message, error }: { message: string; error: unknown }): void {
	progressEl.textContent = `${message} - Sorry :(`;
	throw error;
}

function loadProgressHandler(loader?: { progress: number }): void {
	// called during loading
	if (loader?.progress !== undefined) {
		progress = loader.progress;
		if (preloaded) {
			progress *= 1 - preloadWeight;
			progress += preloadWeight * 100;
		} else {
			progress *= preloadWeight;
		}
	}
	const str = makeStr((progress || 0) / 100);
	progressEl.textContent = str;
	progressEl.setAttribute('aria-valuenow', (progress || 0).toString(10));
}

function play(): void {
	playEl.remove();

	resizer.appendChild(progressEl);

	// start the preload
	loadProgressHandler({ progress: 0 });
	const interval = setInterval(() => {
		loadProgressHandler();
	}, 100);

	Promise.all([import('./Game')]).then(
		([{ game }]) => {
			preloaded = true;
			try {
				// start the actual load
				loadProgressHandler({ progress: 0 });

				game.load({
					onLoad: loadProgressHandler,
					onComplete: () => {
						progressEl.remove();
						resizer.appendChild(game.app.view);
					},
					onError: (error: Error) => {
						fail({
							message: error.message,
							error,
						});
					},
				});
			} catch (error) {
				fail({
					message: 'Something went wrong',
					error,
				});
			} finally {
				clearInterval(interval);
			}
		},
		(error) => {
			clearInterval(interval);
			preloaded = true;
			fail({
				message: 'Something went wrong',
				error,
			});
		}
	);
}

playEl.onclick = play;
if (process.env.NODE_ENV === 'development') {
	// @ts-ignore
	window.debugPhysics = true;
	playEl.click();
}

interface LoadedEvent {
	detail: { loaded: number; total: number; resource: { url: string } };
}

// @ts-ignore
document.addEventListener(
	'chunk-progress-webpack-plugin',
	({ detail: { loaded, total } }: LoadedEvent) => {
		loadProgressHandler({
			progress: (loaded / total) * 100,
		});
	}
);
