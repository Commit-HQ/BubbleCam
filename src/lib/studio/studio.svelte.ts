// The studio's state: the film being shot, its pictures, the camera, and what the viewfinder shows. Pictures show
// in the strip and the ghost the moment they're taken, and are written to the device a moment later, once
// encoded. Every change to the device's films waits for the ones before it (`#write`), so they're saved in the
// order they were made: a picture deleted just after it was taken is deleted after it's saved, and a film is
// played or made into a video only once every picture in it can be read back. What a grown-up set for the studio
// (settings.ts) is read once, as it opens.
//
// A film can have a voice, recorded while it plays through once (voice.ts). The camera stops for the recording
// and starts again on the way back to it: a phone doesn't always keep a camera and a microphone, opened one
// after the other, both going.
//
// With the advanced tools, the shutter can press itself, so a child doesn't walk round to the phone for every
// picture: when the camera's picture has settled after something moved in it (stillness.ts), or at a clap
// (clap.ts). For the clap the camera is opened again together with the microphone, which then stays on for as
// long as the trigger does. Both are off whenever the studio opens. Browser-only.

import { Claps, Ear, earConstraints, hearEvery } from './clap.ts';
import { decode } from './decode.ts';
import {
	CameraError,
	closeCamera,
	countCameras,
	facesUser,
	openCamera,
	openCameraAndMicrophone,
	problemOf,
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
	holdFrame,
	keepFilms,
	orderFrames,
	setFps,
	setVoice,
	type Film
} from './films.ts';
import { coverCrop, filmSize, zoomCrop, type Size } from './geometry.ts';
import { Player } from './player.ts';
import {
	defaults,
	ghostRange,
	holdRange,
	inForce,
	loadSettings,
	pictureQuality,
	saveSettings,
	zoomRange,
	type Settings
} from './settings.ts';
import { Shutter } from './shutter.ts';
import {
	click,
	decodeVoice,
	hush,
	listen,
	mute,
	pop,
	soundContext,
	speak,
	tap,
	tick,
	wake
} from './sound.ts';
import { Eye, lookEvery, Stillness, type StillState } from './stillness.ts';
import { openMicrophone, VoiceRecorder } from './voice.ts';

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

/** What presses the shutter by itself: nothing, the camera's picture settling, or a clap. */
export type Trigger = 'off' | 'still' | 'clap';

/** What just happened, for screen readers. */
export type Event = { type: 'taken' | 'removed' | 'moved' | 'voiced' | 'unvoiced'; count: number };

/** How many seconds are counted down before a voice is recorded: time to draw breath. */
const voiceCountdown = 3;

/**
 * How long after a clap the picture is taken, in milliseconds: the table has stopped shaking by then, and the
 * hands are out of the way. A clap is known to be one a little after it began (clap.ts), so the picture
 * follows it by some six tenths of a second.
 */
const clapWait = 450;

/** How long the studio's own sounds are kept from being taken for a clap, at least, in milliseconds. */
const ownSound = 500;

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

const within = (range: { min: number; max: number }, value: number) =>
	Math.min(range.max, Math.max(range.min, value));

