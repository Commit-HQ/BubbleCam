import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

const { version } = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };

// The footer links a release to CHANGELOG.md (src/lib/components/BuildLabel.svelte), so every version needs an
// entry there. `npm version` runs this after raising the version and stops before committing and tagging it
// when the entry is missing (docs/development.md#releasing). 0.0.0 is the version before the first release.
it.skipIf(version === '0.0.0')('describes the current version in the changelog', () => {
	const headings = readFileSync('CHANGELOG.md', 'utf8').match(/^## \S+/gm) ?? [];
	expect(headings).toContain(`## ${version}`);
});
