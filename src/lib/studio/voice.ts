// A film's sounds: each is one recording, made with the microphone while the film plays through once, so
// what's heard lines up with what's seen. A voice, the noises around the toys, and music are recorded one
// after the other and play together. Each is kept in whatever sound file the browser's recorder writes, which
// the same browser can always play back and put into a video. The microphone is on only while one is recorded,
// or while a clap is listened for (clap.ts). Browser-only, but for mixing them, which is plain arithmetic.

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

/**
 * What the microphone is asked for when it isn't a voice that's recorded: the room as it sounds. A phone
 * tidies a voice up by taking the noise around it away, and noises and music are just what it would take.
 */
export const roomSound: MediaTrackConstraints = {
	echoCancellation: false,
	noiseSuppression: false
};

/** Opens the microphone, for a voice or with what `sound` asks, or says what went wrong, as the camera does. */
export async function openMicrophone(
	sound: MediaTrackConstraints | true = true
): Promise<MediaStream> {
	if (!recordsVoice()) throw new CameraError('unsupported');
	try {
		return await navigator.mediaDevices.getUserMedia({ audio: sound, video: false });
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

/**
 * Several sounds as one row of samples: each as loud as its `volume`, added up, and kept within what a sound
 * file can hold, or nothing where there's nothing to hear. The row is as long as the longest of them.
 */
export function mixSamples(sounds: { samples: Float32Array; volume: number }[]) {
	const heard = sounds.filter(({ samples, volume }) => samples.length > 0 && volume > 0);
	if (!heard.length) return undefined;
	const mixed = new Float32Array(Math.max(...heard.map(({ samples }) => samples.length)));
	for (const { samples, volume } of heard) {
		for (let i = 0; i < samples.length; i++) mixed[i] += samples[i] * volume;
	}
	for (let i = 0; i < mixed.length; i++) mixed[i] = Math.max(-1, Math.min(1, mixed[i]));
	return mixed;
}

/** How many samples a second a voice has in a video. */
export const voiceRate = 48_000;
