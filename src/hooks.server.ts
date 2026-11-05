import type { Handle } from '@sveltejs/kit/hooks';
import { isAppPath, pathLocale } from '#lib/paths.ts';

// Runs as each page is prerendered: there's no server once the site is built.
export const handle: Handle = ({ event, resolve }) => {
	// From the path, so a 404 page is in the language its address asks for.
	const locale = pathLocale(event.url.pathname);
	const app = isAppPath(event.url.pathname);
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', locale),
		// Preload the fonts first paint needs: Baloo 2, for headings and the app's few words, everywhere, and
		// Hanken Grotesk for the privacy page's text. Only Croatian uses Latin Extended (č ć đ š ž).
		preload: (file) => {
			if (file.type !== 'font') return file.type === 'js' || file.type === 'css';
			if (file.filename.includes('-latin-ext-') && locale !== 'hr') return false;
			return file.filename.includes('baloo-2') || !app;
		}
	});
};
