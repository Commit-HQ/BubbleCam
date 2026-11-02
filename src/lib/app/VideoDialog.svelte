<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '#lib/components/Icon.svelte';
	import type { Messages } from '#lib/i18n/index.ts';
	import type { Film } from '#lib/studio/films.ts';
	import { decode } from '#lib/studio/decode.ts';
	import { getImage } from '#lib/studio/films.ts';
	import { canShare, fileName, makeVideo, type Video } from '#lib/studio/video.ts';

	// Making the film's video, then handing it on: shared to another app where the device can, such as the photo
	// library or a messaging app, or saved as a file. Sharing needs a fresh tap, so it waits for one once the
	// video is ready, rather than starting itself.
	let { film, t, onclose }: { film: Film; t: Messages['app']['video']; onclose: () => void } =
		$props();

	let dialog: HTMLDialogElement;
	let canvas = $state<HTMLCanvasElement>();
	let phase = $state<'making' | 'ready' | 'failed'>('making');
	let done = $state(0);
	let video = $state<{ url: string; file: File }>();
	const making = new AbortController();

	async function make() {
		phase = 'making';
		done = 0;
		try {
			const made: Video = await makeVideo(film, {
				progress: (count) => (done = count),
				canvas: canvas!,
				signal: making.signal
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
			<!-- svelte-ignore a11y_media_has_caption: a cartoon of toys has no words to caption. -->
			<video src={video.url} class="block w-full" autoplay loop muted playsinline></video>
		{:else}
			<canvas bind:this={canvas} class="block h-auto w-full" aria-hidden="true"></canvas>
		{/if}
	</div>

	{#if phase === 'making'}
		<progress class="mt-5" max={film.frames.length} value={done}></progress>
		<p class="mt-2 text-center text-white/70">{t.progress(done, film.frames.length)}</p>
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
