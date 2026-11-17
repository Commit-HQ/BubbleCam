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
	QUALITY_MEDIUM,
	QUALITY_VERY_HIGH,
	WebMOutputFormat
} from 'mediabunny';
import { getImage } from './films.ts';
import { decode } from './decode.ts';
import type { Quality } from './settings.ts';
import type { Turn } from './timeline.ts';

export type VideoJob = {
	/** The pictures in the order the video shows them, each for a number of the video's frames (timeline.ts). */
	turns: Turn[];
	width: number;
	height: number;
	fps: number;
	quality: Quality;
};
export type VideoReply =
	| { type: 'progress'; done: number }
	| { type: 'done'; buffer: ArrayBuffer; mime: string }
	| { type: 'unsupported' }
	| { type: 'failed'; error: string };

/** Mediabunny's quality for each choice: it sets the bitrate from the pictures' size and the codec. */
const qualities = { small: QUALITY_MEDIUM, normal: QUALITY_HIGH, high: QUALITY_VERY_HIGH };

const reply = (message: VideoReply, transfer: Transferable[] = []) =>
	self.postMessage(message, { transfer });

self.onmessage = async ({ data }: MessageEvent<VideoJob>) => {
	const { turns, width, height, fps, quality } = data;
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
		const source = new CanvasSource(canvas, {
			codec,
			quality: qualities[quality],
			keyFrameInterval: 2
		});
		output.addVideoTrack(source, { frameRate: fps });
		await output.start();
		// The next picture decodes while this one encodes. A picture that's held is encoded again for each of
		// its turns, which costs next to nothing, since nothing in it changes.
		let next = decode(getImage, turns[0].id);
		let frame = 0;
		for (let index = 0; index < turns.length; index++) {
			const picture = await next;
			if (index + 1 < turns.length) next = decode(getImage, turns[index + 1].id);
			if (picture) {
				context.drawImage(picture, 0, 0, width, height);
				picture.close();
			}
			for (let turn = 0; turn < turns[index].turns; turn++)
				await source.add(frame++ / fps, 1 / fps);
			reply({ type: 'progress', done: index + 1 });
		}
		await output.finalize();
		const buffer = output.target.buffer!;
		reply({ type: 'done', buffer, mime: mp4 ? 'video/mp4' : 'video/webm' }, [buffer]);
	} catch (error) {
		reply({ type: 'failed', error: String(error) });
	}
};
