// setup inputs
export class Mouse {
	wheelY: number;

	wheelX: number;

	x: number;

	y: number;

	down: boolean;

	justDown: boolean;

	justUp: boolean;

	delta: {
		x: number;
		y: number;
	};

	prev: {
		x: number;
		y: number;
	};

	lock: boolean;

	element: HTMLElement;

	constructor(element: HTMLElement, lock: boolean) {
		this.down = false;
		this.justDown = false;
		this.justUp = false;

		this.x = 0;
		this.y = 0;
		this.delta = {
			x: 0,
			y: 0,
		};
		this.prev = {
			x: 0,
			y: 0,
		};
		this.wheelY = 0;
		this.wheelX = 0;

		this.element = element;
		this.element.addEventListener('pointerup', this.onUp);
		this.element.addEventListener('pointerout', this.onUp);
		this.element.addEventListener('pointerdown', this.onDown);
		this.element.addEventListener('pointermove', this.onMove);
		this.element.addEventListener('wheel', this.onWheel);
		this.lock = !!lock;
		if (this.lock) {
			this.lockMouse();
		}
	}

	lockMouse(): void {
		this.element.requestPointerLock();
	}

	update(): void {
		this.justDown = false;
		this.justUp = false;

		this.wheelY = 0;
		this.wheelX = 0;

		// save old position
		this.prev.x = this.x;
		this.prev.y = this.y;
		// calculate delta position
		this.delta.x = 0;
		this.delta.y = 0;
	}

	onDown = (): void => {
		if (!this.down) {
			this.down = true;
			this.justDown = true;
		}
		if (this.lock) {
			this.lockMouse();
		}
	};

	onUp = (): void => {
		this.down = false;
		this.justDown = false;
		this.justUp = true;
	};

	onMove = (event: MouseEvent): void => {
		if (this.lock) {
			if (!document.hasFocus()) {
				return;
			}
			this.delta.x = event.movementX;
			this.delta.y = event.movementY;
			this.x += this.delta.x;
			this.y += this.delta.y;
			return;
		}
		// get new position
		this.x = event.clientX - this.element.offsetLeft;
		this.y = event.clientY - this.element.offsetTop;
		// calculate delta position
		this.delta.x = this.x - this.prev.x;
		this.delta.y = this.y - this.prev.y;
	};

	onWheel = (event: WheelEvent): void => {
		this.wheelY =
			event.deltaY ||
			(event as unknown as { originalEvent?: { wheelDelta?: number } })
				.originalEvent?.wheelDelta ||
			0;
		this.wheelX = event.deltaX;
	};

	isDown(): boolean {
		return this.down;
	}

	isUp(): boolean {
		return !this.isDown();
	}

	isJustDown(): boolean {
		return this.justDown;
	}

	isJustUp(): boolean {
		return this.justUp;
	}

	// returns -1 when moving down, 1 when moving up, 0 when not moving
	getWheelDir(): -1 | 1 | 0 {
		return Math.sign(this.wheelY) as -1 | 1 | 0;
	}
}
