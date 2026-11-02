import { expect, it } from 'vitest';
import { speedOf, speeds } from './studio.svelte.ts';

it('reads a film’s speed as the nearest a child can pick', () => {
	expect(speedOf(speeds.slow)).toBe('slow');
	expect(speedOf(speeds.walk)).toBe('walk');
	expect(speedOf(speeds.fast)).toBe('fast');
	expect(speedOf(1)).toBe('slow');
	expect(speedOf(7)).toBe('walk');
	expect(speedOf(24)).toBe('fast');
});
