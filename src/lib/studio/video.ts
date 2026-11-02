// Making a film into a video file to save or share. A worker encodes it faster than it plays (video.worker.ts).
// A browser that can't encode video there, such as Safari before 16.4, records the film as it plays on a canvas
// instead, with MediaRecorder, which takes as long as the film. Browser-only.

import { getImage, type Film } from './films.ts';
import { decode } from './decode.ts';
import type { VideoJob, VideoReply } from './video.worker.ts';

export type Video = { blob: Blob; extension: 'mp4' | 'webm' };

type Making = {
	/** Called as each picture is done, with how many are. */
	progress: (done: number) => void;
	/** A canvas on the page, which the film plays on if it has to be recorded as it plays. */
	canvas: HTMLCanvasElement;
	signal: AbortSignal;
};

export class VideoUnsupported extends Error {}

export async function makeVideo(film: Film, making: Making): Promise<Video> {
	const encoded = await encode(film, making);
	return encoded ?? record(film, making);
}

const videoOf = (blob: Blob): Video => ({
	blob,
	extension: blob.type.includes('mp4') ? 'mp4' : 'webm'
});

/** Encodes in a worker, or resolves undefined where the browser can't. */
function encode(film: Film, { progress, signal }: Making) {
	if (typeof Worker !== 'function') return Promise.resolve(undefined);
	return new Promise<Video | undefined>((resolve, reject) => {
		const worker = new Worker(new URL('./video.worker.ts', import.meta.url), { type: 'module' });
		const end = () => {
			worker.terminate();
			signal.removeEventListener('abort', abort);
		};
		const abort = () => {
			end();
			reject(signal.reason);
		};
		signal.addEventListener('abort', abort);
		// A worker that can't start, such as a module worker in an older browser, leaves recording.
		worker.onerror = () => {
			end();
			resolve(undefined);
		};
		worker.onmessage = ({ data }: MessageEvent<VideoReply>) => {
			if (data.type === 'progress') return progress(data.done);
			end();
			if (data.type === 'done') resolve(videoOf(new Blob([data.buffer], { type: data.mime })));
			else if (data.type === 'unsupported') resolve(undefined);
			else reject(new Error(data.error));
		};
		// A copy, since a film from a page's state is a proxy, which can't be posted.
		const job: VideoJob = {
			frames: [...film.frames],
			width: film.width,
			height: film.height,
			fps: film.fps
		};
		worker.postMessage(job);
	});
}

/** The first kind of video this browser's MediaRecorder writes, MP4 if it can. */
function recordedType() {
	if (typeof MediaRecorder !== 'function') return undefined;
	return ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'].find(
		(type) => MediaRecorder.isTypeSupported(type)
	);
}

/** Plays the film on the page's canvas once, recording it, in real time. */
async function record(film: Film, { progress, canvas, signal }: Making): Promise<Video> {
	const type = recordedType();
	if (!type || typeof canvas.captureStream !== 'function') throw new VideoUnsupported();
	canvas.width = film.width;
	canvas.height = film.height;
	const context = canvas.getContext('2d')!;
	const draw = (picture: ImageBitmap | null) => {
		if (!picture) return;
		context.drawImage(picture, 0, 0, film.width, film.height);
		picture.close();
	};
	let next = decode(getImage, film.frames[0]);
	draw(await next);
	const stream = canvas.captureStream(film.fps);
	const recorder = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 5_000_000 });
	const chunks: Blob[] = [];
	recorder.ondataavailable = ({ data }) => data.size && chunks.push(data);
	const stopped = new Promise((resolve) => (recorder.onstop = resolve));
	recorder.start();
	try {
		const step = 1000 / film.fps;
		const start = performance.now();
		for (let index = 0; index < film.frames.length; index++) {
			if (index > 0) draw(await next);
			if (index + 1 < film.frames.length) next = decode(getImage, film.frames[index + 1]);
			progress(index + 1);
			// Wait for the picture's turn to end, measured from the start so delays don't add up.
			await new Promise((resolve) =>
				setTimeout(resolve, Math.max(0, start + (index + 1) * step - performance.now()))
			);
			signal.throwIfAborted();
		}
	} finally {
		recorder.stop();
		await stopped;
		for (const track of stream.getTracks()) track.stop();
	}
	return videoOf(new Blob(chunks, { type: type.split(';')[0] }));
}

/** The name a film's video is saved under, such as “bubblecam-cartoon-2026-11-02-1530.mp4”. */
export function fileName(base: string, film: Film, video: Video) {
	const date = new Date(film.created);
	const pad = (part: number) => String(part).padStart(2, '0');
	const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
	return `${base}-${day}-${pad(date.getHours())}${pad(date.getMinutes())}.${video.extension}`;
}

/** Whether this device can hand a video to another app, such as the photo library or a messaging app. */
export function canShare(file: File) {
	try {
		return (
			typeof navigator.share === 'function' && navigator.canShare?.({ files: [file] }) === true
		);
	} catch {
		return false;
	}
}
