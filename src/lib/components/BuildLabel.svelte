<script lang="ts">
	import { messages, type Locale } from '#lib/i18n/index.ts';
	import { repositoryUrl } from '#lib/project.ts';

	// The version a build came from, linked to its changelog, or to its commit when it isn't a release.
	let { locale }: { locale: Locale } = $props();
	const t = $derived(messages[locale].build);
	// Empty for a release, else "abc1234", "abc1234-dirty" when built with uncommitted changes, or "unknown"
	// without Git metadata (vite.config.ts).
	const [, commit, modified] = __COMMIT__.match(/^([0-9a-f]+)(-dirty)?$/) ?? [];
	const href = commit
		? `${repositoryUrl}/commit/${commit}`
		: `${repositoryUrl}/blob/v${__VERSION__}/CHANGELOG.md`;
</script>

<!-- In a window of its own, so the installed app keeps its place. -->
<a class="hover:text-ink" {href} target="_blank" rel="noopener noreferrer">
	{t.label}
	{__VERSION__}{#if commit}&nbsp;· {commit}{/if}
	{#if modified}({t.modified}){/if}
</a>