export class Studio {
	/**
	 * What a grown-up set, as it's followed: what belongs to the advanced tools only while they're on. The
	 * defaults until `configure` reads the device's, in the browser, since the page is prerendered without them.
	 */
	settings = $state.raw<Settings>({ ...defaults });
	/**
	 * Whether the studio has its extra tools: zooming, the ghost's strength, the grid, the self-timer, moving
	 * and holding pictures, and a video that repeats.
	 */
	advanced = $derived(this.settings.advanced);
	/** How long the shutter rests after a picture, in milliseconds. */
	rest = $derived(this.settings.rest * 1000);
	/** The film being shot: undefined until a new film's first picture. Its `frames` aren't kept up to date. */
	film = $state<Omit<Film, 'frames'>>();
	frames = $state<Frame[]>([]);
	mode = $state<Mode>('live');
	/** The picture being looked at in review. */
	selected = $state(-1);
	/** The picture on screen while the film plays. */
	showing = $state(-1);
	ghost = $state(true);
	/** How strongly the ghost shows, as an opacity. */
	ghostStrength = $state(defaults.ghost);
	/** Whether lines divide the camera's picture in thirds. */
	grid = $state(false);
	/** The self-timer: how many seconds the big button counts down before a picture, or 0 without one. */
	timer = $state(0);
	/**
	 * Whether the self-timer counts down again after each picture, so the pictures take themselves until the
	 * big button stops them. Off whenever the studio opens, so a series never starts by surprise.
	 */
	again = $state(false);
	/** What presses the shutter by itself. Off whenever the studio opens, like `again`. */
	trigger = $state<Trigger>('off');
	/** What the picture is doing, for the trigger that waits for it to settle, and how far the wait has got. */
	stillness = $state<StillState>('waiting');
	settled = $state(0);
	/** How loud the room is, for the trigger that waits for a clap: 1 is as loud as a clap has to be. */
	loudness = $state(0);
	/** Counts the claps heard while the studio is open, for the listener's little jump. */
	claps = $state(0);
	/** Why claps can't be listened for, when the microphone was asked for and didn't open. */
	triggerProblem = $state<CameraProblem>();
	/** The seconds left of a countdown under way, to a picture or to recording a voice, or 0. */
	counting = $state(0);
	/** The film's voice, if one was recorded over it. */
	voice = $state.raw<Blob>();
	/** Whether a voice is being recorded, while the film plays through once. */
	recording = $state(false);
	/** Why a voice couldn't be recorded, when the microphone was asked for and didn't open. */
	voiceProblem = $state<CameraProblem>();
	/** How long each held picture stays on screen beyond its turn, in seconds, by its ID. */
	holds = $state<Record<string, number>>({});
	/** How far the camera's picture is zoomed in: 1 is the whole of it. */
	zoom = $state(1);
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
	shape = $derived<Size | undefined>(
		this.film ??
			(this.source &&
				filmSize(this.source, this.settings.shape, pictureQuality[this.settings.pictures].long))
	);

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
	/** When the big button has rested from its last press, by the page's clock. */
	#rested = 0;
	#countdown: ReturnType<typeof setTimeout> | undefined;
	/** The triggers: what watches the picture, what listens to the room, and the clock that asks them. */
	#eye = new Eye();
	#still = new Stillness();
	#ear: Ear | undefined;
	#claps = new Claps();
	#watching: ReturnType<typeof setInterval> | undefined;
	/** The wait between a clap and its picture. */
	#clapped: ReturnType<typeof setTimeout> | undefined;
	/** Until when sounds aren't taken for claps, by the page's clock: the studio's own click is one. */
	#deaf = 0;
	/** The recorder while a voice is recorded, and the microphone from when it opens until the recorder has it. */
	#recorder: VoiceRecorder | undefined;
	#microphone: MediaStream | undefined;
	/** Counts recordings begun and ended, so a microphone that opens late for one given up is let go. */
	#takes = 0;
	/** Whether a voice is on its way to being recorded or is being recorded, from the tap to the end. */
	#voicing = false;
	/** The voice decoded for playing, with the file it was decoded from. */
	#spoken: { voice: Blob; sound: AudioBuffer | undefined } | undefined;
	/** Called when a new film gets its ID, with its first picture. */
	onstart: ((id: string) => void) | undefined;

	/** Follows what a grown-up set on this device, from before the camera and the film are opened. */
	configure() {
		this.settings = inForce(loadSettings());
		this.ghostStrength = this.settings.ghost;
		this.grid = this.settings.grid;
		this.timer = this.settings.timer;
		this.#claps.keenness = this.settings.clap;
		mute(!this.settings.sounds);
	}

