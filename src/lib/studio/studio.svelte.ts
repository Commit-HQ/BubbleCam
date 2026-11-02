// The studio's state: the film being shot, its pictures, the camera, and what the viewfinder shows. Pictures show
// in the strip and the ghost the moment they're taken, and are written to the device a moment later, once
// encoded. Every change to the device's films waits for the ones before it (`#write`), so they're saved in the
// order they were made: a picture deleted just after it was taken is deleted after it's saved, and a film is
// played or made into a video only once every picture in it can be read back. Browser-only.

import { decode } from './decode.ts';
import {
	CameraError,
	closeCamera,
	countCameras,
	facesUser,
	openCamera,
	type CameraProblem,
	type Facing
} from './camera.ts';
import {
	addFrame,
	createFilm,
	deleteFrame,
	getFilm,
	getImage,
	getThumbs,
	keepFilms,
	setFps,
	type Film
} from './films.ts';
import { coverCrop, filmSize, type Size } from './geometry.ts';
import { Player } from './player.ts';
import { Shutter } from './shutter.ts';
import { click, pop, tap } from './sound.ts';

/** The three speeds a child picks from, in pictures a second. */
export const speeds = { slow: 5, walk: 8, fast: 12 } as const;
export type Speed = keyof typeof speeds;

/** The speed nearest to a film's pictures a second. */
export function speedOf(fps: number): Speed {
	const names = Object.keys(speeds) as Speed[];
	return names.reduce((best, name) =>
		Math.abs(speeds[name] - fps) < Math.abs(speeds[best] - fps) ? name : best
	);
}

/** A picture in the strip, with its thumbnail's address once it has been encoded. */
export type Frame = { id: string; thumb: string | undefined };

/** What the viewfinder shows: the camera, one picture taken earlier, or the film playing. */
export type Mode = 'live' | 'review' | 'play';

export type CameraState = 'off' | 'starting' | 'on' | CameraProblem;

/** What just happened, for screen readers. */
export type Event = { type: 'taken' | 'removed'; count: number };

/** Where the device remembers which camera the studio used last. */
const facingKey = 'bubblecam:facing';

function rememberedFacing(): Facing {
	try {
		return localStorage.getItem(facingKey) === 'user' ? 'user' : 'environment';
	} catch {
		return 'environment';
	}
}

/** A thumbnail's address on the page, for a blob from the device. */
const addressOf = (blob: Blob | undefined) => (blob ? URL.createObjectURL(blob) : undefined);

export class Studio {
	/** The film being shot: undefined until a new film's first picture. Its `frames` aren't kept up to date. */
	film = $state<Omit<Film, 'frames'>>();
	frames = $state<Frame[]>([]);
	mode = $state<Mode>('live');
	/** The picture being looked at in review. */
	selected = $state(-1);
	/** The picture on screen while the film plays. */
	showing = $state(-1);
	ghost = $state(true);
	speed = $state<Speed>('walk');
	camera = $state<CameraState>('off');
	facing = $state<Facing>(rememberedFacing());
	/** Whether the camera's picture shows as in a mirror: the camera looks at the child. */
	mirrored = $state(false);
	cameras = $state(1);
	/** The size of the camera's picture, once it plays. */
	source = $state<Size>();
	/** Counts the pictures taken while the studio is open, for the shutter's flash. */
	shots = $state(0);
	event = $state<Event>();
	loaded = $state(false);

	/** The shape of the viewfinder: the film's, or the camera's for a film not started yet. */
	shape = $derived<Size | undefined>(this.film ?? (this.source && filmSize(this.source)));

	#video: HTMLVideoElement | undefined;
	#ghost: HTMLCanvasElement | undefined;
	#screen: HTMLCanvasElement | undefined;
	#stream: MediaStream | undefined;
	#shutter = new Shutter();
	#player: Player | undefined;
	#writes: Promise<unknown> = Promise.resolve();
	/** Pictures deleted, whose files are no longer wanted if they're still being encoded. */
	#removed = new Set<string>();
	#closed = false;
	#starts = 0;
	/** Called when a new film gets its ID, with its first picture. */
	onstart: ((id: string) => void) | undefined;

