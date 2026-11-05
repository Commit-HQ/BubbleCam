<script lang="ts">
	import { dev } from '$app/env';
	import { afterNavigate } from '$app/navigation';
	import '#lib/app/install.svelte.ts';
	import { appPath, manifestPath } from '#lib/paths.ts';
	import { onMount } from 'svelte';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();

	// A new version comes with a new service worker, which takes over as soon as it has everything the new
	// version needs (src/service-worker). The open app keeps running the version it started with, which the old
	// worker's files still serve, and loads the new one on the way back to the cartoons, where nothing is in the
	// middle of being made. An installed app can stay open for days, so coming back into view asks for news.
	let updated = false;
	onMount(() => {
		const container = navigator.serviceWorker;
		if (!container) return;
		// The worker is built as one file without imports, so it runs as a classic script, which browsers without
		// module service workers, such as older Firefox and Safari, run too. It starts storing the site once the
		// page has loaded, so the page comes first. During development there's none.
		const register = () => void container.register('/service-worker.js').catch(() => {});
		if (!dev && document.readyState === 'complete') register();
		else if (!dev) addEventListener('load', register, { once: true });
		const replaced = Boolean(container.controller);
		const changed = () => (updated = replaced);
		const check = () => {
			if (document.visibilityState !== 'visible') return;
			void container
				.getRegistration()
				.then((registration) => registration?.update())
				.catch(() => {});
		};
		container.addEventListener('controllerchange', changed);
		document.addEventListener('visibilitychange', check);
		return () => {
			container.removeEventListener('controllerchange', changed);
			document.removeEventListener('visibilitychange', check);
		};
	});
	afterNavigate(({ to }) => {
		if (updated && to?.url.pathname === appPath(data.locale)) location.reload();
	});
</script>

<svelte:head>
	<link rel="manifest" href={manifestPath(data.locale)} />
</svelte:head>

{@render children()}
