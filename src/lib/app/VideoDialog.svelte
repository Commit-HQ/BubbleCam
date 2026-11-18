<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '#lib/components/Icon.svelte';
	import type { Messages } from '#lib/i18n/index.ts';
	import type { Film } from '#lib/studio/films.ts';
	import { decode } from '#lib/studio/decode.ts';
	import { getImage, hasSound } from '#lib/studio/films.ts';
	import { loopChoices, type Quality } from '#lib/studio/settings.ts';
	import { canShare, fileName, makeVideo, type Video } from '#lib/studio/video.ts';

	// Making the film's video, then handing it on: shared to another app where the device can, such as the photo
	// library or a messaging app, or saved as a file. Sharing needs a fresh tap, so it waits for one once the
	// video is ready, rather than starting itself. With the advanced tools on, the finished video can be made
	// again to play the cartoon several times over, which suits a short one.
	let {
		film,
		quality,
		loops: chosen = 1,
		onloops,
		t,
		onclose
	}: {
		film: Film;
		/** How finely the video is encoded, from the settings. */
		quality: Quality;
		/** How many times the video plays the cartoon, and what keeps another choice: the advanced tools' own. */
		loops?: number;
		onloops?: (loops: number) => void;
		t: Messages['app']['video'];
		onclose: () => void;
	} = $props();

	let dialog: HTMLDialogElement;
	let canvas = $state<HTMLCanvasElement>();
	let phase = $state<'making' | 'ready' | 'failed'>('making');
	let done = $state(0);
	let video = $state<{ url: string; file: File }>();
	// svelte-ignore state_referenced_locally: the dialog starts from what was chosen last, then keeps its own.
	let loops = $state(chosen);
	const making = new AbortController();
	const total = $derived(film.frames.length * loops);

	function repeat(times: number) {
		if (times === loops || phase === 'making') return;
		loops = times;
		onloops?.(times);
		if (video) URL.revokeObjectURL(video.url);
		video = undefined;
		void make();
	}

	async function make() {
		phase = 'making';
		done = 0;
		try {
			const made: Video = await makeVideo(film, {
				progress: (count) => (done = count),
				canvas: canvas!,
				signal: making.signal,
				quality,
				loops
			});
			const name = fileName(t.fileName, film, made);
			const file = new File([made.blob], name, { type: made.blob.type });
			video = { url: URL.createObjectURL(made.blob), file };
			phase = 'ready';
		} catch (error) {
			if (making.signal.aborted) return;
			console.error(error);
			phase = 'failed';
		}
	}

	async function share() {
		if (!video) return;
		try {
			await navigator.share({ files: [video.file], title: t.shareTitle });
		} catch {
			// Closing the share sheet is a choice, not a failure.
		}
	}

	onMount(() => {
		dialog.showModal();
		// The film's first picture while its video is made, which a browser that records the film as it plays
		// then plays over.
		void decode(getImage, film.frames[0]).then((picture) => {
			if (picture && canvas && phase === 'making') {
				canvas.width = picture.width;
				canvas.height = picture.height;
				canvas.getContext('2d')!.drawImage(picture, 0, 0);
			}
			picture?.close();
		});
		void make();
		return () => {
			making.abort();
			if (video) URL.revokeObjectURL(video.url);
		};
	});
</script>

<dialog
	bind:this={dialog}
	class="m-auto w-[calc(100%-2rem)] max-w-xl rounded-4xl bg-dusk p-5 text-white shadow-2xl ring-1 shadow-black/50 ring-white/10 backdrop:bg-night/80 sm:p-7"
	aria-labelledby="video-title"
	{onclose}
>
	<h2 id="video-title" class="mb-4 text-center text-3xl">
		{phase === 'ready' ? t.ready : phase === 'failed' ? t.failed : t.making}
	</h2>

	<div class="overflow-hidden rounded-2xl bg-night">
		{#if phase === 'ready' && video}
			<!-- A cartoon with a sound is heard, and has the browser's controls, in case the browser won't start
			a video with sound by itself. -->
			<!-- svelte-ignore a11y_media_has_caption: a child's own voice over toys isn't captioned. -->
			<video
				src={video.url}
				class="block w-full"
				autoplay
				loop
				playsinline
				muted={!hasSound(film)}
				controls={hasSound(film)}
			></video>
		{:else}
			<canvas bind:this={canvas} class="block h-auto w-full" aria-hidden="true"></canvas>
		{/if}
	</div>

	{#if phase === 'making'}
		<progress class="mt-5" max={total} value={done}></progress>
		<p class="mt-2 text-center text-white/70">{t.progress(done, total)}</p>
		<div class="mt-5 flex justify-center">
			<button
				type="button"
				class="inline-flex min-h-12 items-center rounded-full px-5 font-semibold text-white/80 hover:bg-white/10"
				onclick={() => dialog.close()}>{t.cancel}</button
			>
		</div>
	{:else if phase === 'failed'}
		<p class="mt-4 text-center text-white/75">{t.failedCopy}</p>
		<div class="mt-6 flex flex-wrap justify-center gap-3">
			<button
				type="button"
				class="inline-flex min-h-12 items-center rounded-full bg-white px-6 font-display text-lg font-semibold text-night"
				onclick={make}>{t.retry}</button
			>
			<button
				type="button"
				class="inline-flex min-h-12 items-center rounded-full px-5 font-semibold text-white/80 hover:bg-white/10"
				onclick={() => dialog.close()}>{t.close}</button
			>
		</div>
	{:else if video}
		{#if onloops}
			<div class="mt-5 flex items-center justify-center gap-3" role="group" aria-label={t.loops}>
				<Icon name="repeat" class="size-6 text-white/70" />
				<div class="flex gap-1 rounded-full bg-white/8 p-1">
					{#each loopChoices as times (times)}
						<button
							type="button"
							class="grid min-h-11 min-w-12 place-items-center rounded-full px-3 font-display text-lg font-semibold text-white transition hover:bg-white/15 aria-pressed:bg-sun aria-pressed:text-night"
							aria-label={t.times(times)}
							aria-pressed={loops === times}
							onclick={() => repeat(times)}>{times}×</button
						>
					{/each}
				</div>
			</div>
		{/if}
		<div class="mt-6 flex flex-wrap justify-center gap-3">
			{#if canShare(video.file)}
				<button
					type="button"
					class="inline-flex min-h-13 items-center gap-2 rounded-full bg-coral px-7 font-display text-lg font-semibold text-white shadow-lg shadow-black/30"
					onclick={share}><Icon name="share" />{t.share}</button
				>
			{/if}
			<a
				class="inline-flex min-h-13 items-center gap-2 rounded-full bg-white px-7 font-display text-lg font-semibold text-night"
				href={video.url}
				download={video.file.name}><Icon name="download" />{t.save}</a
			>
			<button
				type="button"
				class="inline-flex min-h-13 items-center rounded-full px-5 font-semibold text-white/80 hover:bg-white/10"
				onclick={() => dialog.close()}>{t.close}</button
			>
		</div>
	{/if}
</dialog>
