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
		open: 'Make a cartoon'
	},
	footer: {
		tagline: 'Toys come to life, one picture at a time.',
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
