<p align="center">
  <img src="src/lib/assets/favicon.svg" width="96" alt="">
</p>

<h1 align="center">BubbleCam 🎬</h1>

<p align="center">
  <strong>Snap, nudge, snap. And it’s a cartoon!</strong><br>
  A free, open-source stop-motion studio for kindergartens and homes.
</p>

<p align="center">
  <a href="docs/hosting.md">Host it</a> ·
  <a href="docs/decisions.md">Why it works this way</a> ·
  <a href="#contributing">Contribute</a>
</p>

---

Kids turn their toys into cartoons, one picture at a time: put a teddy in front of the camera, press the big red button, move it a tiny bit, press again. The last picture floats over the camera like a little ghost, so they see exactly how far they moved it. Press play, and the teddy walks.

BubbleCam is a sister of [BubbleBoard](https://github.com/Commit-HQ/BubbleBoard), made for kindergartens, the parents of their children, and anyone with a toy and a tablet. No sign-ups, no ads, no tracking, and nothing ever leaves the device.

## What it does

- 👻 **A ghost of the last picture** over the camera, so every nudge lines up.
- 🔴 **One big red button.** Pictures are kept the moment they're taken, so kids can snap as fast as they like.
- 🎞️ **A strip of pictures** to look back at, and a bin that takes the last one away.
- ▶️ **Play, at three speeds:** a turtle, footsteps, and a rabbit, which kids read without words.
- 🎬 **A video for the family:** one tap makes an MP4 to save or share.
- 📴 **Works without the internet**, once it has been opened, and installs on phones, tablets, and computers.
- 🔒 **Everything stays on the device**, in the browser's storage. There's no server that could see it.
- 🌍 **Croatian and English.**

## Run it locally

You need **Node.js 24** and npm. No Cloudflare account required.

```sh
npm ci
cp .env.example .env
npm run dev
```

Open the address Vite prints. The camera needs a secure context: `localhost` works, a plain `http://` network address doesn't. The walkthrough is in [docs/development.md](docs/development.md).

## Built small on purpose

Svelte 5 and SvelteKit in strict TypeScript, Tailwind CSS v4, and the browser's own camera, canvas, IndexedDB, and video encoder. Every page is prerendered to a static file, so the site is hosted as plain files on Cloudflare, with no server code at all. The only library the app ships is [Mediabunny](https://mediabunny.dev), which writes the video file, and it loads only when a video is made.

The app opens from the device's own copy once it has been visited, and the privacy and app pages score 100 in all four Lighthouse categories, on mobile and desktop. How that's kept up is in the [architecture notes](docs/architecture.md#speed).

## Host it

The whole site is static files, which Cloudflare serves for free without limits on requests. [docs/hosting.md](docs/hosting.md) walks through deploying your own copy in a few minutes.

## Privacy, honestly

BubbleCam has no accounts, cookies, analytics, or server-side code. Pictures and cartoons are kept in the browser's storage on the device they were made on, and a video goes elsewhere only when someone shares it. The same is true of what the site's privacy page says, which describes the code as it is. The flip side: clearing the browser's data, or removing the installed app, removes the cartoons too, so the app suggests saving the favourites as videos.

## Contributing

Pull requests, ideas, and bug reports are all welcome. 💛

- Run `npm run validate` before opening a pull request. CI runs the same checks and never deploys.
- Add interface copy to both `src/lib/i18n/en.ts` and `hr.ts`.
- Bundling a new asset or library? Add its license to `static/third-party-notices.txt`.

Conventions live in the [architecture notes](docs/architecture.md), and the reasons behind the app's behaviour in the [decisions](docs/decisions.md).

## Made by Commit

[Commit](https://github.com/Commit-HQ) is a small team building free, open-source apps for the everyday problems regular people face. BubbleCam started with a kindergarten full of toys and the wish to show kids that technology is something they can make things with. Write to us at [commit-devs@proton.me](mailto:commit-devs@proton.me).

## License

[GNU AGPL v3.0](LICENSE). Bundled fonts, icons, and libraries keep their own licenses, listed in [`static/third-party-notices.txt`](static/third-party-notices.txt).
