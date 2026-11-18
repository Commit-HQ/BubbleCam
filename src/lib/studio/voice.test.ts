import { expect, it } from 'vitest';
import { mixSamples } from './voice.ts';

const samples = (...values: number[]) => Float32Array.from(values);

it('has nothing to mix without a sound to hear', () => {
	expect(mixSamples([])).toBeUndefined();
	expect(mixSamples([{ samples: samples(), volume: 1 }])).toBeUndefined();
	expect(mixSamples([{ samples: samples(0.5, 0.5), volume: 0 }])).toBeUndefined();
});

it('leaves a single sound as it was recorded', () => {
	expect(mixSamples([{ samples: samples(0.25, -0.5), volume: 1 }])).toEqual(samples(0.25, -0.5));
});

it('adds sounds up, each as loud as it’s set, for as long as the longest lasts', () => {
	const mixed = mixSamples([
		{ samples: samples(0.5, 0.5, 0.5), volume: 1 },
		{ samples: samples(0.5, -0.5), volume: 0.5 },
		{ samples: samples(1, 1, 1, 1), volume: 0 }
	]);
	expect(mixed).toEqual(samples(0.75, 0.25, 0.5));
});

it('keeps the sum within what a sound file can hold', () => {
	const mixed = mixSamples([
		{ samples: samples(0.75, -0.75), volume: 1 },
		{ samples: samples(0.75, -0.75), volume: 1 }
	]);
	expect(mixed).toEqual(samples(1, -1));
});
