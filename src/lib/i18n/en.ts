// Interface copy in English. Croatian (hr.ts) has the same shape. Copy that names or counts something is a
// function, so each language builds its own sentence and plural.

const plural = new Intl.PluralRules('en');

/** "1 picture", "24 pictures". */
function pictures(count: number) {
	return `${count} ${plural.select(count) === 'one' ? 'picture' : 'pictures'}`;
}

export const en = {
	languageName: 'English',
	ogLocale: 'en_US',
	title: 'Toys come to life',
	description:
		'BubbleCam is a free stop-motion app for kids. They turn their toys into cartoons one picture at a time, with a ghost of the last picture over the camera. No sign-ups, no ads, and it works offline.',
	skip: 'Skip to content',
	home: 'BubbleCam home',
	language: 'Language',
	nav: {
		label: 'Main',
		sections: {
			how: 'How it works',
			features: 'What it does',
			workshop: 'For kindergartens',
			faq: 'Questions'
		},
		open: 'Make a cartoon'
	},
	hero: {
		heading: 'Snap, nudge, snap.',
		headingAccent: 'And it’s a cartoon!',
		// The paragraph under the heading. `description` stays the plain summary that search results show.
		copy: 'BubbleCam is a free app where kids turn their toys into cartoons, one picture at a time. The last picture floats over the camera like a little ghost, so they see exactly how far to move their teddy.',
		open: 'Make a cartoon',
		how: 'See how it works',
		quiet: 'Free. No sign-ups, no ads, and it works without the internet.',
		// What the animated tablet beside the heading shows, for screen readers.
		demo: 'BubbleCam on a tablet: a teddy bear hops across the picture with the ghost of its last position one step behind, while the pictures line up in a strip below.'
	},
	how: {
		title: 'Three steps to a cartoon.',
		copy: 'That’s how the very first cartoons were made: lots of still pictures, each a tiny bit different. Shown quickly one after another, they move.',
		steps: [
			{
				title: 'Set the scene',
				copy: 'A plush toy, building bricks, clay, or a drawing. Keep the tablet or phone still, on a stand or a stack of books.'
			},
			{
				title: 'Nudge and snap',
				copy: 'Move the toy a tiny bit and press the red button. The ghost of the last picture shows where it was.'
			},
			{
				title: 'Press play',
				copy: 'The pictures become a cartoon. Turn it into a video and send it to grandma.'
			}
		]
	},
	features: {
		title: 'Made for little hands.',
		copy: 'Big buttons, hardly any words, and nothing to set up. Kids find their way around before they can read.',
		ghost: {
			title: 'A ghost of the last picture',
			copy: 'The previous picture shows through the camera, so every nudge lines up and the cartoon moves smoothly.'
		},
		fast: {
			title: 'Snap as fast as you like',
			copy: 'Each picture is kept the moment it’s taken. No waiting, so the fun never stalls.'
		},
		offline: {
			title: 'Works without the internet',
			copy: 'Once it has opened, BubbleCam works with no network at all: in the playroom, on a trip, or in the car.'
		},
		video: {
			title: 'A video for the whole family',
			copy: 'One tap turns a cartoon into a video to save, or to send to the family chat.'
		},
		private: {
			title: 'Pictures stay on the device',
			copy: 'Nothing is uploaded anywhere. No accounts, no ads, and no tracking, not even by us.'
		},
		free: {
			title: 'Free and open',
			copy: 'No paid extras and no watermarks. Anyone can read the code and see how it works.'
		}
	},
	workshop: {
		title: 'A stop-motion workshop at kindergarten.',
		copy: 'One tablet, a few toys, and a group of little directors. A few tricks make sure the first cartoon is a hit.',
		tipsTitle: 'Tips for the first shoot',
		tips: [
			'Keep the camera still: a stand, a stack of books, or a strip of tape.',
			'Keep the light steady. Sunshine that comes and goes makes the cartoon flicker.',
			'Small nudges make smooth movement, and big jumps make it zippy.',
			'Hands out of the picture before every snap.',
			'Eight pictures make one second of cartoon.'
		],
		ideasTitle: 'Ideas to start with',
		ideas: [
			{ title: 'Teddy goes for a walk', copy: 'A plush toy hops across the table and waves.' },
			{
				title: 'Bricks that build themselves',
				copy: 'A tower grows brick by brick, then tumbles.'
			},
			{ title: 'The clay snail’s journey', copy: 'A snail creeps along a road drawn on paper.' },
			{ title: 'A drawing that grows', copy: 'Add a line, snap, add another. It draws itself.' }
		]
	},
	faq: {
		title: 'Questions and answers',
		copy: 'What parents and teachers ask most often.',
		items: [
			{
				q: 'Do I need an account?',
				a: 'No. Open BubbleCam and start shooting. There’s nothing to sign up for and nothing to pay.'
			},
			{
				q: 'Where are the cartoons kept?',
				a: 'On the device they were made on, in the browser’s storage. They’re never uploaded. If you clear the browser’s data or remove the app, the cartoons go too, so save the ones you love as videos.'
			},
			{
				q: 'Does it work without the internet?',
				a: 'Yes. Once BubbleCam has opened with a connection, it opens and works without one.'
			},
			{
				q: 'Which devices does it work on?',
				a: 'Tablets, phones, and computers with a camera, in an up-to-date Safari, Chrome, Edge, Firefox, or Samsung Internet. A tablet on a stand works best.'
			},
			{
				q: 'How do I put it on the home screen?',
				a: 'On iPad and iPhone, open BubbleCam in Safari, tap Share, then Add to Home Screen. On Android, open Chrome’s menu and choose Install app or Add to home screen. It then opens full screen, like any other app. On iPad and iPhone this also keeps the cartoons safe: Safari may clear what a website keeps when it isn’t opened for a week or so, but it leaves apps on the Home Screen alone.'
			},
			{
				q: 'What can we do with the video?',
				a: 'Save it to the device’s photos, or send it straight to the family in a messaging app. It’s an ordinary MP4 file that plays everywhere.'
			},
			{
				q: 'Is it really free?',
				a: 'Yes, entirely: no ads, no paid features, and no data collected. BubbleCam is open source, made by Commit, a small team building free apps for everyday life.'
			}
		]
	},
	openSource: {
		title: 'Free for every kindergarten and every home.',
		copy: 'BubbleCam is open source and free for everyone, for good. It’s made by Commit, the team behind BubbleBoard, the app that brings families a little closer to their children’s day at kindergarten.',
		code: 'See the code',
		write: 'Write to us',
		subject: 'BubbleCam',
		bubbleBoard: 'Meet BubbleBoard'
	},
	footer: {
		tagline: 'Toys come to life, one picture at a time.',
		explore: 'Explore',
		project: 'Project',
		github: 'Source code',
		license: 'License',
		credits: 'Credits',
		privacy: 'Privacy',
		madeBy: 'Made with care by'
	},
	build: {
		label: 'Version',
		modified: 'modified'
	},
	// The privacy policy (/privacy). It describes what the code does, so change it with anything that alters that.
	privacyPolicy: {
		title: 'Privacy',
		intro: 'BubbleCam keeps nothing about you. What kids make stays on their device.',
		sections: [
			{
				title: 'Pictures and cartoons',
				copy: 'Every picture BubbleCam takes, and every cartoon made of them, is kept only on the device, in the browser’s storage. None of it is sent to us or to anyone else. A video goes anywhere else only when you share it yourself.'
			},
			{
				title: 'The camera',
				copy: 'BubbleCam uses the camera only while a cartoon is open for shooting, once the browser has asked your permission. What the camera sees is never recorded or sent anywhere, apart from the pictures you take, which stay on the device.'
			},
			{
				title: 'No accounts, cookies, or tracking',
				copy: 'There are no accounts, cookies, ads, or analytics. BubbleCam doesn’t know who uses it.'
			},
			{
				title: 'Hosting',
				copy: 'The site is served by Cloudflare. Like any server, it handles the technical details needed to deliver a page to your device, such as its IP address. BubbleCam itself doesn’t log or analyse visits.'
			},
			{
				title: 'Deleting',
				copy: 'Delete a cartoon in the app, or clear the site’s data in your browser’s settings to remove everything at once.'
			}
		],
		contact: 'Questions? Write to'
	},
	error: {
		title: 'Something went wrong',
		copy: 'Something on this page broke. Going back usually helps.',
		missingTitle: 'This page has popped',
		missingCopy: 'Like a soap bubble. Maybe the address is wrong, or the page has moved.',
		home: 'Back to the start',
		app: 'Back to my cartoons'
	},
	app: {
		films: {
			title: 'My cartoons',
			new: 'New cartoon',
			intro:
				'Pick a toy, put it in front of the camera, and press the red button. Cartoons stay on this device, so save the ones you love as videos.',
			pictures,
			/** A cartoon's card, for screen readers: when it was made and how long it is. */
			open: (when: string, count: number) => `Cartoon from ${when}, ${pictures(count)}`,
			remove: 'Delete cartoon',
			removeTitle: 'Delete this cartoon?',
			removeCopy:
				'All its pictures go with it, and that can’t be undone. Videos you saved stay where they are.',
			removeConfirm: 'Delete',
			keep: 'Keep it',
			unavailable:
				'This browser can’t keep cartoons, perhaps because it’s in private mode. Open BubbleCam in a regular window.'
		},
		install: {
			button: 'Install',
			iosTitle: 'Put BubbleCam on the Home Screen',
			iosCopy: 'In Safari, tap Share, then Add to Home Screen. Your cartoons are safest there.',
			dismiss: 'Not now'
		},
		studio: {
			back: 'My cartoons',
			shutter: 'Take a picture',
			camera: 'Back to the camera',
			ghost: 'Ghost of the last picture',
			play: 'Play the cartoon',
			stop: 'Stop',
			flip: 'Switch camera',
			removeLast: 'Delete the last picture',
			removeThis: 'Delete this picture',
			save: 'Make a video',
			speed: 'Speed',
			speeds: { slow: 'Slow', walk: 'Walking', fast: 'Fast' },
			strip: 'Pictures',
			frame: (index: number) => `Picture ${index}`,
			hint: 'Put a toy in front of the camera and press the red button!',
			hintNext: 'Now move it a tiny bit and snap again.',
			taken: (count: number) => `Picture ${count} taken`,
			removed: 'Picture deleted',
			starting: 'Starting the camera…',
			problems: {
				denied: {
					title: 'The camera isn’t allowed',
					copy: 'Allow the camera for this site in the browser’s settings, then try again.'
				},
				missing: {
					title: 'No camera found',
					copy: 'BubbleCam needs a camera, like the one on a tablet or phone.'
				},
				busy: {
					title: 'The camera is busy',
					copy: 'Another app is using the camera. Close it, then try again.'
				},
				unsupported: {
					title: 'This browser can’t use the camera',
					copy: 'Open BubbleCam in an up-to-date Safari, Chrome, Edge, or Firefox.'
				}
			},
			retry: 'Try again'
		},
		video: {
			making: 'Making your video…',
			progress: (done: number, total: number) => `${done} of ${total}`,
			ready: 'Your cartoon is ready!',
			share: 'Share',
			save: 'Save',
			close: 'Close',
			cancel: 'Cancel',
			failed: 'The video didn’t work out',
			failedCopy: 'Try again. If it still doesn’t work, update the browser.',
			retry: 'Try again',
			shareTitle: 'My BubbleCam cartoon',
			fileName: 'bubblecam-cartoon'
		}
	}
};

export type Messages = typeof en;
