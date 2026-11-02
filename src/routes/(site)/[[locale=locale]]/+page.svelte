<script lang="ts">
	import ActionLink from '#lib/components/ActionLink.svelte';
	import Bubble from '#lib/components/Bubble.svelte';
	import Faq from '#lib/components/Faq.svelte';
	import HeroDemo from '#lib/components/HeroDemo.svelte';
	import Icon, { type IconName } from '#lib/components/Icon.svelte';
	import IconTile from '#lib/components/IconTile.svelte';
	import { messages } from '#lib/i18n/index.ts';
	import { appPath } from '#lib/paths.ts';
	import { bubbleBoardUrl, contactEmail, repositoryUrl } from '#lib/project.ts';
	import type { PageProps } from './$types';

	type Item = { title: string; copy: string };
	type Tone = 'sky' | 'mint' | 'sun' | 'pink' | 'coral' | 'brand';

	let { data }: PageProps = $props();
	const t = $derived(messages[data.locale]);
	const app = $derived(appPath(data.locale));
	const writeToUs = $derived(
		`mailto:${contactEmail}?subject=${encodeURIComponent(t.openSource.subject)}`
	);
	const features: { icon: IconName; tone: Tone; key: keyof typeof t.features }[] = [
		{ icon: 'ghost', tone: 'brand', key: 'ghost' },
		{ icon: 'zap', tone: 'sun', key: 'fast' },
		{ icon: 'wifiOff', tone: 'sky', key: 'offline' },
		{ icon: 'share', tone: 'mint', key: 'video' },
		{ icon: 'lock', tone: 'pink', key: 'private' },
		{ icon: 'heart', tone: 'coral', key: 'free' }
	];
	const stepIcons: IconName[] = ['sparkles', 'hand', 'play'];
	/** Each idea's card takes one of the logo's colours. */
	const ideaColours = ['bg-sky/20', 'bg-sun/30', 'bg-mint/25', 'bg-pink/20'];
</script>

<svelte:head>
	<title>BubbleCam · {t.title}</title>
	<meta name="description" content={t.description} />
	<meta property="og:title" content="BubbleCam · {t.title}" />
	<meta property="og:description" content={t.description} />
</svelte:head>

