import { expect, it } from 'vitest';
import { defaults, inForce, readSettings, type Settings } from './settings.ts';

const chosen: Settings = {
	shape: 'portrait',
	lock: true,
	rest: 1.5,
	sounds: false,
	guard: true,
	guardVideo: true,
	pictures: 'high',
	video: 'small',
	advanced: true,
	ghost: 0.7,
	grid: true,
	timer: 5,
	loops: 3
};

it('starts with the defaults, on a device that has kept nothing', () => {
	expect(readSettings(null)).toEqual(defaults);
	expect(readSettings('not JSON')).toEqual(defaults);
	expect(readSettings('null')).toEqual(defaults);
});

it('reads back what was chosen', () => {
	expect(readSettings(JSON.stringify(chosen))).toEqual(chosen);
});

it('keeps the default for anything it doesn’t understand', () => {
	const kept = { shape: 'round', lock: 'yes', ghost: 'strong', pictures: 'huge', video: 'high' };
	expect(readSettings(JSON.stringify(kept))).toEqual({ ...defaults, video: 'high' });
	expect(readSettings(JSON.stringify({ loops: 4 })).loops).toBe(1);
	expect(readSettings(JSON.stringify({ timer: 7 })).timer).toBe(0);
});

it('keeps numbers within what the sliders allow', () => {
	expect(readSettings(JSON.stringify({ ghost: 5 })).ghost).toBe(0.9);
	expect(readSettings(JSON.stringify({ ghost: 0 })).ghost).toBe(0.1);
	expect(readSettings(JSON.stringify({ rest: 60 })).rest).toBe(2);
	expect(readSettings(JSON.stringify({ rest: 0 })).rest).toBe(0);
});

it('follows what belongs to the advanced tools only while they’re on', () => {
	expect(inForce(chosen)).toEqual(chosen);
	expect(inForce({ ...chosen, advanced: false })).toEqual({
		...chosen,
		advanced: false,
		ghost: defaults.ghost,
		grid: false,
		timer: 0,
		loops: 1
	});
});
