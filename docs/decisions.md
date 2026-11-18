# Decisions

Why BubbleCam behaves the way it does. Each entry is a decision the code alone doesn't explain: a trade-off that was weighed, a simpler option that won, or a rule that shouldn't be quietly undone. Everything here describes the app as it is. The [architecture](architecture.md) says how it's built.

## For children first

- **Pictures, not words.** Most of the app's users can't read yet. Every control is a picture a child already knows: a red button takes a picture, a ghost shows the last one, a bin throws one away, a turtle, footsteps, and a rabbit are the speeds. Words are there for the grown-ups (making a video, a camera problem) and for screen readers.
- **One big red button**, where a thumb reaches it: down the side on a tablet held landscape, under the picture on a phone held upright. While a picture is being looked at or the cartoon plays, the same button shows a camera and goes back to it, so pressing the big button never does nothing.
- **The ghost is on by default**, at 45 % opacity: strong enough to line a toy up against, faint enough to see the camera through. It's the one thing that makes stop motion work for a beginner, and a child turns it off by tapping the ghost.
- **Snapping never waits, and the button rests after it.** A picture is on screen and in the strip the moment the button is pressed; encoding and saving follow in a worker. The button then rests for 0.8 seconds, or as long as a grown-up set, while its red grows back: small fingers often land two or three times for one picture, and with a shutter that took every press, cartoons filled with pictures nobody meant to take. Moving the toy takes longer than the rest, so nobody waits for it.
- **A click, a flash, a pop.** The shutter clicks, the picture flashes white, and a deleted picture pops like a bubble, because children learn from what they hear and see. The sounds are made by the code, so there are no files to load, and they follow the phone's silent switch where Safari allows it.
- **Deleting a picture asks nothing; deleting a cartoon asks first.** The bin takes away the last picture, or the one being looked at, at once: it's the undo of stop motion, used constantly, and losing one picture costs one press. A whole cartoon is a child's work, so its bin asks, showing the cartoon's first picture.
- **Three speeds, not a number.** Five, eight, and twelve pictures a second, as a turtle, footsteps, and a rabbit, with footsteps first. Eight is slow enough that a few pictures make a visible cartoon, and the speed a cartoon was last played at is the speed of its video.
- **No names to type.** A cartoon is known by its first picture and the day it was made. The card shows that picture full size: the strip's thumbnail, 144 pixels tall, is a blur on a card, most of all for a cartoon that stands.

## For grown-ups, behind a sum

- **Settings are for grown-ups, and a sum keeps them so.** The cog in the cartoons' page's header asks for a product from the times table, such as 6 × 7, with a new sum after each wrong answer. A child of kindergarten age can't work it out, and a grown-up needs no password to remember. The studio has no cog: a child alone with the tablet is in the studio.
- **The language is one of the settings.** A child has no use for the switch, and the header is left with the logo and the cog. Choosing a language goes to the page in that language with the settings still open. The privacy page, which has no settings, keeps its switch.
- **The studio stays as simple as it was until a grown-up asks for more.** The advanced tools are one switch, off by default. Turned on, they add one button to the studio's top bar, which opens two sliders, the buttons for the grid and the self-timer, and the two ways the shutter presses itself, over the camera; arrows and a slider beside a picture being looked at; and a choice in the video's dialog. Turned off again, the studio is the plain one. What the tools set on the device, the ghost's strength, the grid, the self-timer, and how often a video repeats, is remembered for the next time; what they did to a cartoon, such as a picture held on screen, stays in the cartoon.
- **Every other setting stands by itself**, whether or not the advanced tools are on: the cartoon's shape, the pause after a picture, the sounds, the two guards, and the quality of pictures and of videos.
- **A cartoon's shape can be chosen**: as the device is held, which is the default, or always lying or always standing. A phone is held upright, and a cartoon for the TV lies. A cartoon that lies while the camera's picture stands keeps the middle of that picture, so the camera is then asked for 1080p and the cartoon is as large as that middle allows.
- **The screen is kept from turning only where the browser can do it.** Chromium browsers on Android lock the screen for an installed app, and for a tab only while it's full screen, so the studio goes full screen there. iPhones and iPads give websites no way to do it, so the settings say where their own lock is, in Control Centre. Turning the whole studio with CSS instead was weighed and left: the camera's picture turns with the device, and every picture, drag, and dialog would have to be turned back.
- **The pause after a picture is a slider**, from none to two seconds, 0.8 unless changed: a younger child needs longer, and one who snaps quickly on purpose needs less.
- **Sounds can be turned off**, for a playroom with several tablets. The buzz stays, since it's felt and not heard.
- **Deleting a cartoon can be guarded** by the same sum, asked before the question that deletes it. Deleting a picture in the studio is never guarded: it's the undo of stop motion.
- **Making a video can be guarded** the same way, each by its own switch. A video is what leaves the device, by sharing or saving, so a kindergarten may want a grown-up there when it's made.
- **Three qualities, not numbers.** Pictures are 960, 1280, or 1920 pixels long, as JPEG at quality 0.8, 0.9, or 0.92, and a video is encoded at Mediabunny's medium, high, or very high quality. The middle ones are the standard.

