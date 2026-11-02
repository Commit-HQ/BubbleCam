// The languages, apart from their messages, so code that only checks a language, such as the route matcher,
// doesn't bundle every word of both.

export const locales = ['hr', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'hr';

export function isLocale(value: unknown): value is Locale {
	return locales.includes(value as Locale);
}
