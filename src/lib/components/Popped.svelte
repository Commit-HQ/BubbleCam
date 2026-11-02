<script lang="ts">
	import poppedBubble from '#lib/assets/bubble-popped.svg';
	import { messages, type Locale } from '#lib/i18n/index.ts';

	// An address no page has, or an error no page handles: a popped bubble and a way back.
	let {
		locale,
		missing,
		back,
		label
	}: { locale: Locale; missing: boolean; back: string; label: string } = $props();
	const t = $derived(messages[locale].error);
</script>

<section class="grid justify-items-center rounded-4xl glass px-6 py-10 text-center sm:p-12">
	<img src={poppedBubble} alt="" width="200" height="200" class="size-40 sm:size-48" />
	<h1 class="mt-4 text-4xl sm:text-5xl">{missing ? t.missingTitle : t.title}</h1>
	<p class="mt-3 max-w-md text-lg text-muted">{missing ? t.missingCopy : t.copy}</p>
	<a
		class="mt-8 inline-flex min-h-12 items-center rounded-full bg-ink px-6 font-display text-lg font-semibold text-white shadow-lg shadow-ink/20"
		href={back}>{label}</a
	>
</section>
