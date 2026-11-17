// A film's voice: one recording, made with the microphone while the film plays through once, so what's said
// lines up with what's seen. It's kept in whatever sound file the browser's recorder writes, which the same
// browser can always play back and put into a video. The microphone is on only while a voice is recorded.
// Browser-only.

import { CameraError, problemOf } from './camera.ts';

/** The first kind of sound file this browser's recorder writes. */
function recordedType() {
	if (typeof MediaRecorder !== 'function') return undefined;
	return ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg;codecs=opus'].find(
		(type) => MediaRecorder.isTypeSupported(type)
	);
}

/** Whether this browser can record a voice. */
export function recordsVoice() {
	return Boolean(navigator.mediaDevices?.getUserMedia) && recordedType() !== undefined;
}

/** Opens the microphone, or says what went wrong, as the camera does. */
export async function openMicrophone(): Promise<MediaStream> {
	if (!recordsVoice()) throw new CameraError('unsupported');
	try {
		return await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
	} catch (error) {
		throw new CameraError(problemOf(error));
	}
}

export class VoiceRecorder {
	#stream: MediaStream;
	#recorder: MediaRecorder;
	#chunks: Blob[] = [];

	/** A recorder for an open microphone, which it lets go when it stops. */
	constructor(stream: MediaStream) {
		this.#stream = stream;
		this.#recorder = new MediaRecorder(stream, {
			mimeType: recordedType(),
			audioBitsPerSecond: 96_000
		});
		this.#recorder.ondataavailable = ({ data }) => data.size && this.#chunks.push(data);
	}

	start() {
		this.#recorder.start();
	}

	/** Ends the recording and lets the microphone go. Resolves with what was recorded, if anything was. */
	async stop(): Promise<Blob | undefined> {
		const recorder = this.#recorder;
		if (recorder.state !== 'inactive') {
			await new Promise((resolve) => {
				recorder.onstop = resolve;
				recorder.onerror = resolve;
				recorder.stop();
			});
		}
		for (const track of this.#stream.getTracks()) track.stop();
		if (!this.#chunks.length) return undefined;
		return new Blob(this.#chunks, { type: recorder.mimeType.split(';')[0] });
	}
}

/** A voice as one row of samples, 48,000 a second, for a video: its channels, if it has several, mixed into one. */
export async function voiceSamples(voice: Blob): Promise<Float32Array<ArrayBuffer>> {
	const Offline =
		window.OfflineAudioContext ??
		(window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext })
			.webkitOfflineAudioContext;
	const decoded = await new Offline(1, 1, voiceRate).decodeAudioData(await voice.arrayBuffer());
	const samples = new Float32Array(decoded.length);
	for (let channel = 0; channel < decoded.numberOfChannels; channel++) {
		const data = decoded.getChannelData(channel);
		for (let i = 0; i < data.length; i++) samples[i] += data[i] / decoded.numberOfChannels;
	}
	return samples;
}

/** How many samples a second a voice has in a video. */
export const voiceRate = 48_000;
