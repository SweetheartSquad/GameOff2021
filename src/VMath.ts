export interface V {
	x: number;
	y: number;
}
export function clone(v: V): V {
	return { x: v.x, y: v.y };
}

/** sets dest to be a copy of src */
export function copy(dest: V, src: V): void {
	dest.x = src.x;
	dest.y = src.y;
}

/** returns `a • b` */
export function dot(a: V, b: V): number {
	return a.x * b.x + a.y * b.y;
}

export function multiply(v: V, s: number): V {
	return { x: v.x * s, y: v.y * s };
}

export function divide(v: V, s: number): V {
	return multiply(v, 1 / s);
}

export function add(a: V, b: V): V {
	return { x: a.x + b.x, y: a.y + b.y };
}

export function subtract(a: V, b: V): V {
	return { x: a.x - b.x, y: a.y - b.y };
}

export function magnitude2(v: V): number {
	return v.x * v.x + v.y * v.y;
}

export function magnitude(v: V): number {
	return Math.sqrt(magnitude2(v));
}

export function distance(a: V, b: V): number {
	return magnitude(subtract(a, b));
}

export function distance2(a: V, b: V): number {
	return magnitude2(subtract(a, b));
}

/* EDITS THIS OBJECT */
export function normalize(v: V): void {
	const m = magnitude(v);
	v.x *= m;
	v.y *= m;
}

/* returns a copy; DOES NOT EDIT THIS OBJECT */
export function normalized(v: V): V {
	return divide(v, magnitude(v));
}

export function reflect(ray: V, normal: V): V {
	return subtract(ray, multiply(normal, 2 * dot(ray, normal)));
}
