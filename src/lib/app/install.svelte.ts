// Installing BubbleCam on the device. Chromium browsers offer it themselves with an event, which the cartoons'
// page turns into an Install button; Safari on iPhone and iPad adds it from its Share menu, which the page
// explains. Installed, it opens full screen from the home screen, and Safari keeps its cartoons for good.
// Browser-only.

import { browser } from '$app/env';

/** Chromium's install offer, which the DOM types don't describe. */
type InstallPrompt = Event & { prompt(): Promise<void> };

export const install = $state<{ prompt: InstallPrompt | undefined }>({ prompt: undefined });

if (browser) {
	addEventListener('beforeinstallprompt', (event) => {
		// The page's own button offers it, rather than the browser's banner.
		event.preventDefault();
		install.prompt = event as InstallPrompt;
	});
	addEventListener('appinstalled', () => (install.prompt = undefined));
}

/** Shows the browser's install question, which it asks only once per offer. */
export async function installApp() {
	const prompt = install.prompt;
	install.prompt = undefined;
	await prompt?.prompt();
}

/** Whether this is Safari, or another browser, on iPhone or iPad, outside an app on the Home Screen. */
export function addsFromShareMenu() {
	const apple =
		/iPhone|iPad|iPod/.test(navigator.userAgent) ||
		(/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
	const standalone =
		(navigator as Navigator & { standalone?: boolean }).standalone === true ||
		matchMedia('(display-mode: standalone)').matches;
	return apple && !standalone;
}
