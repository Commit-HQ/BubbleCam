<script lang="ts">
	import { page } from '$app/state';
	import favicon from '#lib/assets/favicon.svg';
	import BuildLabel from '#lib/components/BuildLabel.svelte';
	import Icon, { type IconName } from '#lib/components/Icon.svelte';
	import LanguageSwitch from '#lib/components/LanguageSwitch.svelte';
	import SiteHeader from '#lib/components/SiteHeader.svelte';
	import ActionLink from '#lib/components/ActionLink.svelte';
	import { defaultLocale, locales, messages } from '#lib/i18n/index.ts';
	import { appPath, localizedPath, privacyPath } from '#lib/paths.ts';
	import {
		aboutUrl,
		absoluteUrl,
		bubbleBoardUrl,
		contactEmail,
		organizationUrl,
		repositoryUrl
	} from '#lib/project.ts';
	import shareImage from '#lib/assets/share.jpg';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();
	const t = $derived(messages[data.locale]);
	// The privacy page and the 404 pages. BubbleCam's landing page is on Commit's site (aboutUrl), and the site's
	// home opens the app (static/_redirects), so the logo leads into the app.
	const app = $derived(appPath(data.locale));
	const project: { href: string; label: string; icon: IconName }[] = $derived([
		{ href: repositoryUrl, label: t.footer.github, icon: 'github' },
		{ href: `${repositoryUrl}/blob/main/LICENSE`, label: t.footer.license, icon: 'file' },
		// Font, icon, and library licenses, served with the site.
		{ href: '/third-party-notices.txt', label: t.footer.credits, icon: 'heart' }
	]);
</script>

<svelte:head>
	<meta name="theme-color" content="#fffaf3" />
	<!-- Every page in each language, for search engines. -->
	<link rel="canonical" href={absoluteUrl(page.url.pathname)} />
	{#each locales as locale (locale)}
		<link
			rel="alternate"
			hreflang={locale}
			href={absoluteUrl(localizedPath(page.url.pathname, locale))}
		/>
	{/each}
	<link
		rel="alternate"
		hreflang="x-default"
		href={absoluteUrl(localizedPath(page.url.pathname, defaultLocale))}
	/>

	<!-- Link previews in messaging apps and social networks. Each page adds its own title and description. -->
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="BubbleCam" />
	<meta property="og:url" content={absoluteUrl(page.url.pathname)} />
	<meta property="og:locale" content={t.ogLocale} />
	{#each locales.filter((locale) => locale !== data.locale) as locale (locale)}
		<meta property="og:locale:alternate" content={messages[locale].ogLocale} />
	{/each}
	<meta property="og:image" content={absoluteUrl(shareImage)} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="BubbleCam · {t.title}" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<a
	class="fixed top-4 left-4 z-20 -translate-y-24 rounded-full bg-ink px-4 py-3 text-white focus:translate-y-0"
	href="#main">{t.skip}</a
>

<!-- Decorative bubbles are clipped rather than scrolling the page sideways when enlarged text leaves no room.
`clip`, unlike `hidden`, keeps the header sticky. -->
<div class="mx-auto max-w-7xl overflow-x-clip px-4 sm:px-8 lg:px-10">
	<SiteHeader href={app} label={t.home}>
		<div class="flex items-center gap-2">
			<LanguageSwitch locale={data.locale} />
			<div class="hidden sm:block">
				<ActionLink href={app} label={t.nav.open} icon="camera" size="small" />
			</div>
		</div>
	</SiteHeader>

	<main id="main">
		{@render children()}
	</main>

	<footer class="mb-4 rounded-4xl glass p-7 sm:p-10">
		<div class="grid gap-x-6 gap-y-8 md:grid-cols-[1.4fr_1fr] md:gap-x-10">
			<div>
				<p
					class="inline-flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight"
				>
					<img src={favicon} alt="" width="32" height="32" />BubbleCam
				</p>
				<a class="mt-3 block text-muted hover:text-ink" href={aboutUrl(data.locale)}
					>{t.footer.tagline}</a
				>
				<a
					class="mt-2 inline-flex min-h-11 items-center gap-2 text-muted hover:text-ink"
					href="mailto:{contactEmail}"
				>
					<Icon name="mail" class="size-4" />{contactEmail}
				</a>
			</div>
			<div>
				<h2 class="text-lg">{t.footer.project}</h2>
				<ul class="mt-3 grid gap-1 text-muted">
					{#each project as { href, label, icon } (href)}
						<li>
							<a class="inline-flex min-h-10 items-center gap-2 hover:text-ink" {href}>
								<Icon name={icon} class="size-4" />{label}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</div>
		<div
			class="mt-10 flex flex-wrap justify-between gap-x-6 gap-y-2 border-t border-ink/10 pt-6 text-sm text-muted"
		>
			<p class="flex items-center gap-1.5">
				<Icon name="heart" class="size-4 shrink-0 fill-pink text-pink" />
				<span>
					{t.footer.madeBy}
					<a class="font-semibold text-ink hover:underline" href={organizationUrl}>Commit</a>
					·
					<a class="hover:text-ink hover:underline" href={bubbleBoardUrl}>BubbleBoard</a>
				</span>
			</p>
			<div class="flex flex-wrap gap-x-6 gap-y-2">
				<a class="hover:text-ink" href={privacyPath(data.locale)}>{t.footer.privacy}</a>
				<BuildLabel locale={data.locale} />
			</div>
		</div>
	</footer>
</div>
