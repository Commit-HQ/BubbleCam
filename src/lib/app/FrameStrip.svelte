<script lang="ts">
	import { flip } from 'svelte/animate';
	import { scale } from 'svelte/transition';
	import Icon from '#lib/components/Icon.svelte';
	import type { Messages } from '#lib/i18n/index.ts';
	import { tap } from '#lib/studio/sound.ts';
	import type { Frame, Mode } from '#lib/studio/studio.svelte.ts';
	import { roundButton } from './ui.ts';

	// The film's pictures in a row, newest last, as on a strip of film. A tap shows a picture big; the bin deletes
	// it, or the last one taken. New pictures pop in at the end, which scrolls into view, and deleted ones shrink
	// away while the rest close the gap.
	//
	// With the advanced tools on, a picture can be dragged to another place: at once with a mouse, and after a
	// finger has rested on it a moment, since a finger that moves at once scrolls the strip. The picture takes
	// the place under the pointer as it goes, the others step aside, and the strip scrolls when the pointer
	// nears an end of it.
	let {
		frames,
		mode,
		selected,
		showing,
		shape,
		holds = {},
		t,
		movable = false,
		onselect,
		onremove,
		onmove,
		onmoved
	}: {
		frames: Frame[];
		mode: Mode;
		selected: number;
		showing: number;
		shape: { width: number; height: number } | undefined;
		/** How long each held picture stays on screen beyond its turn, by its ID: those are marked. */
		holds?: Record<string, number>;
		t: Messages['app']['studio'];
		/** Whether pictures can be dragged to another place. */
		movable?: boolean;
		onselect: (index: number) => void;
		onremove: () => void;
		/** Called as a dragged picture takes another place, and once when it has been put down. */
		onmove?: (from: number, to: number) => void;
		onmoved?: () => void;
	} = $props();

	let list = $state<HTMLOListElement>();
	const width = $derived(shape ? Math.round((64 * shape.width) / shape.height) : 112);

	// Each new picture brings the end of the strip into view, as playing brings the picture on screen.
	let count = 0;
	$effect(() => {
		const added = frames.length > count;
		count = frames.length;
		if (added) list?.lastElementChild?.scrollIntoView({ block: 'nearest', inline: 'end' });
	});
	$effect(() => {
		if (showing >= 0)
			list?.children[showing]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
	});

	/** How long a finger rests on a picture before it picks it up, and how far a pointer moves before it drags. */
	const rest = 350;
	const slop = 8;
	/** How near an end of the strip the pointer scrolls it, in pixels, and how fast at most, in pixels a frame. */
	const edge = 48;
	const pace = 12;

	/** The picture being dragged. */
	let dragging = $state<string>();
	/** A press on a picture, which becomes a drag or a tap. */
	let press: { id: string; x: number; y: number; touch: boolean } | undefined;
	let timer: ReturnType<typeof setTimeout> | undefined;
	let scrolling = 0;
	let pointerX = 0;
	let changed = false;
	/** When a picture was last put down: the click that follows isn't a tap on it. */
	let dropped = -Infinity;

	function down(event: PointerEvent, id: string) {
		if (!movable || mode === 'play' || frames.length < 2) return;
		if (!event.isPrimary || event.button !== 0) return;
		release();
		press = { id, x: event.clientX, y: event.clientY, touch: event.pointerType !== 'mouse' };
		pointerX = event.clientX;
		if (press.touch) timer = setTimeout(pick, rest);
		addEventListener('pointermove', move);
		addEventListener('pointerup', drop);
		addEventListener('pointercancel', drop);
	}

	function pick() {
		if (!press) return;
		dragging = press.id;
		changed = false;
		tap();
		scrolling = requestAnimationFrame(scroll);
	}

	function move(event: PointerEvent) {
		if (!press || !event.isPrimary) return;
		pointerX = event.clientX;
		if (!dragging) {
			if (Math.hypot(event.clientX - press.x, event.clientY - press.y) < slop) return;
			// A finger that moves before it has rested is scrolling the strip.
			if (press.touch) return release();
			pick();
		}
		place();
	}

	/**
	 * Gives the dragged picture the place under the pointer. Places are worked out from where the strip lays its
	 * pictures out, which stays put while they slide to their new places.
	 */
	function place() {
		const first = list?.children[0] as HTMLElement | undefined;
		const second = list?.children[1] as HTMLElement | undefined;
		if (!list || !first || !second || !dragging) return;
		const from = frames.findIndex((frame) => frame.id === dragging);
		if (from < 0) return release();
		const step = second.offsetLeft - first.offsetLeft;
		const gap = step - first.offsetWidth;
		const x = pointerX - list.getBoundingClientRect().left + list.scrollLeft;
		const slot = Math.floor((x - first.offsetLeft + gap / 2) / step);
		const to = Math.min(frames.length - 1, Math.max(0, slot));
		if (to === from) return;
		changed = true;
		onmove?.(from, to);
	}

	/** Scrolls the strip while the pointer is near one of its ends, so a picture can go further than is in view. */
	function scroll() {
		scrolling = requestAnimationFrame(scroll);
		if (!list) return;
		const { left, right } = list.getBoundingClientRect();
		const past = Math.min(0, pointerX - left - edge) + Math.max(0, pointerX - right + edge);
		if (!past) return;
		list.scrollLeft += Math.min(pace, Math.max(-pace, past / 4));
		place();
	}

	function drop() {
		if (dragging) {
			dropped = performance.now();
			if (changed) onmoved?.();
		}
		release();
	}

	function release() {
		clearTimeout(timer);
		cancelAnimationFrame(scrolling);
		press = undefined;
		dragging = undefined;
		removeEventListener('pointermove', move);
		removeEventListener('pointerup', drop);
		removeEventListener('pointercancel', drop);
	}

	// A finger dragging a picture mustn't scroll the strip too. Only a listener that isn't passive can say so.
	$effect(() => {
		const strip = list;
		if (!strip || !movable) return;
		const hold = (event: TouchEvent) => {
			if (dragging && event.cancelable) event.preventDefault();
		};
		strip.addEventListener('touchmove', hold, { passive: false });
		return () => strip.removeEventListener('touchmove', hold);
	});

	// A drag under way ends with the strip. An effect's ending, unlike `onDestroy`, never runs while prerendering.
	$effect(() => release);
