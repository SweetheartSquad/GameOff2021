import { game } from './Game';
import { lerp, removeFromArray } from './utils';

export type Tween = {
	/** target */
	t: any;
	/** property */
	p: string | number | symbol;
	/** from */
	a: number;
	/** to */
	b: number;
	/** duration */
	d: number;
	/** start */
	s: number;
	/** easing function */
	e: (t: number) => number;
};
export class TweenManager {
	static tweens: Tween[] = [];

	static tween<T, P extends keyof T, V extends T[P] & number>(
		target: T,
		property: keyof T,
		to: V,
		duration: number,
		from?: V,
		ease: (t: number) => number = (t) => t
	) {
		const t = {
			t: target,
			p: property,
			a: from ?? (target[property] as V),
			b: to,
			d: duration,
			s: game.app.ticker.lastTime,
			e: ease,
		};
		TweenManager.tweens.push(t);
		return t;
	}

	static abort(tween: Tween) {
		removeFromArray(TweenManager.tweens, tween);
	}

	static finish(tween: Tween) {
		tween.t[tween.p] = tween.b;
		removeFromArray(TweenManager.tweens, tween);
	}

	static update() {
		const curTime = game.app.ticker.lastTime;
		TweenManager.tweens.forEach((i) => {
			if (curTime > i.s + i.d) {
				i.t[i.p] = i.b;
				removeFromArray(TweenManager.tweens, i);
				return;
			}
			i.t[i.p] = lerp(i.a, i.b, i.e((curTime - i.s) / i.d));
		});
	}
}