### The advanced tools

- **Zoom keeps the middle of the camera's picture**, up to three times. It works the same on every device and lines up with the ghost; the camera's own zoom, which only some browsers reach, is left alone.
- **A grid divides the camera's picture in thirds**, to keep a toy in its place from one picture to the next. It's only on the screen, never in a picture.
- **A self-timer counts down three, five, or ten seconds** before a picture, in big numbers with a tick for each second: time to take a hand out of the picture, or to get into it. While it counts, the big button shows a square and stops it. The button's rest holds here too, so a child's second press doesn't stop the countdown the first one started.
- **The self-timer can go on by itself.** With the timer on, a small button on the big one's shoulder makes it count down again after each picture, until the big button is pressed: a child can step back and be in a cartoon that takes itself. It's off whenever the studio opens, so a series never starts by surprise.
- **The shutter can press itself, so a child doesn't walk round to the phone for every picture.** Two buttons under the sliders turn it on, one way at a time: when the picture has settled, or at a clap. Either does what a press of the big button would, countdown included when the self-timer is on, and the big button goes on working. Both are off whenever the studio opens, like the self-timer that goes on by itself, so a picture is never taken by surprise and the microphone never listens unasked. While one is on, a sign at the foot of the picture shows what it sees or hears, since a child has to see why nothing happened.
- **When the picture settles** takes one once something has moved in front of the camera and nothing has since for a second: a hand comes, moves the toy, and goes. It needs no microphone and works in a noisy room. Each picture is what the next looks are held against, so a toy nudged too slowly for any two looks to differ is noticed too; a hand that holds still in the picture for a second is taken with it, and deleting that picture is one press.
- **At a clap** takes one six tenths of a second after it, when the table has stopped shaking. A clap is told from a word by its shape, not only by how loud it is: it starts at its loudest and is all but gone a tenth of a second later, while a voice swells and holds on. The first version only waited for the sound to be over, and took a picture at every short word. A click of the tongue or a knock on the table has a clap's shape and counts as one. The room's own noise sets how loud a clap has to be, and the studio's click is never taken for one.
- **How easily a clap is heard is a setting**, lower, standard, or higher, shown while the advanced tools are on: microphones differ from one phone to the next more than cameras do, and a playroom isn't a living room.
- **Moving a picture is a drag in the strip, or an arrow.** A mouse drags at once; a finger rests on the picture first, since a finger that moves at once scrolls the strip. The arrows beside a picture being looked at do the same one place at a time, for a keyboard or a hand that can't drag.
- **A picture can be held on screen**, up to five seconds beyond its turn, with a slider beside the picture being looked at: a title, a pause before the punchline. This took the place of choosing an exact speed, since what a cartoon wants is rarely another speed and often one picture that stays. In a video a held picture is the same picture again for whole frames, so the video keeps the cartoon's own steady frame rate, which every player and messaging app takes.
- **A video can play the cartoon two, three, or five times over**, chosen in the video's dialog once the video is ready, which makes it again. A cartoon of twenty pictures lasts two and a half seconds, and is over before a grandparent has looked.

