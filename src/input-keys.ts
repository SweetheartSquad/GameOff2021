export enum KEYS {
	LEFT = 37,
	UP = 38,
	RIGHT = 39,
	DOWN = 40,

	ZERO = 48,
	ONE = 49,
	TWO = 50,
	THREE = 51,
	FOUR = 52,
	FIVE = 53,
	SIX = 54,
	SEVEN = 55,
	EIGHT = 56,
	NINE = 57,

	Q = 81,
	W = 87,
	E = 69,
	R = 82,
	T = 84,
	Y = 89,
	U = 85,
	I = 73,
	O = 79,
	P = 80,

	A = 65,
	S = 83,
	D = 68,
	F = 70,
	G = 71,
	H = 72,
	J = 74,
	K = 75,
	L = 76,

	Z = 90,
	X = 88,
	C = 67,
	V = 86,
	B = 66,
	N = 78,
	M = 77,

	SHIFT = 16,
	CTRL = 17,
	SPACE = 32,
	ENTER = 13,
	BACKSPACE = 8,
	ESCAPE = 27,
	SEMI_COLON = 186,
	SQUARE_BRACKET_OPEN = 219,
	SQUARE_BRACKET_CLOSE = 221,
	SINGLE_QUOTE = 222,
}

interface KeyStateMap {
	[key: number]: boolean;
}

class Keys {
	enabled = true;

	down: KeyStateMap;

	justDown: KeyStateMap;

	justUp: KeyStateMap;

	capture: KEYS[];

	constructor() {
		this.down = {};
		this.justDown = {};
		this.justUp = {};
		this.capture = [];
	}

	init(options: { capture?: KEYS[] }): void {
		document.addEventListener('keyup', this.onUp, {
			capture: true,
		});
		document.addEventListener('keydown', this.onDown, {
			capture: true,
		});

		this.capture = options.capture || [];
	}

	update(): void {
		if (!this.enabled) {
			this.down = {};
		}
		this.justDown = [];
		this.justUp = [];
	}

	onDown = (event: KeyboardEvent): boolean => {
		if (!this.enabled) return true;
		if (this.down[event.keyCode] !== true) {
			this.down[event.keyCode] = true;
			this.justDown[event.keyCode] = true;
		}
		if (this.capture.indexOf(event.keyCode) !== -1) {
			event.preventDefault();
			return false;
		}
		return true;
	};

	onUp = (event: KeyboardEvent): boolean => {
		if (!this.enabled) return true;
		this.down[event.keyCode] = false;
		this.justDown[event.keyCode] = false;
		this.justUp[event.keyCode] = true;
		if (
			this.capture.indexOf(event.keyCode) !== -1 &&
			(!document.activeElement || document.activeElement === document.body)
		) {
			event.preventDefault();
			return false;
		}
		return true;
	};

	isDown(key: KEYS): boolean {
		return this.down[key] === true;
	}

	isUp(key: KEYS): boolean {
		return !this.isDown(key);
	}

	isJustDown(key: KEYS): boolean {
		return this.justDown[key] === true;
	}

	isJustUp(key: KEYS): boolean {
		return this.justUp[key] === true;
	}
}

export const keys = new Keys();
