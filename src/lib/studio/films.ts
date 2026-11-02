// The cartoons a device keeps, in IndexedDB, which pages and workers share: each film's record, and each of its
// pictures as two JPEG files, the picture itself and its thumbnail for the strip. Records and files are in
// separate stores, so opening a film reads its small thumbnails and never every full picture. Nothing here
// leaves the device.
//
// Every change is one transaction: a picture's files arrive together with its place in the film, so a film
// never names a picture it doesn't have. Transactions that change the same stores run in the order they're
// made, and the studio makes its changes one after another (src/lib/studio/studio.svelte.ts).

export type Film = {
	id: string;
	/** When the film was started, and last changed, in milliseconds since 1970. */
	created: number;
	updated: number;
	/** The size of its pictures, in pixels (geometry.ts). */
	width: number;
	height: number;
	/** How many pictures it shows in a second. */
	fps: number;
	/** Its pictures' IDs, in the order they play. */
	frames: string[];
};

const name = 'bubblecam';
const version = 1;

let opening: Promise<IDBDatabase> | undefined;

/** The database, opened once and kept open while the page or worker runs. */
function database() {
	opening ??= new Promise<IDBDatabase>((resolve, reject) => {
		const request = indexedDB.open(name, version);
		request.onupgradeneeded = () => {
			const db = request.result;
			db.createObjectStore('films', { keyPath: 'id' });
			db.createObjectStore('images');
			db.createObjectStore('thumbs');
		};
		request.onsuccess = () => {
			const db = request.result;
			// A newer version of the app open in another tab asks for the database to upgrade it. This one lets go,
			// and opens it again the next time it needs it.
			db.onversionchange = () => {
				db.close();
				opening = undefined;
			};
			db.onclose = () => (opening = undefined);
			resolve(db);
		};
		request.onerror = () => {
			opening = undefined;
			reject(request.error);
		};
	});
	return opening;
}

/** Settles when a transaction has been written, or fails with why it wasn't. */
function done(transaction: IDBTransaction) {
	return new Promise<void>((resolve, reject) => {
		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject(transaction.error);
		transaction.onabort = () =>
			reject(transaction.error ?? new DOMException('Aborted', 'AbortError'));
	});
}

/** The value a request read, once its transaction has finished. */
async function read<T>(
	stores: string | string[],
	query: (transaction: IDBTransaction) => IDBRequest<T>
) {
	const transaction = (await database()).transaction(stores, 'readonly');
	const request = query(transaction);
	await done(transaction);
	return request.result;
}

/**
 * Changes a film in one transaction with its pictures: `change` gets the film as stored and returns it changed,
 * or undefined to change nothing, as when the film was deleted meanwhile. Resolves with the film as saved.
 */
async function changeFilm(
	id: string,
	change: (film: Film, transaction: IDBTransaction) => Film | undefined
): Promise<Film | undefined> {
	const transaction = (await database()).transaction(['films', 'images', 'thumbs'], 'readwrite');
	const films = transaction.objectStore('films');
	let saved: Film | undefined;
	const reading = films.get(id) as IDBRequest<Film | undefined>;
	reading.onsuccess = () => {
		const film = reading.result;
		saved = film && change(film, transaction);
		if (saved) films.put(saved);
	};
	await done(transaction);
	return saved;
}

/**
 * Every film with a picture, newest first. A film left without one, by deleting every picture, is deleted here,
 * once it hasn't changed for a minute: a film just started gets its first picture a moment after its record.
 */
export async function listFilms(): Promise<Film[]> {
	const films = await read<Film[]>('films', (t) => t.objectStore('films').getAll());
	const empty = films.filter(
		(film) => film.frames.length === 0 && film.updated < Date.now() - 60000
	);
	if (empty.length) void Promise.all(empty.map((film) => deleteFilm(film.id))).catch(() => {});
	return films.filter((film) => film.frames.length > 0).sort((a, b) => b.created - a.created);
}

export function getFilm(id: string) {
	return read<Film | undefined>('films', (t) => t.objectStore('films').get(id));
}

/** Saves a new film, which gets its pictures with `addFrame`. */
export async function createFilm(film: Film) {
	const transaction = (await database()).transaction('films', 'readwrite');
	transaction.objectStore('films').add(film);
	await done(transaction);
}

/** Adds a picture to the end of a film. Resolves with the film, or undefined if it has been deleted. */
export function addFrame(filmId: string, frameId: string, image: Blob, thumb: Blob) {
	return changeFilm(filmId, (film, transaction) => {
		transaction.objectStore('images').put(image, frameId);
		transaction.objectStore('thumbs').put(thumb, frameId);
		return { ...film, frames: [...film.frames, frameId], updated: Date.now() };
	});
}

/** Takes a picture out of a film and deletes its files. */
export function deleteFrame(filmId: string, frameId: string) {
	return changeFilm(filmId, (film, transaction) => {
		transaction.objectStore('images').delete(frameId);
		transaction.objectStore('thumbs').delete(frameId);
		return { ...film, frames: film.frames.filter((id) => id !== frameId), updated: Date.now() };
	});
}

/** Sets how many pictures a film shows in a second. */
export function setFps(filmId: string, fps: number) {
	return changeFilm(filmId, (film) =>
		film.fps === fps ? undefined : { ...film, fps, updated: Date.now() }
	);
}

/** Deletes a film with all its pictures. */
export async function deleteFilm(id: string) {
	const transaction = (await database()).transaction(['films', 'images', 'thumbs'], 'readwrite');
	const films = transaction.objectStore('films');
	const reading = films.get(id) as IDBRequest<Film | undefined>;
	reading.onsuccess = () => {
		for (const frame of reading.result?.frames ?? []) {
			transaction.objectStore('images').delete(frame);
			transaction.objectStore('thumbs').delete(frame);
		}
		films.delete(id);
	};
	await done(transaction);
}

/** A picture, full size, as JPEG. */
export function getImage(frameId: string) {
	return read<Blob | undefined>('images', (t) => t.objectStore('images').get(frameId));
}

/** The thumbnails of the given pictures, read in one transaction. Pictures without one are left out. */
export async function getThumbs(frameIds: string[]) {
	const transaction = (await database()).transaction('thumbs', 'readonly');
	const store = transaction.objectStore('thumbs');
	const requests = frameIds.map(
		(id) => [id, store.get(id) as IDBRequest<Blob | undefined>] as const
	);
	await done(transaction);
	const thumbs = new Map<string, Blob>();
	for (const [id, request] of requests) if (request.result) thumbs.set(id, request.result);
	return thumbs;
}

/**
 * Asks the browser to keep the films even when the device runs low on space. Browsers decide by themselves,
 * often by whether the site is installed, and some never ask the person; a refusal changes nothing.
 */
export async function keepFilms() {
	try {
		if (!(await navigator.storage?.persisted?.())) await navigator.storage?.persist?.();
	} catch {
		// Storage that may be cleared is still storage.
	}
}
