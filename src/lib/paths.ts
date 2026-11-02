import { defaultLocale, isLocale, type Locale } from '#lib/i18n/locales.ts';

// Every path the site links to. The default language, Croatian, has no prefix (`/`, `/app`); English does
// (`/en`, `/en/app`).

const prefix = (locale: Locale) => (locale === defaultLocale ? '' : `/${locale}`);

export function homePath(locale: Locale) {
	return prefix(locale) || '/';
}

export function privacyPath(locale: Locale) {
	return `${prefix(locale)}/privacy`;
}

/** The app's cartoons, and the studio where one is shot. Pages are prerendered once, so the cartoon's ID
 * travels in the query; a studio without one starts a new cartoon. */
export function appPath(locale: Locale, film?: { id?: string }) {
	const path = `${prefix(locale)}/app`;
	if (!film) return path;
	return film.id ? `${path}/film?${new URLSearchParams({ id: film.id })}` : `${path}/film`;
}

/** The language of a path, from its prefix. Any other path, even one no page has, is in the default language. */
export function pathLocale(pathname: string): Locale {
	const [, first] = pathname.split('/');
	return first !== defaultLocale && isLocale(first) ? first : defaultLocale;
}

/** Whether a path is one of the app's pages, which the installed app keeps in its own window. */
export function isAppPath(pathname: string) {
	const app = appPath(pathLocale(pathname));
	return pathname === app || pathname.startsWith(`${app}/`);
}

/** The current page in another language, without the query or fragment. */
export function localizedPath(pathname: string, locale: Locale) {
	const [, first = '', rest = ''] = /^\/([^/]*)(.*)$/.exec(pathname) ?? [];
	const path = first !== defaultLocale && isLocale(first) ? rest : pathname;
	return `${prefix(locale)}${path === '/' ? '' : path}` || '/';
}
