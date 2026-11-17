<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import type { Messages } from '#lib/i18n/index.ts';
	import { newSum, solves } from './gate.ts';
	import { inkButton, softButton } from './ui.ts';

	// The sum a grown-up answers before the settings open, or before a cartoon is deleted where that's guarded:
	// a product from the times table, and a new one after each wrong answer (gate.ts). It's the first thing a
	// dialog shows, so the dialog names itself by this heading.
	let {
		t,
		copy,
		open,
		titleId,
		onpass,
		oncancel
	}: {
		t: Messages['app']['gate'];
		/** What the sum guards, and the button that goes on to it. */
		copy: string;
		open: string;
		/** The ID of the heading, which the dialog is labelled by. */
		titleId: string;
		onpass: () => void;
		oncancel: () => void;
	} = $props();

	let answer = $state<HTMLInputElement>();
	let sum = $state(newSum());
	let typed = $state('');
	let wrong = $state(false);

	function solve(event: SubmitEvent) {
		event.preventDefault();
		if (solves(sum, typed)) return onpass();
		wrong = true;
		sum = newSum(sum);
		typed = '';
		answer?.focus();
	}
</script>

<form novalidate onsubmit={solve}>
	<span class="mb-4 grid size-14 place-items-center rounded-2xl bg-brand text-white">
		<Icon name="lock" class="size-7" />
	</span>
	<h2 id={titleId} class="text-3xl">{t.title}</h2>
	<p class="mt-2 text-muted">{copy}</p>
	<label class="mt-6 flex items-center justify-center gap-3 font-display text-4xl font-bold">
		<span aria-hidden="true">{sum.a} × {sum.b} =</span>
		<span class="sr-only">{t.question(sum.a, sum.b)}</span>
		<input
			bind:this={answer}
			bind:value={typed}
			class="w-24 rounded-2xl bg-ink/5 px-2 py-1.5 text-center ring-2 ring-ink/40 outline-none focus:ring-4 focus:ring-accent"
			inputmode="numeric"
			pattern="[0-9]*"
			maxlength="3"
			autocomplete="off"
			enterkeyhint="go"
		/>
	</label>
	<p class="mt-3 min-h-6 text-center font-semibold text-red-800" aria-live="polite">
		{wrong ? t.wrong : ''}
	</p>
	<div class="mt-4 flex flex-wrap justify-end gap-3">
		<button type="button" class={softButton} onclick={oncancel}>{t.cancel}</button>
		<button type="submit" class={inkButton}>{open}</button>
	</div>
</form>
