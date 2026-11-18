// A shutter that presses itself once the picture has settled. A child moves a toy, takes the hand away, and
// the picture is taken when nothing in front of the camera has moved for a moment, so nobody walks round to the
// phone for each one. The camera's picture is looked at ten times a second, tiny and grey: what changed since
// the look before says whether something is moving, and what changed since the last picture says whether a toy
// was moved so slowly that no single look caught it. The microphone has no part in it, so it works in a noisy
// room. `Stillness` decides, and is plain arithmetic; `Eye` does the looking, in the browser.

import type { Rect } from './geometry.ts';

/** How often the camera's picture is looked at, in milliseconds. */
export const lookEvery = 100;

/** The long side of the picture that's compared, in pixels: enough to see a hand, too few to see camera noise. */
const lookLong = 64;

/** How far a pixel's brightness, of 255, has to be from what it was to count as changed. */
const differs = 24;

export const stillness = {
	/** The share of the picture that has to change, between two looks or since the last picture, to be a move. */
	moves: 0.015,
	/** The share that may still change between two looks while the picture counts as still. */
	rests: 0.004,
	/** How long the picture has to stay still before it's taken, in milliseconds. */
	holds: 1000
};

/** Waiting for something to move, watching it move, or counting how long it has been still. */
export type StillState = 'waiting' | 'moving' | 'settling';

/** The share of two grey pictures' pixels that differ, from 0 to 1. Pictures of different sizes differ wholly. */
export function changed(one: Uint8Array, other: Uint8Array) {
	if (one.length !== other.length || !one.length) return 1;
	let count = 0;
	for (let i = 0; i < one.length; i++) if (Math.abs(one[i] - other[i]) > differs) count++;
	return count / one.length;
}

export class Stillness {
	state: StillState = 'waiting';
	/** How much of the wait for a still picture has passed, from 0 to 1. */
	progress = 0;
	/** The look before this one, and the look when the last picture was taken or the watch began. */
	#before: Uint8Array | undefined;
	#taken: Uint8Array | undefined;
	#since = 0;

	/**
	 * Takes one look at the camera's picture, at `now` on the page's clock, and says whether a picture should be
	 * taken: something moved, and nothing has since for long enough.
	 */
	feed(look: Uint8Array, now: number) {
		const before = this.#before;
		this.#before = look;
		// The first look, or the first after the phone was turned, is what the others are held against.
		if (!before || !this.#taken || before.length !== look.length) {
			this.#taken = look;
			this.state = 'waiting';
			this.progress = 0;
			return false;
		}
		const stirs = changed(before, look);
		if (stirs >= stillness.moves) return this.#moving();
		if (this.state === 'waiting') {
			// A toy nudged a hair at a time never moves much between two looks.
			if (changed(this.#taken, look) >= stillness.moves) this.#moving();
			return false;
		}
		if (stirs > stillness.rests) return this.#moving();
		if (this.state === 'moving') {
			this.state = 'settling';
			this.#since = now;
		}
		this.progress = Math.min(1, (now - this.#since) / stillness.holds);
		if (this.progress < 1) return false;
		this.reset();
		return true;
	}

	#moving() {
		this.state = 'moving';
		this.progress = 0;
		return false;
	}

	/** Starts over, as after a picture: the next look is what the ones after it are held against. */
	reset() {
		this.state = 'waiting';
		this.progress = 0;
		this.#before = undefined;
		this.#taken = undefined;
	}
}

/** Looks at the camera's picture: the part a picture keeps, small and grey. Browser-only. */
export class Eye {
	#canvas: HTMLCanvasElement | undefined;

	/** One look at `crop` of what `video` shows now, or nothing where the browser can't read it. */
	look(video: HTMLVideoElement, crop: Rect): Uint8Array | undefined {
		const scale = lookLong / Math.max(crop.width, crop.height);
		const width = Math.max(1, Math.round(crop.width * scale));
		const height = Math.max(1, Math.round(crop.height * scale));
		const canvas = (this.#canvas ??= document.createElement('canvas'));
		if (canvas.width !== width) canvas.width = width;
		if (canvas.height !== height) canvas.height = height;
		const context = canvas.getContext('2d', { willReadFrequently: true });
		if (!context) return undefined;
		try {
			context.drawImage(video, crop.x, crop.y, crop.width, crop.height, 0, 0, width, height);
			const { data } = context.getImageData(0, 0, width, height);
			const grey = new Uint8Array(width * height);
			for (let i = 0; i < grey.length; i++) {
				grey[i] = (data[i * 4] * 77 + data[i * 4 + 1] * 150 + data[i * 4 + 2] * 29) >> 8;
			}
			return grey;
		} catch {
			return undefined;
		}
	}
}
