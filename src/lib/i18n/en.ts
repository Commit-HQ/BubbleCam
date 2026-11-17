// Interface copy in English. Croatian (hr.ts) has the same shape. Copy that names or counts something is a
// function, so each language builds its own sentence and plural.

const plural = new Intl.PluralRules('en');
const seconds = new Intl.NumberFormat('en', { maximumFractionDigits: 1 });

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
				title: 'The microphone',
				copy: 'BubbleCam uses the microphone only while you record a voice for a cartoon. The browser asks to allow it together with the camera, so recording isn’t interrupted later. The recorded voice stays on the device, with the pictures.'
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
			open: (when: string, count: number, voiced: boolean) =>
				`Cartoon from ${when}, ${pictures(count)}${voiced ? ', with a voice' : ''}`,
			remove: 'Delete cartoon',
			removeTitle: 'Delete this cartoon?',
			removeCopy:
				'All its pictures go with it, and that can’t be undone. Videos you saved stay where they are.',
			removeConfirm: 'Delete',
			keep: 'Keep it',
			unavailable:
				'This browser can’t keep cartoons, perhaps because it’s in private mode. Open BubbleCam in a regular window.',
			settings: 'Settings'
		},
		/** The sum that keeps the settings, and deleting where that's guarded, for grown-ups. */
		gate: {
			title: 'Grown-ups only',
			question: (a: number, b: number) => `What is ${a} times ${b}?`,
			wrong: 'Not quite. Here’s another sum.',
			cancel: 'Cancel',
			settings: {
				copy: 'The settings are for parents and teachers. To open them, answer the sum.',
				open: 'Open settings'
			},
			remove: {
				copy: 'Deleting a cartoon is for parents and teachers. To go on, answer the sum.',
				open: 'Go on'
			},
			video: {
				copy: 'Making a video is for parents and teachers. To go on, answer the sum.',
				open: 'Go on'
			}
		},
		settings: {
			title: 'Settings',
			language: 'Language',
			shape: {
				title: 'Cartoon shape',
				hint: 'For new cartoons. A cartoon already started keeps its shape.',
				options: { auto: 'As held', landscape: 'Wide', portrait: 'Tall' }
			},
			lock: {
				title: 'Keep the screen from turning',
				hint: 'While a cartoon is shot, the screen stays turned the way the cartoon is. In a browser, the studio opens full screen for this.',
				apple:
					'On iPhone and iPad, lock the screen’s rotation in Control Centre. A website can’t do it there.'
			},
			rest: {
				title: 'Pause after a picture',
				hint: 'How long the red button rests after a picture, so two quick presses take only one.'
			},
			sounds: {
				title: 'Sounds',
				hint: 'The shutter’s click, and the pop of a picture being deleted. A cartoon’s voice plays either way.'
			},
			guard: {
				title: 'Guard deleting',
				hint: 'Deleting a cartoon asks a sum first, as the settings do.'
			},
			guardVideo: {
				title: 'Guard making videos',
				hint: 'Making a video asks a sum first, as the settings do.'
			},
			pictures: {
				title: 'Picture quality',
				hint: 'Larger pictures are sharper and take more room on the device. For new cartoons.',
				options: { small: 'Smaller', normal: 'Standard', high: 'High' }
			},
			video: {
				title: 'Video quality',
				hint: 'Higher quality makes a sharper video, and a bigger file.',
				options: { small: 'Smaller', normal: 'Standard', high: 'High' }
			},
			advanced: {
				title: 'Advanced tools',
				hint: 'Adds to the studio: zoom, the ghost’s strength, a grid over the camera, a self-timer, moving pictures, holding a picture on screen, and a video that repeats.'
			},
			done: 'Done'
		},
		/** A length of time, such as "1.5 s". */
		seconds: (value: number) => `${seconds.format(value)} s`,
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
			/** A voice recorded over the cartoon as it plays through once. */
			record: 'Record a voice',
			finishRecording: 'Finish recording',
			removeVoice: 'Delete the voice',
			recording: 'Recording…',
			voiced: 'The voice is recorded',
			unvoiced: 'The voice is deleted',
			hasVoice: 'With a voice',
			voiceProblems: {
				denied:
					'The microphone isn’t allowed. Allow it for this site in the browser’s settings, then try again.',
				missing: 'No microphone found.',
				busy: 'Another app is using the microphone. Close it, then try again.',
				unsupported: 'This browser can’t record a voice.'
			},
			/** The advanced tools, which a grown-up turns on in the settings. */
			tools: 'Zoom, ghost, grid, and self-timer',
			zoom: 'Zoom',
			ghostStrength: 'Ghost’s strength',
			grid: 'Grid over the camera',
			timer: (seconds: number) => (seconds ? `Self-timer: ${seconds} s` : 'Self-timer: off'),
			again: 'Count down again after each picture',
			stopTimer: 'Stop the self-timer',
			counting: (seconds: number) => `A picture in ${seconds}`,
			hold: 'Hold this picture on screen',
			moveEarlier: 'Move this picture earlier',
			moveLater: 'Move this picture later',
			moved: (index: number) => `The picture is now number ${index}`,
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
			/** How many times the video plays the cartoon, with the advanced tools. */
			loops: 'Times the cartoon plays',
			times: (count: number) => (count === 1 ? 'Once' : `${count} times`),
			shareTitle: 'My BubbleCam cartoon',
			fileName: 'bubblecam-cartoon'
		}
	}
};

export type Messages = typeof en;
