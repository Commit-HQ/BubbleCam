import { expect, it } from 'vitest';
import { newSum, solves } from './gate.ts';

it('asks for a product from the times table', () => {
	expect(newSum(undefined, () => 0)).toEqual({ a: 3, b: 3 });
	expect(newSum(undefined, () => 0.999)).toEqual({ a: 9, b: 9 });
	for (let i = 0; i < 100; i++) {
		const { a, b } = newSum();
		expect(a).toBeGreaterThanOrEqual(3);
		expect(a).toBeLessThanOrEqual(9);
		expect(b).toBeGreaterThanOrEqual(3);
		expect(b).toBeLessThanOrEqual(9);
	}
});

it('never asks the same sum twice in a row', () => {
	expect(newSum({ a: 3, b: 3 }, () => 0)).toEqual({ a: 3, b: 4 });
	expect(newSum({ a: 9, b: 9 }, () => 0.999)).toEqual({ a: 9, b: 3 });
});

it('takes only the right number as the answer', () => {
	const sum = { a: 6, b: 7 };
	expect(solves(sum, '42')).toBe(true);
	expect(solves(sum, ' 42 ')).toBe(true);
	expect(solves(sum, '41')).toBe(false);
	expect(solves(sum, '')).toBe(false);
	expect(solves(sum, '4e1')).toBe(false);
	expect(solves(sum, '42.0')).toBe(false);
});