	/** Opens a film the device keeps, or starts a new one when there's none by that ID. */
	async load(id: string | null) {
		const film = id ? await getFilm(id).catch(() => undefined) : undefined;
		if (film) {
			const { frames, ...rest } = film;
			this.film = rest;
			this.speed = speedOf(film.fps);
			const thumbs = await getThumbs(frames);
			this.frames = frames.map((frame) => ({ id: frame, thumb: addressOf(thumbs.get(frame)) }));
			this.#write(() => this.#drawGhost());
		}
		this.loaded = true;
	}

	/** The video the camera plays in, the ghost's canvas, and the screen pictures are shown on. */
	attach(video: HTMLVideoElement, ghost: HTMLCanvasElement, screen: HTMLCanvasElement) {
		this.#video = video;
		this.#ghost = ghost;
		this.#screen = screen;
		this.#player = new Player(screen, getImage);
		this.#player.onshow = (index) => (this.showing = index);
		// Turning a phone turns the camera's picture with it.
		video.addEventListener('resize', () => {
			if (video.videoWidth) this.source = { width: video.videoWidth, height: video.videoHeight };
		});
	}

	async startCamera() {
		closeCamera(this.#stream);
		this.#stream = undefined;
		if (this.#closed || !this.#video) return;
		// Only the latest start keeps its camera, as when the app comes back into view during a switch.
		const start = ++this.#starts;
		this.camera = 'starting';
		try {
			const stream = await openCamera(this.facing);
			if (this.#closed || start !== this.#starts) return closeCamera(stream);
			this.#stream = stream;
			this.mirrored = facesUser(stream);
			const video = this.#video;
			video.srcObject = stream;
			await video.play().catch(() => {});
			if (!video.videoWidth) {
				await new Promise((resolve) =>
					video.addEventListener('loadedmetadata', resolve, { once: true })
				);
			}
			this.source = { width: video.videoWidth, height: video.videoHeight };
			this.camera = 'on';
			this.cameras = await countCameras();
		} catch (error) {
			this.camera = error instanceof CameraError ? error.problem : 'unsupported';
		}
	}

	/** Lets the camera go, as when the app goes into the background, which stops it anyway. */
	stopCamera() {
		this.#starts++;
		closeCamera(this.#stream);
		this.#stream = undefined;
		if (this.#video) this.#video.srcObject = null;
		this.camera = 'off';
	}

	/** Switches between the camera on the front and the one on the back. */
	async flip() {
		this.facing = this.facing === 'user' ? 'environment' : 'user';
		try {
			localStorage.setItem(facingKey, this.facing);
		} catch {
			// Remembering is a nicety.
		}
		// A phone opens one camera at a time, so the other is closed first.
		this.stopCamera();
		await this.startCamera();
	}

	/** Takes a picture of what the camera shows, if it's on and in view. */
	capture() {
		const video = this.#video;
		const ghost = this.#ghost;
		// A film being opened isn't one to start anew.
		if (!this.loaded || this.camera !== 'on' || this.mode !== 'live') return;
		if (!video?.videoWidth || !ghost) return;
		const source = { width: video.videoWidth, height: video.videoHeight };
		const film = this.film ?? this.#start(source);
		const size = { width: film.width, height: film.height };
		const picture = this.#shutter.take(video, coverCrop(source, size), size, this.mirrored, ghost);
		const id = crypto.randomUUID();
		this.frames.push({ id, thumb: undefined });
		this.shots++;
		this.event = { type: 'taken', count: this.frames.length };
		click();
		tap();
		this.#write(async () => {
			const files = await picture.catch(() => undefined);
			// A picture that couldn't be encoded leaves the strip as if it had been deleted.
			if (!files) {
				this.#removed.add(id);
				this.frames = this.frames.filter((frame) => frame.id !== id);
				return;
			}
			if (this.#removed.has(id)) return;
			// The strip shows the thumbnail as soon as it's encoded, whether or not the device can keep it.
			const frame = this.frames.find((frame) => frame.id === id);
			if (frame) frame.thumb = addressOf(files.thumb);
			await addFrame(film.id, id, files.image, files.thumb);
		});
	}

	/** Starts a new film, shaped like the camera's picture, with its first picture. */
	#start(source: Size) {
		const now = Date.now();
		const film: Film = {
			id: crypto.randomUUID(),
			created: now,
			updated: now,
			...filmSize(source),
			fps: speeds[this.speed],
			frames: []
		};
		const { frames, ...rest } = film;
		this.film = rest;
		this.#write(() => createFilm(film));
		void keepFilms();
		this.onstart?.(film.id);
		return rest;
	}

	/** Deletes the picture being looked at, or else the last one taken. */
	remove() {
		const film = this.film;
		if (this.mode === 'play' || !film) return;
		const index = this.mode === 'review' ? this.selected : this.frames.length - 1;
		const frame = this.frames[index];
		if (!frame) return;
		const last = index === this.frames.length - 1;
		this.#removed.add(frame.id);
		this.frames.splice(index, 1);
		// After the strip's thumbnail has had its moment to leave.
		if (frame.thumb) setTimeout(() => URL.revokeObjectURL(frame.thumb!), 1000);
		this.event = { type: 'removed', count: this.frames.length };
		pop();
		tap();
		this.#write(() => deleteFrame(film.id, frame.id));
		if (last) this.#write(() => this.#drawGhost());
		if (this.mode === 'review') {
			if (this.frames.length) this.select(Math.min(index, this.frames.length - 1));
			else this.live();
		}
	}

	/** Shows one picture taken earlier, big, in place of the camera. */
	select(index: number) {
		if (!this.frames[index]) return;
		this.#player?.stop();
		this.mode = 'review';
		this.selected = index;
		this.showing = -1;
		const id = this.frames[index].id;
		// The picture may still be on its way to the device.
		this.#write(async () => {
			const picture = await decode(getImage, id);
			const screen = this.#screen;
			if (screen && picture && this.mode === 'review' && this.frames[this.selected]?.id === id) {
				draw(screen, picture);
			}
			picture?.close();
		});
	}

	/** Back to the camera. */
	live() {
		this.#player?.stop();
		this.mode = 'live';
		this.selected = -1;
		this.showing = -1;
	}

	/** Plays the film, round and round, once every picture in it can be read. */
	play() {
		if (this.frames.length < 2) return;
		this.#player?.stop();
		this.mode = 'play';
		this.selected = -1;
		const ids = this.frames.map((frame) => frame.id);
		this.#write(async () => {
			if (this.mode === 'play') this.#player?.play(ids, speeds[this.speed]);
		});
	}

	setSpeed(speed: Speed) {
		this.speed = speed;
		if (this.#player) this.#player.fps = speeds[speed];
		const film = this.film;
		if (!film) return;
		film.fps = speeds[speed];
		this.#write(() => setFps(film.id, speeds[speed]));
	}

	/** The film as the device keeps it, once everything taken so far has been saved: for making its video. */
	async saved(): Promise<Film | undefined> {
		await this.#writes;
		const film = this.film;
		return film && { ...$state.snapshot(film), frames: this.frames.map((frame) => frame.id) };
	}

	/** Closes the studio. Pictures still being encoded or saved finish first. */
	close() {
		this.#closed = true;
		this.#player?.stop();
		this.stopCamera();
		const thumbs = this.frames.map((frame) => frame.thumb);
		void this.#writes.finally(() => {
			this.#shutter.close();
			for (const thumb of thumbs) if (thumb) URL.revokeObjectURL(thumb);
		});
	}

	/** Runs a change to the device's films after the ones before it. */
	#write(change: () => Promise<unknown>) {
		this.#writes = this.#writes.then(change).catch((error) => console.error(error));
	}

	/** Draws the film's last picture as the ghost over the camera, as after deleting the one after it. */
	async #drawGhost() {
		const ghost = this.#ghost;
		const last = this.frames.at(-1);
		if (!ghost || !last) return;
		const picture = await decode(getImage, last.id);
		// A picture taken meanwhile is the ghost already.
		if (picture && this.frames.at(-1)?.id === last.id) draw(ghost, picture);
		picture?.close();
	}
}

/** Draws a picture on a canvas of its own size. */
function draw(canvas: HTMLCanvasElement, picture: ImageBitmap) {
	if (canvas.width !== picture.width) canvas.width = picture.width;
	if (canvas.height !== picture.height) canvas.height = picture.height;
	canvas.getContext('2d')!.drawImage(picture, 0, 0);
}
