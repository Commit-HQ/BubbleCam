<script lang="ts">
	import { onMount, tick, type Snippet } from 'svelte';
	import type { Messages } from '#lib/i18n/index.ts';
	import Gate from './Gate.svelte';
	import { dangerButton, modal, softButton } from './ui.ts';

	// A question before something that can't be undone, in the browser's own modal dialog. Where a grown-up
	// guards deleting, the dialog first asks the sum the settings ask (Gate.svelte), and the question follows.
	let {
		title,
		copy,
		confirm,
		cancel,
		gate,
		onconfirm,
		onclose,
		children
	}: {
		title: string;
		copy: string;
		confirm: string;
		cancel: string;
		/** The sum's words, when the question is guarded. */
		gate?: Messages['app']['gate'];
		onconfirm: () => void;
		onclose: () => void;
		children?: Snippet;
	} = $props();

	let dialog: HTMLDialogElement;
	let keep = $state<HTMLButtonElement>();
	// svelte-ignore state_referenced_locally: a dialog is guarded or not for as long as it's open.
	let passed = $state(!gate);

	async function pass() {
		passed = true;
		await tick();
		keep?.focus();
	}

	onMount(() => dialog.showModal());
</script>

<dialog bind:this={dialog} class={modal} aria-labelledby="confirm-title" {onclose}>
	{#if gate && !passed}
		<Gate
			t={gate}
			copy={gate.remove.copy}
			open={gate.remove.open}
			titleId="confirm-title"
			onpass={pass}
			oncancel={() => dialog.close()}
		/>
	{:else}
		{@render children?.()}
		<h2 id="confirm-title" class="text-3xl">{title}</h2>
		<p class="mt-2 text-muted">{copy}</p>
		<div class="mt-7 flex flex-wrap justify-end gap-3">
			<button bind:this={keep} type="button" class={softButton} onclick={() => dialog.close()}
				>{cancel}</button
			>
			<button
				type="button"
				class={dangerButton}
				onclick={() => {
					onconfirm();
					dialog.close();
				}}>{confirm}</button
			>
		</div>
	{/if}
</dialog>
