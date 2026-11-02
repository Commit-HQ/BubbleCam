# Development

Everything a contributor needs beyond the [README](../README.md): local setup, the commands, testing on devices, and releasing.

## Start locally

Use **Node.js 24 LTS** and npm. No Cloudflare account is needed for local development.

```sh
npm ci
cp .env.example .env
npm run dev
```

`.env` sets `PUBLIC_SITE_URL`, the public origin used for canonical links and link previews: `https://` and a hostname, with no path, query, or credentials (`http://localhost` also works). Pages are prerendered, so the address is written into the HTML at build time; `src/env.ts` stops the build with a message naming `PUBLIC_SITE_URL` when it's missing or invalid.

The camera needs a secure context. On the computer running the server, `localhost` is one. To try the app on a phone or tablet, which is where it's meant to be used, serve it over HTTPS, for example with `npx wrangler dev --port 4173` behind a tunnel, or deploy a copy (see [hosting](hosting.md)); a plain `http://` network address can't open the camera.

| Command             | Purpose                                                                    |
| ------------------- | -------------------------------------------------------------------------- |
| `npm run dev`       | Run the development server                                                 |
| `npm run check`     | Svelte and TypeScript checks, the service worker's included                |
| `npm run lint`      | Check formatting with Prettier                                             |
| `npm run format`    | Apply formatting                                                           |
| `npm test`          | Behavior tests with Vitest                                                 |
| `npm run build`     | Prerender the whole site to `build/`                                       |
| `npm run preview`   | Serve `build/` as Cloudflare does, with its headers and 404 pages          |
| `npm run validate`  | Type checks, formatting, tests, and build                                  |
| `npm run deploy`    | Build and publish to Cloudflare                                            |
| `npm version minor` | Raise the version and tag it, once the changelog has its entry (Releasing) |

The development server has no service worker, so the app doesn't work offline there. Measure performance, for example with Lighthouse, on a production build (`npm run build && npm run preview`): development performance is not representative. The landing, privacy, and app pages should score 100 in all four categories, on mobile and desktop; the [architecture notes](architecture.md#speed) say what keeps it there. The 404 pages ask search engines not to index them, which the SEO score counts against them.

`npm test` covers what the code guarantees rather than component markup: the shape and size of pictures, the cartoons kept in IndexedDB (in Node, with `fake-indexeddb`), paths, both dictionaries, the CSP's hash of SvelteKit's announcer, and the changelog. The camera, the encoders, and the service worker need a browser: before a release, shoot a cartoon on a real phone or tablet, play it, make its video, and open the app again without a network.

## Pictures

The app icons in `static/icons` are renderings of `src/lib/assets/favicon.svg` (the rounded tile, `icon-*.png`) and `src/lib/assets/app-icon.svg` (full bleed, `icon-maskable-*.png` and `apple-touch-icon.png`), and `static/favicon.ico` holds the favicon at 32 and 16 pixels. Render them again after changing the logo, for example with `rsvg-convert` and ImageMagick:

```sh
rsvg-convert -w 512 -h 512 src/lib/assets/favicon.svg -o static/icons/icon-512.png
rsvg-convert -w 192 -h 192 src/lib/assets/favicon.svg -o static/icons/icon-192.png
rsvg-convert -w 512 -h 512 src/lib/assets/app-icon.svg -o static/icons/icon-maskable-512.png
rsvg-convert -w 192 -h 192 src/lib/assets/app-icon.svg -o static/icons/icon-maskable-192.png
rsvg-convert -w 180 -h 180 src/lib/assets/app-icon.svg -o static/icons/apple-touch-icon.png
rsvg-convert -w 64 -h 64 src/lib/assets/favicon.svg -o favicon-64.png
magick favicon-64.png -define icon:auto-resize=32,16 static/favicon.ico
```

`src/lib/assets/share.jpg`, the link preview, is the landing page's tablet beside the logo and name, 1200 by 630 pixels; take it again from the built page when either changes.

## Releasing

Features collect on `main` and go out together as a version: `0.1.1` for fixes, `0.2.0` for new features. The footer shows the version, and links to [CHANGELOG.md](../CHANGELOG.md) as it was at that version's tag.

1. Add the version's entry at the top of `CHANGELOG.md`, `## 0.2.0 (date)` and a few plain lines about what's new, in English, and commit it.
2. `npm version minor` (or `patch`, `major`) raises the version in `package.json`, commits it, and tags the commit `v0.2.0`. It stops before committing when the changelog has no entry for the new version; put `package.json` and `package-lock.json` back (`git checkout package.json package-lock.json`) and start again from step 1.
3. `git push --follow-tags`, then `npm run deploy`. The pushed tag gets its GitHub release, with the version's changelog entry as its notes (`.github/workflows/release.yml`).

The footer shows the version alone only for a build of the tagged commit with no uncommitted changes. Any other build shows its commit next to the version and links to that commit instead.

## Small by design

| Layer       | Choice                                                          |
| ----------- | --------------------------------------------------------------- |
| Application | Svelte 5 + SvelteKit 3 + strict TypeScript                      |
| Build       | Vite                                                            |
| Hosting     | Cloudflare Workers static assets, prerendered by adapter-static |
| Styles      | Tailwind CSS v4, self-hosted fonts                              |
| Storage     | IndexedDB, on the device                                        |
| Camera      | `getUserMedia`, canvases, and a worker that encodes JPEG        |
| Video       | WebCodecs and Mediabunny, with `MediaRecorder` as the way out   |
| Offline     | A service worker that keeps every file of a version             |
| Formatting  | Prettier + Svelte and Tailwind plugins                          |
| Tests       | Vitest, with `fake-indexeddb`                                   |

```text
src/
  lib/
    app/                The app's screens: the studio's parts, the cartoons' cards, dialogs, installing
    assets/             The logo, the bubbles, and the link preview
    components/         Components shared with the landing pages: header, icons, the hero's tablet, the bear
    i18n/               Croatian and English copy
    studio/             The studio's engine: camera, pictures, storage, playing, video, sounds
    styles/             Tailwind entry, fonts, theme tokens, base styles
    paths.ts            Site paths
    project.ts          Project links and absolute URLs
  routes/
    (site)/             Landing, privacy, and 404 pages: static HTML without JavaScript
    (app)/              The cartoons' page, the studio, and the manifests
  service-worker/       The site kept on the device, offline
  env.ts                Build-time settings, checked
  hooks.server.ts       Document language and font preloads, while prerendering
  params.ts             The language prefix matcher
static/                 Icons, headers, robots.txt, and third-party notices
docs/                   Architecture, decisions, development, hosting
wrangler.jsonc          The Cloudflare Worker that serves build/
```
