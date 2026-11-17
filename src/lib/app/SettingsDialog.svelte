<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount, tick } from 'svelte';
	import { locales, messages, type Locale } from '#lib/i18n/index.ts';
	import { localizedPath } from '#lib/paths.ts';
	import { isAppleTouch, locksRotation } from '#lib/studio/rotation.ts';
	import { loadSettings, restRange, saveSettings, type Settings } from '#lib/studio/settings.ts';
	import Choice from './Choice.svelte';
	import Gate from './Gate.svelte';
	import Slider from './Slider.svelte';
	import Switch from './Switch.svelte';
	import { inkButton, modal } from './ui.ts';

	// The settings, for grown-ups: the dialog first asks a sum (Gate.svelte), so a child playing alone doesn't
	// get in. Every change is kept at once, and the studio follows the settings the next time it opens. The
	// language is here too: choosing one goes to this page in that language, with the settings still open.
	let { locale, onclose }: { locale: Locale; onclose: () => void } = $props();
	const t = $derived(messages[locale].app);

	let dialog: HTMLDialogElement;
	let heading = $state<HTMLHeadingElement>();
	let open = $state(false);
	const settings = $state(loadSettings());
	/** Whether this browser can keep the screen from turning, or it's an iPhone or iPad, which can't be asked. */
	let locks = $state(false);
	let apple = $state(false);

	const qualities = ['small', 'normal', 'high'] as const;

	async function pass() {
		open = true;
		await tick();
		heading?.focus();
	}

	function set<Key extends keyof Settings>(key: Key, value: Settings[Key]) {
		settings[key] = value;
		saveSettings($state.snapshot(settings));
	}

	function speak(language: Locale) {
		// The page stays where it is, with the focus on the language just chosen.
		void goto(localizedPath(page.url.pathname, language), { replace: true, reset: false });
	}

	onMount(() => {
		locks = locksRotation();
		apple = isAppleTouch();
		dialog.showModal();
	});
</script>

<dialog
	bind:this={dialog}
	class="{modal} max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain"
	aria-labelledby="settings-title"
	{onclose}
>
	{#if !open}
		<Gate
			t={t.gate}
			copy={t.gate.settings.copy}
			open={t.gate.settings.open}
			titleId="settings-title"
			onpass={pass}
			oncancel={() => dialog.close()}
		/>
	{:else}
		<h2 id="settings-title" bind:this={heading} class="text-3xl outline-none" tabindex="-1">
			{t.settings.title}
		</h2>
		<div class="mt-5 grid gap-5 divide-y divide-ink/10 *:pb-5">
			<Choice
				name="language"
				legend={t.settings.language}
				options={locales.map((value) => ({ value, label: messages[value].languageName }))}
				value={locale}
				onchange={speak}
			/>
			<Choice
				name="shape"
				legend={t.settings.shape.title}
				hint={t.settings.shape.hint}
				options={[
					{ value: 'auto', label: t.settings.shape.options.auto, icon: 'rotateCw' },
					{
						value: 'landscape',
						label: t.settings.shape.options.landscape,
						icon: 'rectangleHorizontal'
					},
					{ value: 'portrait', label: t.settings.shape.options.portrait, icon: 'rectangleVertical' }
				]}
				value={settings.shape}
				onchange={(shape) => set('shape', shape)}
			/>
			<Switch
				title={t.settings.advanced.title}
				hint={t.settings.advanced.hint}
				checked={settings.advanced}
				onchange={(advanced) => set('advanced', advanced)}
			/>
			{#if locks}
				<Switch
					title={t.settings.lock.title}
					hint={t.settings.lock.hint}
					checked={settings.lock}
					onchange={(lock) => set('lock', lock)}
				/>
			{:else if apple}
				<div>
					<h3 class="text-xl">{t.settings.lock.title}</h3>
					<p class="mt-1 text-sm text-muted">{t.settings.lock.apple}</p>
				</div>
			{/if}
			<Slider
				name="rest"
				title={t.settings.rest.title}
				hint={t.settings.rest.hint}
				shown={t.seconds(settings.rest)}
				range={restRange}
				value={settings.rest}
				onchange={(rest) => set('rest', rest)}
			/>
			<Switch
				title={t.settings.sounds.title}
				hint={t.settings.sounds.hint}
				checked={settings.sounds}
				onchange={(sounds) => set('sounds', sounds)}
			/>
			<Switch
				title={t.settings.guard.title}
				hint={t.settings.guard.hint}
				checked={settings.guard}
				onchange={(guard) => set('guard', guard)}
			/>
			<Switch
				title={t.settings.guardVideo.title}
				hint={t.settings.guardVideo.hint}
				checked={settings.guardVideo}
				onchange={(guardVideo) => set('guardVideo', guardVideo)}
			/>
			<Choice
				name="pictures"
				legend={t.settings.pictures.title}
				hint={t.settings.pictures.hint}
				options={qualities.map((value) => ({ value, label: t.settings.pictures.options[value] }))}
				value={settings.pictures}
				onchange={(pictures) => set('pictures', pictures)}
			/>
			<Choice
				name="video"
				legend={t.settings.video.title}
				hint={t.settings.video.hint}
				options={qualities.map((value) => ({ value, label: t.settings.video.options[value] }))}
				value={settings.video}
				onchange={(video) => set('video', video)}
			/>
		</div>
		<div class="flex justify-end">
			<button type="button" class={inkButton} onclick={() => dialog.close()}
				>{t.settings.done}</button
			>
		</div>
	{/if}
</dialog>
