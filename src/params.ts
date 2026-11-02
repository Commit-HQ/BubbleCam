import { defineParams } from '@sveltejs/kit/params';
import { defaultLocale, isLocale } from '#lib/i18n/locales.ts';

export const params = defineParams({
	// `/` already serves the default language, so only the other languages get a path prefix.
	locale: (param) => (param !== defaultLocale && isLocale(param) ? param : undefined)
});
