<script lang="ts" generics="Value extends string">
	import Icon, { type IconName } from '#lib/components/Icon.svelte';

	// One choice of a few, for the settings: radio buttons in a row, the chosen one filled in.
	let {
		name,
		legend,
		hint,
		options,
		value,
		onchange
	}: {
		name: string;
		legend: string;
		hint?: string;
		options: { value: Value; label: string; icon?: IconName }[];
		value: Value;
		onchange: (value: Value) => void;
	} = $props();
</script>

<fieldset class="min-w-0" aria-describedby={hint ? `${name}-hint` : undefined}>
	<legend class="font-display text-xl font-semibold">{legend}</legend>
	<div class="mt-2 grid auto-cols-fr grid-flow-col gap-1 rounded-3xl bg-ink/5 p-1">
		{#each options as option (option.value)}
			<label class="relative">
				<input
					type="radio"
					class="peer absolute inset-0 size-full cursor-pointer opacity-0"
					{name}
					value={option.value}
					checked={value === option.value}
					onchange={() => onchange(option.value)}
				/>
				<!-- Forced colours drop the dark fill, so the chosen one is underlined there instead. -->
				<span
					class="grid h-full min-h-12 place-items-center content-center gap-1 rounded-[1.25rem] px-2 py-2 text-center text-sm leading-tight font-bold text-muted transition-colors peer-checked:bg-ink peer-checked:text-white peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent forced-colors:peer-checked:underline"
				>
					{#if option.icon}<Icon name={option.icon} class="size-6" />{/if}
					{option.label}
				</span>
			</label>
		{/each}
	</div>
	{#if hint}<p id="{name}-hint" class="mt-2 text-sm text-muted">{hint}</p>{/if}
</fieldset>
