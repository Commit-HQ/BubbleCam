<script lang="ts">
	// The teddy bear of the landing page's tablet, waving, drawn in the page itself rather than loaded as a file:
	// it shows the moment the page does.
	let { class: className = '' }: { class?: string } = $props();
</script>

<svg class={className} viewBox="-42 -94 84 104" aria-hidden="true">
	<ellipse cx="0" cy="3" rx="24" ry="5" fill="#000" opacity=".25" />
	<ellipse cx="-12" cy="-5" rx="10" ry="8" fill="#a8693d" />
	<ellipse cx="12" cy="-5" rx="10" ry="8" fill="#a8693d" />
	<ellipse cx="-12" cy="-3" rx="5" ry="3.6" fill="#f6c99f" />
	<ellipse cx="12" cy="-3" rx="5" ry="3.6" fill="#f6c99f" />
	<ellipse cx="0" cy="-27" rx="24" ry="22" fill="#c47f4e" />
	<ellipse cx="0" cy="-23" rx="14" ry="13" fill="#f6c99f" />
	<ellipse cx="-24" cy="-33" rx="7.5" ry="12" fill="#a8693d" transform="rotate(30 -24 -33)" />
	<ellipse cx="25" cy="-42" rx="7.5" ry="12" fill="#a8693d" transform="rotate(-50 25 -42)" />
	<circle cx="-17" cy="-77" r="10" fill="#a8693d" />
	<circle cx="17" cy="-77" r="10" fill="#a8693d" />
	<circle cx="-17" cy="-77" r="5" fill="#f6c99f" />
	<circle cx="17" cy="-77" r="5" fill="#f6c99f" />
	<circle cx="0" cy="-61" r="22" fill="#c47f4e" />
	<ellipse cx="0" cy="-54" rx="10" ry="7.5" fill="#f6c99f" />
	<ellipse cx="0" cy="-57" rx="3.6" ry="2.7" fill="#3a2214" />
	<path
		d="M-3.5 -52.5q3.5 3 7 0"
		fill="none"
		stroke="#3a2214"
		stroke-width="1.6"
		stroke-linecap="round"
	/>
	<circle cx="-8" cy="-65" r="2.8" fill="#2a170c" />
	<circle cx="8" cy="-65" r="2.8" fill="#2a170c" />
	<circle cx="-7.2" cy="-66" r=".9" fill="#fff" />
	<circle cx="8.8" cy="-66" r=".9" fill="#fff" />
	<circle cx="-14" cy="-56" r="3.2" fill="#ff8fa3" opacity=".6" />
	<circle cx="14" cy="-56" r="3.2" fill="#ff8fa3" opacity=".6" />
</svg>
