<script lang="ts">
	// Something a grown-up turns on or off in the settings: its name, what it does, and a switch.
	let {
		title,
		hint,
		checked,
		onchange
	}: { title: string; hint: string; checked: boolean; onchange: (checked: boolean) => void } =
		$props();
</script>

<label class="flex cursor-pointer items-start gap-4">
	<span class="grow">
		<span class="block font-display text-xl font-semibold">{title}</span>
		<span class="mt-1 block text-sm text-muted">{hint}</span>
	</span>
	<input
		type="checkbox"
		role="switch"
		class="peer sr-only"
		{checked}
		onchange={(event) => onchange(event.currentTarget.checked)}
	/>
	<span
		class="relative mt-0.5 h-8 w-14 shrink-0 rounded-full bg-ink/50 transition-colors peer-checked:bg-accent peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent after:absolute after:top-1 after:left-1 after:size-6 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-6 motion-reduce:after:transition-none forced-colors:border forced-colors:peer-checked:after:bg-[Highlight]"
		aria-hidden="true"
	></span>
</label>
