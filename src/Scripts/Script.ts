import { GameObject } from '../GameObject';

export abstract class Script {
	constructor(public gameObject: GameObject, ..._extra: unknown[]) {}

	init?(): void;
	update?(): void;
	destroy?(): void;
}
