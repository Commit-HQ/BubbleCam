// A film as it's shown, picture by picture. Each picture has its turn, one of the film's pictures a second, and
// one that's held stays for more turns: the whole turns nearest to the seconds it's held. A video shows every
// picture for a whole number of its frames, so its frame rate stays the film's own, which every player takes.

import type { Film } from './films.ts';

/** A picture's turn: which picture, and for how many of the film's turns it stays. */
export type Turn = { id: string; turns: number };

/** A film's pictures in the order they show, played through `loops` times. */
export function timeline(film: Pick<Film, 'frames' | 'fps' | 'holds'>, loops = 1): Turn[] {
	const once = film.frames.map((id) => ({
		id,
		turns: 1 + Math.round((film.holds?.[id] ?? 0) * film.fps)
	}));
	return Array.from({ length: Math.max(1, loops) }, () => once).flat();
}
