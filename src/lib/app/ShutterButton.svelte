<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';

	// The big red button. While a picture is being looked at or the film plays, it takes the child back to the
	// camera instead, and shows a camera.
	let {
		label,
		live,
		disabled = false,
		onclick
	}: { label: string; live: boolean; disabled?: boolean; onclick: () => void } = $props();
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
	{#if live}
		<span
			class="relative size-[4.6rem] rounded-full bg-coral shadow-[inset_0_-6px_10px_rgb(0_0_0/0.18)] transition group-hover:brightness-110"
		>
			<span class="absolute top-3 left-4 size-4 rounded-full bg-white/45"></span>
		</span>
	{:else}
		<span class="grid size-[4.6rem] place-items-center rounded-full bg-white text-night">
			<Icon name="camera" class="size-9" />
		</span>
	{/if}
</button>
