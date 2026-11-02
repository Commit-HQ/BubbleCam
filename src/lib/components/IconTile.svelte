<script lang="ts">
	import Icon, { type IconName } from './Icon.svelte';

	// An icon on a rounded tile: the brand gradient, or one of the logo's colours for a row of different things.
	let {
		icon,
		tone = 'brand'
	}: { icon: IconName; tone?: 'brand' | 'ink' | 'sky' | 'mint' | 'sun' | 'pink' | 'coral' } =
		$props();
	const tones = {
		brand: 'bg-brand text-white',
		ink: 'bg-ink text-white',
		sky: 'bg-sky/20 text-sky-800',
		mint: 'bg-mint/25 text-emerald-800',
		sun: 'bg-sun/30 text-amber-800',
		pink: 'bg-pink/20 text-pink-800',
		coral: 'bg-coral/15 text-red-700'
	};
</script>

<span class="grid size-12 shrink-0 place-items-center rounded-2xl {tones[tone]}">
	<Icon name={icon} class="size-6" />
</span>
