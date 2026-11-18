import { expect, it } from 'vitest';
import { clapLike, clapping, Claps, hearEvery, type Keenness } from './clap.ts';

/** How long a stretch of sound is in these tests, in milliseconds, and how many make up a listen. */
const every = 5;
const perListen = hearEvery / every;

/** So many stretches of sound, as loud as `level` or as each of `levels`. */
const of = (count: number, level: number) => Array.from({ length: count }, () => level);
const quiet = (milliseconds: number) => of(milliseconds / every, 0.01);
/** A clap: loudest at once, and fading within a few hundredths of a second. */
const clap = [0.9, 0.5, 0.25, 0.15, 0.1, 0.07, 0.05, 0.04, 0.03, 0.02];
/** A word: it swells for a moment, holds for as long as it's said, and dies away. */
const word = (milliseconds: number, level = 0.5) => [
	0.15 * level,
	0.4 * level,
	0.7 * level,
	0.9 * level,
	...of(milliseconds / every, level),
	0.5 * level,
	0.2 * level
];

/**
 * A room with a microphone in it. Sounds played in it reach `claps` a stretch at a time, as the microphone
 * would hear them: how loud the last moment was, at each listen, and the last third of a second when it's
 * asked for. `play` says at which of its listens a clap was heard.
 */
class Room {
	claps = new Claps();
	#sound: number[] = [];
	#listens = 0;

	constructor(keenness: Keenness = 'normal') {
		this.claps.keenness = keenness;
	}

	play(sound: number[]) {
		const heard: number[] = [];
		const first = this.#listens;
		this.#sound.push(...sound);
		while ((this.#listens + 1) * perListen <= this.#sound.length) {
			const end = ++this.#listens * perListen;
			const level = Math.max(...this.#sound.slice(Math.max(0, end - 9), end));
			const last = () => ({
				strength: this.#sound.slice(Math.max(0, end - 68), end).map((loudness) => loudness ** 2),
				every
			});
			if (this.claps.feed(level, this.#listens * hearEvery, last))
				heard.push(this.#listens - first);
		}
		return heard;
	}
}

/** Plays a sound in a room of its own. */
const play = (sound: number[], keenness?: Keenness) => new Room(keenness).play(sound);

it('hears nothing in a quiet room', () => {
	expect(play(quiet(4000))).toEqual([]);
});

it('hears a clap, a little after it', () => {
	const heard = play([...quiet(1000), ...clap, ...quiet(1000)]);
	expect(heard.length).toBe(1);
	expect(heard[0] * hearEvery).toBeGreaterThan(1000 + clapping.weighed - hearEvery);
	expect(heard[0] * hearEvery).toBeLessThan(1000 + clapping.weighed + 3 * hearEvery);
});

it('doesn’t take a word for a clap, however short, and listens again once it’s over', () => {
	for (const length of [100, 150, 300, 800]) {
		const room = new Room();
		expect(room.play([...quiet(1000), ...word(length), ...quiet(1000)]), `${length} ms`).toEqual(
			[]
		);
		expect(room.play([...clap, ...quiet(500)]).length, `a clap after ${length} ms`).toBe(1);
	}
});

it('doesn’t take the end of a word for a clap, though silence follows it', () => {
	// Two syllables with a stop between them, the second no louder than the first.
	const twice = [...word(120), ...quiet(60), ...word(120, 0.45)];
	expect(play([...quiet(1000), ...twice, ...quiet(1000)])).toEqual([]);
});

it('ignores sounds too quiet to be a clap', () => {
	const rustle = clap.map((level) => level / 12);
	expect(play([...quiet(1000), ...rustle, ...quiet(1000)])).toEqual([]);
});

it('asks for a louder clap in a noisy room', () => {
	const calm = new Room();
	calm.play(quiet(2000));
	const noisy = new Room();
	noisy.play(of(2000, 0.08));
	expect(calm.claps.threshold).toBe(clapping.loud.normal.least);
	expect(noisy.claps.threshold).toBeGreaterThan(0.3);
	const soft = clap.map((level) => level / 3);
	expect(noisy.play([...soft, ...of(100, 0.08)])).toEqual([]);
	expect(noisy.play([...clap, ...of(100, 0.08)]).length).toBe(1);
});

it('asks for a louder or a softer clap as a grown-up set it', () => {
	const hears = (keenness: Keenness, by: number) =>
		play([...quiet(1000), ...clap.map((level) => level / by), ...quiet(1000)], keenness).length;
	expect([hears('low', 6), hears('normal', 6), hears('high', 6)]).toEqual([0, 1, 1]);
	expect([hears('low', 12), hears('normal', 12), hears('high', 12)]).toEqual([0, 0, 1]);
});

it('hears each of two claps', () => {
	expect(play([...quiet(500), ...clap, ...quiet(800), ...clap, ...quiet(500)]).length).toBe(2);
});

it('remembers what the room sounds like when it starts over', () => {
	const room = new Room();
	room.play(of(2000, 0.08));
	const threshold = room.claps.threshold;
	room.claps.reset();
	expect(room.claps.threshold).toBe(threshold);
});

it('doesn’t weigh a sound it no longer has the beginning or the end of', () => {
	const strength = [...quiet(100), ...clap, ...quiet(40)].map((loudness) => loudness ** 2);
	expect(clapLike({ strength, every }, 90)).toBe(false);
	expect(clapLike({ strength: strength.slice(18), every }, 90)).toBe(false);
});

it('hears a clap in a room that rings', () => {
	// The clap's echo dies away over half a second.
	const ringing = Array.from({ length: 60 }, (_, i) => 0.9 * (i ? 0.45 * Math.exp(-i / 14) : 1));
	expect(play([...quiet(1000), ...ringing, ...quiet(700)]).length).toBe(1);
});
