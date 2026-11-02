<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import { formatDay, messages, type Locale } from '#lib/i18n/index.ts';
	import { getThumbs, type Film } from '#lib/studio/films.ts';
	import { appPath } from '#lib/paths.ts';
	import { onDestroy } from 'svelte';

	// A cartoon on the cartoons' page: its first picture, how many it has, and when it was made. Pointed at with a
	// mouse or reached with the keyboard, it plays its thumbnails at the film's speed, a little preview.
	let {
		film,
		cover,
		locale,
		onremove
	}: { film: Film; cover: string | undefined; locale: Locale; onremove: () => void } = $props();
	const t = $derived(messages[locale].app.films);
	const day = $derived(formatDay(locale, film.created));

	let preview = $state<string>();
	/** The thumbnails' addresses, read once, the first time the card plays. */
	let thumbs: Promise<string[]> | undefined;
	let timer: ReturnType<typeof setInterval> | undefined;
	let wanted = false;

	async function play() {
		wanted = true;
		const frames = await (thumbs ??= getThumbs(film.frames).then((found) =>
			film.frames.flatMap((id) => {
				const blob = found.get(id);
				return blob ? [URL.createObjectURL(blob)] : [];
			})
		));
		if (!wanted || timer || frames.length < 2) return;
		let index = 0;
		timer = setInterval(() => {
			index = (index + 1) % frames.length;
			preview = frames[index];
		}, 1000 / film.fps);
	}

	function stop() {
		wanted = false;
		clearInterval(timer);
		timer = undefined;
		preview = undefined;
	}

	onDestroy(() => {
		stop();
		void thumbs?.then((frames) => frames.forEach((frame) => URL.revokeObjectURL(frame)));
	});
</script>

<li class="relative">
	<a
		class="group block rounded-4xl glass p-2 transition hover:-translate-y-1 hover:bg-white/80 motion-reduce:hover:translate-y-0"
		href={appPath(locale, { id: film.id })}
		aria-label={t.open(day, film.frames.length)}
		onpointerenter={(event) => event.pointerType === 'mouse' && play()}
		onpointerleave={stop}
		onfocus={play}
		onblur={stop}
	>
		<div class="relative aspect-4/3 overflow-hidden rounded-3xl bg-ink/10">
			{#if preview ?? cover}
				<img
					src={preview ?? cover}
					alt=""
					class="size-full object-cover"
					draggable="false"
					decoding="async"
				/>
			{/if}
			<span
				class="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 rounded-full bg-ink/75 px-3 py-1 font-display font-semibold text-white"
			>
				<Icon name="film" class="size-4" />{film.frames.length}
			</span>
		</div>
		<p class="px-2 pt-2 pb-1 font-display font-semibold sm:px-3 sm:pt-2.5 sm:pb-1.5 sm:text-lg">
			{day}
		</p>
	</a>
	<button
		type="button"
		class="absolute top-3.5 right-3.5 grid size-11 place-items-center rounded-full frosted text-ink transition hover:text-red-700"
		aria-label={t.remove}
		onclick={onremove}
	>
		<Icon name="trash2" />
	</button>
</li>
