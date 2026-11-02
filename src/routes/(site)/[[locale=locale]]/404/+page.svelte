<script lang="ts">
	import Popped from '#lib/components/Popped.svelte';
	import { messages } from '#lib/i18n/index.ts';
	import { homePath } from '#lib/paths.ts';
	import type { PageProps } from './$types';

	// The page Cloudflare serves, with a 404 status, for an address no file has: 404.html for Croatian and
	// en/404.html for English, the nearest to the address asked for (wrangler.jsonc).
	let { data }: PageProps = $props();
	const t = $derived(messages[data.locale].error);
</script>

<svelte:head>
	<title>BubbleCam · {t.missingTitle}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="mx-auto max-w-2xl py-10">
	<Popped locale={data.locale} missing back={homePath(data.locale)} label={t.home} />
</div>
