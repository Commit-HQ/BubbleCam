<script lang="ts">
	import bubble from '#lib/assets/bubble.svg';

	// A decorative soap bubble, BubbleBoard's, placed and sized by its class.
	let { class: className }: { class: string } = $props();
</script>

<img src={bubble} alt="" class="pointer-events-none absolute {className}" />