	/** Keeps one of the advanced tools' settings for the next time, beside what else the device keeps. */
	#keep(change: Partial<Settings>) {
		this.settings = { ...this.settings, ...change };
		saveSettings({ ...loadSettings(), ...change });
	}

	/** Opens a film the device keeps, or starts a new one when there's none by that ID. */
	async load(id: string | null) {
		const film = id ? await getFilm(id).catch(() => undefined) : undefined;
		if (film) {
			const { frames, holds, voice, ...rest } = film;
			this.film = rest;
			this.holds = holds ?? {};
			this.voice = voice;
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
		this.#player.onshow = (index) => {
			this.showing = index;
			if (index !== 0) return;
			// The film's first picture: a recording starts with it, and a voice starts over with each round.
			if (this.#recorder && !this.recording) {
				this.#recorder.start();
				this.recording = true;
			} else if (!this.#recorder && this.#spoken?.sound) speak(this.#spoken.sound);
		};
		this.#player.onend = () => void this.#endRecording(true);
		// Turning a phone turns the camera's picture with it.
		video.addEventListener('resize', () => {
			if (video.videoWidth) this.source = { width: video.videoWidth, height: video.videoHeight };
		});
	}

	async startCamera() {
		this.#closeEar();
		closeCamera(this.#stream);
		this.#stream = undefined;
		if (this.#closed || !this.#video) return;
		// Only the latest start keeps its camera, as when the app comes back into view during a switch.
		const start = ++this.#starts;
		this.camera = 'starting';
		try {
			const stream = await this.#open();
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
			this.#hearWith(stream);
			this.cameras = await countCameras();
		} catch (error) {
			this.camera = error instanceof CameraError ? error.problem : 'unsupported';
		}
	}

	/**
	 * Opens the camera, together with the microphone while a clap is listened for. Where the microphone can't be
	 * had, the camera opens alone, and the studio goes on without the clap and says why.
	 */
	async #open() {
		if (this.trigger === 'clap') {
			listen(true);
			try {
				return await openCameraAndMicrophone(this.facing, this.#cameraLong(), earConstraints);
			} catch (error) {
				this.#giveUpClaps(error instanceof CameraError ? error.problem : problemOf(error));
			}
		}
		return openCamera(this.facing, this.#cameraLong());
	}

	/** Starts listening to the microphone a camera was opened with, or lets go of one no longer wanted. */
	#hearWith(stream: MediaStream) {
		if (this.trigger !== 'clap') return dropMicrophone(stream);
		if (!stream.getAudioTracks().length) return;
		try {
			this.#ear = new Ear(soundContext(), stream);
		} catch {
			dropMicrophone(stream);
			this.#giveUpClaps('unsupported');
		}
	}

	#giveUpClaps(problem: CameraProblem) {
		if (this.trigger !== 'clap') return;
		this.trigger = 'off';
		this.triggerProblem = problem;
		this.#unlisten();
		this.#watch();
	}

	#closeEar() {
		this.#ear?.close();
		this.#ear = undefined;
	}

	/** Lets the page's sound mix with other sound again, unless the microphone is still listened to for claps. */
	#unlisten() {
		listen(this.trigger === 'clap' && !this.#closed);
	}

	/**
	 * How long a picture the camera is asked for, in pixels: as long as the film's pictures. A film whose shape
	 * was chosen may lie while the camera's picture stands, or the other way round, and then keeps only the
	 * middle of it, so the camera is asked for 1080p, which leaves that middle sharp.
	 */
	#cameraLong() {
		const { long } = pictureQuality[this.settings.pictures];
		return this.settings.shape === 'auto' ? long : Math.max(long, 1920);
	}

	/**
	 * The app goes into the background, which stops the camera and the microphone anyway: the camera is let go,
	 * and a voice being recorded is given up, back at the camera.
	 */
	hide() {
		if (this.#voicing) this.live();
		this.stopCamera();
	}

	/** Lets the camera go. */
	stopCamera() {
		this.stopTimer();
		this.#starts++;
		this.#closeEar();
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

	/**
	 * The big button, pressed while the camera shows: it takes a picture, or with the self-timer starts the
	 * countdown to one, or stops a countdown under way. It then rests: presses that follow within its rest are
	 * the same press, to a child, whose second one would otherwise stop the countdown the first one started.
	 */
	shoot() {
		const now = performance.now();
		if (now < this.#rested || !this.#ready()) return;
		this.#rested = now + this.rest;
		if (this.counting) this.stopTimer();
		else if (this.timer) this.#countToPicture();
		else this.#take();
	}

	/**
	 * Chooses what presses the shutter by itself: the picture settling, a clap, or nothing. A clap needs the
	 * microphone, so the camera is opened again with it, and without it once claps aren't listened for.
	 */
	async setTrigger(trigger: Trigger) {
		if (trigger === this.trigger) return;
		const heard = this.trigger === 'clap';
		this.trigger = trigger;
		this.triggerProblem = undefined;
		this.stopTimer();
		this.#watch();
		if (trigger === 'clap') {
			// The tap is what lets the page's sound start, which listening is a part of.
			wake();
			await this.startCamera();
		} else if (heard) {
			this.#closeEar();
			if (this.#stream) dropMicrophone(this.#stream);
			this.#unlisten();
		}
	}

	/** Starts the trigger's clock, or stops it, and has the trigger start over. */
	#watch() {
		clearInterval(this.#watching);
		clearTimeout(this.#clapped);
		this.#watching = undefined;
		this.#still.reset();
		this.#claps.reset();
		this.stillness = 'waiting';
		this.settled = 0;
		this.loudness = 0;
		if (this.#closed) return;
		if (this.trigger === 'still') this.#watching = setInterval(() => this.#look(), lookEvery);
		if (this.trigger === 'clap') this.#watching = setInterval(() => this.#hear(), hearEvery);
	}

	/** One look at the camera's picture, for the trigger that waits for it to settle. */
	#look() {
		const video = this.#video;
		const shape = this.shape;
		// Whatever takes the camera's place, or counts down to a picture, has the watch start over.
		if (!video || !shape || !this.#ready() || this.counting) {
			this.#still.reset();
			this.stillness = 'waiting';
			this.settled = 0;
			return;
		}
		const source = { width: video.videoWidth, height: video.videoHeight };
		const look = this.#eye.look(video, zoomCrop(coverCrop(source, shape), this.zoom));
		if (!look) return;
		const still = this.#still.feed(look, performance.now());
		this.stillness = this.#still.state;
		this.settled = this.#still.progress;
		if (still) this.#fire();
	}

	/** One listen to the room, for the trigger that waits for a clap. */
	#hear() {
		const now = performance.now();
		const ear = this.#ear;
		if (!ear || !this.#ready() || this.counting || now < this.#deaf) {
			this.#claps.reset();
			this.loudness = 0;
			return;
		}
		const level = ear.level();
		const clap = this.#claps.feed(level, now, () => ear.heard());
		// The bar jumps with the room and falls back gently, in steps, so the page isn't redrawn for nothing.
		const shown = Math.max(Math.min(1, level / this.#claps.threshold), this.loudness - 0.1);
		this.loudness = Math.round(shown * 20) / 20;
		if (!clap) return;
		this.claps++;
		this.#deaf = now + clapWait + 100;
		this.#clapped = setTimeout(() => {
			if (this.trigger === 'clap') this.#fire();
		}, clapWait);
	}

	/** What a trigger does when it goes off: what the big button would, short of stopping a countdown. */
	#fire() {
		if (!this.#ready() || this.counting) return;
		this.#rested = performance.now() + this.rest;
		if (this.timer) this.#countToPicture();
		else this.#take();
	}

	/** Whether a picture can be taken: the camera is on and in view, and a film being opened has opened. */
	#ready() {
		return (
			this.loaded &&
			this.camera === 'on' &&
			this.mode === 'live' &&
			Boolean(this.#video?.videoWidth)
		);
	}

	/** Counts the seconds down to a picture, and again after it where that's asked. */
	#countToPicture() {
		this.#count(this.timer, () => {
			if (this.#take() && this.again && this.timer) this.#countToPicture();
		});
	}

	/** Counts seconds down, with a tick for each, and then does what was counted down to. */
	#count(left: number, then: () => void) {
		this.counting = left;
		tick();
		this.#countdown = setTimeout(() => {
			if (left > 1) return this.#count(left - 1, then);
			this.counting = 0;
			then();
		}, 1000);
	}

	/** Stops a countdown, as when the big button is pressed again, or the camera gives way to something else. */
	stopTimer() {
		clearTimeout(this.#countdown);
		this.counting = 0;
	}

	/** Sets the self-timer's seconds, or turns it off with 0, and keeps it for the next time. */
	setTimer(seconds: number) {
		this.stopTimer();
		this.timer = seconds;
		if (!seconds) this.again = false;
		this.#keep({ timer: seconds });
	}

	/** Takes a picture of what the camera shows, if it's on and in view, and says whether it did. */
	#take() {
		const video = this.#video;
		const ghost = this.#ghost;
		if (!this.#ready() || !video || !ghost) return false;
		const source = { width: video.videoWidth, height: video.videoHeight };
		const film = this.film ?? this.#start(source);
		const size = { width: film.width, height: film.height };
		const picture = this.#shutter.take(
			video,
			zoomCrop(coverCrop(source, size), this.zoom),
			size,
			this.mirrored,
			ghost,
			pictureQuality[this.settings.pictures].jpeg
		);
		const id = crypto.randomUUID();
		this.frames.push({ id, thumb: undefined });
		this.shots++;
		this.event = { type: 'taken', count: this.frames.length };
		click();
		tap();
		// The triggers start over with each picture, however it was taken, and the click isn't a clap.
		this.#still.reset();
		this.#deaf = performance.now() + Math.max(this.rest, ownSound);
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
		return true;
	}

	/** Starts a new film, shaped like the camera's picture, with its first picture. */
	#start(source: Size) {
		const now = Date.now();
		const film: Film = {
			id: crypto.randomUUID(),
			created: now,
			updated: now,
			...filmSize(source, this.settings.shape, pictureQuality[this.settings.pictures].long),
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
		delete this.holds[frame.id];
		// After the strip's thumbnail has had its moment to leave.
		if (frame.thumb) setTimeout(() => URL.revokeObjectURL(frame.thumb!), 1000);
		this.event = { type: 'removed', count: this.frames.length };
		pop();
		tap();
		this.#deaf = performance.now() + ownSound;
		this.#write(() => deleteFrame(film.id, frame.id));
		if (last) this.#write(() => this.#drawGhost());
		if (this.mode === 'review') {
			if (this.frames.length) this.select(Math.min(index, this.frames.length - 1));
			else this.live();
		}
	}

	/**
	 * Moves a picture to another place in the film, on the page. `moved` then keeps the new order on the device,
	 * once the picture has been put down.
	 */
	move(from: number, to: number) {
		if (this.mode === 'play' || from === to || !this.frames[from] || !this.frames[to]) return;
		const looked = this.frames[this.selected]?.id;
		const [frame] = this.frames.splice(from, 1);
		this.frames.splice(to, 0, frame);
		// The picture being looked at stays the one being looked at.
		if (looked) this.selected = this.frames.findIndex((other) => other.id === looked);
	}

	/** Keeps the pictures' order after `move`, and shows the last one as the ghost, which may be another now. */
	moved() {
		const film = this.film;
		if (!film) return;
		const order = this.frames.map((frame) => frame.id);
		this.#write(() => orderFrames(film.id, order));
		this.#write(() => this.#drawGhost());
	}

	/** Moves the picture being looked at one place earlier or later: what dragging does, for one press. */
	shift(by: -1 | 1) {
		const to = this.selected + by;
		if (this.mode !== 'review' || !this.frames[to]) return;
		this.move(this.selected, to);
		this.moved();
		this.event = { type: 'moved', count: to + 1 };
		tap();
	}

	/** Zooms the camera's picture in, for the pictures taken from now on. */
	setZoom(zoom: number) {
		this.zoom = within(zoomRange, zoom);
		// Zooming changes the whole picture, which isn't a toy being moved.
		this.#still.reset();
	}

	/** Sets how strongly the ghost shows, and keeps it for the next time. */
	setGhostStrength(strength: number) {
		this.ghostStrength = within(ghostRange, strength);
		this.#keep({ ghost: this.ghostStrength });
	}

	/** Shows or hides the grid over the camera, and keeps it for the next time. */
	setGrid(grid: boolean) {
		this.grid = grid;
		this.#keep({ grid });
	}

	/** Sets how many times a video plays the film, and keeps it for the next time. */
	setLoops(loops: number) {
		this.#keep({ loops });
	}

	/**
	 * Holds the picture being looked at on screen for `seconds` beyond its turn, on the page. `held` then keeps
	 * it on the device, once the slider has been let go.
	 */
	hold(seconds: number) {
		const frame = this.frames[this.selected];
		if (this.mode !== 'review' || !frame) return;
		const held = within(holdRange, seconds);
		if (held > 0) this.holds[frame.id] = held;
		else delete this.holds[frame.id];
	}

	/** Keeps how long the picture being looked at is held, after `hold`. */
	held() {
		const film = this.film;
		const frame = this.frames[this.selected];
		if (!film || !frame) return;
		const seconds = this.holds[frame.id] ?? 0;
		this.#write(() => holdFrame(film.id, frame.id, seconds));
	}

	/** Shows one picture taken earlier, big, in place of the camera. */
	select(index: number) {
		if (!this.frames[index]) return;
		this.#stopPlaying();
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
		this.#stopPlaying();
		this.mode = 'live';
		this.selected = -1;
		this.showing = -1;
		// The camera stopped if a voice was recorded.
		if (this.camera === 'off' && !this.#closed) void this.startCamera();
	}

	/** Stops the film and its voice, a countdown, and a recording under way, which is given up. */
	#stopPlaying() {
		this.stopTimer();
		void this.#endRecording(false);
		this.#player?.stop();
		hush();
	}

	/** Plays the film, round and round, once every picture in it can be read. */
	play() {
		if (this.frames.length < 2) return;
		this.#stopPlaying();
		this.mode = 'play';
		this.selected = -1;
		this.voiceProblem = undefined;
		const ids = this.frames.map((frame) => frame.id);
		const holds = $state.snapshot(this.holds);
		const voice = this.voice;
		// The tap that plays the film is what lets its voice be heard, a moment later.
		if (voice) wake();
		this.#write(async () => {
			if (voice && this.#spoken?.voice !== voice) {
				this.#spoken = { voice, sound: await decodeVoice(voice) };
			}
			if (!voice) this.#spoken = undefined;
			if (this.mode === 'play' && !this.#voicing)
				this.#player?.play(ids, speeds[this.speed], holds);
		});
	}

	/**
	 * Records a voice over the film: after a short countdown, the film plays through once while the microphone
	 * listens, and what was said becomes the film's voice, in place of any it had. `finishRecording` ends it
	 * sooner and keeps what was said so far; anything else that stops the film gives it up.
	 */
	async record() {
		const film = this.film;
		if (!film || this.frames.length < 2 || this.#voicing) return;
		this.#stopPlaying();
		this.#voicing = true;
		this.mode = 'play';
		this.selected = -1;
		this.showing = -1;
		this.voiceProblem = undefined;
		this.stopCamera();
		const take = ++this.#takes;
		const ids = this.frames.map((frame) => frame.id);
		const holds = $state.snapshot(this.holds);
		const first = decode(getImage, ids[0]);
		try {
			listen(true);
			const microphone = await openMicrophone();
			// Given up while the browser was asking.
			if (take !== this.#takes || this.mode !== 'play') {
				closeCamera(microphone);
				return void first.then((picture) => picture?.close());
			}
			this.#microphone = microphone;
		} catch (error) {
			this.#unlisten();
			void first.then((picture) => picture?.close());
			if (take !== this.#takes) return;
			// The film plays on, with why it has no voice yet.
			this.#voicing = false;
			this.play();
			this.voiceProblem = error instanceof CameraError ? error.problem : 'unsupported';
			return;
		}
		// The film's first picture waits on screen while the seconds are counted down.
		const picture = await first;
		if (picture && this.#screen && take === this.#takes) draw(this.#screen, picture);
		picture?.close();
		if (take !== this.#takes) return;
		this.#count(voiceCountdown, () => {
			const microphone = this.#microphone;
			if (!microphone) return;
			this.#microphone = undefined;
			try {
				this.#recorder = new VoiceRecorder(microphone);
			} catch {
				closeCamera(microphone);
				this.#unlisten();
				this.#voicing = false;
				this.play();
				this.voiceProblem = 'unsupported';
				return;
			}
			// The recorder starts with the first picture (`attach`), and the film's end ends it.
			this.#player?.play(ids, speeds[this.speed], holds, true);
		});
	}

	/** Ends a recording before the film does, and keeps what was said so far. */
	finishRecording() {
		if (!this.recording) return;
		this.#player?.stop();
		void this.#endRecording(true);
	}

	/** Ends a recording, or the wait for one, and lets the microphone go. A voice that's kept is then played. */
	async #endRecording(keep: boolean) {
		this.#takes++;
		this.#voicing = false;
		closeCamera(this.#microphone);
		this.#microphone = undefined;
		const recorder = this.#recorder;
		this.#recorder = undefined;
		this.recording = false;
		if (!recorder) return this.#unlisten();
		const voice = await recorder.stop();
		this.#unlisten();
		const film = this.film;
		if (!keep || !voice?.size || !film) return;
		this.voice = voice;
		this.event = { type: 'voiced', count: this.frames.length };
		this.#write(() => setVoice(film.id, voice));
		if (this.mode === 'play') this.play();
	}

	/** Takes the film's voice away. */
	removeVoice() {
		const film = this.film;
		if (!film || !this.voice || this.#recorder) return;
		this.voice = undefined;
		this.#spoken = undefined;
		hush();
		this.event = { type: 'unvoiced', count: this.frames.length };
		pop();
		tap();
		this.#write(() => setVoice(film.id, undefined));
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
		return (
			film && {
				...$state.snapshot(film),
				frames: this.frames.map((frame) => frame.id),
				holds: $state.snapshot(this.holds),
				voice: this.voice
			}
		);
	}

	/** Closes the studio. Pictures still being encoded or saved finish first. */
	close() {
		this.#closed = true;
		this.#watch();
		this.#stopPlaying();
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

/** Lets a stream's microphone go and keeps its camera. */
function dropMicrophone(stream: MediaStream) {
	for (const track of stream.getAudioTracks()) {
		track.stop();
		stream.removeTrack(track);
	}
}

/** Draws a picture on a canvas of its own size. */
function draw(canvas: HTMLCanvasElement, picture: ImageBitmap) {
	if (canvas.width !== picture.width) canvas.width = picture.width;
	if (canvas.height !== picture.height) canvas.height = picture.height;
	canvas.getContext('2d')!.drawImage(picture, 0, 0);
}
