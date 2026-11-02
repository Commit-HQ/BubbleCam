<script lang="ts">
	import Icon from './Icon.svelte';
	import { messages, type Locale } from '#lib/i18n/index.ts';

	// The frequently asked questions: plain details elements, one open at a time, so they work without
	// JavaScript.
	let { locale }: { locale: Locale } = $props();
	const t = $derived(messages[locale].faq);
</script>

<section
	id="faq"
	class="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16"
	aria-labelledby="faq-title"
>
	<div class="lg:sticky lg:top-24 lg:self-start">
		<h2 id="faq-title" class="mb-4 max-w-2xl text-4xl text-balance sm:text-5xl">{t.title}</h2>
		<p class="max-w-md text-lg text-muted">{t.copy}</p>
	</div>
	<div class="divide-y divide-ink/10 rounded-4xl glass px-6 py-2 sm:px-8">
		{#each t.items as { q, a } (q)}
			<!-- One open question at a time: details sharing a name close each other. -->
			<details class="group py-4" name="faq">
				<summary
					class="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold [&::-webkit-details-marker]:hidden"
				>
					{q}
					<Icon
						name="plus"
						class="size-5 shrink-0 text-accent transition-transform group-open:rotate-45"
					/>
				</summary>
				<p class="mt-2 max-w-prose text-muted">{a}</p>
			</details>
		{/each}
	</div>
</section>

<style>
	/* A question opens and closes smoothly: the browser animates the answer's height from 0 to its natural
	   size and fades it in. Browsers without ::details-content simply open at once. */
	details {
		interpolate-size: allow-keywords;
	}
	details::details-content {
		height: 0;
		overflow: clip;
		opacity: 0;
		transition:
			height 0.3s ease,
			opacity 0.3s ease,
			content-visibility 0.3s allow-discrete;
	}
	details[open]::details-content {
		height: auto;
		opacity: 1;
	}
	@media (prefers-reduced-motion: reduce) {
		details::details-content {
			transition: none;
		}
	}
</style>
