// BubbleCam's service worker keeps the whole site on the device, so the app opens and works without a network,
// in a playroom without Wi-Fi or a car on the motorway. Installing a version stores every file it has, each
// version in a cache of its own; the app's pages then come from the device, and the privacy page from the
// network when there is one.
//
// A new version takes over as soon as it's stored. The previous version's cache stays until the next one
// arrives, so an app still running it can load the code it hasn't needed yet, such as the video maker's, and
// the app moves to the new version on its way back to the cartoons (src/routes/(app)/+layout.svelte).

import { version } from '$app/env';
import { assets, immutable, prerendered } from '$app/manifest';
import { self } from '$app/service-worker';
import { isAppPath } from '#lib/paths.ts';

const prefix = 'bubblecam-';
const current = `${prefix}${version}`;

// Paths are relative to the site's root. Cloudflare reads _headers instead of serving it.
const files = [...immutable, ...assets, ...prerendered]
	.map(({ path }) => `/${path}`)
	.filter((path) => !/^\/_(headers|redirects)$/.test(path));

/** When a version was built, from its name: the build's time in base 36 (vite.config.ts). */
const builtAt = (cache: string) => parseInt(cache.slice(prefix.length), 36) || 0;

self.addEventListener('install', (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(current);
			// From the network, not the browser's HTTP cache, which may hold an earlier version's page.
			await cache.addAll(files.map((path) => new Request(path, { cache: 'reload' })));
			await self.skipWaiting();
		})()
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			const older = (await caches.keys())
				.filter((name) => name.startsWith(prefix) && name !== current)
				.sort((a, b) => builtAt(b) - builtAt(a));
			// The newest earlier version stays, for an app still running it.
			await Promise.all(older.slice(1).map((name) => caches.delete(name)));
			await self.clients.claim();
		})()
	);
});

self.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);
	if (request.method !== 'GET' || url.origin !== self.location.origin) return;
	event.respondWith(respond(request, url));
});

async function respond(request: Request, url: URL) {
	const cache = await caches.open(current);
	const page = request.mode === 'navigate';
	// The privacy page comes fresh when there's a network, and from the device when there isn't.
	if (page && !isAppPath(url.pathname)) {
		try {
			return await fetch(request);
		} catch {
			return (await cache.match(request, { ignoreSearch: true })) ?? missing(cache);
		}
	}
	// The app's pages and the build's files: this version's, else the previous version's, which a page still
	// running it asks for, else the network.
	const stored =
		(await cache.match(request, { ignoreSearch: page })) ??
		(await caches.match(request, { ignoreSearch: page }));
	if (stored) return stored;
	try {
		return await fetch(request);
	} catch {
		return page ? missing(cache) : Response.error();
	}
}

/** The popped bubble, for a page that isn't on the device while there's no network. */
async function missing(cache: Cache) {
	return (await cache.match('/404')) ?? Response.error();
}
