import { en, type Messages } from './en.ts';
import { hr } from './hr.ts';
import type { Locale } from './locales.ts';

export { defaultLocale, isLocale, locales, type Locale } from './locales.ts';
export type { Messages };

export const messages: Record<Locale, Messages> = { hr, en };

const days: Partial<Record<Locale, Intl.DateTimeFormat>> = {};

/** The day a cartoon was made, such as “2 November” or “2. studenoga”. */
export function formatDay(locale: Locale, time: number) {
	// A formatter is slow to make, so each language's is made once.
	days[locale] ??= new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' });
	return days[locale].format(time);
}
