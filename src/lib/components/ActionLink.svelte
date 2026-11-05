<script lang="ts">
	import Icon, { type IconName } from './Icon.svelte';

	// A page's main action: an ink pill with its icon in a coral circle, the shutter's colour.
	let {
		href,
		label,
		icon,
		size = 'large'
	}: { href: string; label: string; icon: IconName; size?: 'large' | 'small' } = $props();
</script>

<a
	class="inline-flex items-center rounded-full bg-ink font-display font-semibold text-white shadow-xl shadow-ink/25 hover:-translate-y-0.5 motion-safe:transition-transform {size ===
	'large'
		? 'gap-3 py-2 pr-2 pl-6 text-lg'
		: 'min-h-11 gap-2 py-1.5 pr-1.5 pl-4'}"
	{href}
>
	{label}
	<span
		class="grid shrink-0 place-items-center rounded-full bg-coral text-white {size === 'large'
			? 'size-10'
			: 'size-8'}"
	>
		<Icon name={icon} class={size === 'large' ? 'size-5' : 'size-4'} />
	</span>
</a>
