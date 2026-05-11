<script>
	import { base } from '$app/paths';
	import '$src/app.css'; // Import the global styles!
	import favicon from '$lib/assets/favicon.svg';
	import SVGDefs from '$lib/components/SVGDefs.svelte';
	import { currentSeason } from "$lib/stores.js";
	import Narrator from "$lib/components/Narrator.svelte";
	import GlobalOverlay from '$lib/components/GlobalOverlay.svelte';
	import AudioBaithak from '$lib/components/AudioBaithak.svelte';
	import FamilyTreeConsole from '$lib/components/FamilyTreeConsole.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<SVGDefs />

<div class="app-wrapper" style="
	--active-bg-color: var(--{$currentSeason.toLowerCase()}-1);
	--border-color: var(--{$currentSeason.toLowerCase()}-vine);
	--text-color: var(--{$currentSeason.toLowerCase()}-vine);
	--accent-color: var(--{$currentSeason.toLowerCase()}-7);
    --active-accent-color: var(--{$currentSeason.toLowerCase()}-5);
    --active-damask: var(--damask-{$currentSeason.toLowerCase()});
    --damask-size: var(--damask-size-{$currentSeason.toLowerCase()}, 150px 200px);
    --active-damask-w: var(--damask-w-{$currentSeason.toLowerCase()}, 150px);
    --active-damask-h: var(--damask-h-{$currentSeason.toLowerCase()}, 200px);
">
	<div class="rotate-gate">
		<p>please rotate your device</p>
	</div>

	<div class="desktop-shell">
		<Narrator />
		<AudioBaithak />

		<div class="page-content">
			{@render children()}
		</div>

		<FamilyTreeConsole />
		<GlobalOverlay />
	</div>
</div>

