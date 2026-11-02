import { IDBFactory } from 'fake-indexeddb';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as Films from './films.ts';

let films: typeof Films;

// Each test gets an empty database, and a fresh module, which keeps its connection.
beforeEach(async () => {
	globalThis.indexedDB = new IDBFactory();
	vi.resetModules();
	films = await import('./films.ts');
});

const jpeg = (text: string) => new Blob([text], { type: 'image/jpeg' });

function film(id: string, created = Date.now()): Films.Film {
	return { id, created, updated: created, width: 1280, height: 720, fps: 8, frames: [] };
}

describe('a film', () => {
	it('keeps its pictures in the order they were taken, with their files', async () => {
		await films.createFilm(film('a'));
		await films.addFrame('a', 'one', jpeg('1'), jpeg('t1'));
		const saved = await films.addFrame('a', 'two', jpeg('2'), jpeg('t2'));
		expect(saved?.frames).toEqual(['one', 'two']);
		expect((await films.getFilm('a'))?.frames).toEqual(['one', 'two']);
		expect(await (await films.getImage('two'))?.text()).toBe('2');
		const thumbs = await films.getThumbs(['one', 'two', 'missing']);
		expect([...thumbs.keys()]).toEqual(['one', 'two']);
		expect(await thumbs.get('one')?.text()).toBe('t1');
	});

	it('deletes a picture with its files', async () => {
		await films.createFilm(film('a'));
		await films.addFrame('a', 'one', jpeg('1'), jpeg('t1'));
		await films.addFrame('a', 'two', jpeg('2'), jpeg('t2'));
		expect((await films.deleteFrame('a', 'one'))?.frames).toEqual(['two']);
		expect(await films.getImage('one')).toBeUndefined();
		expect((await films.getThumbs(['one'])).size).toBe(0);
	});

	it('keeps no picture for a film deleted meanwhile', async () => {
		await films.createFilm(film('a'));
		await films.deleteFilm('a');
		expect(await films.addFrame('a', 'late', jpeg('1'), jpeg('t1'))).toBeUndefined();
		expect(await films.getImage('late')).toBeUndefined();
	});

	it('remembers its speed', async () => {
		await films.createFilm(film('a'));
		await films.setFps('a', 12);
		expect((await films.getFilm('a'))?.fps).toBe(12);
	});

	it('goes with all its pictures', async () => {
		await films.createFilm(film('a'));
		await films.addFrame('a', 'one', jpeg('1'), jpeg('t1'));
		await films.deleteFilm('a');
		expect(await films.getFilm('a')).toBeUndefined();
		expect(await films.getImage('one')).toBeUndefined();
	});
});

describe('the list of films', () => {
	it('shows films with pictures, newest first', async () => {
		await films.createFilm(film('old', 1000));
		await films.createFilm(film('new', 2000));
		await films.addFrame('old', 'one', jpeg('1'), jpeg('t1'));
		await films.addFrame('new', 'two', jpeg('2'), jpeg('t2'));
		expect((await films.listFilms()).map((f) => f.id)).toEqual(['new', 'old']);
	});

	it('leaves out a film without pictures, and deletes it once it has been left a minute', async () => {
		await films.createFilm(film('started'));
		await films.createFilm(film('emptied', Date.now() - 120000));
		expect(await films.listFilms()).toEqual([]);
		await vi.waitFor(async () => expect(await films.getFilm('emptied')).toBeUndefined());
		// One just started gets its first picture in a moment, so it stays.
		expect(await films.getFilm('started')).toBeDefined();
	});
});
