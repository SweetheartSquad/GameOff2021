import { GameObject } from '../GameObject';

export abstract class Script {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	constructor(public gameObject: GameObject, ..._extra: unknown[]) {}

	init?(): void;
	update?(): void;
	destroy?(): void;
}
