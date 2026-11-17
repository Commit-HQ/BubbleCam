<script lang="ts">
	import { onMount } from 'svelte';
	import type { Messages } from '#lib/i18n/index.ts';
	import Gate from './Gate.svelte';
	import { modal } from './ui.ts';

	// The sum by itself, before something a grown-up guards that has no question of its own to ask, such as
	// making a video. A right answer goes on; anything else that closes the dialog doesn't.
	let {
		t,
		copy,
		open,
		onpass,
		onclose
	}: {
		t: Messages['app']['gate'];
		/** What the sum guards, and the button that goes on to it. */
		copy: string;
		open: string;
		onpass: () => void;
		onclose: () => void;
	} = $props();

	let dialog: HTMLDialogElement;
	onMount(() => dialog.showModal());
</script>

<dialog bind:this={dialog} class={modal} aria-labelledby="gate-title" {onclose}>
	<Gate {t} {copy} {open} titleId="gate-title" {onpass} oncancel={() => dialog.close()} />
</dialog>
