<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import FrameStrip from '#lib/app/FrameStrip.svelte';
	import GateDialog from '#lib/app/GateDialog.svelte';
	import ShutterButton from '#lib/app/ShutterButton.svelte';
	import VideoDialog from '#lib/app/VideoDialog.svelte';
	import Viewfinder from '#lib/app/Viewfinder.svelte';
	import { pillButton, roundButton, smallButton } from '#lib/app/ui.ts';
	import Icon from '#lib/components/Icon.svelte';
	import { messages } from '#lib/i18n/index.ts';
	import { appPath } from '#lib/paths.ts';
	import type { Film } from '#lib/studio/films.ts';
	import { orientationOf } from '#lib/studio/geometry.ts';
	import { heldAs, lockRotation, locksRotation } from '#lib/studio/rotation.ts';
	import { wake } from '#lib/studio/sound.ts';
	import { Studio } from '#lib/studio/studio.svelte.ts';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';

	// The studio, where a cartoon is shot: the camera with the ghost of the last picture, the big red button, the
	// strip of pictures, and play. A tablet stands landscape, with the buttons down the side; a phone held upright
	// has them under the picture, where thumbs reach. The cartoon in the address opens; without one, the first
	// picture starts a new cartoon, which the address then names, so going back to it or reloading returns to it.
	// What a grown-up chose in the settings shows here: the advanced tools add a button for the zoom and the
	// ghost's strength to the top bar, and the screen is kept from turning where that was asked and can be done.
	// With the self-timer on, a small button on the big one's shoulder makes it count down again after each
	// picture, so the pictures take themselves until the big button is pressed.
	let { data }: PageProps = $props();
	const t = $derived(messages[data.locale].app);

	const studio = new Studio();
	/** The cartoon whose video is being made, while its dialog is open. */
	let saving = $state.raw<Film>();
	/** Whether the sum is being asked before a video, where a grown-up guards making one. */
	let asking = $state(false);
	/** Whether the sliders for the zoom and the ghost's strength are open over the camera. */
	let tools = $state(false);
	const said = $derived.by(() => {
		const event = studio.event;
		switch (event?.type) {
			case 'taken':
				return t.studio.taken(event.count);
			case 'removed':
				return t.studio.removed;
			case 'moved':
				return t.studio.moved(event.count);
			case 'voiced':
				return t.studio.voiced;
			case 'unvoiced':
				return t.studio.unvoiced;
			default:
				return '';
		}
	});

	/** The big button: a picture, or back to the camera from a picture or the film playing. */
	function shutter() {
		if (studio.mode === 'live') studio.shoot();
		else studio.live();
	}

	function playOrStop() {
		if (studio.mode === 'play') studio.live();
		else studio.play();
	}

	function save() {
		studio.stopTimer();
		studio.live();
		// The tap is what lets a video that's recorded as the cartoon plays hear the cartoon's voice.
		if (studio.voice) wake();
		if (studio.settings.guardVideo) asking = true;
		else void make();
	}

	async function make() {
		asking = false;
		saving = await studio.saved();
	}

	/** Back to the cartoons, once the last pictures are saved, so the cartoon there has them all. */
	async function back(event: MouseEvent) {
		event.preventDefault();
		await studio.saved();
		await goto(appPath(data.locale));
	}

	/**
	 * Keys for a computer's keyboard, and for the remote shutters sold for selfies, which press Enter or a
	 * volume key: Space or Enter takes a picture, unless a button has the focus and takes the key itself.
	 */
	function keys(event: KeyboardEvent) {
		if (event.defaultPrevented || event.repeat || event.metaKey || event.ctrlKey) return;
		if (saving || asking) return;
		const onControl = (event.target as Element).closest?.('button, a, input, select, textarea');
		switch (event.key) {
			case ' ':
			case 'Enter':
				if (onControl) return;
				break;
			case 'AudioVolumeUp':
			case 'AudioVolumeDown':
				break;
			case 'Backspace':
			case 'Delete':
				event.preventDefault();
				return studio.remove();
			case 'p':
				return playOrStop();
			case 'g':
				studio.ghost = !studio.ghost;
				return;
			default:
				return;
		}
		event.preventDefault();
		shutter();
	}

	onMount(() => {
		studio.onstart = (id) =>
			void goto(appPath(data.locale, { id }), { replace: true, shallow: true });
		studio.configure();
		// The screen is kept as the cartoon lies or stands; a new one's shape is the one chosen for new cartoons,
		// or else the way the device is held as the studio opens.
		let turn: (() => void) | undefined;
		let closed = false;
		void studio.load(page.url.searchParams.get('id')).then(() => {
			if (closed || !studio.settings.lock || !locksRotation()) return;
			const chosen = studio.settings.shape === 'auto' ? heldAs() : studio.settings.shape;
			turn = lockRotation(studio.film ? orientationOf(studio.film) : chosen);
		});
		void studio.startCamera();

		// The screen stays on while shooting, which can take a while between pictures. The camera stops when the
		// app goes into the background, as phones do anyway, and starts again when it's back.
		let lock: WakeLockSentinel | undefined;
		const awake = async () => {
			try {
				lock = await navigator.wakeLock?.request('screen');
			} catch {
				// A screen that dims is only a nuisance.
			}
		};
		const visibility = () => {
			if (document.visibilityState === 'visible') {
				void awake();
				if (studio.camera === 'off') void studio.startCamera();
			} else studio.hide();
		};
		void awake();
		document.addEventListener('visibilitychange', visibility);
		addEventListener('keydown', keys);
		return () => {
			document.removeEventListener('visibilitychange', visibility);
			removeEventListener('keydown', keys);
			void lock?.release().catch(() => {});
			closed = true;
			turn?.();
			studio.close();
		};
	});
