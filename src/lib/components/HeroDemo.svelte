<script lang="ts">
	// The landing page's picture of BubbleCam at work, drawn and animated without a line of script: a tablet
	// running the studio, where a teddy bear hops across the table one picture at a time. The ghost of the last
	// picture trails a step behind, the shutter flashes, and each picture joins the strip below. Its steps are
	// CSS keyframes that jump rather than glide, as a stop-motion film does. With reduced motion, it holds still
	// on its fourth picture.
	let { label }: { label: string } = $props();

	/** Where the bear stands in each of the film's eight pictures, along the table. */
	const steps = Array.from({ length: 8 }, (_, i) => 120 + i * 50);
	/** The strip's thumbnails, each a tiny copy of its picture. */
	const thumbs = steps.map((x, i) => ({ x: 58 + i * 68, bear: ((x - 50) / 560) * 64 }));
</script>

<svg
	class="block h-auto w-full drop-shadow-2xl"
	viewBox="0 0 800 500"
	role="img"
	aria-label={label}
>
	<defs>
		<clipPath id="demo-viewfinder"><rect x="50" y="50" width="560" height="315" rx="18" /></clipPath
		>
		<linearGradient id="demo-wall" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color="#cfeaff" />
			<stop offset="1" stop-color="#eaf6ff" />
		</linearGradient>
		<!-- The bear, drawn standing on the origin, so a step moves and tilts it about its feet. -->
		<g id="demo-bear">
			<ellipse cx="0" cy="3" rx="24" ry="5" fill="#3a2214" opacity=".12" />
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
		</g>
	</defs>

	<!-- The tablet and its screen, the studio's dark room. -->
	<rect x="10" y="10" width="780" height="480" rx="46" fill="#1b1938" />
	<rect
		x="12"
		y="12"
		width="776"
		height="476"
		rx="44"
		fill="none"
		stroke="#fff"
		stroke-opacity=".12"
	/>
	<rect x="30" y="30" width="740" height="440" rx="28" fill="#14132c" />

	<!-- The camera's picture: a wall with a drawing on it, a table, and a stack of bricks. -->
	<g clip-path="url(#demo-viewfinder)">
		<rect x="50" y="50" width="560" height="225" fill="url(#demo-wall)" />
		<g transform="rotate(-4 470 112)">
			<rect x="425" y="76" width="92" height="72" rx="4" fill="#fff" />
			<circle cx="452" cy="104" r="12" fill="#ffc54d" />
			<path
				d="M452 84v-5M452 129v-5M432 104h-5M477 104h-5M438 90l-3-3M466 118l3 3M466 90l3-3M438 118l-3 3"
				stroke="#ffc54d"
				stroke-width="3"
				stroke-linecap="round"
			/>
			<path d="M425 148q30-24 50-8t42-6V148z" fill="#5fd8b0" />
		</g>
		<rect x="50" y="268" width="560" height="97" fill="#ffd8a6" />
		<rect x="50" y="268" width="560" height="7" fill="#f2bf83" />
		<rect
			x="538"
			y="252"
			width="34"
			height="34"
			rx="5"
			fill="#3fb8ff"
			transform="rotate(-6 555 269)"
		/>
		<rect x="560" y="262" width="34" height="34" rx="5" fill="#ff5a5f" />
		<rect
			x="546"
			y="224"
			width="34"
			height="34"
			rx="5"
			fill="#ffc54d"
			transform="rotate(5 563 241)"
		/>
		<circle cx="88" cy="300" r="16" fill="#5fd8b0" />
		<path d="M76 292q12 10 24 0" fill="none" stroke="#fff" stroke-width="3" opacity=".7" />

		<g transform="translate(0 300)">
			<g class="ghost"><use href="#demo-bear" /></g>
			<g class="bear"><use href="#demo-bear" /></g>
		</g>
		<rect class="flash" x="50" y="50" width="560" height="315" fill="#fff" />
	</g>

	<!-- The rail beside the picture: the ghost, switched on, the shutter, and play. -->
	<circle cx="690" cy="100" r="27" fill="#fff" fill-opacity=".14" />
	<circle cx="690" cy="100" r="27" fill="none" stroke="#3fb8ff" stroke-width="3" />
	<path
		transform="translate(676 86) scale(1.17)"
		d="M15 10v1M7.528 20.472a1.6 1.6 0 012.277 0l1.057 1.056a1.6 1.6 0 002.276 0l1.057-1.056a1.6 1.6 0 012.277 0l1.114 1.114a1.4 1.4 0 002.414-1V10a8 8 0 00-16 0v10.586a1.4 1.4 0 002.414 1zM9 10v1"
		fill="none"
		stroke="#fff"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	<g class="shutter">
		<circle cx="690" cy="208" r="46" fill="none" stroke="#fff" stroke-width="7" />
		<circle cx="690" cy="208" r="35" fill="#ff5a5f" />
		<circle cx="679" cy="197" r="7" fill="#fff" fill-opacity=".45" />
	</g>
	<circle cx="690" cy="318" r="27" fill="#fff" fill-opacity=".14" />
	<path d="M683 305v26l21-13z" fill="#fff" stroke="#fff" stroke-width="3" stroke-linejoin="round" />

	<!-- The strip of pictures taken so far, the newest ringed. -->
	<rect x="50" y="384" width="560" height="62" rx="16" fill="#fff" fill-opacity=".07" />
	{#each thumbs as { x, bear }, i (x)}
		<g class="thumb t{i}">
			<rect x={x + 4} y="397" width="64" height="36" rx="6" fill="#e3f3ff" />
			<rect x={x + 4} y="421" width="64" height="12" fill="#ffd8a6" />
			<circle cx={x + 4 + bear} cy="418" r="5" fill="#c47f4e" />
			<circle cx={x + 4 + bear - 3.5} cy="413" r="2.2" fill="#a8693d" />
			<circle cx={x + 4 + bear + 3.5} cy="413" r="2.2" fill="#a8693d" />
		</g>
	{/each}
	<rect
		class="playhead"
		x="60"
		y="395"
		width="68"
		height="40"
		rx="8"
		fill="none"
		stroke="#ff5a5f"
		stroke-width="3"
	/>
	<circle cx="690" cy="415" r="24" fill="#fff" fill-opacity=".1" />
	<path
		transform="translate(678 403)"
		d="M10 11v6M14 11v6M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
		fill="none"
		stroke="#fff"
		stroke-opacity=".8"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</svg>

<style>
	/*
	 * Eight pictures, 0.6 s apart. Each keyframe holds until the next (steps), so the bear jumps between poses
	 * as a stop-motion puppet does. Without animation, everything shows the fourth picture.
	 */
	.bear,
	.ghost,
	.playhead,
	.thumb,
	.flash,
	.shutter {
		animation-duration: 4.8s;
		animation-iteration-count: infinite;
		animation-timing-function: steps(1, end);
	}
	.bear {
		transform: translate(270px, -20px) rotate(-6deg) scale(0.96, 1.05);
		animation-name: hop;
	}
	.ghost {
		opacity: 0.38;
		transform: translate(220px, 0) scale(1.04, 0.96);
		animation-name: ghost;
	}
	.playhead {
		transform: translateX(204px);
		animation-name: playhead;
	}
	.t4,
	.t5,
	.t6,
	.t7 {
		opacity: 0;
	}
	.flash {
		opacity: 0;
		animation-duration: 0.6s;
		animation-timing-function: ease-out;
		animation-name: flash;
	}
	.shutter {
		transform-box: fill-box;
		transform-origin: center;
		animation-duration: 0.6s;
		animation-timing-function: ease-out;
		animation-name: press;
	}
	.t1 {
		animation-name: t1;
	}
	.t2 {
		animation-name: t2;
	}
	.t3 {
		animation-name: t3;
	}
	.t4 {
		animation-name: t4;
	}
	.t5 {
		animation-name: t5;
	}
	.t6 {
		animation-name: t6;
	}
	.t7 {
		animation-name: t7;
	}
	@media (prefers-reduced-motion: reduce) {
		.bear,
		.ghost,
		.playhead,
		.thumb,
		.flash,
		.shutter {
			animation: none;
		}
	}

	/* On the table, squashed a little; in the air, stretched and tilted. */
	@keyframes hop {
		0% {
			transform: translate(120px, 0) scale(1.04, 0.96);
		}
		12.5% {
			transform: translate(170px, -20px) rotate(6deg) scale(0.96, 1.05);
		}
		25% {
			transform: translate(220px, 0) scale(1.04, 0.96);
		}
		37.5% {
			transform: translate(270px, -20px) rotate(-6deg) scale(0.96, 1.05);
		}
		50% {
			transform: translate(320px, 0) scale(1.04, 0.96);
		}
		62.5% {
			transform: translate(370px, -20px) rotate(6deg) scale(0.96, 1.05);
		}
		75% {
			transform: translate(420px, 0) scale(1.04, 0.96);
		}
		87.5% {
			transform: translate(470px, -20px) rotate(-6deg) scale(0.96, 1.05);
		}
	}
	/* The picture before: none for the first one. */
	@keyframes ghost {
		0% {
			opacity: 0;
			transform: translate(120px, 0);
		}
		12.5% {
			opacity: 0.38;
			transform: translate(120px, 0) scale(1.04, 0.96);
		}
		25% {
			transform: translate(170px, -20px) rotate(6deg) scale(0.96, 1.05);
		}
		37.5% {
			transform: translate(220px, 0) scale(1.04, 0.96);
		}
		50% {
			transform: translate(270px, -20px) rotate(-6deg) scale(0.96, 1.05);
		}
		62.5% {
			transform: translate(320px, 0) scale(1.04, 0.96);
		}
		75% {
			transform: translate(370px, -20px) rotate(6deg) scale(0.96, 1.05);
		}
		87.5% {
			transform: translate(420px, 0) scale(1.04, 0.96);
		}
	}
	@keyframes playhead {
		0% {
			transform: translateX(0);
		}
		12.5% {
			transform: translateX(68px);
		}
		25% {
			transform: translateX(136px);
		}
		37.5% {
			transform: translateX(204px);
		}
		50% {
			transform: translateX(272px);
		}
		62.5% {
			transform: translateX(340px);
		}
		75% {
			transform: translateX(408px);
		}
		87.5% {
			transform: translateX(476px);
		}
	}
	@keyframes flash {
		0% {
			opacity: 0.75;
		}
		30%,
		100% {
			opacity: 0;
		}
	}
	@keyframes press {
		0% {
			transform: scale(0.88);
		}
		35%,
		100% {
			transform: scale(1);
		}
	}
	/* Each thumbnail joins the strip when its picture is taken, and they all leave as the film starts over. */
	@keyframes t1 {
		0% {
			opacity: 0;
		}
		12.5% {
			opacity: 1;
		}
	}
	@keyframes t2 {
		0% {
			opacity: 0;
		}
		25% {
			opacity: 1;
		}
	}
	@keyframes t3 {
		0% {
			opacity: 0;
		}
		37.5% {
			opacity: 1;
		}
	}
	@keyframes t4 {
		0% {
			opacity: 0;
		}
		50% {
			opacity: 1;
		}
	}
	@keyframes t5 {
		0% {
			opacity: 0;
		}
		62.5% {
			opacity: 1;
		}
	}
	@keyframes t6 {
		0% {
			opacity: 0;
		}
		75% {
			opacity: 1;
		}
	}
	@keyframes t7 {
		0% {
			opacity: 0;
		}
		87.5% {
			opacity: 1;
		}
	}
</style>
