<script lang="ts">
	import { page } from '$app/state';
	import Popped from '#lib/components/Popped.svelte';
	import SiteHeader from '#lib/components/SiteHeader.svelte';
	import { messages } from '#lib/i18n/index.ts';
	import { appPath, homePath, isAppPath, pathLocale } from '#lib/paths.ts';

	// An error while the app runs, or an address the app's router doesn't know: back into the app, which an
	// installed app keeps in its window, or home from anywhere else.
	const locale = $derived(pathLocale(page.url.pathname));
	const t = $derived(messages[locale]);
	const inApp = $derived(isAppPath(page.url.pathname));
	const back = $derived(inApp ? appPath(locale) : homePath(locale));
</script>

<svelte:head>
	<title>BubbleCam</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 sm:px-8">
	<SiteHeader href={back} label={inApp ? undefined : t.home} />
	<main id="main" class="my-auto py-10">
		<Popped
			{locale}
			missing={page.status === 404}
			{back}
			label={inApp ? t.error.app : t.error.home}
		/>
	</main>
</div>
