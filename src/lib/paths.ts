import { defaultLocale, isLocale, type Locale } from '#lib/i18n/locales.ts';

// Every path the site links to. The site is the app: its home is the cartoons' page, in Croatian, the default
// language, without a prefix (`/`, `/film`), and in English under `/en`. BubbleCam's landing page is on
// Commit's site, at aboutUrl in project.ts.

const prefix = (locale: Locale) => (locale === defaultLocale ? '' : `/${locale}`);

export function privacyPath(locale: Locale) {
	return `${prefix(locale)}/privacy`;
}

/** The app's cartoons, and the studio where one is shot. Pages are prerendered once, so the cartoon's ID
 * travels in the query; a studio without one starts a new cartoon. */
export function appPath(locale: Locale, film?: { id?: string }) {
	if (!film) return prefix(locale) || '/';
	const studio = `${prefix(locale)}/film`;
	return film.id ? `${studio}?${new URLSearchParams({ id: film.id })}` : studio;
}

/** Each language's web app manifest, beside its cartoons' page. */
export function manifestPath(locale: Locale) {
	return `${prefix(locale)}/manifest.webmanifest`;
}

/** The language of a path, from its prefix. Any other path, even one no page has, is in the default language. */
export function pathLocale(pathname: string): Locale {
	const [, first] = pathname.split('/');
	return first !== defaultLocale && isLocale(first) ? first : defaultLocale;
}

/** Whether a path is one of the app's pages, the cartoons' page and the studio, rather than the privacy page or
 * a page no one has. */
export function isAppPath(pathname: string) {
	const page = pathname.slice(prefix(pathLocale(pathname)).length) || '/';
	return page === '/' || page === '/film';
}

/** The current page in another language, without the query or fragment. */
export function localizedPath(pathname: string, locale: Locale) {
	const [, first = '', rest = ''] = /^\/([^/]*)(.*)$/.exec(pathname) ?? [];
	const path = first !== defaultLocale && isLocale(first) ? rest : pathname;
	return `${prefix(locale)}${path === '/' ? '' : path}` || '/';
}
