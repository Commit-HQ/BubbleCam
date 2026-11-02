import { defineEnvVars } from '@sveltejs/kit/env';

// Build-time settings, from `.env` (see `.env.example`).
export const variables = defineEnvVars({
	PUBLIC_SITE_URL: {
		public: true,
		// Prerendered pages are written once, at build time, so the address is too.
		static: true,
		description:
			'The public origin of the site, such as https://bubblecam.example.com, for canonical URLs and link previews.',
		schema: siteOrigin
	}
});

/** Accepts `https://host[:port]`, with or without a trailing slash, and `http://` for localhost only. */
function siteOrigin(value: string | undefined) {
	// The message never repeats the value, which could contain credentials.
	const invalid = (reason: string) =>
		new Error(
			`PUBLIC_SITE_URL ${reason}. Set it in .env to the public origin of the site, such as https://bubblecam.example.com (see .env.example).`
		);
	if (!value) throw invalid('is not set');
	if (!URL.canParse(value)) throw invalid('is not a valid URL');
	const url = new URL(value);
	const localhost = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
	if (url.protocol !== 'https:' && !(url.protocol === 'http:' && localhost)) {
		throw invalid('must start with https:// (http:// is allowed only for localhost)');
	}
	if (url.username || url.password) throw invalid('must not contain a username or password');
	if (url.pathname !== '/' || /[?#]/.test(value)) {
		throw invalid('must not have a path, query, or fragment');
	}
	return url.origin;
}
