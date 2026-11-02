import { messages } from '#lib/i18n/index.ts';
import { appPath, pathLocale } from '#lib/paths.ts';
import type { RequestHandler } from './$types';

// The web app manifest, in each language, written to a file at build time. Both start the same app, with one ID
// and scope, so installing from either language gives one BubbleCam. The "any" icons are the favicon's rounded
// tile; the maskable ones are app-icon.svg, full bleed, for launchers that cut their own shape.

export const prerender = true;

/** The page's colour, `--color-canvas` in app.css. */
const canvas = '#fffaf3';

export const GET: RequestHandler = ({ url }) => {
	const locale = pathLocale(url.pathname);
	const icon = (name: string, size: number, purpose: 'any' | 'maskable') => ({
		src: `/icons/${name}-${size}.png`,
		sizes: `${size}x${size}`,
		type: 'image/png',
		purpose
	});
	return Response.json(
		{
			id: '/app',
			name: 'BubbleCam',
			short_name: 'BubbleCam',
			description: messages[locale].description,
			lang: locale,
			dir: 'ltr',
			start_url: appPath(locale),
			scope: '/',
			display: 'standalone',
			orientation: 'any',
			background_color: canvas,
			theme_color: canvas,
			categories: ['kids', 'education', 'photo'],
			icons: [
				icon('icon', 192, 'any'),
				icon('icon', 512, 'any'),
				icon('icon-maskable', 192, 'maskable'),
				icon('icon-maskable', 512, 'maskable')
			]
		},
		{ headers: { 'content-type': 'application/manifest+json' } }
	);
};
