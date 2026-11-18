// The studio's little sounds, made on the spot with Web Audio rather than played from files: a camera's click
// for each picture, a soap bubble's pop when one is deleted, and a tick for each second of the self-timer. A
// film's voice plays through the same output, so it needs no tap of its own to be heard. Phones on silent stay quiet in Safari, which
// otherwise plays Web Audio regardless, and the sounds mix with, rather than stop, music playing nearby.
// Sounds are a nicety: anything that goes wrong is ignored. Browser-only.

let context: AudioContext | undefined;
let noise: AudioBuffer | undefined;
let quiet = false;

/** Turns the sounds off or on, as a grown-up set them. The buzz stays: it's felt, not heard. */
export function mute(off: boolean) {
	quiet = off;
}

/** Safari's say in how the page's sound sits beside other sound, which other browsers don't have. */
const session = () => (navigator as Navigator & { audioSession?: { type: string } }).audioSession;

/** Whether the microphone is to be heard (`listen`), which the first sound mustn't undo. */
let listening = false;

/** The audio context, made on the first tap, as browsers require. */
function audio() {
	if (!context) {
		const safari = session();
		if (safari) safari.type = listening ? 'play-and-record' : 'ambient';
		context = new AudioContext();
	}
	// Safari also stops it for a phone call or when the microphone opens, which isn't "suspended" by name.
	if (context.state !== 'running') void context.resume().catch(() => {});
	return context;
}

/** The page's sound output, for a film's voice played into a video that's recorded as the film plays. */
export function soundContext() {
	return audio();
}

/** Gets the sound ready during a tap, so a voice can play a moment later, when it has been read. */
export function wake() {
	try {
		audio();
	} catch {
		// Silence is fine.
	}
}

/**
 * Lets the microphone be heard while a voice is recorded or a clap is listened for, and goes back to sounds
 * that mix with others after: Safari gives the microphone nothing while the page only plays along.
 */
export function listen(on: boolean) {
	listening = on;
	try {
		const safari = session();
		if (safari) safari.type = on ? 'play-and-record' : 'ambient';
	} catch {
		// Other browsers listen anyway.
	}
}

/** A film's voice, decoded for playing. */
export async function decodeVoice(voice: Blob): Promise<AudioBuffer | undefined> {
	try {
		return await audio().decodeAudioData(await voice.arrayBuffer());
	} catch {
		return undefined;
	}
}

let speaking: AudioBufferSourceNode | undefined;

/** Plays a film's voice from its start, in place of one that's playing. Turning the sounds off leaves it on. */
export function speak(voice: AudioBuffer) {
	hush();
	try {
		const sound = audio();
		speaking = sound.createBufferSource();
		speaking.buffer = voice;
		speaking.connect(sound.destination);
		speaking.start();
	} catch {
		// Silence is fine.
	}
}

/** Stops the voice. */
export function hush() {
	try {
		speaking?.stop();
	} catch {
		// It had ended by itself.
	}
	speaking = undefined;
}

/** A short burst of white noise, the stuff a shutter's click is made of. */
function noiseOf(audio: AudioContext) {
	if (noise) return noise;
	noise = audio.createBuffer(1, Math.round(audio.sampleRate * 0.08), audio.sampleRate);
	const samples = noise.getChannelData(0);
	for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
	return noise;
}

/** One part of the click, `at` seconds from now: noise through a band of `pitch` hertz, gone in `length` seconds. */
function burst(audio: AudioContext, at: number, pitch: number, length: number, volume: number) {
	const source = audio.createBufferSource();
	source.buffer = noiseOf(audio);
	const band = audio.createBiquadFilter();
	band.type = 'bandpass';
	band.frequency.value = pitch;
	band.Q.value = 0.9;
	const gain = audio.createGain();
	const start = audio.currentTime + at;
	gain.gain.setValueAtTime(0.0001, start);
	gain.gain.exponentialRampToValueAtTime(volume, start + 0.003);
	gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
	source.connect(band).connect(gain).connect(audio.destination);
	source.start(start);
	source.stop(start + length + 0.02);
}

/** “Ka-chick”: the shutter opening, then closing. */
export function click() {
	if (quiet) return;
	try {
		const sound = audio();
		burst(sound, 0, 2600, 0.035, 0.55);
		burst(sound, 0.055, 4200, 0.045, 0.4);
	} catch {
		// Silence is fine.
	}
}

/** A bubble's pop: a quick fall in pitch. */
export function pop() {
	if (quiet) return;
	try {
		const sound = audio();
		const start = sound.currentTime;
		const tone = sound.createOscillator();
		tone.type = 'sine';
		tone.frequency.setValueAtTime(900, start);
		tone.frequency.exponentialRampToValueAtTime(160, start + 0.09);
		const gain = sound.createGain();
		gain.gain.setValueAtTime(0.0001, start);
		gain.gain.exponentialRampToValueAtTime(0.35, start + 0.008);
		gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
		tone.connect(gain).connect(sound.destination);
		tone.start(start);
		tone.stop(start + 0.14);
	} catch {
		// Silence is fine.
	}
}

/** A soft tick for each second the self-timer counts down. */
export function tick() {
	if (quiet) return;
	try {
		const sound = audio();
		const start = sound.currentTime;
		const tone = sound.createOscillator();
		tone.type = 'sine';
		tone.frequency.setValueAtTime(1100, start);
		const gain = sound.createGain();
		gain.gain.setValueAtTime(0.0001, start);
		gain.gain.exponentialRampToValueAtTime(0.2, start + 0.005);
		gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.07);
		tone.connect(gain).connect(sound.destination);
		tone.start(start);
		tone.stop(start + 0.09);
	} catch {
		// Silence is fine.
	}
}

/** A tiny buzz on phones that can, felt more than heard. */
export function tap() {
	try {
		navigator.vibrate?.(12);
	} catch {
		// Not every device buzzes.
	}
}
