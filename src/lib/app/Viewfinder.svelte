<script lang="ts">
	import { onMount } from 'svelte';
	import Bear from '#lib/components/Bear.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import type { Messages } from '#lib/i18n/index.ts';
	import { fit } from '#lib/studio/geometry.ts';
	import type { Studio } from '#lib/studio/studio.svelte.ts';
	import SpeedPicker from './SpeedPicker.svelte';

	// The picture: the camera, with the ghost of the last picture over it, or a picture taken earlier, or the
	// film playing. It takes the film's shape, as large as the space allows, and the camera's picture fills it
	// the way a picture is taken (geometry.ts), so the ghost lines up exactly.
	let { studio, t }: { studio: Studio; t: Messages['app']['studio'] } = $props();

	let video: HTMLVideoElement;
	let ghost: HTMLCanvasElement;
	let screen: HTMLCanvasElement;
	let spaceWidth = $state(0);
	let spaceHeight = $state(0);

	const box = $derived(
		studio.shape && spaceWidth && spaceHeight
			? fit({ width: spaceWidth, height: spaceHeight }, studio.shape)
			: undefined
	);
	const problem = $derived(
		studio.camera === 'on' || studio.camera === 'off' || studio.camera === 'starting'
			? undefined
			: t.problems[studio.camera]
	);

	onMount(() => {
		studio.attach(video, ghost, screen);
	});
</script>

<div
	class="grid size-full place-items-center"
	bind:clientWidth={spaceWidth}
	bind:clientHeight={spaceHeight}
>
	<div
		class="relative isolate overflow-hidden rounded-3xl bg-dusk shadow-2xl ring-1 shadow-black/40 ring-white/10 {box
			? ''
			: 'size-full'}"
		style:width={box ? `${box.width}px` : undefined}
		style:height={box ? `${box.height}px` : undefined}
	>
		<!-- The camera. Muted and inline, as phones require to play it without a tap, and hidden until it plays. -->
		<video
			bind:this={video}
			class="absolute inset-0 size-full object-cover {studio.mirrored
				? '-scale-x-100'
				: ''} {studio.camera === 'on' ? '' : 'invisible'}"
			autoplay
			muted
			playsinline
			disablepictureinpicture
		></video>
		<canvas
			bind:this={ghost}
			class="pointer-events-none absolute inset-0 size-full opacity-45 transition-opacity {studio.ghost &&
			studio.mode === 'live' &&
			studio.frames.length
				? ''
				: 'invisible'}"
			aria-hidden="true"
		></canvas>
		<canvas
			bind:this={screen}
			class="absolute inset-0 size-full bg-dusk {studio.mode === 'live' ? 'invisible' : ''}"
			aria-hidden="true"
		></canvas>

		{#if studio.shots}
			{#key studio.shots}
				<div class="flash pointer-events-none absolute inset-0 bg-white" aria-hidden="true"></div>
			{/key}
		{/if}

		{#if problem}
			<div class="absolute inset-0 grid place-items-center bg-dusk p-5 text-center">
				<div class="grid max-w-sm justify-items-center gap-2">
					<Bear class="mb-1 h-16 w-auto opacity-80" />
					<h2 class="text-xl">{problem.title}</h2>
					<p class="text-sm text-white/75">{problem.copy}</p>
					<button
						type="button"
						class="mt-2 inline-flex min-h-12 items-center rounded-full bg-white px-6 font-display text-lg font-semibold text-night"
						onclick={() => studio.startCamera()}>{t.retry}</button
					>
				</div>
			</div>
		{:else if studio.camera !== 'on' && studio.mode === 'live'}
			<!-- While the camera starts, a bear says what to do. It's in the page as it loads, so the studio shows
			something friendly at once, and the words are the largest the studio ever shows, which keeps the page
			quick by the measure browsers use (the largest contentful paint). -->
			<div
				class="absolute inset-0 grid place-content-center justify-items-center gap-3 p-6 text-center"
			>
				<Bear class="h-24 w-auto sm:h-32" />
				<p class="max-w-md font-display text-2xl font-semibold text-balance sm:text-3xl">
					{t.hint}
				</p>
				<p class="flex items-center gap-2 text-white/70">
					<Icon name="camera" class="size-5 motion-safe:animate-pulse" />{t.starting}
				</p>
			</div>
		{:else if studio.mode === 'live' && studio.camera === 'on' && studio.frames.length < 2}
			<!-- What to do, for the first two pictures. -->
			<p
				class="hint absolute inset-x-3 bottom-3 mx-auto w-fit max-w-[90%] rounded-3xl bg-night/70 px-4 py-2 text-center font-display font-medium text-white ring-1 ring-white/15 backdrop-blur-md sm:bottom-4 sm:rounded-full sm:px-5 sm:py-3 sm:text-lg"
			>
				{studio.frames.length ? t.hintNext : t.hint}
			</p>
		{/if}

		{#if studio.mode === 'review'}
			<p
				class="absolute top-3 left-3 rounded-full bg-night/70 px-4 py-2 font-display font-semibold backdrop-blur-md"
			>
				{t.frame(studio.selected + 1)}
			</p>
		{:else if studio.mode === 'play'}
			<div class="absolute inset-x-0 bottom-3 flex justify-center">
				<SpeedPicker speed={studio.speed} {t} onchange={(speed) => studio.setSpeed(speed)} />
			</div>
		{/if}
	</div>
</div>

<style>
	/* The flash of a picture being taken. */
	.flash {
		opacity: 0;
		animation: flash 0.28s ease-out;
	}
	@keyframes flash {
		from {
			opacity: 0.8;
		}
	}
	/* The first hint bobs gently, to be noticed. */
	.hint {
		animation: bob 2.4s ease-in-out infinite;
	}
	@keyframes bob {
		50% {
			transform: translateY(-4px);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.flash {
			animation-duration: 0.12s;
		}
		.hint {
			animation: none;
		}
	}
</style>
