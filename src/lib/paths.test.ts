import { expect, it } from 'vitest';
import { aboutUrl } from './project.ts';
import { appPath, isAppPath, localizedPath, pathLocale, privacyPath } from './paths.ts';

it('leaves the default language unprefixed', () => {
	expect([appPath('hr'), appPath('en')]).toEqual(['/app', '/en/app']);
	expect([aboutUrl('hr'), aboutUrl('en')]).toEqual([
		'https://bubbleboard.fyi/apps/bubblecam',
		'https://bubbleboard.fyi/en/apps/bubblecam'
	]);
	expect([privacyPath('hr'), privacyPath('en')]).toEqual(['/privacy', '/en/privacy']);
});

it('puts a cartoon in the query of the studio, and starts a new one without it', () => {
	expect(appPath('en', { id: 'a1b2' })).toBe('/en/app/film?id=a1b2');
	expect(appPath('hr', {})).toBe('/app/film');
});

it('tells the app’s pages from the others', () => {
	expect(['/app', '/app/film', '/en/app', '/en/app/film'].every(isAppPath)).toBe(true);
	expect(['/', '/en', '/privacy', '/application', '/en/apple'].some(isAppPath)).toBe(false);
});

it('reads the language of a path, including one no page has', () => {
	expect(['/', '/app', '/english', '/nothing-here'].map(pathLocale)).toEqual([
		'hr',
		'hr',
		'hr',
		'hr'
	]);
	expect(['/en', '/en/app/film', '/en/nothing-here'].map(pathLocale)).toEqual(['en', 'en', 'en']);
});

it('switches the language of the current page', () => {
	expect(localizedPath('/', 'en')).toBe('/en');
	expect(localizedPath('/en', 'hr')).toBe('/');
	expect(localizedPath('/app/film', 'en')).toBe('/en/app/film');
	expect(localizedPath('/en/privacy', 'hr')).toBe('/privacy');
	expect(localizedPath('/english', 'en')).toBe('/en/english');
});
