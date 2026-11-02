import { PUBLIC_SITE_URL } from '$app/env/public';

export const repositoryUrl = 'https://github.com/Commit-HQ/BubbleCam';
export const organizationUrl = 'https://github.com/Commit-HQ';
export const bubbleBoardUrl = 'https://bubbleboard.fyi';
export const contactEmail = 'commit-devs@proton.me';

/** An absolute link on this site, for canonical URLs and link previews (src/env.ts checks the origin). */
export function absoluteUrl(path: string) {
	return new URL(path, PUBLIC_SITE_URL).href;
}
