// Keeping a phone's or tablet's screen from turning while a cartoon is shot, when a grown-up asks for it. Only
// Chromium browsers on Android can: an installed app locks its screen as it is, and a browser tab only while
// it's full screen, so the studio goes full screen there. iPhones and iPads lock their screens in Control
// Centre, which no website can reach. Browser-only.

import type { Orientation } from './geometry.ts';

/** The screen's orientation, with the locking that TypeScript's DOM types leave out. */
type Lockable = ScreenOrientation & { lock?: (orientation: Orientation) => Promise<void> };

const orientation = () => screen.orientation as Lockable | undefined;

/** Whether this is an iPhone or iPad, whose iPadOS says it's a Mac with a touchscreen. */
export function isAppleTouch() {
	return (
		/iPhone|iPad|iPod/.test(navigator.userAgent) ||
		(/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1)
	);
}

/** Whether this browser can keep a screen from turning: one that locks, on a device that turns in the hand. */
export function locksRotation() {
	return (
		typeof orientation()?.lock === 'function' &&
		matchMedia('(pointer: coarse)').matches &&
		!isAppleTouch()
	);
}

/** How the screen is held now. */
export function heldAs(): Orientation {
	const type = orientation()?.type;
	if (type) return type.startsWith('portrait') ? 'portrait' : 'landscape';
	return innerWidth >= innerHeight ? 'landscape' : 'portrait';
}

/**
 * Keeps the screen lying or standing until the returned function is called. Where that takes full screen,
 * which starts only from a tap, the first tap starts it, as does the next one after a swipe has ended it.
 */
export function lockRotation(as: Orientation): () => void {
	const screenOrientation = orientation();
	if (typeof screenOrientation?.lock !== 'function') return () => {};
	const lock = screenOrientation.lock.bind(screenOrientation);
	let released = false;
	/** Whether locking takes full screen here, and whether this lock is what made the page full screen. */
	let needsFullScreen = false;
	let wentFullScreen = false;

	const attempt = async () => {
		try {
			if (needsFullScreen && !document.fullscreenElement) {
				// Without a tap just before, the browser would only refuse and complain; the next tap asks again.
				if (navigator.userActivation && !navigator.userActivation.isActive) return;
				await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
				wentFullScreen = true;
			}
			await lock(as);
			if (released) release();
		} catch (error) {
			// A tab that isn't full screen is refused for its own safety; anything else can't be helped.
			const refused = error instanceof DOMException && error.name === 'SecurityError';
			if (refused && !needsFullScreen) {
				needsFullScreen = true;
				await attempt();
			}
		}
	};
	const tapped = () => {
		if (needsFullScreen && !document.fullscreenElement) void attempt();
	};
	const release = () => {
		released = true;
		removeEventListener('pointerup', tapped);
		try {
			screenOrientation.unlock();
		} catch {
			// A screen that was never locked turns anyway.
		}
		if (wentFullScreen && document.fullscreenElement)
			void document.exitFullscreen().catch(() => {});
		wentFullScreen = false;
	};

	addEventListener('pointerup', tapped);
	void attempt();
	return release;
}