## The cartoon

- **A cartoon takes the shape of its first picture**, and later pictures keep the middle of the camera's picture in that shape. Turning the tablet midway would otherwise make a cartoon of mixed shapes, and the viewfinder shows exactly the part that will be kept, so the ghost lines up.
- **720p**, at most 1280 pixels on the long side, unless a grown-up chooses otherwise: sharp on a phone or a TV, light to keep, and quick to make into a video on an old tablet. Pictures are JPEG at quality 0.9, so the video isn't made from a blurry copy, and thumbnails have their own small JPEG, so the strip never decodes full pictures.
- **Mirrored as seen.** A camera facing the child shows a mirror image, as every camera app does, and the pictures are kept that way, so the cartoon moves the way it moved in the viewfinder. A computer's webcam, which often doesn't say which way it faces, counts as facing the child.
- **New pictures go at the end.** Looking back at a picture is for checking it or deleting it, and, with the advanced tools, for moving it. Inserting one in the middle is deferred.

## The voice

- **A cartoon can have a voice: one recording, made while the cartoon plays through once.** A child gives the toys their voices and makes the noises, and what's said lines up with what's seen without any editing. A microphone beside the speeds starts it, after a countdown of three; the same button ends it sooner and keeps what was said, and anything else that stops the cartoon gives the take up. A new recording replaces the old one, and a bin beside the microphone takes the voice away.
- **Everyone has it**, not only those with the advanced tools: it's one button, where the cartoon plays.
- **The voice isn't tied to the pictures.** Pictures added or deleted afterwards, or another speed, leave the voice as it was: it plays from the start of the cartoon, is cut where the cartoon ends, and is followed by silence if it's shorter. Recording again is one press, and a cartoon whose voice vanished because a picture was deleted would be a worse surprise.
- **The camera and the microphone are asked for together**, the first time the browser asks about the camera, so the first recording doesn't stop for a second question in the middle of a child's idea. The microphone is let go at once and is on only while a voice is recorded, or while the shutter listens for a clap, which only measures how loud the room is. Browsers ask one question for both, so someone who refuses is asked again for the camera alone where the browser allows a second question; a device without a microphone is asked for the camera alone.
- **The camera stops while a voice is recorded**, and starts again on the way back to it. A phone doesn't always keep a camera and a microphone going when they're opened one after the other, and the cartoon is on screen then anyway.
- **Turning the sounds off leaves the voice on.** The setting is for the shutter's click in a playroom; the voice is part of the cartoon.

## The video

- **MP4 with H.264, made on the device.** It's the file every phone, messaging app, and computer plays. The browser's own encoder (WebCodecs) does the work in a worker, faster than the cartoon plays, and Mediabunny writes the file; where H.264 can't be encoded, the video is WebM. Browsers without WebCodecs record the cartoon as it plays with `MediaRecorder`, which takes as long as the cartoon, so older iPads still make videos.
- **Not a GIF.** A GIF of a 720p cartoon is many times larger than its video, has 256 colours, and messaging apps often turn GIFs into videos anyway.
- **Played once, at the cartoon's own frame rate**, unless a grown-up with the advanced tools asks for more rounds, with the cartoon's voice if it has one, which starts over with each round. No music or titles are added: the video is the cartoon.
- **The voice is AAC in the MP4**, which every phone plays, or Opus where the browser can't encode AAC. A browser that can encode neither records the cartoon as it plays instead, voice and all, which takes as long as the cartoon.
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
- **Baloo 2**, a rounded font, for the display and the app's words, and BubbleBoard's Hanken Grotesk for text: a younger sibling's voice in the family's handwriting. It replaced Fredoka, which has no č, ć, or đ, so Croatian, the default language, fell back to another font in the middle of a word.

## Deferred

- Inserting a picture in the middle, and copying one.
- More than one ghost.
- Keeping the screen from turning on iPhone and iPad, if Safari ever lets a website do it.
- Music in the video, which needs tunes that may be shared and kept offline.
- Titles, stickers, and drawing on pictures.
- Moving a cartoon to another device.
