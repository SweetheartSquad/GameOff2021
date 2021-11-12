import './resizer.css';

export enum ScaleModes {
	FIT = 'FIT',
	COVER = 'COVER',
	MULTIPLES = 'MULTIPLES', // scale up in multiples of original size
	NONE = 'NONE', // don't scale
}

const SCALE_LUT: {
	[key in ScaleModes]: (
		containerWidth: number,
		containerHeight: number,
		baseWidth: number,
		baseHeight: number,
		ratio: number
	) => [number, number, number];
} = {
	[ScaleModes.FIT]: function scaleToFit(
		containerWidth,
		containerHeight,
		baseWidth,
		_baseHeight,
		ratio
	) {
		let width = containerWidth;
		let height = containerHeight;
		if (width / height < ratio) {
			height = Math.round(width / ratio);
		} else {
			width = Math.round(height * ratio);
		}
		return [width, height, width / baseWidth];
	},
	[ScaleModes.NONE]: function scaleNone(
		_containerWidth,
		_containerHeight,
		baseWidth,
		baseHeight
	) {
		return [baseWidth, baseHeight, 1];
	},
	[ScaleModes.MULTIPLES]: function scaleInMultiples(
		containerWidth,
		containerHeight,
		baseWidth,
		baseHeight,
		ratio
	) {
		let width = containerWidth;
		let height = containerHeight;
		if (width / height < ratio) {
			height = Math.round(width / ratio);
		} else {
			width = Math.round(height * ratio);
		}

		let scaleMultiplier = 1;
		let aw = Math.min(baseWidth, width);
		let ah = Math.min(baseHeight, height);

		while (aw + baseWidth <= width || ah + baseHeight <= height) {
			aw += baseWidth;
			ah += baseHeight;
			scaleMultiplier += 1;
		}
		return [aw, ah, scaleMultiplier];
	},
	[ScaleModes.COVER]: function scaleToCover(
		containerWidth,
		containerHeight,
		baseWidth,
		_baseHeight,
		ratio
	) {
		let width = containerWidth;
		let height = containerHeight;
		if (width / height < ratio) {
			width = Math.round(height * ratio);
		} else {
			height = Math.round(width / ratio);
		}

		return [width, height, width / baseWidth];
	},
};

export class Resizer {
	element: HTMLDivElement;

	childElement: HTMLDivElement;

	ratio: number;

	scaleMultiplier: number;

	constructor(
		public baseWidth: number,
		public baseHeight: number,
		public scaleMode = ScaleModes.FIT
	) {
		this.element = document.createElement('div');
		this.childElement = document.createElement('div');
		this.element.appendChild(this.childElement);
		this.element.className = 'resizer';
		this.childElement.className = 'resizerChild';

		this.ratio = this.baseWidth / this.baseHeight;

		this.scaleMultiplier = 1;

		window.onresize = this.onResize;

		this.onResize();
	}

	onResize = (): void => {
		const [w, h, scaleMultiplier] = SCALE_LUT[this.scaleMode](
			this.element.offsetWidth,
			this.element.offsetHeight,
			this.baseWidth,
			this.baseHeight,
			this.ratio
		);

		this.childElement.style.width = `${w}px`;
		this.childElement.style.height = `${h}px`;
		this.childElement.style.top = '0';
		this.childElement.style.left = '0';
		this.childElement.style.fontSize = `${scaleMultiplier * 100}%`;
		this.scaleMultiplier = scaleMultiplier;
	};

	appendChild(element: HTMLElement): void {
		this.childElement.appendChild(element);
		this.onResize();
	}
}
