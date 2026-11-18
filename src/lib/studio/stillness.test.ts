import { expect, it } from 'vitest';
import { changed, lookEvery, Stillness, stillness } from './stillness.ts';

/** A grey picture of a hundred pixels, with the first `moved` of them brighter than the rest. */
const look = (moved = 0) => Uint8Array.from({ length: 100 }, (_, i) => (i < moved ? 200 : 40));

/** Feeds the looks one after the other, a tenth of a second apart, and says at which ones a picture was taken. */
function watch(looks: Uint8Array[], still = new Stillness()) {
	const taken: number[] = [];
	looks.forEach((picture, index) => {
		if (still.feed(picture, index * lookEvery)) taken.push(index);
	});
	return { taken, still };
}

const times = <T>(count: number, value: T) => Array.from({ length: count }, () => value);
const settles = Math.ceil(stillness.holds / lookEvery);

it('counts the pixels that changed, and not the camera’s noise', () => {
	expect(changed(look(), look())).toBe(0);
	expect(changed(look(), look(10))).toBe(0.1);
	expect(changed(look(), look().fill(50))).toBe(0);
	expect(changed(look(), new Uint8Array(50))).toBe(1);
});

it('takes no picture of a scene nobody touches', () => {
	const { taken, still } = watch(times(50, look()));
	expect(taken).toEqual([]);
	expect(still.state).toBe('waiting');
});

it('takes one picture once a hand has come, gone, and left the scene still', () => {
	const hand = [look(30), look(60), look(30)];
	const { taken, still } = watch([look(), look(), ...hand, ...times(settles + 5, look(5))]);
	// The hand leaving is a move too, so the wait starts with the second look at the scene without it.
	expect(taken).toEqual([6 + settles]);
	expect(still.state).toBe('waiting');
});

it('starts the wait over when something moves again', () => {
	const { taken } = watch([
		look(),
		look(),
		look(40),
		...times(5, look(5)),
		look(40),
		...times(settles + 2, look(5))
	]);
	expect(taken).toEqual([10 + settles]);
});

it('says how far the wait has got', () => {
	const { still } = watch([look(), look(), look(40), ...times(2 + settles / 2, look(5))]);
	expect(still.state).toBe('settling');
	expect(still.progress).toBeCloseTo(0.5);
});

it('notices a toy moved too slowly for any two looks to differ much', () => {
	const creeping = Array.from({ length: 6 }, (_, step) => look(step));
	const { taken } = watch([look(), ...creeping, ...times(settles + 2, look(5))]);
	expect(taken.length).toBe(1);
});

it('holds the next looks against the picture just taken', () => {
	const still = new Stillness();
	const first = watch([look(), look(), look(40), ...times(settles + 2, look(5))], still);
	expect(first.taken.length).toBe(1);
	expect(watch(times(30, look(5)), still).taken).toEqual([]);
});

it('starts over when the picture changes its shape, as when a phone is turned', () => {
	const { taken } = watch([look(), look(), new Uint8Array(80), ...times(30, new Uint8Array(80))]);
	expect(taken).toEqual([]);
});
