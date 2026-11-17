<script lang="ts">
	// An amount a grown-up sets in the settings: its name, the amount in words, a slider, and what it does.
	let {
		name,
		title,
		hint,
		shown,
		range,
		value,
		onchange
	}: {
		name: string;
		title: string;
		hint: string;
		/** The amount as it's read, such as "0.8 s". */
		shown: string;
		range: { min: number; max: number; step: number };
		value: number;
		onchange: (value: number) => void;
	} = $props();
</script>

<div>
	<div class="flex items-baseline justify-between gap-3">
		<label for={name} class="font-display text-xl font-semibold">{title}</label>
		<output for={name} class="font-display text-lg font-semibold whitespace-nowrap tabular-nums"
			>{shown}</output
		>
	</div>
	<input
		id={name}
		type="range"
		class="mt-1 h-10 w-full cursor-pointer accent-accent"
		min={range.min}
		max={range.max}
		step={range.step}
		{value}
		aria-valuetext={shown}
		aria-describedby="{name}-hint"
		oninput={(event) => onchange(event.currentTarget.valueAsNumber)}
	/>
	<p id="{name}-hint" class="text-sm text-muted">{hint}</p>
</div>