{#snippet intro(id: string, title: string, copy: string)}
	<h2 id="{id}-title" class="mb-4 max-w-2xl text-4xl text-balance sm:text-5xl">{title}</h2>
	<p class="max-w-xl text-lg text-muted">{copy}</p>
{/snippet}

<div class="flex flex-col gap-20 pb-20 lg:gap-28 lg:pb-28">
	<section
		class="grid items-center gap-12 pt-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:pt-14"
		aria-labelledby="hero-title"
	>
		<div>
			<h1 id="hero-title" class="mb-6 text-[2.6rem] leading-[1.02] sm:text-6xl xl:text-7xl">
				{t.hero.heading}
				<span class="block text-brand">{t.hero.headingAccent}</span>
			</h1>
			<p class="max-w-lg text-lg text-muted">{t.hero.copy}</p>
			<div class="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
				<ActionLink href={app} label={t.hero.open} icon="camera" />
				<a
					class="flex min-h-11 items-center gap-2 font-semibold text-muted hover:text-ink"
					href="#how"
				>
					{t.hero.how}<Icon name="arrowDown" class="size-4 shrink-0" />
				</a>
			</div>
			<p class="mt-6 flex items-center gap-2 text-sm text-muted">
				<Icon name="heart" class="size-4 shrink-0 fill-pink text-pink" />{t.hero.quiet}
			</p>
		</div>
		<div class="relative">
			<HeroDemo label={t.hero.demo} />
			<!-- The logo's big, medium, and small bubbles, drifting off the tablet. -->
			<Bubble class="-top-16 right-0 size-20 sm:-top-12 sm:-right-6 sm:size-32" />
			<Bubble class="-top-10 right-24 size-10 sm:right-36 sm:size-14" />
			<Bubble class="-bottom-6 -left-3 size-12 sm:-left-8 sm:size-16" />
		</div>
	</section>

	<section
		id="how"
		class="relative isolate overflow-hidden rounded-4xl glass bg-linear-135 from-sky/15 via-accent/10 to-pink/15 p-7 sm:p-12"
		aria-labelledby="how-title"
	>
		<Bubble class="-right-16 -bottom-20 -z-10 size-56 sm:size-72" />
		{@render intro('how', t.how.title, t.how.copy)}
		<ol class="mt-10 grid gap-4 md:grid-cols-3">
			{#each t.how.steps as { title, copy }, i (title)}
				<li class="rounded-3xl bg-white/70 p-6 ring-1 ring-white">
					<div class="flex items-center gap-4">
						<span class="font-display text-5xl leading-none font-semibold text-accent">{i + 1}</span
						>
						<IconTile icon={stepIcons[i]} tone={i === 1 ? 'coral' : 'brand'} />
					</div>
					<h3 class="mt-5 text-xl">{title}</h3>
					<p class="mt-1 text-muted">{copy}</p>
				</li>
			{/each}
		</ol>
	</section>

	<section id="features" aria-labelledby="features-title">
		{@render intro('features', t.features.title, t.features.copy)}
		<ul class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each features as { icon, tone, key } (key)}
				{@const item = t.features[key] as Item}
				<li class="rounded-3xl glass p-6">
					<IconTile {icon} {tone} />
					<h3 class="mt-5 text-xl">{item.title}</h3>
					<p class="mt-1 text-muted">{item.copy}</p>
				</li>
			{/each}
		</ul>
	</section>

	<section
		id="workshop"
		class="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16"
		aria-labelledby="workshop-title"
	>
		<div>
			{@render intro('workshop', t.workshop.title, t.workshop.copy)}
			<h3 class="mt-10 text-2xl">{t.workshop.tipsTitle}</h3>
			<ul class="mt-5 grid gap-3.5">
				{#each t.workshop.tips as tip (tip)}
					<li class="flex gap-3 font-semibold">
						<Icon name="check" class="mt-0.5 size-5 shrink-0 text-accent" />{tip}
					</li>
				{/each}
			</ul>
		</div>
		<div class="rounded-4xl glass p-6 sm:p-8">
			<h3 class="flex items-center gap-3 text-2xl">
				<IconTile icon="lightbulb" tone="sun" />{t.workshop.ideasTitle}
			</h3>
			<ul class="mt-6 grid gap-3 sm:grid-cols-2">
				{#each t.workshop.ideas as { title, copy }, i (title)}
					<li class="rounded-3xl p-5 {ideaColours[i]}">
						<h4 class="font-display text-lg font-semibold">{title}</h4>
						<p class="mt-1 text-muted">{copy}</p>
					</li>
				{/each}
			</ul>
		</div>
	</section>

	<Faq locale={data.locale} />

	<section
		id="open"
		class="relative isolate overflow-hidden rounded-4xl glass bg-linear-135 from-sun/20 via-pink/10 to-sky/20 px-6 py-12 text-center sm:px-12 sm:py-16"
		aria-labelledby="open-title"
	>
		<!-- Behind the text but above the section's own background, which is what `isolate` is for. -->
		<Bubble class="-top-20 -right-20 -z-10 size-48 sm:-top-24 sm:-right-16 sm:size-80" />
		<Bubble class="-bottom-10 -left-8 -z-10 size-24 sm:size-32" />
		<h2 id="open-title" class="mx-auto mb-4 max-w-2xl text-4xl text-balance sm:text-5xl">
			{t.openSource.title}
		</h2>
		<p class="mx-auto max-w-2xl text-lg text-muted">{t.openSource.copy}</p>
		<div class="mt-9 flex flex-wrap items-center justify-center gap-3">
			<ActionLink href={app} label={t.hero.open} icon="camera" />
			<a
				class="inline-flex min-h-13 items-center gap-2 rounded-full glass px-6 font-semibold hover:bg-white/80"
				href={repositoryUrl}><Icon name="github" />{t.openSource.code}</a
			>
			<a
				class="inline-flex min-h-13 items-center gap-2 rounded-full glass px-6 font-semibold hover:bg-white/80"
				href={writeToUs}><Icon name="mail" />{t.openSource.write}</a
			>
		</div>
		<p class="mt-8">
			<a
				class="inline-flex min-h-11 items-center gap-2 font-semibold underline-offset-4 hover:underline"
				href={bubbleBoardUrl}
				>{t.openSource.bubbleBoard}<Icon name="arrowRight" class="size-4 shrink-0 text-accent" /></a
			>
		</p>
	</section>
</div>
