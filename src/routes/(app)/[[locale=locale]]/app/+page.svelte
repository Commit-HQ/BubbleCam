<script lang="ts">
	import ConfirmDialog from '#lib/app/ConfirmDialog.svelte';
	import FilmCard from '#lib/app/FilmCard.svelte';
	import { addsFromShareMenu, install, installApp } from '#lib/app/install.svelte.ts';
	import BuildLabel from '#lib/components/BuildLabel.svelte';
	import Bubble from '#lib/components/Bubble.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import LanguageSwitch from '#lib/components/LanguageSwitch.svelte';
	import SiteHeader from '#lib/components/SiteHeader.svelte';
	import { messages } from '#lib/i18n/index.ts';
	import { appPath, homePath, privacyPath } from '#lib/paths.ts';
	import { deleteFilm, getThumbs, listFilms, type Film } from '#lib/studio/films.ts';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';

	// The cartoons this device keeps, newest first, after a card that starts a new one. They're read from the
	// device in the browser, so the prerendered page has the heading, a line on what to do, and the new cartoon's
	// card, and nothing bigger appears later than those first words, which keeps the page quick to show.
	let { data }: PageProps = $props();
	const t = $derived(messages[data.locale]);

	type Card = { film: Film; cover: string | undefined };
	let cards = $state<Card[]>();
	let unavailable = $state(false);
	let removing = $state<Card>();
	let tip = $state(false);

	/** Where the device remembers that the Home Screen tip was put away. */
	const tipKey = 'bubblecam:home-screen-tip';

	onMount(() => {
		let covers: string[] = [];
		void (async () => {
			try {
				const films = await listFilms();
				const thumbs = await getThumbs(films.map((film) => film.frames[0]));
				cards = films.map((film) => {
					const thumb = thumbs.get(film.frames[0]);
					return { film, cover: thumb && URL.createObjectURL(thumb) };
				});
				covers = cards.flatMap((card) => (card.cover ? [card.cover] : []));
			} catch (error) {
				console.error(error);
				unavailable = true;
				cards = [];
			}
		})();
		try {
			tip = addsFromShareMenu() && localStorage.getItem(tipKey) === null;
		} catch {
			tip = false;
		}
		return () => covers.forEach((cover) => URL.revokeObjectURL(cover));
	});

	function hideTip() {
		tip = false;
		try {
			localStorage.setItem(tipKey, 'hidden');
		} catch {
			// It shows again next time.
		}
	}

	async function remove(card: Card) {
		cards = cards?.filter((other) => other !== card);
		await deleteFilm(card.film.id);
		if (card.cover) URL.revokeObjectURL(card.cover);
	}
</script>

<svelte:head>
	<title>BubbleCam</title>
	<meta name="description" content={t.description} />
	<meta name="theme-color" content="#fffaf3" />
</svelte:head>

<div class="mx-auto flex min-h-dvh max-w-6xl flex-col overflow-x-clip px-4 sm:px-8">
	<SiteHeader href={appPath(data.locale)}>
		<div class="flex items-center gap-2">
			{#if install.prompt}
				<button
					type="button"
					class="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full bg-ink font-display font-semibold whitespace-nowrap text-white sm:py-1.5 sm:pr-4 sm:pl-3"
					aria-label={t.app.install.button}
					onclick={installApp}
					><Icon name="download" /><span class="max-sm:hidden">{t.app.install.button}</span></button
				>
			{/if}
			<LanguageSwitch locale={data.locale} />
		</div>
	</SiteHeader>

	<main id="main" class="relative isolate flex-1 pt-6 pb-16">
		<Bubble class="-top-2 right-0 -z-10 size-32 sm:size-48" />
		<h1 class="mb-3 text-5xl sm:text-6xl">{t.app.films.title}</h1>
		<p class="mb-8 max-w-xl text-lg text-muted">{t.app.films.intro}</p>

		{#if tip}
			<aside class="mb-8 flex items-start gap-4 rounded-3xl glass p-5">
				<span class="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand text-white">
					<Icon name="share" class="size-6" />
				</span>
				<div class="grow">
					<h2 class="text-xl">{t.app.install.iosTitle}</h2>
					<p class="mt-1 text-muted">{t.app.install.iosCopy}</p>
				</div>
				<button
					type="button"
					class="grid size-11 shrink-0 place-items-center rounded-full text-muted hover:bg-ink/5 hover:text-ink"
					aria-label={t.app.install.dismiss}
					onclick={hideTip}><Icon name="x" /></button
				>
			</aside>
		{/if}

		{#if unavailable}
			<p class="mb-8 rounded-3xl bg-pink/15 p-5 font-semibold text-red-800">
				{t.app.films.unavailable}
			</p>
		{/if}

		<ul class="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
			<li>
				<a
					class="group grid h-full min-h-44 place-items-center content-center gap-3 rounded-4xl border-[3px] border-dashed border-coral/50 bg-white/50 p-4 text-center transition hover:border-coral hover:bg-white/80 sm:min-h-56 sm:gap-4 sm:p-6"
					href={appPath(data.locale, {})}
				>
					<!-- With no cartoon yet, the button wiggles now and then, to be pressed. -->
					<span
						class="grid size-16 place-items-center rounded-full bg-coral text-white shadow-lg shadow-coral/40 transition group-hover:scale-105 motion-reduce:group-hover:scale-100 sm:size-20 {cards?.length ===
						0
							? 'wiggle'
							: ''}"
					>
						<Icon name="plus" class="size-8 sm:size-10" />
					</span>
					<span class="font-display text-xl font-semibold sm:text-2xl">{t.app.films.new}</span>
				</a>
			</li>
			{#each cards ?? [] as card (card.film.id)}
				<FilmCard
					film={card.film}
					cover={card.cover}
					locale={data.locale}
					onremove={() => (removing = card)}
				/>
			{/each}
		</ul>
	</main>

	<footer
		class="mb-4 flex flex-wrap justify-between gap-x-6 gap-y-2 border-t border-ink/10 pt-6 text-sm text-muted"
	>
		<!-- Pages outside the app open in a window of their own, so the installed app keeps its place. -->
		<a class="hover:text-ink" href={homePath(data.locale)} target="_blank" rel="noopener"
			>{t.footer.tagline}</a
		>
		<div class="flex flex-wrap gap-x-6 gap-y-2">
			<a class="hover:text-ink" href={privacyPath(data.locale)} target="_blank" rel="noopener"
				>{t.footer.privacy}</a
			>
			<BuildLabel locale={data.locale} />
		</div>
	</footer>
</div>

{#if removing}
	{@const card = removing}
	<ConfirmDialog
		title={t.app.films.removeTitle}
		copy={t.app.films.removeCopy}
		confirm={t.app.films.removeConfirm}
		cancel={t.app.films.keep}
		onconfirm={() => remove(card)}
		onclose={() => (removing = undefined)}
	>
		{#if card.cover}
			<img src={card.cover} alt="" class="mb-5 aspect-4/3 w-full rounded-3xl object-cover" />
		{/if}
	</ConfirmDialog>
{/if}

<style>
	.wiggle {
		animation: wiggle 2.8s ease-in-out 1s infinite;
	}
	@keyframes wiggle {
		0%,
		70%,
		100% {
			transform: rotate(0) scale(1);
		}
		76% {
			transform: rotate(-10deg) scale(1.08);
		}
		82% {
			transform: rotate(9deg) scale(1.08);
		}
		88% {
			transform: rotate(-5deg) scale(1.04);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.wiggle {
			animation: none;
		}
	}
</style>
