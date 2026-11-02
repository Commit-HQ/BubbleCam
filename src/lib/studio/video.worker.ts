// Makes a film's video in a worker, faster than it plays: each picture is read from IndexedDB, drawn, and encoded
// with the browser's own video encoder (WebCodecs), and Mediabunny writes the encoded pictures into an MP4 file,
// or a WebM file where the browser can't encode H.264. A browser without WebCodecs here says so, and the page
// records the film as it plays instead (video.ts).

import {
	BufferTarget,
	CanvasSource,
	getFirstEncodableVideoCodec,
	Mp4OutputFormat,
	Output,
	QUALITY_HIGH,
	WebMOutputFormat
} from 'mediabunny';
import { getImage } from './films.ts';
import { decode } from './decode.ts';

export type VideoJob = { frames: string[]; width: number; height: number; fps: number };
export type VideoReply =
	| { type: 'progress'; done: number }
	| { type: 'done'; buffer: ArrayBuffer; mime: string }
	| { type: 'unsupported' }
	| { type: 'failed'; error: string };

const reply = (message: VideoReply, transfer: Transferable[] = []) =>
	self.postMessage(message, { transfer });

self.onmessage = async ({ data }: MessageEvent<VideoJob>) => {
	const { frames, width, height, fps } = data;
	if (typeof VideoEncoder !== 'function' || typeof OffscreenCanvas !== 'function') {
		return reply({ type: 'unsupported' });
	}
	try {
		// H.264 in MP4 plays everywhere a family might send it; VP9 or VP8 in WebM is the way out.
		const codec = await getFirstEncodableVideoCodec(['avc', 'vp9', 'vp8'], {
			width,
			height,
			frameRate: fps
		});
		if (!codec) return reply({ type: 'unsupported' });
		const mp4 = codec === 'avc';
		const canvas = new OffscreenCanvas(width, height);
		const context = canvas.getContext('2d', { alpha: false })!;
		const output = new Output({
			format: mp4 ? new Mp4OutputFormat() : new WebMOutputFormat(),
			target: new BufferTarget()
		});
		// A key frame every two seconds, so a player can start anywhere without the file growing much.
		const source = new CanvasSource(canvas, { codec, quality: QUALITY_HIGH, keyFrameInterval: 2 });
		output.addVideoTrack(source, { frameRate: fps });
		await output.start();
		// The next picture decodes while this one encodes.
		let next = decode(getImage, frames[0]);
		for (let index = 0; index < frames.length; index++) {
			const picture = await next;
			if (index + 1 < frames.length) next = decode(getImage, frames[index + 1]);
			if (picture) {
				context.drawImage(picture, 0, 0, width, height);
				picture.close();
			}
			await source.add(index / fps, 1 / fps);
			reply({ type: 'progress', done: index + 1 });
		}
		await output.finalize();
		const buffer = output.target.buffer!;
		reply({ type: 'done', buffer, mime: mp4 ? 'video/mp4' : 'video/webm' }, [buffer]);
	} catch (error) {
		reply({ type: 'failed', error: String(error) });
	}
};
