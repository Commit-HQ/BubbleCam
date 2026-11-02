<script lang="ts">
	import { flip } from 'svelte/animate';
	import { scale } from 'svelte/transition';
	import Icon from '#lib/components/Icon.svelte';
	import type { Messages } from '#lib/i18n/index.ts';
	import type { Frame, Mode } from '#lib/studio/studio.svelte.ts';
	import { roundButton } from './ui.ts';

	// The film's pictures in a row, newest last, as on a strip of film. A tap shows a picture big; the bin deletes
	// it, or the last one taken. New pictures pop in at the end, which scrolls into view, and deleted ones shrink
	// away while the rest close the gap.
	let {
		frames,
		mode,
		selected,
		showing,
		shape,
		t,
		onselect,
		onremove
	}: {
		frames: Frame[];
		mode: Mode;
		selected: number;
		showing: number;
		shape: { width: number; height: number } | undefined;
		t: Messages['app']['studio'];
		onselect: (index: number) => void;
		onremove: () => void;
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
</script>

<div class="flex items-center gap-2">
	<ol
		bind:this={list}
		class="flex h-20 min-w-0 flex-1 [scrollbar-width:none] items-center gap-2 overflow-x-auto overscroll-x-contain px-1"
		aria-label={t.strip}
	>
		{#each frames as frame, index (frame.id)}
			<li
				class="shrink-0"
				animate:flip={{ duration: 200 }}
				out:scale={{ duration: 180, start: 0.4 }}
			>
				<button
					type="button"
					class="thumb relative block h-16 overflow-hidden rounded-xl bg-white/10 transition {showing ===
					index
						? 'ring-4 ring-sun'
						: 'hover:ring-2 hover:ring-white/40 aria-current:ring-4 aria-current:ring-coral'}"
					style:width="{width}px"
					aria-label={t.frame(index + 1)}
					aria-current={mode === 'review' && selected === index ? 'true' : undefined}
					onclick={() => onselect(index)}
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
