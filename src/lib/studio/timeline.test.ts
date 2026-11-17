import { expect, it } from 'vitest';
import { timeline } from './timeline.ts';

it('gives each picture one turn', () => {
	expect(timeline({ frames: ['a', 'b'], fps: 8 })).toEqual([
		{ id: 'a', turns: 1 },
		{ id: 'b', turns: 1 }
	]);
});

it('keeps a held picture for the turns its seconds take', () => {
	const film = { frames: ['a', 'b', 'c'], fps: 8, holds: { b: 1.5, gone: 2 } };
	expect(timeline(film).map((turn) => turn.turns)).toEqual([1, 13, 1]);
	expect(timeline({ ...film, fps: 5 }).map((turn) => turn.turns)).toEqual([1, 9, 1]);
});

it('plays the film through as often as asked', () => {
	const film = { frames: ['a', 'b'], fps: 8, holds: { a: 0.5 } };
	expect(timeline(film, 3).map((turn) => turn.id)).toEqual(['a', 'b', 'a', 'b', 'a', 'b']);
	expect(timeline(film, 3).map((turn) => turn.turns)).toEqual([5, 1, 5, 1, 5, 1]);
	expect(timeline(film, 0)).toHaveLength(2);
});
