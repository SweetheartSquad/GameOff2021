import { Filter, utils } from 'pixi.js';

export class CustomFilter<T extends utils.Dict<unknown>> extends Filter {
	constructor(fragmentSource: string) {
		super(undefined, fragmentSource);
	}

	override get uniforms(): T {
		return this.uniformGroup.uniforms as T;
	}
}
