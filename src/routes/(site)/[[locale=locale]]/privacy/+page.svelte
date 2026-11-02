<script lang="ts">
	import IconTile from '#lib/components/IconTile.svelte';
	import type { IconName } from '#lib/components/Icon.svelte';
	import { messages } from '#lib/i18n/index.ts';
	import { contactEmail } from '#lib/project.ts';
	import type { PageProps } from './$types';

	// What BubbleCam keeps and where, as the code does it. Keep it in step with any change that alters that.
	let { data }: PageProps = $props();
	const t = $derived(messages[data.locale].privacyPolicy);
	const icons: IconName[] = ['image', 'camera', 'shieldCheck', 'globe', 'trash2'];
</script>

<svelte:head>
	<title>BubbleCam · {t.title}</title>
	<meta name="description" content={t.intro} />
	<meta property="og:title" content="BubbleCam · {t.title}" />
	<meta property="og:description" content={t.intro} />
</svelte:head>

<div class="mx-auto max-w-3xl pt-8 pb-20 lg:pt-14 lg:pb-28">
	<h1 class="mb-5 text-5xl sm:text-6xl">{t.title}</h1>
	<p class="text-xl text-muted">{t.intro}</p>
	<ul class="mt-10 grid gap-4">
		{#each t.sections as { title, copy }, i (title)}
			<li class="flex gap-5 rounded-3xl glass p-6 sm:p-7">
				<IconTile icon={icons[i]} />
				<div>
					<h2 class="text-2xl">{title}</h2>
					<p class="mt-2 text-muted">{copy}</p>
				</div>
			</li>
		{/each}
	</ul>
	<p class="mt-10 text-lg">
		{t.contact}
		<a class="font-semibold underline underline-offset-4" href="mailto:{contactEmail}"
			>{contactEmail}</a
		>.
	</p>
</div>
