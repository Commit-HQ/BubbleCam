<script lang="ts">
	import { onMount } from 'svelte';
	import Bear from '#lib/components/Bear.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import type { Messages } from '#lib/i18n/index.ts';
	import { fit } from '#lib/studio/geometry.ts';
	import { ghostRange, holdRange, timerChoices, zoomRange } from '#lib/studio/settings.ts';
	import type { Studio } from '#lib/studio/studio.svelte.ts';
	import { recordsVoice } from '#lib/studio/voice.ts';
	import SpeedPicker from './SpeedPicker.svelte';

	// The picture: the camera, with the ghost of the last picture over it, or a picture taken earlier, or the
	// film playing. It takes the film's shape, as large as the space allows, and the camera's picture fills it
	// the way a picture is taken (geometry.ts), so the ghost lines up exactly. Zoomed in, the camera's picture is
	// simply shown larger, and a picture keeps the part still in view.
	//
	// With the advanced tools on, sliders for the zoom and the ghost's strength open over the camera, with
	// buttons for a grid that divides the picture in thirds and for the self-timer, whose countdown shows big in
	// the middle; and a picture being looked at has arrows that move it earlier or later in the film, and a
	// slider that holds it on screen for a few seconds when the film plays. Under the sliders are the two
	// triggers that press the shutter by themselves, one at a time: when the picture has settled, or at a clap.
	// While one is on, a little sign at the foot of the picture shows what it sees or hears: a bar that fills as
	// the picture stays still, or one that jumps with the room's noise and is full at a clap.
	//
	// While the film plays, a microphone beside the speeds records a voice over it: the film then plays through
	// once, after a countdown, and the same button ends the recording sooner. A film with a voice has a bin
	// beside the microphone, which takes the voice away.
	let {
		studio,
		t,
		seconds,
		tools = false
	}: {
		studio: Studio;
		t: Messages['app']['studio'];
		/** Writes a length of time in the page's language. */
		seconds: Messages['app']['seconds'];
		/** Whether the sliders for the zoom and the ghost's strength are open. */
		tools?: boolean;
	} = $props();

	/** How long the picture being looked at is held, in seconds. */
	const held = $derived(studio.holds[studio.frames[studio.selected]?.id] ?? 0);

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

	/** The self-timer's next choice: off, three, five, and ten seconds, round and round. */
	const nextTimer = $derived(
		timerChoices[(timerChoices.indexOf(studio.timer) + 1) % timerChoices.length]
	);

	const voiceButton =
		'grid size-14 place-items-center rounded-full text-white transition hover:bg-white/15 active:scale-90 motion-reduce:active:scale-100';
	const toolButton =
		'grid h-12 min-w-12 place-items-center rounded-full px-2 text-white transition hover:bg-white/15 active:scale-90 aria-pressed:bg-sky aria-pressed:text-night motion-reduce:active:scale-100';
	const moveButton =
		'grid size-12 place-items-center rounded-full text-white transition hover:bg-white/15 active:scale-90 aria-disabled:opacity-30 motion-reduce:active:scale-100';

	/** Whether this browser can record a voice. */
	let records = $state(false);

	onMount(() => {
		records = recordsVoice();
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
			style:scale={studio.zoom > 1
				? `${studio.mirrored ? -studio.zoom : studio.zoom} ${studio.zoom}`
				: undefined}
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
			style:opacity={studio.advanced ? studio.ghostStrength : undefined}
			aria-hidden="true"
		></canvas>
		<canvas
			bind:this={screen}
			class="absolute inset-0 size-full bg-dusk {studio.mode === 'live' ? 'invisible' : ''}"
			aria-hidden="true"
		></canvas>

		{#if studio.grid && studio.mode === 'live' && studio.camera === 'on'}
			<!-- Thirds, to keep a toy in its place from one picture to the next. -->
			<svg
				class="pointer-events-none absolute inset-0 size-full text-white/60"
				viewBox="0 0 3 3"
				preserveAspectRatio="none"
				fill="none"
				stroke="currentColor"
				aria-hidden="true"
			>
				<path d="M1 0v3M2 0v3M0 1h3M0 2h3" stroke-width="1" vector-effect="non-scaling-stroke" />
			</svg>
		{/if}

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
		{:else if studio.mode === 'live' && studio.camera === 'on' && studio.trigger !== 'off' && !studio.counting}
			<p
				class="absolute inset-x-3 bottom-3 mx-auto flex w-fit max-w-[90%] items-center gap-3 rounded-full bg-night/70 py-2 pr-5 pl-4 font-display font-semibold text-white ring-1 ring-white/15 backdrop-blur-md sm:bottom-4 sm:text-lg"
			>
				{#if studio.trigger === 'still'}
					<Icon name="eye" class="size-6 shrink-0 text-sun" />
					<span>{t.still[studio.stillness]}</span>
					<span class="meter" aria-hidden="true">
						<span class="still" style:width="{studio.settled * 100}%"></span>
					</span>
				{:else}
					{#key studio.claps}
						<span class={studio.claps ? 'heard' : ''}>
							<Icon name="ear" class="size-6 shrink-0 text-sun" />
						</span>
					{/key}
					<span>{t.clap}</span>
					<span class="meter" aria-hidden="true">
						<span style:width="{studio.loudness * 100}%"></span>
					</span>
				{/if}
			</p>
		{:else if studio.mode === 'live' && studio.camera === 'on' && studio.triggerProblem}
			<p
				class="absolute inset-x-3 bottom-3 mx-auto w-fit max-w-[90%] rounded-3xl bg-night/80 px-4 py-2 text-center font-medium ring-1 ring-white/15 backdrop-blur-md"
				role="status"
			>
				{t.voiceProblems[studio.triggerProblem]}
			</p>
		{:else if studio.mode === 'live' && studio.camera === 'on' && studio.frames.length < 2 && !studio.counting && !tools}
			<!-- What to do, for the first two pictures. The tools, while they're open, need the room. -->
			<p
				class="hint absolute inset-x-3 bottom-3 mx-auto w-fit max-w-[90%] rounded-3xl bg-night/70 px-4 py-2 text-center font-display font-medium text-white ring-1 ring-white/15 backdrop-blur-md sm:bottom-4 sm:rounded-full sm:px-5 sm:py-3 sm:text-lg"
			>
				{studio.frames.length ? t.hintNext : t.hint}
			</p>
		{/if}

		{#if tools && studio.mode === 'live' && studio.camera === 'on' && !studio.counting}
			<div
				class="absolute inset-x-3 top-3 mx-auto grid max-w-sm grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 rounded-3xl bg-night/70 py-1 pr-2 pl-4 ring-1 ring-white/15 backdrop-blur-md"
			>
				<label class="flex items-center gap-3">
					<Icon name="zoomIn" class="size-6 shrink-0" />
					<span class="sr-only">{t.zoom}</span>
					<input
						type="range"
						class="h-12 min-w-0 grow cursor-pointer accent-sun"
						min={zoomRange.min}
						max={zoomRange.max}
						step={zoomRange.step}
						value={studio.zoom}
						oninput={(event) => studio.setZoom(event.currentTarget.valueAsNumber)}
					/>
				</label>
				<button
					type="button"
					class={toolButton}
					aria-label={t.grid}
					aria-pressed={studio.grid}
					onclick={() => studio.setGrid(!studio.grid)}
				>
					<Icon name="grid3x3" class="size-6" />
				</button>
				<label class="flex items-center gap-3 {studio.ghost ? '' : 'opacity-40'}">
					<Icon name="ghost" class="size-6 shrink-0" />
					<span class="sr-only">{t.ghostStrength}</span>
					<input
						type="range"
						class="h-12 min-w-0 grow cursor-pointer accent-sun"
						min={ghostRange.min}
						max={ghostRange.max}
						step={ghostRange.step}
						value={studio.ghostStrength}
						disabled={!studio.ghost}
						oninput={(event) => studio.setGhostStrength(event.currentTarget.valueAsNumber)}
					/>
				</label>
				<!-- Each press picks the next countdown; the seconds show beside the clock while it's on. -->
				<button
					type="button"
					class="{toolButton} grid-flow-col gap-1 font-display text-lg font-semibold"
					aria-label={t.timer(studio.timer)}
					aria-pressed={studio.timer > 0}
					onclick={() => studio.setTimer(nextTimer)}
				>
					<Icon name="timer" class="size-6" />{#if studio.timer}<span>{studio.timer}</span>{/if}
				</button>
				<!-- The shutter pressing itself, one way at a time. Off whenever the studio opens. -->
				<div class="col-span-2 -ml-2 flex gap-1 pb-1" role="group" aria-label={t.triggers.title}>
					<button
						type="button"
						class="{toolButton} grow grid-flow-col gap-2 font-display font-semibold"
						aria-pressed={studio.trigger === 'still'}
						onclick={() => studio.setTrigger(studio.trigger === 'still' ? 'off' : 'still')}
					>
						<Icon name="eye" class="size-6" /><span>{t.triggers.still}</span>
					</button>
					<button
						type="button"
						class="{toolButton} grow grid-flow-col gap-2 font-display font-semibold"
						aria-pressed={studio.trigger === 'clap'}
						onclick={() => studio.setTrigger(studio.trigger === 'clap' ? 'off' : 'clap')}
					>
						<Icon name="ear" class="size-6" /><span>{t.triggers.clap}</span>
					</button>
				</div>
			</div>
		{/if}

		{#if studio.mode === 'review'}
			<div class="absolute top-3 left-3 flex flex-wrap items-center gap-2">
				<p class="rounded-full bg-night/70 px-4 py-2 font-display font-semibold backdrop-blur-md">
					{t.frame(studio.selected + 1)}
				</p>
				{#if studio.advanced && studio.frames.length > 1}
					<!-- Dragging in the strip, for one press or a keyboard. At either end of the film an arrow stays
					in reach, dimmed, so the focus isn't lost with it. -->
					<div
						class="flex items-center rounded-full bg-night/70 ring-1 ring-white/15 backdrop-blur-md"
					>
						<button
							type="button"
							class={moveButton}
							aria-label={t.moveEarlier}
							aria-disabled={studio.selected <= 0}
							onclick={() => studio.shift(-1)}
						>
							<Icon name="arrowLeft" class="size-6" />
						</button>
						<Icon name="film" class="size-5 text-sun" />
						<button
							type="button"
							class={moveButton}
							aria-label={t.moveLater}
							aria-disabled={studio.selected >= studio.frames.length - 1}
							onclick={() => studio.shift(1)}
						>
							<Icon name="arrowRight" class="size-6" />
						</button>
					</div>
				{/if}
			</div>
			{#if studio.advanced}
				<!-- A picture that's held stays on screen for these seconds beyond its turn: a title, or a pause. -->
				<label
					class="absolute inset-x-3 bottom-3 mx-auto flex max-w-sm items-center gap-3 rounded-full bg-night/70 px-4 ring-1 ring-white/15 backdrop-blur-md"
				>
					<Icon name="snowflake" class="size-6 shrink-0" />
					<span class="sr-only">{t.hold}</span>
					<input
						type="range"
						class="h-12 min-w-0 grow cursor-pointer accent-sun"
						min={holdRange.min}
						max={holdRange.max}
						step={holdRange.step}
						value={held}
						aria-valuetext={seconds(held)}
						oninput={(event) => studio.hold(event.currentTarget.valueAsNumber)}
						onchange={() => studio.held()}
					/>
					<output class="w-12 text-right font-display font-semibold whitespace-nowrap tabular-nums"
						>{seconds(held)}</output
					>
				</label>
			{/if}
		{:else if studio.mode === 'play'}
			{#if studio.recording}
				<p
					class="absolute top-3 left-3 inline-flex items-center gap-2 rounded-full bg-night/70 px-4 py-2 font-display font-semibold backdrop-blur-md"
				>
					<span class="size-3 rounded-full bg-coral motion-safe:animate-pulse"></span>{t.recording}
				</p>
			{:else if studio.voiceProblem}
				<p
					class="absolute inset-x-3 top-3 mx-auto w-fit max-w-[90%] rounded-3xl bg-night/80 px-4 py-2 text-center font-medium ring-1 ring-white/15 backdrop-blur-md"
					role="status"
				>
					{t.voiceProblems[studio.voiceProblem]}
				</p>
			{/if}
			<div class="absolute inset-x-3 bottom-3 flex flex-wrap items-center justify-center gap-2">
				{#if !studio.recording && !studio.counting}
					<SpeedPicker speed={studio.speed} {t} onchange={(speed) => studio.setSpeed(speed)} />
				{/if}
				{#if records}
					<div
						class="flex gap-1 rounded-full bg-night/70 p-1.5 ring-1 ring-white/15 backdrop-blur-md"
					>
						<button
							type="button"
							class="{voiceButton} aria-pressed:bg-coral"
							aria-label={studio.recording ? t.finishRecording : t.record}
							aria-pressed={studio.recording}
							onclick={() => (studio.recording ? studio.finishRecording() : studio.record())}
						>
							<Icon name="mic" class="size-7" />
						</button>
						{#if studio.voice && !studio.recording && !studio.counting}
							<button
								type="button"
								class={voiceButton}
								aria-label={t.removeVoice}
								onclick={() => studio.removeVoice()}
							>
								<Icon name="trash2" class="size-6" />
							</button>
						{/if}
					</div>
				{/if}
			</div>
		{/if}

		{#if studio.counting}
			<!-- The self-timer's countdown: time to take the hand away, or to get into the picture. The hint and the
			tools make way for it. -->
			{#key studio.counting}
				<p
					class="count pointer-events-none absolute inset-0 grid place-items-center font-display text-[9rem] leading-none font-bold text-white"
					role="timer"
					aria-label={t.counting(studio.counting)}
				>
					{studio.counting}
				</p>
			{/key}
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
	/* Each second of the self-timer's countdown lands with a little bounce, readable over any picture. */
	.count {
		text-shadow: 0 4px 24px rgb(0 0 0 / 0.65);
		animation: count 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes count {
		from {
			transform: scale(1.6);
			opacity: 0;
		}
	}
	/* A trigger's bar: how long the picture has been still, or how loud the room is. */
	.meter {
		width: 4.5rem;
		height: 0.6rem;
		flex-shrink: 0;
		overflow: hidden;
		border-radius: 999px;
		background: rgb(255 255 255 / 0.22);
	}
	.meter > span {
		display: block;
		height: 100%;
		border-radius: inherit;
		background: var(--color-sun);
	}
	/* The still one is looked at ten times a second, and glides between the looks. */
	.meter > .still {
		transition: width 0.1s linear;
	}
	/* The ear jumps when it has heard a clap. */
	.heard {
		display: inline-grid;
		animation: heard 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes heard {
		from {
			transform: scale(1.9);
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
		.hint,
		.count,
		.heard {
			animation: none;
		}
	}
</style>
