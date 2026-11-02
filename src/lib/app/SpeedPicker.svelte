<script lang="ts">
	import Icon, { type IconName } from '#lib/components/Icon.svelte';
	import type { Messages } from '#lib/i18n/index.ts';
	import type { Speed } from '#lib/studio/studio.svelte.ts';

	// How fast the film plays: a turtle, footsteps, or a rabbit, which children read without words.
	let {
		speed,
		t,
		onchange
	}: { speed: Speed; t: Messages['app']['studio']; onchange: (speed: Speed) => void } = $props();
	const options: { speed: Speed; icon: IconName }[] = [
		{ speed: 'slow', icon: 'turtle' },
		{ speed: 'walk', icon: 'footprints' },
		{ speed: 'fast', icon: 'rabbit' }
	];
</script>

<div
	class="flex gap-1 rounded-full bg-night/70 p-1.5 ring-1 ring-white/15 backdrop-blur-md"
	role="group"
	aria-label={t.speed}
>
	{#each options as option (option.speed)}
		<button
			type="button"
			class="grid size-14 place-items-center rounded-full text-white transition hover:bg-white/15 aria-pressed:bg-sun aria-pressed:text-night"
			aria-label={t.speeds[option.speed]}
			aria-pressed={speed === option.speed}
			onclick={() => onchange(option.speed)}
		>
			<Icon name={option.icon} class="size-7" />
		</button>
	{/each}
</div>
