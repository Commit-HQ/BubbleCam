import { expect, it } from 'vitest';
import type { Film } from './films.ts';
import { fileName } from './video.ts';

it('names a video after when its film was started', () => {
	const film: Film = {
		id: 'a',
		created: new Date(2026, 10, 2, 9, 5).getTime(),
		updated: 0,
		width: 1280,
		height: 720,
		fps: 8,
		frames: []
	};
	const video = { blob: new Blob(), extension: 'mp4' as const };
	expect(fileName('bubblecam-crtic', film, video)).toBe('bubblecam-crtic-2026-11-02-0905.mp4');
});