</script>

<svelte:head>
	<title>BubbleCam</title>
	<meta name="description" content={messages[data.locale].description} />
	<meta name="theme-color" content="#14132c" />
</svelte:head>

<div class="studio-room fixed inset-0 grid studio text-white">
	<header class="top flex items-center gap-2 p-3 pb-1">
		<a class={smallButton} href={appPath(data.locale)} aria-label={t.studio.back} onclick={back}>
			<Icon name="arrowLeft" class="size-6" />
		</a>
		<p
			class="inline-flex min-h-12 items-center gap-2 rounded-full bg-white/8 px-4 font-display text-xl font-semibold"
			aria-hidden="true"
		>
			<Icon name="film" class="size-5 text-sun" />{studio.frames.length}
			{#if studio.voice}<Icon name="mic" class="size-5 text-sun" />{/if}
		</p>
		{#if studio.voice}<p class="sr-only">{t.studio.hasVoice}</p>{/if}
		<div class="ml-auto flex items-center gap-2">
			{#if studio.advanced}
				<button
					type="button"
					class={smallButton}
					aria-label={t.studio.tools}
					aria-pressed={tools}
					onclick={() => (tools = !tools)}
				>
					<Icon name="slidersHorizontal" class="size-6" />
				</button>
			{/if}
			{#if studio.cameras > 1}
				<button
					type="button"
					class={smallButton}
					aria-label={t.studio.flip}
					disabled={studio.camera === 'starting'}
					onclick={() => studio.flip()}
				>
					<Icon name="switchCamera" class="size-6" />
				</button>
			{/if}
			<button
				type="button"
				class={pillButton}
				aria-label={t.studio.save}
				disabled={studio.frames.length < 2}
				onclick={save}
			>
				<Icon name="clapperboard" class="size-5" />
				<span class="max-sm:hidden">{t.studio.save}</span>
			</button>
		</div>
	</header>

	<div class="view min-h-0 min-w-0 p-3">
		<Viewfinder {studio} t={t.studio} seconds={t.seconds} {tools} />
	</div>

	<div class="strip min-w-0 px-3 pb-1">
		<FrameStrip
			frames={studio.frames}
			mode={studio.mode}
			selected={studio.selected}
			showing={studio.showing}
			shape={studio.shape}
			holds={studio.holds}
			t={t.studio}
			movable={studio.advanced}
			onselect={(index) => studio.select(index)}
			onremove={() => studio.remove()}
			onmove={(from, to) => studio.move(from, to)}
			onmoved={() => studio.moved()}
		/>
	</div>

	<div
		class="controls flex items-center justify-center gap-6 p-3 landscape:flex-col landscape:gap-5"
	>
		<button
			type="button"
			class={roundButton}
			aria-label={t.studio.ghost}
			aria-pressed={studio.ghost}
			onclick={() => (studio.ghost = !studio.ghost)}
		>
			<Icon name="ghost" class="size-7" />
		</button>
		<div class="relative grid">
			<ShutterButton
				label={studio.mode !== 'live'
					? t.studio.camera
					: studio.counting
						? t.studio.stopTimer
						: t.studio.shutter}
				live={studio.mode === 'live'}
				counting={studio.counting > 0}
				shots={studio.shots}
				rest={studio.rest}
				disabled={studio.mode === 'live' && (studio.camera !== 'on' || !studio.loaded)}
				onclick={shutter}
			/>
			{#if studio.timer > 0 && studio.mode === 'live'}
				<button
					type="button"
					class="absolute -top-3 -right-4 grid size-11 place-items-center rounded-full bg-dusk text-white ring-1 ring-white/25 transition hover:bg-white/20 active:scale-90 aria-pressed:bg-sky aria-pressed:text-night aria-pressed:ring-sky motion-reduce:active:scale-100"
					aria-label={t.studio.again}
					aria-pressed={studio.again}
					onclick={() => (studio.again = !studio.again)}
				>
					<Icon name="repeat" class="size-5" />
				</button>
			{/if}
		</div>
		<button
			type="button"
			class={roundButton}
			aria-label={studio.mode === 'play' ? t.studio.stop : t.studio.play}
			disabled={studio.frames.length < 2}
			onclick={playOrStop}
		>
			<Icon name={studio.mode === 'play' ? 'square' : 'play'} class="size-7" />
		</button>
	</div>

	<p class="sr-only" aria-live="polite">{said}</p>
</div>

{#if asking}
	<GateDialog
		t={t.gate}
		copy={t.gate.video.copy}
		open={t.gate.video.open}
		onpass={make}
		onclose={() => (asking = false)}
	/>
{/if}

{#if saving}
	<VideoDialog
		film={saving}
		quality={studio.settings.video}
		loops={studio.settings.loops}
		onloops={studio.advanced ? (loops) => studio.setLoops(loops) : undefined}
		t={t.video}
		onclose={() => (saving = undefined)}
	/>
{/if}

<style>
	/* A dark room with a soft glow from above, so the camera's picture is the brightest thing on screen. The
	   screen's rounded corners and notches stay clear (viewport-fit=cover in app.html). */
	.studio-room {
		background:
			radial-gradient(50rem 30rem at 50% -10%, rgb(107 92 255 / 0.28), transparent 70%),
			radial-gradient(30rem 20rem at 100% 100%, rgb(63 184 255 / 0.12), transparent 70%),
			var(--color-night);
		grid-template-areas: 'top' 'view' 'strip' 'controls';
		grid-template-rows: auto minmax(0, 1fr) auto auto;
		grid-template-columns: minmax(0, 1fr);
		padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom)
			env(safe-area-inset-left);
	}
	@media (orientation: landscape) {
		.studio-room {
			grid-template-areas: 'top controls' 'view controls' 'strip controls';
			grid-template-columns: minmax(0, 1fr) auto;
			grid-template-rows: auto minmax(0, 1fr) auto;
		}
	}
	.top {
		grid-area: top;
	}
	.view {
		grid-area: view;
	}
	.strip {
		grid-area: strip;
	}
	.controls {
		grid-area: controls;
	}
</style>
