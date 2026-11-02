<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { dangerButton, modal, softButton } from './ui.ts';

	// A question before something that can't be undone, in the browser's own modal dialog.
	let {
		title,
		copy,
		confirm,
		cancel,
		onconfirm,
		onclose,
		children
	}: {
		title: string;
		copy: string;
		confirm: string;
		cancel: string;
		onconfirm: () => void;
		onclose: () => void;
		children?: Snippet;
	} = $props();

	let dialog: HTMLDialogElement;
	onMount(() => dialog.showModal());
</script>

<dialog bind:this={dialog} class={modal} aria-labelledby="confirm-title" {onclose}>
	{@render children?.()}
	<h2 id="confirm-title" class="text-3xl">{title}</h2>
	<p class="mt-2 text-muted">{copy}</p>
	<div class="mt-7 flex flex-wrap justify-end gap-3">
		<button type="button" class={softButton} onclick={() => dialog.close()}>{cancel}</button>
		<button
			type="button"
			class={dangerButton}
			onclick={() => {
				onconfirm();
				dialog.close();
			}}>{confirm}</button
		>
	</div>
</dialog>
