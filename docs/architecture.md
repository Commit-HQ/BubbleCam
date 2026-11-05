# Architecture

One SvelteKit application, prerendered whole to static files, which Cloudflare serves as a Worker's static assets with no code of ours running there. Everything that happens, happens in the browser: the camera, the pictures, the cartoons kept on the device, and the video made from them. Use strict TypeScript and Svelte 5 runes. Why it behaves as it does is in the [decisions](decisions.md).

## Pages and languages

Pages live in two route groups. `(site)` holds the privacy page and the 404 pages: static HTML without client-side JavaScript (`csr = false` in its `+layout.ts`). BubbleCam's landing page is on Commit's site, at bubbleboard.fyi/apps/bubblecam ([ADR 0001](adr/0001-an-origin-of-its-own.md)). `(app)` holds the app, which is the site's home: the cartoons' page (`/`) and the studio (`/film`), prerendered as shells that then run in the browser. Their HTML holds only what the first paint needs; the cartoons are read from IndexedDB in the browser. The root layout adds the stylesheet, the icons, and the document's language.

Croatian is served at `/` and `/film`, English at `/en` and `/en/film`: the optional `[[locale=locale]]` segment and its matcher in `src/params.ts` keep the default language unprefixed, and `src/lib/paths.ts` builds every path. The studio is prerendered once, so the cartoon it opens travels in the query (`/film?id=…`), which the page reads in the browser; without one, the first picture starts a new cartoon, and the address then names it, by a shallow navigation that replaces the history entry. The language switch is a plain link, so no cookie is needed. All interface copy lives in `src/lib/i18n/en.ts` and `hr.ts`, which have the same shape; copy that names or counts something is a function, so each language builds its own sentence and plural (`Intl.PluralRules`). The privacy page addresses parents and teachers formally ("vi"), and the app talks to children ("ti").

Canonical URLs, `hreflang` alternates, and link previews need an absolute address, which prerendered pages can't take from a request. It comes from `PUBLIC_SITE_URL`, a static public variable that `src/env.ts` declares and checks at build time, imported from `$app/env/public`; `src/lib/project.ts` builds absolute links with it. Each language has a web app manifest, prerendered from `src/routes/(app)/[[locale=locale]]/manifest.webmanifest/+server.ts`, with the same `id` and scope, so installing from either language gives one app.

`src/hooks.server.ts` runs only while pages are prerendered: it writes the document's language and decides which fonts each page preloads.

## The studio

The studio's code is in `src/lib/studio`, and its screens in `src/lib/app`. `studio.svelte.ts` holds the state: the cartoon, its pictures, what the viewfinder shows (the camera, a picture taken earlier, or the cartoon playing), and the camera. The modules around it each do one thing:

- `camera.ts` opens the camera, asking for 720p, and names what went wrong when it can't (not allowed, not there, busy, not in this browser).
- `geometry.ts` decides a cartoon's size and the part of the camera's picture it keeps. A cartoon takes the shape of the camera's picture at its first picture, at most 1280 pixels long with both sides a multiple of 16, which every video encoder takes. Later pictures keep the middle of the camera's picture in that shape, which is exactly what the viewfinder shows (`object-fit: cover`), so the ghost lines up.
- `shutter.ts` takes a picture. The tap only draws the camera's current picture at the cartoon's size, and onto the ghost's canvas, which the GPU does in a moment. The drawing goes to a worker as a transferred bitmap (`encode.worker.ts`), which encodes it as a JPEG at quality 0.9 and a 144-pixel-tall thumbnail at 0.8, off the page. Browsers without canvases in workers, such as Safari before 16.4, and pages where the worker can't start, encode on the page with `toBlob`; a picture a failed worker lost leaves the strip.
- `films.ts` keeps the cartoons in IndexedDB: a `films` store of records, each naming its pictures in order, and `images` and `thumbs` stores of JPEG blobs by picture ID, so opening a cartoon reads only its thumbnails. Every change is one transaction, so a cartoon never names a picture it doesn't have. A cartoon left without pictures disappears from the list, and is deleted once it hasn't changed for a minute.
- `player.ts` plays a cartoon on a canvas over the camera, decoding ten pictures ahead and letting them go once shown; a cartoon of ten pictures or fewer stays decoded and loops without decoding again. A picture that isn't decoded in time keeps the one before on screen a little longer.
- `video.ts` and `video.worker.ts` make the video. The worker reads each picture from IndexedDB, draws it on an `OffscreenCanvas`, and encodes it with WebCodecs at the cartoon's own frame rate, while Mediabunny writes the MP4 (H.264), or WebM (VP9 or VP8) where H.264 can't be encoded; it runs faster than the cartoon plays. Without WebCodecs in workers, the page plays the cartoon on the dialog's canvas once and records it with `MediaRecorder`, in real time.
- `sound.ts` makes the shutter's click and the bubble's pop with Web Audio, from noise and a falling tone, and buzzes phones that can.

Pictures show in the strip and the ghost the moment they're taken, and are written a moment later. Every change to the device's cartoons goes through one queue in `Studio` (`#write`), so changes happen in the order they were made: a picture deleted just after it was taken is deleted after it's saved; a cartoon plays, shows an earlier picture, or becomes a video only once everything taken so far can be read back; and leaving the studio lets pictures still being encoded finish before the encoding worker stops. A cartoon in the page's state is a Svelte proxy, which can't be posted to a worker or stored, so what crosses those lines is a snapshot or a copy.

