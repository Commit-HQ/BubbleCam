// Playing a film in the viewfinder, round and round, at its speed. Its pictures are full-size JPEG files, so a
// few of them are decoded ahead of the one on screen and let go once shown; a short film is kept decoded whole,
// so it loops without decoding anything again. If a slow device hasn't decoded the next picture in time, the
// one on screen simply stays a little longer, as it would on a film projector. Browser-only.

import { decode } from './decode.ts';

/** How many pictures are decoded ahead of the one on screen. */
const ahead = 10;

export class Player {
	#canvas: HTMLCanvasElement;
	#load: (frameId: string) => Promise<Blob | undefined>;
	#frames: string[] = [];
	#fps = 8;
	/** Decoded pictures by their place in the film, or null for one that couldn't be read, which is skipped. */
	#ready = new Map<number, ImageBitmap | null>();
	#loading = new Set<number>();
	#index = 0;
	#due = 0;
	#frame = 0;
	/** Counts starts and stops, so a picture decoded for an earlier playing is let go rather than shown. */
	#run = 0;
	/** Called with each picture's place in the film as it shows. */
	onshow: ((index: number) => void) | undefined;

	constructor(canvas: HTMLCanvasElement, load: (frameId: string) => Promise<Blob | undefined>) {
		this.#canvas = canvas;
		this.#load = load;
	}

	/** Plays `frames` from the picture at `from`, at `fps` pictures a second, until stopped. */
	play(frames: string[], fps: number, from = 0) {
		this.stop();
		if (!frames.length) return;
		this.#frames = frames;
		this.#fps = fps;
		this.#index = from % frames.length;
		this.#due = performance.now();
		this.#prefetch();
		this.#frame = requestAnimationFrame(this.#tick);
	}

	/** Changes the speed while playing. */
	set fps(fps: number) {
		this.#fps = fps;
	}

	stop() {
		cancelAnimationFrame(this.#frame);
		this.#run++;
		for (const picture of this.#ready.values()) picture?.close();
		this.#ready.clear();
		this.#loading.clear();
	}

	#tick = (now: number) => {
		this.#frame = requestAnimationFrame(this.#tick);
		if (now < this.#due) return;
		const count = this.#frames.length;
		const picture = this.#ready.get(this.#index);
		if (picture === undefined) return;
		const shown = this.#index;
		this.#index = (shown + 1) % count;
		if (picture) {
			const context = this.#canvas.getContext('2d')!;
			if (this.#canvas.width !== picture.width) this.#canvas.width = picture.width;
			if (this.#canvas.height !== picture.height) this.#canvas.height = picture.height;
			context.drawImage(picture, 0, 0);
			this.onshow?.(shown);
			const step = 1000 / this.#fps;
			// Keep time, unless a slow decode left playing more than a picture behind.
			this.#due = now - this.#due > step ? now + step : this.#due + step;
		}
		if (count > ahead) {
			picture?.close();
			this.#ready.delete(shown);
		}
		this.#prefetch();
	};

	#prefetch() {
		const count = this.#frames.length;
		const run = this.#run;
		for (let step = 0; step < Math.min(count, ahead); step++) {
			const index = (this.#index + step) % count;
			if (this.#ready.has(index) || this.#loading.has(index)) continue;
			this.#loading.add(index);
			void decode(this.#load, this.#frames[index]).then((picture) => {
				if (run !== this.#run) return picture?.close();
				this.#loading.delete(index);
				this.#ready.set(index, picture);
			});
		}
	}
}
