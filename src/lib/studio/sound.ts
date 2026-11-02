// The studio's little sounds, made on the spot with Web Audio rather than played from files: a camera's click
// for each picture, and a soap bubble's pop when one is deleted. Phones on silent stay quiet in Safari, which
// otherwise plays Web Audio regardless, and the sounds mix with, rather than stop, music playing nearby.
// Sounds are a nicety: anything that goes wrong is ignored. Browser-only.

let context: AudioContext | undefined;
let noise: AudioBuffer | undefined;

/** The audio context, made on the first tap, as browsers require. */
function audio() {
	if (!context) {
		const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
		if (session) session.type = 'ambient';
		context = new AudioContext();
	}
	if (context.state === 'suspended') void context.resume();
	return context;
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

/** A tiny buzz on phones that can, felt more than heard. */
export function tap() {
	try {
		navigator.vibrate?.(12);
	} catch {
		// Not every device buzzes.
	}
}
