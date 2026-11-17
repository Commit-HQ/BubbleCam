import { describe, expect, it } from 'vitest';
import { coverCrop, filmSize, fit, orientationOf, thumbSize, zoomCrop } from './geometry.ts';

describe('filmSize', () => {
	it('keeps 720p pictures as they are', () => {
		expect(filmSize({ width: 1280, height: 720 })).toEqual({ width: 1280, height: 720 });
		expect(filmSize({ width: 720, height: 1280 })).toEqual({ width: 720, height: 1280 });
	});

	it('makes bigger pictures 1280 pixels long, in their own shape', () => {
		expect(filmSize({ width: 1920, height: 1080 })).toEqual({ width: 1280, height: 720 });
		expect(filmSize({ width: 4032, height: 3024 })).toEqual({ width: 1280, height: 960 });
	});

	it('rounds both sides to a multiple of 16 for video encoders', () => {
		const { width, height } = filmSize({ width: 1000, height: 562 });
		expect(width % 16).toBe(0);
		expect(height % 16).toBe(0);
		expect(width / height).toBeCloseTo(1000 / 562, 1);
	});

	it('lies or stands as chosen, whichever way the camera is held', () => {
		// A phone held upright, for a film that lies: the middle of the camera's picture, 720 by 405.
		expect(filmSize({ width: 720, height: 1280 }, 'landscape')).toEqual({
			width: 720,
			height: 400
		});
		expect(filmSize({ width: 1280, height: 720 }, 'portrait')).toEqual({ width: 400, height: 720 });
		expect(filmSize({ width: 1280, height: 720 }, 'landscape')).toEqual({
			width: 1280,
			height: 720
		});
		expect(filmSize({ width: 720, height: 1280 }, 'portrait')).toEqual({
			width: 720,
			height: 1280
		});
	});

	it('is as long as the pictures’ quality asks, and never longer than the camera’s picture', () => {
		expect(filmSize({ width: 1920, height: 1080 }, 'auto', 1920)).toEqual({
			width: 1920,
			height: 1088
		});
		expect(filmSize({ width: 1920, height: 1080 }, 'auto', 960)).toEqual({
			width: 960,
			height: 544
		});
		expect(filmSize({ width: 1280, height: 720 }, 'auto', 1920)).toEqual({
			width: 1280,
			height: 720
		});
	});
});

it('tells a lying picture from a standing one', () => {
	expect(orientationOf({ width: 1280, height: 720 })).toBe('landscape');
	expect(orientationOf({ width: 720, height: 1280 })).toBe('portrait');
	expect(orientationOf({ width: 480, height: 480 })).toBe('landscape');
});

describe('coverCrop', () => {
	it('keeps the middle of a wider picture', () => {
		expect(coverCrop({ width: 1600, height: 900 }, { width: 1200, height: 900 })).toEqual({
			x: 200,
			y: 0,
			width: 1200,
			height: 900
		});
	});

	it('keeps the middle of a taller picture, such as a tablet turned upright', () => {
		const crop = coverCrop({ width: 720, height: 1280 }, { width: 1280, height: 720 });
		expect(crop.x).toBe(0);
		expect(crop.width).toBe(720);
		expect(crop.height).toBeCloseTo(405);
		expect(crop.y).toBeCloseTo((1280 - 405) / 2);
	});

	it('keeps the whole picture when the shapes match', () => {
		expect(coverCrop({ width: 1280, height: 720 }, { width: 640, height: 360 })).toEqual({
			x: 0,
			y: 0,
			width: 1280,
			height: 720
		});
	});
});

it('zooms into the middle of what a picture keeps', () => {
	const whole = { x: 100, y: 0, width: 1200, height: 900 };
	expect(zoomCrop(whole, 1)).toEqual(whole);
	expect(zoomCrop(whole, 2)).toEqual({ x: 400, y: 225, width: 600, height: 450 });
});

it('fits a shape in a space', () => {
	const wide = fit({ width: 1000, height: 500 }, { width: 1280, height: 720 });
	expect(wide.height).toBe(500);
	expect(wide.width).toBeCloseTo((500 * 1280) / 720);
	const tall = fit({ width: 300, height: 800 }, { width: 1280, height: 720 });
	expect(tall.width).toBe(300);
	expect(tall.height).toBeCloseTo((300 * 720) / 1280);
});

it('sizes thumbnails by their height', () => {
	expect(thumbSize({ width: 1280, height: 720 })).toEqual({ width: 256, height: 144 });
	expect(thumbSize({ width: 720, height: 1280 })).toEqual({ width: 81, height: 144 });
});
