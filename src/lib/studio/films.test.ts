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

	it('puts its pictures in a new order', async () => {
		await films.createFilm(film('a'));
		for (const id of ['one', 'two', 'three']) await films.addFrame('a', id, jpeg(id), jpeg(id));
		expect((await films.orderFrames('a', ['three', 'one', 'two']))?.frames).toEqual([
			'three',
			'one',
			'two'
		]);
		expect((await films.getFilm('a'))?.frames).toEqual(['three', 'one', 'two']);
	});

	it('orders only the pictures it has, and loses none the order doesn’t name', async () => {
		await films.createFilm(film('a'));
		for (const id of ['one', 'two', 'three']) await films.addFrame('a', id, jpeg(id), jpeg(id));
		// "gone" was deleted meanwhile, and "three" was saved after the order was made.
		expect((await films.orderFrames('a', ['two', 'gone', 'one']))?.frames).toEqual([
			'two',
			'one',
			'three'
		]);
	});

	it('reads full pictures together, as for the cartoons’ covers', async () => {
		await films.createFilm(film('a'));
		await films.addFrame('a', 'one', jpeg('1'), jpeg('t1'));
		const images = await films.getImages(['one', 'missing']);
		expect([...images.keys()]).toEqual(['one']);
		expect(await images.get('one')?.text()).toBe('1');
	});

	it('holds a picture, and lets it go with the picture or when asked', async () => {
		await films.createFilm(film('a'));
		for (const id of ['one', 'two']) await films.addFrame('a', id, jpeg(id), jpeg(id));
		await films.holdFrame('a', 'one', 2);
		await films.holdFrame('a', 'two', 1.5);
		expect((await films.getFilm('a'))?.holds).toEqual({ one: 2, two: 1.5 });
		await films.holdFrame('a', 'two', 0);
		expect((await films.getFilm('a'))?.holds).toEqual({ one: 2 });
		await films.deleteFrame('a', 'one');
		expect((await films.getFilm('a'))?.holds).toEqual({});
		// A picture the film doesn't have isn't held.
		expect(await films.holdFrame('a', 'gone', 1)).toBeUndefined();
	});

	it('keeps a voice, replaces it, and lets it go', async () => {
		const sound = (text: string) => new Blob([text], { type: 'audio/webm' });
		await films.createFilm(film('a'));
		await films.addFrame('a', 'one', jpeg('1'), jpeg('t1'));
		await films.setVoice('a', sound('hello'));
		expect(await (await films.getFilm('a'))?.voice?.text()).toBe('hello');
		// Whatever else changes, the voice stays.
		await films.setFps('a', 12);
		await films.addFrame('a', 'two', jpeg('2'), jpeg('t2'));
		await films.setVoice('a', sound('again'));
		expect(await (await films.getFilm('a'))?.voice?.text()).toBe('again');
		await films.setVoice('a', undefined);
		expect(await films.getFilm('a')).not.toHaveProperty('voice');
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
