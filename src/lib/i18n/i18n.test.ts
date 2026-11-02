import { expect, it } from 'vitest';
import { messages } from './index.ts';

it('counts pictures in each language’s plural', () => {
	const hr = messages.hr.app.films.pictures;
	expect([1, 2, 4, 5, 11, 21, 22, 25].map(hr)).toEqual([
		'1 sličica',
		'2 sličice',
		'4 sličice',
		'5 sličica',
		'11 sličica',
		'21 sličica',
		'22 sličice',
		'25 sličica'
	]);
	expect([1, 2].map(messages.en.app.films.pictures)).toEqual(['1 picture', '2 pictures']);
});

it('has the same words to say in both languages', () => {
	// The types already match; this catches a list with an item missing in one language.
	const shape = (value: unknown): unknown =>
		Array.isArray(value)
			? value.length
			: value && typeof value === 'object'
				? Object.fromEntries(Object.entries(value).map(([key, item]) => [key, shape(item)]))
				: typeof value;
	expect(shape(messages.hr)).toEqual(shape(messages.en));
});
