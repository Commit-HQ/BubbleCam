// A shutter that a clap presses. The microphone listens while the camera shows, and nothing it hears is kept
// or sent anywhere: only how loud the room is, fifty times a second, and the last third of a second of sound
// while a noise is weighed. A clap is a sound that's suddenly much louder than the room, loudest right as it
// begins, and all but gone a twentieth of a second later, which a word isn't: a voice takes a moment to swell
// and holds on for a tenth of a second at least. How loud the room is, is heard without the low part of the
// sound, so a knock on the table isn't a clap; a noise is weighed with nearly all of it, since a word's vowels
// are low, and without them "to" would be a "t" and nothing more. `Claps` decides, with `clapLike`, and is
// plain arithmetic; `Ear` does the listening, in the browser.

/** How often the microphone is listened to, in milliseconds. */
export const hearEvery = 20;

/** How easily a sound counts as loud enough to be a clap, as a grown-up set it. */
export type Keenness = 'low' | 'normal' | 'high';

/**
 * How loud a clap has to be: at least `least` of the loudest the microphone hears, so a quiet room's rustle
 * isn't one, and `over` times louder than the room.
 */
const loud: Record<Keenness, { least: number; over: number }> = {
	low: { least: 0.2, over: 8 },
	normal: { least: 0.1, over: 5 },
	high: { least: 0.05, over: 3.5 }
};

export const clapping = {
	loud,
	/** How long after a sound begins it's weighed, in milliseconds: long enough to tell a clap from a word. */
	weighed: 140,
	/** How quickly the room's usual loudness follows what's heard, in milliseconds. */
	follows: 2000,
	/**
	 * A clap's shape, in milliseconds from its loudest instant, and how much of that instant's strength (its
	 * power, not its loudness) the sound may have just before it, soon after it, and a little later. The
	 * loudest instant is looked for from `early` before the sound was first heard to `late` after it: a clap is
	 * heard at its loudest, and a voice that goes on to swell is weighed by how it began.
	 */
	early: 60,
	late: 5,
	head: [-5, 15],
	before: [-50, -10],
	soon: [25, 60],
	after: [60, 120],
	rises: 0.25,
	holds: 0.6,
	fades: 0.25
};

/** The strength of the last moments of sound, a few milliseconds at a time, the latest last. */
export type Heard = {
	/** Each stretch's strength: the mean of its samples, squared. */
	strength: ArrayLike<number>;
	/** How long each stretch is, in milliseconds. */
	every: number;
};

/**
 * Whether a sound first heard `ago` milliseconds back has the shape of a clap: nothing much just before its
 * loudest instant, so it began with a bang, less of it soon after, and little left a moment later, so it
 * ended as fast.
 */
export function clapLike({ strength, every }: Heard, ago: number) {
	const at = (milliseconds: number) => Math.round(milliseconds / every);
	const began = strength.length - at(ago);
	let peak = Math.max(0, began - at(clapping.early));
	const until = Math.min(strength.length - 1, began + at(clapping.late));
	for (let i = peak; i <= until; i++) if (strength[i] > strength[peak]) peak = i;
	/** The mean strength of a stretch around the loudest instant, or nothing where the sound wasn't kept. */
	const mean = ([from, to]: number[]) => {
		const first = peak + at(from);
		const last = peak + at(to);
		if (first < 0 || last > strength.length) return undefined;
		let sum = 0;
		for (let i = first; i < last; i++) sum += strength[i];
		return sum / (last - first);
	};
	const head = mean(clapping.head);
	const before = mean(clapping.before);
	const soon = mean(clapping.soon);
	const after = mean(clapping.after);
	if (!head || before === undefined || soon === undefined || after === undefined) return false;
	return (
		before <= head * clapping.rises &&
		soon <= head * clapping.holds &&
		after <= head * clapping.fades
	);
}

export class Claps {
	/** How easily a sound counts as loud enough. */
	keenness: Keenness = 'normal';
	/** The room's usual loudness, which a clap has to stand out from. */
	floor = 0;
	/** Listening for a sound, waiting to weigh one that may be a clap, or waiting for one that wasn't to end. */
	#state: 'quiet' | 'burst' | 'loud' = 'quiet';
	#began = 0;
	#heard: number | undefined;

	/** How loud a sound has to be to begin a clap. */
	get threshold() {
		const { least, over } = clapping.loud[this.keenness];
		return Math.max(least, this.floor * over);
	}