<style>
	/* Set global defaults */
	:global(body) {
		margin: 0;
		padding: 0;
	}
	.app-wrapper {
		position: relative;
		width: 100%;
		height: 100vh;
		background-color: var(--bg-color); /* Parchment background color */
		overflow: hidden;
		margin: 0;
		padding: 0;
	}

	.desktop-shell {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.rotate-gate {
		display: none;
		position: absolute;
		inset: 0;
		z-index: 1000;
		background: var(--theme-parchment, #f4ece1);
		color: var(--theme-ink, #3e2723);
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 24px;
		font-family: var(--font-bharvati, Bharvati, serif);
		font-size: clamp(1.4rem, 4vw, 2.4rem);
		letter-spacing: 0.03em;
	}

	.rotate-gate p {
		margin: 0;
	}

	/* THE MASKED TREE CONTAINER */
	.masked-tree-container {
		/*width: 100%;*/
		/*height: 100%;*/

		/* Apply the SVG as a mask */
		-webkit-mask-image: url('/arch-mask.svg');
		mask-image: url('/arch-mask.svg');

		/* Force the mask to stretch exactly to the edges of the div */
		-webkit-mask-size: 100% 100%;
		mask-size: 100% 100%;

		-webkit-mask-repeat: no-repeat;
		mask-repeat: no-repeat;

		display: flex;
		justify-content: center;
		align-items: center;
	}

	/* YOUR ORNATE BORDER OVERLAY */
	.ornate-border-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		/*		!* Your traditional border PNG *!
                background-image: url('/border.png');
                background-size: 100% 100%; !* Stretches to frame *!
                background-repeat: no-repeat;*/

		/* CRITICAL: Allows mouse clicks to pass through the border image
           and interact with the nodes underneath */
		pointer-events: none;
		/*z-index: 10;*/
	}

	.background-vines {
		position: absolute;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		mask-image: url(/seamless.svg);
		mask-repeat: repeat;
		mask-size: 30% 30%;
		mask-position: top left;
		mask-origin: border-box;
		mask-clip: no-clip;
	}

	/* THE FRAME CONTAINER */
	.ui-frame {
		position: absolute;
		inset: 1px; /* Creates a margin around the entire screen */
		pointer-events: none; /* CRITICAL: Lets clicks pass through to the SVG tree */
		z-index: 2;
		margin: 0;
		padding: 0;
	}

	.page-content {
		position: relative;
		z-index: 10;
		pointer-events: none;
	}

	/* THE CORNERS */
	.corner {
		position: absolute;
		width: 100px; /* Size of corner SVG */
		height: 100px;
		background-color: var(--border-color); /* Placeholder for arabesque corner image */
	}

	.corner-image {
		mask-image: var(--corner-ornament);
		mask-size: cover;
		mask-repeat: no-repeat;
		mask-position: 0 0;
	}

	.top-left     { top: 0; left: 0; }
	.top-right    { top: 0; right: 0; transform: scaleX(-1); } /* Flips the same SVG horizontally */
	.bottom-left  { bottom: 0; left: 0; transform: scaleY(-1); } /* Flips vertically */
	.bottom-right { bottom: 0; right: 0; transform: scale(-1, -1); } /* Flips both ways */


	/* THE EDGES */
	.edge {
		position: absolute;
		mask: var(--corner-ornament) center repeat;
		background-color: var(--border-color); /* Placeholder */
		mask-repeat: repeat;
		/* Add a second, fully opaque layer (linear-gradient(#000 0 0) creates a solid black rectangle) */
		mask-image: var(--corner-ornament), linear-gradient(var(--accent-color), var(--border-color));
		/* Use mask-composite: exclude to cut the shape out of the solid background */
		mask-composite: exclude;
		/* Use the -webkit- prefix for broader compatibility in older browsers */
		-webkit-mask-composite: xor;
		border-radius: 10px;
	}

	.border-top, .border-bottom {
		height: var(--border-width); /* Thickness of top/bottom border */
		left: 20px; /* Start after the corner */
		right: 20px; /* End before the corner */
		/* background-repeat: repeat-x; */
	}

	.border-top    { top: 0; }
	.border-bottom { bottom: 0; }

	.border-left, .border-right {
		width: 20px; /* Thickness of side border */
		top: 20px; /* Start after top corner */
		bottom: 20px; /* End before bottom corner */
		/* background-repeat: repeat-y; */
	}

	.border-left  { left: 0; }
	.border-right { right: 0; }

	.cutout {
		background-color: var(--active-accent-color); /* <--- Replaces the inline style */
		mask-image: url('/half-arch-mask.svg');
		mask-repeat: no-repeat;
		mask-size: auto;
		mask-position: top left;
		mask-origin: border-box;
		mask-clip: view-box;
		height: 50vh;
		width: 50%;
		top: var(--border-width);
		filter: drop-shadow(5rem 3rem 2rem rgba(0, 0, 0, 0.75));
	}

	.top-left.cutout     { left: var(--border-width); }
	.top-right.cutout    { right: var(--border-width); }

	.background {
		width: 100%;
		height: 100%;
	}

	.damask {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background-image: none;

		-webkit-mask-image: var(--active-damask), var(--active-damask);
		mask-image: var(--active-damask), var(--active-damask);

		/*		-webkit-mask-size: var(--active-damask-w) var(--active-damask-h), var(--active-damask-w) var(--active-damask-h);
                mask-size: var(--active-damask-w) var(--active-damask-h), var(--active-damask-w) var(--active-damask-h);*/

		-webkit-mask-position: 0 0, calc(var(--active-damask-w) / 2) calc(var(--active-damask-h) / 2);
		mask-position: 0 0, calc(var(--active-damask-w) / 2) calc(var(--active-damask-h) / 2);

		-webkit-mask-repeat: repeat, repeat;
		mask-repeat: repeat, repeat;

		background-color: var(--active-bg-color); /* <--- Replaces the inline style */
		transition: mask-image 1s ease, mask-size 1s ease, background-color 1s ease;

		/* Hardcode a size: */
		/*		-webkit-mask-size: var(--damask-size), 150px 200px;
                mask-size: var(--damask-size), 150px 200px;	*/

		-webkit-mask-size: var(--damask-size);
		mask-size: var(--damask-size);
	}

	/* --- TRADITIONAL HEADER --- */
	.ragamala-header h1 {
		font-family: var(--font-display);
		font-size: 2.2rem;
		font-weight: 400; /* Tiro is naturally quite heavily weighted */
		color: var(--theme-sindoor);
		margin: 0 0 5px 0;
	}

	.ragamala-header .dhyana-text {
		font-family: var(--font-body);
		font-size: 1.1rem;
		font-style: italic;
		color: var(--theme-ink);
	}

	@media (max-width: 900px) and (orientation: portrait) {
		.desktop-shell {
			display: none;
		}

		.rotate-gate {
			display: flex;
		}

		:global(body) {
			overflow: hidden;
			background: var(--theme-parchment, #f4ece1);
		}
	}

	@media (max-width: 900px) and (orientation: landscape) {
		.desktop-shell {
			transform: scale(0.94);
			transform-origin: center center;
			width: 106.5%;
			height: 106.5%;
			margin-left: -3.25%;
			margin-top: -3.25%;
		}
	}

</style>