</script>

<div class="flex items-center gap-2">
	<!-- A long press on a picture picks it up, so it doesn't also open the browser's menu for pictures. -->
	<ol
		bind:this={list}
		class="relative flex h-20 min-w-0 flex-1 [scrollbar-width:none] items-center gap-2 overflow-x-auto overscroll-x-contain px-1"
		aria-label={t.strip}
		oncontextmenu={(event) => movable && event.preventDefault()}
	>
		{#each frames as frame, index (frame.id)}
			<li
				class="shrink-0 {dragging === frame.id ? 'z-10' : ''}"
				animate:flip={{ duration: 200 }}
				out:scale={{ duration: 180, start: 0.4 }}
			>
				<button
					type="button"
					class="thumb relative block h-16 overflow-hidden rounded-xl bg-white/10 transition {dragging ===
					frame.id
						? 'scale-110 cursor-grabbing shadow-lg ring-4 shadow-black/50 ring-sky'
						: showing === index
							? 'ring-4 ring-sun'
							: 'hover:ring-2 hover:ring-white/40 aria-current:ring-4 aria-current:ring-coral'}"
					style:width="{width}px"
					aria-label={t.frame(index + 1)}
					aria-current={mode === 'review' && selected === index ? 'true' : undefined}
					onpointerdown={(event) => down(event, frame.id)}
					onclick={() => performance.now() - dropped > 400 && onselect(index)}
				>
					{#if frame.thumb}
						<img
							src={frame.thumb}
							alt=""
							class="size-full object-cover"
							draggable="false"
							decoding="async"
						/>
					{:else}
						<span class="block size-full animate-pulse bg-white/20"></span>
					{/if}
					{#if holds[frame.id]}
						<span
							class="absolute right-1 bottom-1 grid size-5 place-items-center rounded-full bg-night/80 text-sky"
						>
							<Icon name="snowflake" class="size-3.5" />
						</span>
					{/if}
				</button>
			</li>
		{/each}
	</ol>
	<button
		type="button"
		class={roundButton}
		aria-label={mode === 'review' ? t.removeThis : t.removeLast}
		disabled={!frames.length || mode === 'play'}
		onclick={onremove}
	>
		<Icon name="trash2" class="size-6" />
	</button>
</div>

<style>
	/* A new picture pops into the strip, a little bouncy. */
	.thumb {
		animation: arrive 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes arrive {
		from {
			transform: scale(0.3);
			opacity: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.thumb {
			animation: none;
		}
	}
</style>
