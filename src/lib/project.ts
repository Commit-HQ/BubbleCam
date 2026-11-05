import { PUBLIC_SITE_URL } from '$app/env/public';
import { defaultLocale, type Locale } from '#lib/i18n/locales.ts';

export const repositoryUrl = 'https://github.com/Commit-HQ/BubbleCam';
export const organizationUrl = 'https://github.com/Commit-HQ';
export const bubbleBoardUrl = 'https://bubbleboard.fyi';

/** BubbleCam's page on Commit's site, which tells what BubbleCam is (docs/adr/0001-an-origin-of-its-own.md). */
export function aboutUrl(locale: Locale) {
	return `${bubbleBoardUrl}${locale === defaultLocale ? '' : `/${locale}`}/apps/bubblecam`;
}
export const contactEmail = 'commit-devs@proton.me';

/** An absolute link on this site, for canonical URLs and link previews (src/env.ts checks the origin). */
export function absoluteUrl(path: string) {
	return new URL(path, PUBLIC_SITE_URL).href;
}
