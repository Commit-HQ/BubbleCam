import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

const { version } = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };

// Shown in the footer so a page can be traced to what it was built from. "-dirty" marks uncommitted changes,
// including new files Git doesn't ignore, which the commit alone doesn't describe. Builds without Git metadata,
// such as from a source ZIP, are "unknown".
function commit() {
	const git = (command: string) =>
		execSync(`git ${command}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
	try {
		const sha = git('rev-parse --short HEAD');
		if (git('status --porcelain')) return { built: `${sha}-dirty`, release: false };
		// A release is the clean commit its version's tag points at (docs/development.md#releasing).
		return { built: sha, release: git('tag --points-at HEAD').split('\n').includes(`v${version}`) };
	} catch {
		return { built: 'unknown', release: false };
	}
}
const { built, release } = commit();
// One stamp for the whole build. Vite evaluates this file more than once per build, for the client and for
// the server that prerenders, and both must name the build the same, so the environment keeps the first. It's
// a time in base 36, so the service worker can tell the newer of two builds by their names (src/service-worker).
const stamp = (process.env.BUILD_STAMP ??= Date.now().toString(36));

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// Every page is prerendered to a static file, so the whole site is static assets: Cloudflare serves it
			// without running any code of ours (wrangler.jsonc).
			adapter: adapter({ strict: true }),
			// Absolute asset paths: a 404 page is served at whatever address was missing, at any depth, where
			// paths relative to its own address would point nowhere.
			paths: { relative: false },
			// The service worker brings new versions (src/service-worker), so SvelteKit doesn't poll for them.
			version: { name: stamp, pollInterval: 0 },
			// The app registers the service worker itself, as a classic script, which every browser that has
			// service workers runs; SvelteKit would register it as a module (src/routes/(app)/+layout.svelte).
			serviceWorker: { register: false },
			prerender: {
				// The other language and the files no page links to, which crawling doesn't find.
				entries: [
					'*',
					'/en/app',
					'/en/app/film',
					'/en/privacy',
					'/404',
					'/en/404',
					'/app/manifest.webmanifest',
					'/en/app/manifest.webmanifest'
				]
			},
			csp: {
				mode: 'hash',
				// Styles, fonts, scripts, workers, and the manifest fall back to default-src, and SvelteKit adds
				// hashes for its inline scripts and styles.
				directives: {
					'default-src': ['self'],
					// Thumbnails and frames are shown from the blob: URLs the app makes for the pictures it keeps.
					'img-src': ['self', 'blob:'],
					// A finished film plays from the blob: URL of the video made on the device.
					'media-src': ['self', 'blob:'],
					// SvelteKit's route announcer, on pages that run in the browser, has one fixed inline style
					// attribute. This allows exactly that value, not inline styles in general, and src/csp.test.ts
					// fails when a SvelteKit update changes it.
					'style-src-attr': [
						'unsafe-hashes',
						'sha256-S8qMpvofolR8Mpjy4kQvEm7m1q8clzU4dfDH0AmvZjo='
					],
					'base-uri': ['none'],
					'form-action': ['self'],
					'object-src': ['none']
				}
			}
		})
	],
	// The footer shows the version alone for a release, and the commit next to it for any other build.
	define: {
		__VERSION__: JSON.stringify(version),
		__COMMIT__: JSON.stringify(release ? '' : built)
	},
	build: {
		// Emit every asset as a hashed file instead of a data: URI, so the CSP can stay 'self'-only.
		assetsInlineLimit: 0
	},
	worker: {
		format: 'es'
	},
	test: {
		include: ['src/**/*.test.ts']
	}
});
