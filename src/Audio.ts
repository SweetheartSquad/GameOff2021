import { Howl, Howler } from 'howler';
import { resources } from './Game';
import { delay } from './utils';

let muted = false;
export function toggleMute(): void {
	if (muted) {
		Howler.mute(false);
	} else {
		Howler.mute(true);
	}
	muted = !muted;
}

function getHowl(howl: string) {
	const h = resources[howl]?.data as Maybe<Howl>;
	if (!h) {
		console.warn(`Audio "${howl}" not found`);
	}
	return h;
}

let musicPlaying:
	| {
			music: string;
			howl: Howl;
			id: number;
			volume: number;
			rate: number;
	  }
	| undefined;

export function sfx(
	sfxName: string,
	{ rate = 1, volume = 1 }: { rate?: number; volume?: number } = {}
) {
	const howl = getHowl(sfxName);
	if (!howl) return undefined;
	const id = howl.play();
	howl.rate(rate, id);
	howl.volume(volume, id);
	return id;
}

export function music(
	musicName: string,
	{
		rate = 1,
		volume = 0.5,
		fade = 1000,
	}: { rate?: number; volume?: number; fade?: number } = {}
) {
	const playing = musicPlaying;
	if (
		playing?.music === musicName &&
		playing.volume === volume &&
		playing.rate === rate
	)
		return playing.id;
	if (playing) {
		playing.howl.fade(playing.volume, 0, fade, playing.id);
		delay(fade).then(() => {
			playing.howl.stop(playing.id);
		});
	}
	musicPlaying = undefined;
	if (!musicName) return undefined;
	const howl = getHowl(musicName);
	if (!howl) return undefined;
	const id = howl.play();
	howl.rate(rate, id);
	howl.loop(true, id);
	howl.fade(0, volume, fade, id);
	musicPlaying = {
		music: musicName,
		howl,
		id,
		volume,
		rate,
	};
	return id;
}
