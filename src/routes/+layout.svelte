<script lang="ts">
	import favicon from '#lib/assets/favicon.svg';
	import '#lib/styles/app.css';
	import { onMount } from 'svelte';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();

	// The document's language comes with the first page. Pages that change language in the browser update it,
	// so screen readers pronounce the new language.
	$effect(() => {
		document.documentElement.lang = data.locale;
	});

	// A page left open over two new versions asks for code that neither the device nor the site keeps any more
	// (src/service-worker). Loading the page again brings the newest version.
	onMount(() => {
		const reload = () => location.reload();
		window.addEventListener('vite:preloadError', reload);
		return () => window.removeEventListener('vite:preloadError', reload);
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} type="image/svg+xml" />
	<link rel="icon" href="/favicon.ico" sizes="32x32" />
	<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
</svelte:head>

{@render children()}
