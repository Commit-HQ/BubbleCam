# Decisions

Why BubbleCam behaves the way it does. Each entry is a decision the code alone doesn't explain: a trade-off that was weighed, a simpler option that won, or a rule that shouldn't be quietly undone. Everything here describes the app as it is. The [architecture](architecture.md) says how it's built.

## For children first

- **Pictures, not words.** Most of the app's users can't read yet. Every control is a picture a child already knows: a red button takes a picture, a ghost shows the last one, a bin throws one away, a turtle, footsteps, and a rabbit are the speeds. Words are there for the grown-ups (making a video, a camera problem) and for screen readers.
- **One big red button**, where a thumb reaches it: down the side on a tablet held landscape, under the picture on a phone held upright. While a picture is being looked at or the cartoon plays, the same button shows a camera and goes back to it, so pressing the big button never does nothing.
- **The ghost is on by default**, at 45 % opacity: strong enough to line a toy up against, faint enough to see the camera through. It's the one thing that makes stop motion work for a beginner, and a child turns it off by tapping the ghost.
- **Snapping never waits.** A picture is on screen and in the strip the moment the button is pressed; encoding and saving follow in a worker. A child can press as fast as they like, and every picture is kept in order (thirty presses in two and a half seconds, in testing, with no frame of the page longer than 50 ms).
- **A click, a flash, a pop.** The shutter clicks, the picture flashes white, and a deleted picture pops like a bubble, because children learn from what they hear and see. The sounds are made by the code, so there are no files to load, and they follow the phone's silent switch where Safari allows it.
- **Deleting a picture asks nothing; deleting a cartoon asks first.** The bin takes away the last picture, or the one being looked at, at once: it's the undo of stop motion, used constantly, and losing one picture costs one press. A whole cartoon is a child's work, so its bin asks, showing the cartoon's first picture.
- **Three speeds, not a number.** Five, eight, and twelve pictures a second, as a turtle, footsteps, and a rabbit, with footsteps first. Eight is slow enough that a few pictures make a visible cartoon, and the speed a cartoon was last played at is the speed of its video.
- **No names to type.** A cartoon is known by its first picture and the day it was made.

## The cartoon

- **A cartoon takes the shape of its first picture**, and later pictures keep the middle of the camera's picture in that shape. Turning the tablet midway would otherwise make a cartoon of mixed shapes, and the viewfinder shows exactly the part that will be kept, so the ghost lines up.
- **720p**, at most 1280 pixels on the long side: sharp on a phone or a TV, light to keep, and quick to make into a video on an old tablet. Pictures are JPEG at quality 0.9, so the video isn't made from a blurry copy, and thumbnails have their own small JPEG, so the strip never decodes full pictures.
- **Mirrored as seen.** A camera facing the child shows a mirror image, as every camera app does, and the pictures are kept that way, so the cartoon moves the way it moved in the viewfinder. A computer's webcam, which often doesn't say which way it faces, counts as facing the child.
- **New pictures go at the end.** Looking back at a picture is for checking it or deleting it. Inserting and reordering are deferred.

## The video

- **MP4 with H.264, made on the device.** It's the file every phone, messaging app, and computer plays. The browser's own encoder (WebCodecs) does the work in a worker, faster than the cartoon plays, and Mediabunny writes the file; where H.264 can't be encoded, the video is WebM. Browsers without WebCodecs record the cartoon as it plays with `MediaRecorder`, which takes as long as the cartoon, so older iPads still make videos.
- **Not a GIF.** A GIF of a 720p cartoon is many times larger than its video, has 256 colours, and messaging apps often turn GIFs into videos anyway.
- **Played once, at the cartoon's own frame rate.** No music, titles, or loops are added: the video is the cartoon.
- **Sharing waits for a tap.** Browsers allow the share sheet only right after a tap, so the video is made first and then offered with Share, where the device can share files, and Save, which downloads it.

## On the device, and only there

- **No accounts and no server.** The site is static files; there's nothing to sign in to and nowhere for a picture to go. That makes it free to host for anyone and simple to trust: a teacher can tell parents that children's pictures stay on the tablet, because there's no code that could send them.
- **Kept in IndexedDB, persistently where the browser agrees.** The first picture of a cartoon asks the browser to keep the site's storage for good. Chrome decides by itself, often by whether the app is installed; Firefox may ask. Safari can clear what a website keeps after about a week without a visit, but not what a Home Screen app keeps, so the cartoons' page shows iPhone and iPad users, until they put it away, how to add BubbleCam to the Home Screen, and BubbleCam's page on Commit's site says why in its questions.
- **Save the ones you love as videos.** Browser storage can be cleared by its user, so the cartoons' page says, under its heading, that cartoons stay on the device and favourites are worth saving as videos.

## Installing and offline

- **Works offline, unlike BubbleBoard.** BubbleBoard deliberately keeps nothing offline, because everything it shows comes from its server. BubbleCam has no server data, so its service worker keeps the whole site, and the app opens in a playroom without Wi-Fi or on a trip.
- **New versions arrive quietly.** A new version is stored in the background and takes over at once, while the app keeps running the version it started with; the move happens on the way back to the cartoons, where nothing is being made. The previous version's files stay, so an app still running it can load what it hasn't needed yet. Nothing a child is doing is ever interrupted by an update.
- **Install where the browser offers it.** Chromium browsers offer installing with an event, which the cartoons' page turns into an Install button rather than the browser's banner. Safari on iPhone and iPad installs from its Share menu, which a tip explains. Installing isn't required: BubbleCam works in the browser, and on computers that's the usual way.

## Built on

- **SvelteKit 3**, while BubbleBoard is on SvelteKit 2: a new project starts on the current major version, and BubbleCam's few routes make it a gentle first step for the team.
- **Static files on Cloudflare.** Every page is prerendered (`adapter-static`), and an assets-only Worker serves them, with `_headers` for security headers and a 404 page per language. Static asset requests cost nothing on Cloudflare's Free plan and have no daily limit.
- **Fredoka**, a rounded font, for the display and the app's words, and BubbleBoard's Hanken Grotesk for text: a younger sibling's voice in the family's handwriting.

## Deferred

- Reordering pictures, inserting a picture in the middle, and copying one.
- More than one ghost, and the ghost's strength.
- Locking the camera's exposure and focus after the first picture, where browsers allow it, against flicker.
- A self-timer, and taking a picture every few seconds (time-lapse).
- Sound: a voice-over or music in the video.
- Titles, stickers, and drawing on pictures.
- Moving a cartoon to another device, and a cartoon's video looping a few times.
