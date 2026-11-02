// Taking a picture. The camera's current picture is drawn at the film's size straight away, which is all the
// tap waits for: the ghost shows it at once. Encoding it as JPEG files takes a phone tens of milliseconds, so a
// worker does that (encode.worker.ts) while the next picture is being lined up. Browsers without canvases in
// workers, such as Safari before 16.4, encode on the page instead. Browser-only.

import { thumbSize, type Rect, type Size } from './geometry.ts';

/** A picture's files: the picture itself and its thumbnail, both JPEG. */
export type Picture = { image: Blob; thumb: Blob };

type Reply = { id: number; image: Blob; thumb: Blob } | { id: number; error: string };

/** Whether this browser draws and encodes on canvases in workers. */
function workersDraw() {
	try {
		return (
			typeof OffscreenCanvas === 'function' &&
			'convertToBlob' in OffscreenCanvas.prototype &&
			new OffscreenCanvas(1, 1).getContext('2d') !== null
		);
	} catch {
		return false;
	}
}

function toBlob(canvas: HTMLCanvasElement, quality: number) {
	return new Promise<Blob>((resolve, reject) =>
		canvas.toBlob(
			(blob) => (blob ? resolve(blob) : reject(new Error('The picture could not be encoded'))),
			'image/jpeg',
			quality
		)
	);
}

export class Shutter {
	#worker: Worker | undefined;
	#jobs = new Map<
		number,
		{ resolve: (picture: Picture) => void; reject: (error: Error) => void }
	>();
	#nextJob = 0;
	#offscreen = workersDraw();
	#canvas: OffscreenCanvas | HTMLCanvasElement | undefined;

	/**
	 * Takes what the camera shows now: the part `crop` marks, at the film's `size`, mirrored for a camera that
	 * faces the child, as the viewfinder shows it. It's drawn on `ghost` at once, and its files follow.
	 */
	take(
		video: HTMLVideoElement,
		crop: Rect,
		size: Size,
		mirror: boolean,
		ghost: HTMLCanvasElement
	): Promise<Picture> {
		// A worker that can't start, as where scripts can't make workers, leaves encoding to the page.
		if (this.#offscreen && !this.#worker) {
			try {
				this.#worker = this.#startWorker();
			} catch {
				this.#workerFailed();
			}
		}
		const canvas = this.#canvasOf(size);
		const context = canvas.getContext('2d') as
			OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
		context.setTransform(mirror ? -1 : 1, 0, 0, 1, mirror ? size.width : 0, 0);
		context.drawImage(
			video,
			crop.x,
			crop.y,
			crop.width,
			crop.height,
			0,
			0,
			size.width,
			size.height
		);
		context.setTransform(1, 0, 0, 1, 0, 0);
		// Resizing a canvas clears it, so it's done only for a new film's size; a picture covers it whole.
		if (ghost.width !== size.width) ghost.width = size.width;
		if (ghost.height !== size.height) ghost.height = size.height;
		ghost.getContext('2d')!.drawImage(canvas, 0, 0);
		const thumb = thumbSize(size);
		if (canvas instanceof HTMLCanvasElement) return this.#encodeHere(canvas, thumb);
		return this.#encodeInWorker(canvas.transferToImageBitmap(), thumb);
	}

	/** Lets the worker go, with any picture it was still encoding. */
	close() {
		this.#worker?.terminate();
		this.#worker = undefined;
		for (const job of this.#jobs.values()) job.reject(new Error('The studio closed'));
		this.#jobs.clear();
	}

	#canvasOf({ width, height }: Size) {
		if (this.#canvas?.width === width && this.#canvas.height === height) return this.#canvas;
		if (this.#offscreen) this.#canvas = new OffscreenCanvas(width, height);
		else {
			this.#canvas = document.createElement('canvas');
			this.#canvas.width = width;
			this.#canvas.height = height;
		}
		return this.#canvas;
	}

	#encodeInWorker(picture: ImageBitmap, thumb: Size) {
		const worker = this.#worker!;
		const id = this.#nextJob++;
		return new Promise<Picture>((resolve, reject) => {
			this.#jobs.set(id, { resolve, reject });
			worker.postMessage({ id, picture, thumb }, [picture]);
		});
	}

	#startWorker() {
		const worker = new Worker(new URL('./encode.worker.ts', import.meta.url), { type: 'module' });
		worker.onmessage = ({ data }: MessageEvent<Reply>) => {
			const job = this.#jobs.get(data.id);
			this.#jobs.delete(data.id);
			if ('error' in data) job?.reject(new Error(data.error));
			else job?.resolve({ image: data.image, thumb: data.thumb });
		};
		// A worker whose script doesn't run loses the pictures handed to it; the next ones encode on the page.
		worker.onerror = () => this.#workerFailed();
		return worker;
	}

	#workerFailed() {
		this.close();
		this.#offscreen = false;
		this.#canvas = undefined;
	}

	/** Encodes on the page. `toBlob` copies the canvas as it's called, so the next picture can reuse it. */
	async #encodeHere(canvas: HTMLCanvasElement, thumb: Size): Promise<Picture> {
		const small = document.createElement('canvas');
		small.width = thumb.width;
		small.height = thumb.height;
		const context = small.getContext('2d')!;
		context.imageSmoothingQuality = 'high';
		context.drawImage(canvas, 0, 0, thumb.width, thumb.height);
		const [image, thumbnail] = await Promise.all([toBlob(canvas, 0.9), toBlob(small, 0.8)]);
		return { image, thumb: thumbnail };
	}
}
