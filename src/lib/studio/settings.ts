// What a grown-up sets for the studio, kept on the device like the cartoons. The cartoons' page asks a sum
// before it shows them (src/lib/app/gate.ts). The advanced tools are one of them: what belongs to those tools
// alone, the ghost's strength, the grid, the self-timer, and how often a video repeats, counts only while
// they're on, so switching them off brings back the plain studio without forgetting what was chosen.

import { longSide, type Shape } from './geometry.ts';

export type Quality = 'small' | 'normal' | 'high';

export type Settings = {
	/** The shape of new cartoons: as the device is held, or always lying or standing. */
	shape: Shape;
	/** Whether the studio keeps the screen from turning, where the browser can (rotation.ts). */
	lock: boolean;
	/** How long the shutter rests after a picture, in seconds. */
	rest: number;
	/** Whether the shutter clicks and a deleted picture pops. */
	sounds: boolean;
	/** Whether deleting a cartoon asks the sum first, as the settings do, and whether making a video does. */
	guard: boolean;
	guardVideo: boolean;
	/** How large and how finely new pictures are kept. */
	pictures: Quality;
	/** How sharp a video is made. */
	video: Quality;
	/**
	 * Whether the studio has its extra tools: zooming, the ghost's strength, the grid, the self-timer, moving
	 * and holding pictures, and a video that repeats.
	 */
	advanced: boolean;
	/** How strongly the ghost shows over the camera, as an opacity. */
	ghost: number;
	/** Whether lines divide the camera's picture in thirds, to keep a toy in its place. */
	grid: boolean;
	/** How many seconds the self-timer counts down before a picture, or 0 without one. */
	timer: number;
	/** How many times a video plays the cartoon. */
	loops: number;
};

/**
 * How long the shutter may rest. A small finger often lands on the button two or three times for one picture,
 * so the rest that follows a picture takes those presses as the same one.
 */
export const restRange = { min: 0, max: 2, step: 0.1 };

/** The ghost's strength: strong enough to line a toy up against, faint enough to see the camera through. */
export const ghostRange = { min: 0.1, max: 0.9, step: 0.05 };

/** How far the studio zooms in. Zooming keeps the middle of the camera's picture, so further would be a blur. */
export const zoomRange = { min: 1, max: 3, step: 0.1 };

/** How long a picture can be held on screen beyond its turn, in seconds. */
export const holdRange = { min: 0, max: 5, step: 0.5 };

/** The self-timer's countdowns, in seconds: none, or long enough to take a hand away, or to get in the picture. */
export const timerChoices = [0, 3, 5, 10];

/** How many times a video can play the cartoon. */
export const loopChoices = [1, 2, 3, 5];

export const defaults: Settings = {
	shape: 'auto',
	lock: false,
	rest: 0.8,
	sounds: true,
	guard: false,
	guardVideo: false,
	pictures: 'normal',
	video: 'normal',
	advanced: false,
	ghost: 0.45,
	grid: false,
	timer: 0,
	loops: 1
};

/** The long side of a new cartoon's pictures, in pixels, which is also what the camera is asked for, and their
 * JPEG quality. */
export const pictureQuality: Record<Quality, { long: number; jpeg: number }> = {
	small: { long: 960, jpeg: 0.8 },
	normal: { long: longSide, jpeg: 0.9 },
	high: { long: 1920, jpeg: 0.92 }
};

/** Where the device keeps them. */
const key = 'bubblecam:settings';

const shapes: Shape[] = ['auto', 'landscape', 'portrait'];
const qualities: Quality[] = ['small', 'normal', 'high'];

/** The settings in what the device kept, with the default for anything missing or not understood. */
export function readSettings(kept: string | null): Settings {
	let found: Partial<Record<keyof Settings, unknown>> = {};
	try {
		const parsed: unknown = JSON.parse(kept ?? '{}');
		if (parsed && typeof parsed === 'object') found = parsed;
	} catch {
		// Nothing to read is nothing set.
	}
	const one = <T>(options: T[], value: unknown, otherwise: T) =>
		options.includes(value as T) ? (value as T) : otherwise;
	const flag = (value: unknown, otherwise: boolean) =>
		typeof value === 'boolean' ? value : otherwise;
	const within = (range: { min: number; max: number }, value: unknown, otherwise: number) =>
		typeof value === 'number' && Number.isFinite(value)
			? Math.min(range.max, Math.max(range.min, value))
			: otherwise;
	return {
		shape: one(shapes, found.shape, defaults.shape),
		lock: flag(found.lock, defaults.lock),
		rest: within(restRange, found.rest, defaults.rest),
		sounds: flag(found.sounds, defaults.sounds),
		guard: flag(found.guard, defaults.guard),
		guardVideo: flag(found.guardVideo, defaults.guardVideo),
		pictures: one(qualities, found.pictures, defaults.pictures),
		video: one(qualities, found.video, defaults.video),
		advanced: flag(found.advanced, defaults.advanced),
		ghost: within(ghostRange, found.ghost, defaults.ghost),
		grid: flag(found.grid, defaults.grid),
		timer: one(timerChoices, found.timer, defaults.timer),
		loops: one(loopChoices, found.loops, defaults.loops)
	};
}

/** The settings as the studio follows them: what belongs to the advanced tools only while they're on. */
export function inForce(settings: Settings): Settings {
	if (settings.advanced) return settings;
	const { ghost, grid, timer, loops } = defaults;
	return { ...settings, ghost, grid, timer, loops };
}

export function loadSettings(): Settings {
	try {
		return readSettings(localStorage.getItem(key));
	} catch {
		// Where the device keeps nothing, and while pages are prerendered, the defaults hold.
		return { ...defaults };
	}
}

export function saveSettings(settings: Settings) {
	try {
		localStorage.setItem(key, JSON.stringify(settings));
	} catch {
		// They hold until the app is closed.
	}
}
