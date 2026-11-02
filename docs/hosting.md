# Hosting

BubbleCam is a static site: every page is prerendered to a file, and nothing runs on a server. Cloudflare serves it from a Worker's static assets, which cost nothing on the Free plan and have no request limit. Anyone can host a copy; there's no data to look after, because cartoons never leave the devices they're made on.

## Deploy

1. Clone this repository and follow the [local setup](development.md#start-locally).
2. Run `npx wrangler login` to sign in to your Cloudflare account.
3. Choose a unique Worker `name` in `wrangler.jsonc`, if `bubblecam` is taken in your account.
4. Set `PUBLIC_SITE_URL` in `.env` to the origin the site will be served from, such as `https://bubblecam.example.com`. It's read when you build.
5. Run `npm run validate` and `npx wrangler deploy --dry-run`.
6. Run `npm run deploy`. It builds the site into `build/` and uploads it; the site is then on the Worker's `workers.dev` address.
7. To use your own domain, add it to the Worker in the Cloudflare dashboard (**Workers & Pages → your Worker → Settings → Domains & Routes**), and turn on **Always Use HTTPS** for it (**SSL/TLS → Edge Certificates**): the camera only works over `https://`. Build with that domain in `PUBLIC_SITE_URL`.

`wrangler.jsonc` has no `main`, so no Worker code runs: Cloudflare answers every request from `build/`. `static/_headers` gives every response its security headers, and caches the build's hashed files for a year; an address no file has gets `404.html`, or `en/404.html` under `/en`, with a 404 status.

## Updates

Run `npm run deploy` again. Devices that have opened BubbleCam keep a copy of the version they have, which their service worker swaps for the new one in the background the next time they're online; an open app moves to it on its way back to the cartoons. Cartoons stay where they are, on the devices. Keep the way they're stored compatible (`src/lib/studio/films.ts`): a new version may add stores and fields, and must read what earlier versions wrote.

## Privacy

The site has no cookies, accounts, analytics, or server code, and its pages load nothing from other sites. Cloudflare, like any host, handles the technical details needed to deliver a page, such as a visitor's IP address; don't turn on anything in the dashboard that records visitors, such as Web Analytics, without updating the privacy page (`privacyPolicy` in `src/lib/i18n/`), which says the site doesn't.