	/**
	 * Takes how loud the last moment was, from 0 to 1, at `now` on the page's clock, and says whether a clap has
	 * just been heard. `heard` gives the last moments of sound, and is asked once a sound has gone on long enough
	 * to be weighed.
	 */
	feed(level: number, now: number, heard: () => Heard | undefined) {
		const passed = this.#heard === undefined ? 0 : Math.max(0, now - this.#heard);
		this.#heard = now;
		if (this.#state === 'burst') {
			if (now - this.#began < clapping.weighed) return false;
			const sound = heard();
			const clap = sound !== undefined && clapLike(sound, now - this.#began);
			// A voice or a noise has to end before the next sound is listened for.
			this.#state = clap ? 'quiet' : 'loud';
			return clap;
		}
		const threshold = this.threshold;
		// The room's loudness follows along, so a room that gets noisy asks for a louder clap.
		this.floor += (level - this.floor) * (1 - Math.exp(-passed / clapping.follows));
		if (this.#state === 'loud') {
			if (level < threshold) this.#state = 'quiet';
			return false;
		}
		if (level >= threshold) {
			this.#state = 'burst';
			this.#began = now;
		}
		return false;
	}

	/** Forgets a sound half heard, as after the studio's own click. What the room sounds like is kept. */
	reset() {
		this.#state = 'quiet';
		this.#heard = undefined;
	}
}

/** What the microphone is asked for: the sound as it is, since a phone's tidying up would smooth a clap away. */
export const earConstraints = {
	echoCancellation: false,
	noiseSuppression: false,
	autoGainControl: false
};

/** How long a stretch of sound is when a noise is weighed, in milliseconds. */
const stretch = 5;

/** Listens to a microphone that's open, without keeping any of it. Browser-only. */
export class Ear {
	#audio: AudioContext;
	#source: MediaStreamAudioSourceNode;
	/** Without the low part of the sound, a table's knock among it, and without only its rumble. */
	#high: BiquadFilterNode;
	#most: BiquadFilterNode;
	/** The last moment, for how loud the room is, and the last third of a second, for weighing a noise. */
	#moment: AnalyserNode;
	#while: AnalyserNode;
	#samples: Float32Array<ArrayBuffer>;
	#longer: Float32Array<ArrayBuffer>;
	/** When the page's sound was last asked to go on, by the page's clock, where a phone had stopped it. */
	#asked = 0;

	constructor(audio: AudioContext, microphone: MediaStream) {
		this.#audio = audio;
		this.#source = audio.createMediaStreamSource(microphone);
		this.#high = audio.createBiquadFilter();
		this.#high.type = 'highpass';
		this.#high.frequency.value = 1500;
		this.#most = audio.createBiquadFilter();
		this.#most.type = 'highpass';
		this.#most.frequency.value = 200;
		// A little more than two listens' worth of sound, so a clap between two of them is still heard.
		this.#moment = audio.createAnalyser();
		this.#moment.fftSize = 2048;
		this.#samples = new Float32Array(this.#moment.fftSize);
		this.#while = audio.createAnalyser();
		this.#while.fftSize = 16384;
		this.#longer = new Float32Array(this.#while.fftSize);
		// It goes nowhere from here: the room isn't played back.
		this.#source.connect(this.#high);
		this.#high.connect(this.#moment);
		this.#source.connect(this.#most);
		this.#most.connect(this.#while);
	}

	/** How loud the last moment was, from 0 to 1: its loudest instant. */
	level() {
		// A phone may stop the page's sound as the microphone opens; nothing is heard until it goes on again.
		if (this.#audio.state !== 'running' && performance.now() - this.#asked > 1000) {
			this.#asked = performance.now();
			void this.#audio.resume().catch(() => {});
		}
		this.#moment.getFloatTimeDomainData(this.#samples);
		let peak = 0;
		for (const sample of this.#samples) {
			const size = Math.abs(sample);
			if (size > peak) peak = size;
		}
		return Math.min(1, peak);
	}

	/** The strength of the last third of a second, a few milliseconds at a time. */
	heard(): Heard {
		this.#while.getFloatTimeDomainData(this.#longer);
		const length = Math.max(1, Math.round((this.#audio.sampleRate * stretch) / 1000));
		const count = Math.floor(this.#longer.length / length);
		const strength = new Float32Array(count);
		// The latest sound ends the last stretch, so what's left over is dropped from the oldest end.
		const start = this.#longer.length - count * length;
		for (let i = 0; i < count; i++) {
			let sum = 0;
			for (let j = start + i * length, end = j + length; j < end; j++) {
				sum += this.#longer[j] * this.#longer[j];
			}
			strength[i] = sum / length;
		}
		return { strength, every: (length * 1000) / this.#audio.sampleRate };
	}

	close() {
		try {
			this.#source.disconnect();
			this.#high.disconnect();
			this.#most.disconnect();
		} catch {
			// It was let go already.
		}
	}
}
