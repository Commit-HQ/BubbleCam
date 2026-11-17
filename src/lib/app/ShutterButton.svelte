<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';

	// The big red button. While a picture is being looked at or the film plays, it takes the child back to the
	// camera instead, and shows a camera. After each picture the red shrinks and grows back, for as long as the
	// shutter rests, so a child sees when it's ready for the next one. While the self-timer counts down, the red
	// is a square, as on a recorder that's running, and a press stops the countdown.
	let {
		label,
		live,
		counting = false,
		shots,
		rest,
		disabled = false,
		onclick
	}: {
		label: string;
		live: boolean;
		/** Whether the self-timer is counting down to a picture. */
		counting?: boolean;
		/** How many pictures have been taken since the studio opened. */
		shots: number;
		/** How long the shutter rests after a picture, in milliseconds. */
		rest: number;
		disabled?: boolean;
		onclick: () => void;
	} = $props();

	/** Whether the shutter is resting from a picture just taken. */
	let resting = $state(false);
	$effect(() => {
		if (!shots || !rest) return;
		resting = true;
		const timer = setTimeout(() => (resting = false), rest);
		return () => clearTimeout(timer);
	});
</script>

<button
	type="button"
	class="group relative grid size-24 shrink-0 place-items-center rounded-full transition active:scale-90 disabled:pointer-events-none disabled:opacity-40 motion-reduce:active:scale-100"
	aria-label={label}
	{disabled}
	{onclick}
>
	<span class="absolute inset-0 rounded-full border-[6px] border-white shadow-lg shadow-black/30"
	></span>
	{#if live && counting}
		<span class="relative size-10 rounded-xl bg-coral shadow-[inset_0_-4px_8px_rgb(0_0_0/0.18)]"
		></span>
	{:else if live}
		{#key shots}
			<span
				class="relative size-[4.6rem] rounded-full bg-coral shadow-[inset_0_-6px_10px_rgb(0_0_0/0.18)] transition group-hover:brightness-110 {resting
					? 'rest'
					: ''}"
				style:animation-duration={resting ? `${rest}ms` : undefined}
			>
				<span class="absolute top-3 left-4 size-4 rounded-full bg-white/45"></span>
			</span>
		{/key}
	{:else}
		<span class="grid size-[4.6rem] place-items-center rounded-full bg-white text-night">
			<Icon name="camera" class="size-9" />
		</span>
	{/if}
</button>

<style>
	/* The shutter resting after a picture: the red is small and pale, and grows back as it gets ready. */
	.rest {
		animation-name: rest;
		animation-timing-function: cubic-bezier(0.5, 0, 0.75, 0);
	}
	@keyframes rest {
		from {
			transform: scale(0.45);
			opacity: 0.45;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		@keyframes rest {
			from {
				opacity: 0.45;
			}
		}
	}
</style>