The studio keeps the screen on with a wake lock, stops the camera when the app goes into the background and starts it again when it's back, and remembers on the device which camera was used last. Pictures from a camera that faces the child are mirrored, as the viewfinder shows them. Space or Enter takes a picture unless a button has the focus, as do the volume keys that remote shutters for selfies press where the browser reports them; Backspace deletes, P plays, and G switches the ghost.

## Offline and updates

The service worker (`src/service-worker/index.ts`) keeps the whole site on the device. Installing a version stores every file of the build, every static file, and every prerendered page in a cache named after the build (`version.name` in `vite.config.ts`, the build's time in base 36), bypassing the HTTP cache. The app's pages and the build's files are then answered from this version's cache, else the previous version's, else the network; the privacy page comes from the network, and from the cache without one; a page that isn't stored, without a network, gets the 404 page.

A new version takes over as soon as it's stored (`skipWaiting` and `clients.claim`). The previous version's cache stays until the next version arrives, so an app still running it can load the code it hasn't needed yet. The app moves to the new version on its way back to the cartoons, where nothing is in the middle of being made (`src/routes/(app)/+layout.svelte`), and an app left open for days asks for news whenever it comes back into view. SvelteKit's own polling for new versions is off. The app registers the worker itself, after the page has loaded, as a classic script: it's built as one file without imports, which browsers without module service workers run too. During development there's no service worker.

## Speed

The privacy and app pages score 100 for performance, accessibility, best practices, and SEO in Lighthouse, on mobile and desktop, in both languages. Measure on a production build served as Cloudflare serves it (`npm run build && npm run preview`), not the development server. What keeps it there:

- The privacy page carries no JavaScript.
- Fonts are self-hosted variable fonts, only Latin and Latin Extended, with metric-matched local fallbacks (computed with Capsize), so text doesn't move when they swap in. `src/hooks.server.ts` preloads Fredoka everywhere, Hanken Grotesk only on the privacy page, and Latin Extended only on Croatian pages.
- The app's pages show their largest words in the prerendered HTML, and nothing larger appears later: the cartoons' page says what to do under its heading, and the studio shows a bear and the same words, drawn inline, while the camera starts. The largest contentful paint then comes with the first paint, and a camera problem, shown later in smaller type, doesn't move it.
- Nothing heavy loads before it's needed: the encoding worker with the first picture, and Mediabunny, about 60 kB compressed, only with a video.
- Files whose names change with their content are cached for a year (`static/_headers`).

## Design

The look is BubbleBoard's cheerful glass in a younger key: translucent white surfaces over soft sky, pink, mint, and sun gradients on a warm cream canvas, with Fredoka, a rounded display font, for headings and the app's words, and Hanken Grotesk for text. The studio is a dark room instead, so the camera's picture is the brightest thing on the screen. The logo is BubbleBoard's three bubbles on a sky-to-violet tile, with the big one a red record button.

`src/lib/styles/app.css`, the only stylesheet, holds the theme tokens (`ink`, `muted`, `canvas`, `accent`, the logo's `sky`, `mint`, `sun`, `pink`, and the shutter's `coral`, and the studio's `night` and `dusk`) and the utilities `glass`, `frosted`, `bg-brand`, `text-brand`, and `studio`. Style with Tailwind utilities in markup; component `<style>` blocks hold keyframes and grid areas, which Tailwind can't say well. Palette colours are not automatically text colours: sky, mint, sun, and pink are too light for text on the canvas.

Children use the app before they can read, so its controls are pictures: a red button, a ghost, a turtle and a rabbit, a bin. Every one has a label for screen readers in both languages, and what just happened (a picture taken or deleted) is announced politely. The studio's main buttons are 56 pixels across, those in its top bar 48, and the shutter 96. The studio turns off text selection, long-press callouts, double-tap zoom, and overscroll, so small fingers can't get lost.

Icons come from `src/lib/components/Icon.svelte`, Lucide paths joined into one path each. Use semantic HTML, visible focus, and reduced-motion support. Font, icon, and library licenses are in `static/third-party-notices.txt`, which the site serves; update it when bundling a new asset or library.

## Security

A hash-mode CSP (`csp` in `vite.config.ts`) allows same-origin resources only, plus images and media from the `blob:` URLs the app makes for its own pictures and videos: no inline scripts or styles beyond SvelteKit's hashed ones, no plugins, no framing. Pages carry it as a `<meta>` tag and get the other security headers, including `frame-ancestors`, from `static/_headers`. SvelteKit's route announcer has one fixed inline style attribute, which `style-src-attr` allows by hash (`'unsafe-hashes'`, never `'unsafe-inline'`); `src/csp.test.ts` fails when a SvelteKit update changes it. Dynamic sizes are set through the CSSOM (Svelte's `style:` directives, in the browser only), which the CSP doesn't restrict; the prerendered HTML has no `style` attributes. `Permissions-Policy` allows the camera to this site only, and nothing else.

## Dependency policy

Use platform APIs and Svelte first. Add a library only for an implemented need, after checking maintenance, licensing, bundle cost, and transitive dependencies. Mediabunny (MPL-2.0, no dependencies) writes video files; writing MP4 by hand is possible but easy to get subtly wrong for some player, and the video must play everywhere a family sends it. Vitest runs the tests, with `fake-indexeddb` giving the storage tests a real store in Node. No component UI library, global state package, analytics, remote fonts, or remote images.

On 2026-11-02, `npm audit` reported a low-severity advisory in `deepmerge`, which `@sveltejs/vite-plugin-svelte` uses to merge its configuration at build time; nothing of it reaches the site. Recheck when updating the toolchain.
