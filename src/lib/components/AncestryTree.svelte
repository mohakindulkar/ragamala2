<script>
    import { base } from '$app/paths';
    import * as d3 from 'd3';
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import { get } from 'svelte/store';
    import { innerWidth, innerHeight } from 'svelte/reactivity/window';
    import CreeperLink from "$lib/components/CreeperLink.svelte";
    import { currentSeason, defaultSeason, activeRaga, currentLang } from '$lib/stores.js';
    import AudioEngine from '$lib/components/AudioEngine.svelte';
    // Track the active node when a user clicks

    export let data;

    // Svelte tracks the real browser dimensions
    let containerWidth = innerWidth;
    let containerHeight = innerHeight;
    let currentLanguage = $currentLang;

    let hierarchyNode = null;
    let root = null;
    let activeNode = null;
    let allNodesFlat = [];
    let isMusicPlaying = false;

    // --- NEW: BOUND AUDIO CONTROLS ---
    let currentBpm = 80;
    let complexity = 0.5;
    let swingAmount = 0.3;
    let melodyVol = -8;
    let audioLevel = 0;

    // --- NEW: SVG RING DRAG LOGIC ---
    let draggingRing = null;
    let startY = 0;
    let startVal = 0;

    function startRingDrag(e, paramName, currentVal) {
        e.stopPropagation(); // CRUCIAL: Stops D3 from panning the whole canvas!
        draggingRing = paramName;
        startY = e.clientY || e.touches[0].clientY;
        startVal = currentVal;

        window.addEventListener('mousemove', onRingDrag);
        window.addEventListener('mouseup', endRingDrag);
    }

    function onRingDrag(e) {
        if (!draggingRing) return;
        const currentY = e.clientY || e.touches[0].clientY;
        const delta = startY - currentY; // Moving mouse UP increases the value

        // Adjust sensitivity based on the parameter's min/max range
        if (draggingRing === 'bpm') currentBpm = Math.max(40, Math.min(180, startVal + delta));
        if (draggingRing === 'complexity') complexity = Math.max(0.1, Math.min(1.0, startVal + (delta / 200)));
        if (draggingRing === 'swing') swingAmount = Math.max(0, Math.min(0.8, startVal + (delta / 200)));
        if (draggingRing === 'vol') melodyVol = Math.max(-40, Math.min(10, startVal + (delta / 5)));
    }

    function endRingDrag() {
        draggingRing = null;
        window.removeEventListener('mousemove', onRingDrag);
        window.removeEventListener('mouseup', endRingDrag);
    }

    const PIZZA_RADIUS = 100;
    // D3 Zoom Variables
    let svgElement; // Binds to the <svg> tag to capture mouse drags
    let zoomTransform = { x: 0, y: 0, k: 1 }; // Holds the current pan/zoom state [cite: 16]

    // Standard D3 Setup
    const tree = d3.tree()
        .size([2 * Math.PI, 1])
        .separation((a, b) => (a.parent == b.parent ? 1 : 1.5) / a.depth);

    const linkGen = d3.linkRadial()
        .angle(d => d.x)
        .radius(d => d.y);

    onMount(() => {
        hierarchyNode = d3.hierarchy(data).each(d => {
            // 1. Inherit Season (Already working perfectly!)
            if (!d.data.season && d.parent) {
                d.data.season = d.parent.data.season;
            }

            // 2. MUSICAL INHERITANCE
            if (d.parent && d.parent.data.musicalDNA) {

                // Clone the parent's DNA so we don't accidentally mutate the parent
                let inheritedDNA = JSON.parse(JSON.stringify(d.parent.data.musicalDNA));

                // If this child has specific mutations (like a Ragini flattening a note)
                if (d.data.musicalMutation) {

                    // Capture the notes to flatten, checking for both JSON key variations
                    const notesToFlatten = d.data.musicalMutation.flattenNotes || d.data.musicalMutation.flatten;

                    if (notesToFlatten) {
                        // Flatten notes in the ascending scale
                        if (inheritedDNA.arohana) {
                            inheritedDNA.arohana = inheritedDNA.arohana.map(note =>
                                notesToFlatten.includes(note) ? note.replace('4', 'b4') : note
                            );
                        }

                        // Flatten notes in the descending scale
                        if (inheritedDNA.avarohana) {
                            inheritedDNA.avarohana = inheritedDNA.avarohana.map(note =>
                                notesToFlatten.includes(note) ? note.replace('4', 'b4') : note
                            );
                        }
                    }

                    // Example: Override the Vadi (King Note) or Tempo
                    if (d.data.musicalMutation.vadi) inheritedDNA.vadi = d.data.musicalMutation.vadi;
                    if (d.data.musicalMutation.tempo) inheritedDNA.tempo = d.data.musicalMutation.tempo;
                }

                // Save the newly combined DNA into the child's data
                d.data.musicalDNA = inheritedDNA;
            }
        });

        allNodesFlat = hierarchyNode.descendants();

        // RECURSIVE COLLAPSE: Strictly hides all levels
        function collapseAll(d) {
            if (d.children) {
                d._children = d.children;
                d._children.forEach(collapseAll);
                d.children = null;
            }
        }
        collapseAll(hierarchyNode);
        updateTree();

        // Initialize D3 Zoom and Pan
        const zoomBehavior = d3.zoom()
            .scaleExtent([0.3, 3]) // Allow zooming out to 30% and in to 300%
            .on("zoom", (event) => {
                zoomTransform = event.transform; // Update Svelte reactive variable
            });

        // Attach the zoom behavior to the SVG element
        d3.select(svgElement).call(zoomBehavior);
    });

    // React to Window Resizes!
    // Whenever the browser changes size or nodes open, redraw the tree to fill the new space
    $: if (containerWidth && containerHeight && hierarchyNode) {
        updateTree();
    }
    // Reactive statement: When the language changes, redraw the tree!
    $: if (currentLanguage !== $currentLang) { updateTree(); }

    function updateTree() {
        currentLanguage = $currentLang;
        if (!hierarchyNode) return;
        root = tree(hierarchyNode);
        const maxVisibleDepth = root.height;

        // --- THE TRUE RECTANGULAR BOUNDARY ALGORITHM ---
        // Calculate safe padding so avatars don't clip off the screen
        const safeWidth = (containerWidth / 2) - 80;
        const safeHeight = (containerHeight / 2) - 80;
        const startDistance = PIZZA_RADIUS + 80; // Where the 1st generation starts

        root.each(d => {
            if (d.depth === 0) {
                d.y = 0;
                return;
            }

            // Find the absolute maximum distance a node can travel at its specific angle
            // before it hits the literal edge of the browser window.
            let maxR = Math.min(
                safeWidth / (Math.abs(Math.sin(d.x)) || 0.001),
                safeHeight / (Math.abs(Math.cos(d.x)) || 0.001)
            );

            // Enforce a MINIMUM radial gap of 150px per generation so they NEVER overlap radially!
            const requiredMaxR = startDistance + ((maxVisibleDepth - 1) * 150);
            maxR = Math.max(maxR, requiredMaxR);

            if (d.depth === 1) {
                // 1st generation ALWAYS sits securely at startDistance. No jumping.
                d.y = startDistance;
            } else {
                // Subsequent generations are pushed out into the available/forced space
                d.y = startDistance + ((maxR - startDistance) * ((d.depth - 1) / (maxVisibleDepth - 1)));
            }
        });

        root = root; // Trigger Svelte Reactivity
    }

    function toggleNode(d) {
        // Update the global store based on what was clicked!
        if (d.depth === 0) {
            $currentSeason = 'Vasanta'; // Or default
        } else {
            $currentSeason = d.data.season;
        }

        // We only save d.data (the clean JSON), not the whole complex D3 node
        $activeRaga = d.data;

        // --- EXCLUSIVE COLLAPSE LOGIC ---
        // If clicking a level-1 node (a main Raga like Bhairav), collapse all other siblings
        if (d.depth === 1) {
            root.children.forEach(sibling => {
                if (sibling !== d && sibling.children) {
                    sibling._children = sibling.children;
                    sibling.children = null;
                }
            });
        }

        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else if (d._children) {
            d.children = d._children;
            d._children = null;
        }
        updateTree();
    }

    // --- THE PIZZA HUB ALGORITHM ---
    // Grabs the 1st level nodes (whether visible or hidden) to track their exact rotation
    $: activeFirstLevel = (root && root.children) ? root.children : (root && root._children ? root._children : []);

    // 1. Define the specific image for each deity/season
    const seasonImages = {
        'Vasanta': `${base}/images/placeholder_hindol.png`,
        'Grishma': `${base}/images/placeholder_dipak.png`,
        'Varsha':  `${base}/images/placeholder_megh.png`,
        'Sharad':  `${base}/images/placeholder_sri.png`,
        'Hemant':  `${base}/images/placeholder_malkauns.png`,
        'Shishira': `${base}/images/placeholder_bhairav.png`
    };

    $: backgroundWedges = activeFirstLevel.map((child, i, arr) => {
        const getAngle = (node, index) => node.x !== undefined ? node.x : (index * (Math.PI * 2) / 6);

        const prev = arr[i === 0 ? arr.length - 1 : i - 1];
        const next = arr[i === arr.length - 1 ? 0 : i + 1];

        const cx = getAngle(child, i);
        const px = getAngle(prev, i === 0 ? arr.length - 1 : i - 1);
        const nx = getAngle(next, i === arr.length - 1 ? 0 : i + 1);

        const startAngle = i === 0 ? (cx + px - 2 * Math.PI) / 2 : (cx + px) / 2;
        const endAngle = i === arr.length - 1 ? (cx + nx + 2 * Math.PI) / 2 : (cx + nx) / 2;

        const centerAngle = (startAngle + endAngle) / 2;
        const rotationDegrees = centerAngle * (180 / Math.PI);

        // --- NEW GEOMETRY MATH ---
        // 1. Find the actual angle span of this specific wedge
        const wedgeAngle = Math.abs(endAngle - startAngle);

        // 2. Calculate the "Chord Length" (the exact straight-line width at the crust)
        const chordWidth = 2 * PIZZA_RADIUS * Math.sin(wedgeAngle / 2);

        // 3. Ensure the bounding box is never narrower than the radius, and add 4px padding for safety
        const dynamicWidth = Math.max(PIZZA_RADIUS, chordWidth) + 4;

        const arcPath = d3.arc()({
            innerRadius: 0,
            outerRadius: PIZZA_RADIUS,
            startAngle: startAngle,
            endAngle: endAngle
        });

        return {
            id: child.data.name,
            season: child.data.season,
            path: arcPath,
            rotation: rotationDegrees,

            // Pass the calculated width to the HTML
            imageWidth: dynamicWidth,

            color: `var(--${child.data.season.toLowerCase()}-bg})` || '#ffffff'
        };
    });

    // --- THE TRANSLATION HARVESTER (Loop-Proof) ---
    let harvestTimer; // Keeps track of the timeout
    // Scrapes the invisible DOM nodes after Google translates them
    $: if ($currentLang) {
        // Cancel any pending harvests if they click quickly
        clearTimeout(harvestTimer);

        if ($currentLang === 'en') {
            updateTree();
        } else {
            harvestTimer = setTimeout(() => {
                allNodesFlat.forEach(node => {
                    if (!node.data.i18n) node.data.i18n = {};
                    if (!node.data.i18n[$currentLang]) node.data.i18n[$currentLang] = {};

                    const nameEl = document.getElementById(`trans-name-${node.data.name}`);
                    if (nameEl) node.data.i18n[$currentLang].name = nameEl.innerText;

                    const descEl = document.getElementById(`trans-desc-${node.data.name}`);
                    if (descEl && node.data.description) {
                        node.data.i18n[$currentLang].description = descEl.innerText;
                    }
                });

                updateTree();

                // STEALTH UPDATE: Update activeRaga without triggering Svelte's $ reactive loop!
                const currentActive = get(activeRaga);
                if (currentActive) {
                    activeRaga.set({...currentActive});
                }
            }, 1500);
        }
    }
</script>

<div class="tree-container"
     bind:clientWidth={containerWidth}
     bind:clientHeight={containerHeight}
     style="--bg-color: var(--{$currentSeason.toLowerCase()}-bg, #f4ece1); background-color: var(--bg-color); transition: background-color 1s ease;"
>
    <div class="translation-matrix" style="position: absolute; opacity: 0; pointer-events: none; z-index: -1;" aria-hidden="true">
        {#each allNodesFlat as node}
            <span id="trans-name-{node.data.name}">{node.data.name}</span>
            {#if node.data.description}
                <span id="trans-desc-{node.data.name}">{node.data.description}</span>
            {/if}
        {/each}
    </div>

    <svg
            bind:this={svgElement}
            width="100%"
            height="100%"
            viewBox="-{containerWidth/2} -{containerHeight/2} {containerWidth} {containerHeight}"
            style="cursor: grab;"
    >
        <defs>
            <clipPath id="avatar-clip">
                <circle r="20" cx="0" cy="0" />
            </clipPath>

            {#each backgroundWedges as wedge (wedge.id)}
                <clipPath id="clip-{wedge.id}">
                    <path d={wedge.path} style="transition: d 0.8s ease;" />
                </clipPath>
            {/each}
        </defs>

        {#if root}
            <g transform="translate({zoomTransform.x}, {zoomTransform.y}) scale({zoomTransform.k})">
            <g class="links">
                {#each root.links() as link (link.target.data.name)}
                    <CreeperLink pathData={linkGen(link)} ragaData={link.target.data} />
                    <path d={linkGen(link)} fill="none" stroke="#8b4513" stroke-width="0.5" opacity="0.2" />
                {/each}
            </g>

            {#if backgroundWedges.length > 0}
                {#if isMusicPlaying}
                    <g class="smoke-ring" filter="url(#magic-smoke)" style="transform: scale({1 + audioLevel * 0.15}); transition: transform 0.05s;">
                        <ellipse class="smoke-layer s1" cx="0" cy="0" rx="120" ry="135" />
                        <ellipse class="smoke-layer s2" cx="0" cy="0" rx="140" ry="125" />
                        <ellipse class="smoke-layer s3" cx="0" cy="0" rx="130" ry="130" />
                        <ellipse class="smoke-layer s4" cx="0" cy="0" rx="115" ry="145" />
                    </g>

                    <g class="interaction-rings" stroke="transparent" stroke-width="20" fill="none" style="cursor: ns-resize;">
                        <ellipse cx="0" cy="0" rx="120" ry="135"
                                 on:mousedown={(e) => startRingDrag(e, 'bpm', currentBpm)}>
                            <title>Drag Up/Down: Tempo (BPM)</title>
                        </ellipse>

                        <ellipse cx="0" cy="0" rx="140" ry="125"
                                 on:mousedown={(e) => startRingDrag(e, 'complexity', complexity)}>
                            <title>Drag Up/Down: Note Density</title>
                        </ellipse>

                        <ellipse cx="0" cy="0" rx="130" ry="130"
                                 on:mousedown={(e) => startRingDrag(e, 'swing', swingAmount)}>
                            <title>Drag Up/Down: Swing (Groove)</title>
                        </ellipse>

                        <ellipse cx="0" cy="0" rx="115" ry="145"
                                 on:mousedown={(e) => startRingDrag(e, 'vol', melodyVol)}>
                            <title>Drag Up/Down: Melody Volume</title>
                        </ellipse>
                    </g>
                {/if}
                <g class="pizza-root" on:click={() => toggleNode(root)} style="cursor: pointer;">

                    {#each backgroundWedges as wedge, index (wedge.id)}
                        <g clip-path="url(#clip-{wedge.id})">

                            <path d={wedge.path} fill={wedge.color} style="transition: d 0.8s ease;" />

                            <image
                                    href={seasonImages[wedge.season]}

                            x={-wedge.imageWidth / 2}
                            y={-PIZZA_RADIUS}
                            width={wedge.imageWidth}
                            height={PIZZA_RADIUS}

                            preserveAspectRatio="xMidYMax slice"

                            style="
                            transform: rotate({wedge.rotation}deg);
                            transform-origin: 0px 0px;
                            transition: transform 0.8s ease, width 0.8s ease, x 0.8s ease;
                            "
                            />

                        </g>

                        <path d={wedge.path} fill="none" stroke="#d7ccc8" stroke-width="2" style="transition: d 0.8s ease;" />

                    {/each}

                    <circle r={PIZZA_RADIUS} fill="none" stroke="#8b4513" stroke-width="3" />
                </g>
            {/if}

            {#each root.descendants() as node (node.data.name)}
                {#if node.depth > 0}
                    <g
                            class="node {node._children ? 'has-children' : ''}"
                            transform="rotate({(node.x * 180) / Math.PI - 90}) translate({node.y},0)"
                            on:click={() => toggleNode(node)}
                            style="cursor: pointer; transition: transform 0.8s ease;"
                            in:fade={{ delay: 5000, duration: 500 }}
                    >
                        {#if $activeRaga && $activeRaga.name === node.data.name}
                            <circle class="true-halo" cx="0" cy="0" filter="url(#soft-glow)" />
                        {/if}

                        <image href="{base}/avatar.png" x="-20" y="-20" width="40" height="40" clip-path="url(#avatar-clip)" />

                        <circle r="20" fill="none" stroke={node.data.type === 'parent' ? '#d32f2f' : `var(--${node.data.season.toLowerCase()}-${Math.min(node.depth, 7)})`} stroke-width="3" />

                        <!-- The Glowing Aura (Rendered Behind) -->
                        <text
                                dy="0.31em"
                                x={node.x < Math.PI ? 48 : -48}
                                text-anchor={node.x < Math.PI ? "start" : "end"}
                                transform={node.x >= Math.PI ? "rotate(180)" : null}
                                class="raga-label-glow"
                        >
                            {node.data.i18n?.[$currentLang]?.name || node.data.name}
                        </text>

                        <!-- The Crisp Text (Rendered on Top) -->
                        <text
                                dy="0.31em"
                                x={node.x < Math.PI ? 48 : -48}
                                text-anchor={node.x < Math.PI ? "start" : "end"}
                                transform={node.x >= Math.PI ? "rotate(180)" : null}
                                class="raga-label"
                        >
                            {node.data.i18n?.[$currentLang]?.name || node.data.name}
                        </text>
                    </g>
                {/if}
            {/each}
            </g>
        {/if}
    </svg>
    <AudioEngine
            activeNode={hierarchyNode}
            bind:isPlaying={isMusicPlaying}
            bind:currentBpm={currentBpm}
            bind:complexity={complexity}
            bind:swingAmount={swingAmount}
            bind:melodyVol={melodyVol}
            bind:audioLevel={audioLevel}
    />
</div>

<style>
    .tree-container {
        width: 100vw;
        height: 100vh;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #f4ece1;
    }

    .pizza-root {
        transition: transform 0.8s ease;
    }

    .pizza-root path {
        transition: d 0.8s ease; /* Smoothly morphs the slices as they rotate */
    }

    .raga-label {
        font-family: 'serif';
        font-size: 14px;
        fill: #3e2723;
        font-weight: 600; /* Keeps the actual text thick and legible */
        transition: all 0.3s ease;
    }

    .raga-label-glow {
        font-family: 'serif';
        font-size: 14px;
        font-weight: 600;
        fill: none; /* No inner color, just the outline */
        stroke: var(--active-accent-color);
        stroke-width: 10px; /* Thicker base for the glow */
        opacity: 0.35; /* Overall 35% transparency */
        stroke-linecap: round;
        stroke-linejoin: round;
        filter: blur(4px); /* Heavier gaussian blur for proper scattering */
        transition: all 0.3s ease;
    }

    .node.has-children circle {
        stroke-dasharray: 1 6;
        stroke-linecap: round;
        animation: spin 10s linear infinite;
    }

    .node:hover .raga-label {
        font-weight: bold;
        fill: #d32f2f;
    }

    /* --- D3 TREE NODES --- */
    .node text {
        font-family: var(--font-ui);
        font-size: 12px;
        font-weight: 500;
        fill: var(--theme-ink);
    }

    /* --- AUDIO PANEL --- */
    .audio-panel {
        font-family: var(--font-ui);
    }

    .raga-name {
        font-family: var(--font-display);
        font-size: 1.5rem;
        color: var(--theme-ink);
    }

    /* --- THE AURORA BOREALIS BACKGROUND --- */
    .tree-container {
        width: 100vw;
        height: 100vh;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;

        /* The base parchment color */
        background-color: var(--theme-parchment, #f4ece1);

        /* Two massive, soft radial gradients that use the family's specific colors */
        background-image:
                radial-gradient(circle at 0% 0%, var(--active-bg-color) 0%, transparent 60%),
                radial-gradient(circle at 100% 100%, var(--active-accent-color) 0%, transparent 50%);
        background-size: 200% 200%;

        /* The slow, breathing shift animation */
        animation: aurora-flow 12s ease-in-out infinite alternate;
    }

    /* --- NEON GLOW PHYSICS (The Halo Fix) --- */
    .neon-glow-outer {
        fill: var(--active-accent-color);
        /* Hardware accelerated pulsing */
        animation: breathe-halo 2s ease-in-out infinite alternate;
    }

    .neon-glow-inner {
        animation: breathe-inner 2s ease-in-out infinite alternate;
    }

    @keyframes breathe-halo {
        0% {
            r: 16px; /* Sits just slightly wider than the node image */
            opacity: 0.4;
            filter: drop-shadow(0 0 8px var(--active-accent-color));
        }
        100% {
            r: 26px; /* Swells outwards */
            opacity: 0.8;
            filter: drop-shadow(0 0 20px var(--active-accent-color));
        }
    }

    @keyframes breathe-outer {
        0% {
            r: 12px;
            opacity: 0.2;
            filter: drop-shadow(0 0 5px var(--active-accent-color));
        }
        100% {
            r: 22px;
            opacity: 0.7;
            filter: drop-shadow(0 0 20px var(--active-accent-color));
        }
    }

    @keyframes breathe-inner {
        0% { r: 5px; fill: rgba(255,255,255, 0.8); }
        100% { r: 7px; fill: #ffffff; }
    }

    @keyframes aurora-flow {
        0% { background-position: 0% 0%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 50% 100%; }
    }

    @keyframes spin {
        100% { transform: rotate(360deg); }
    }

    /* --- FIXED HALO PHYSICS --- */
    .true-halo {
        fill: var(--active-accent-color);
        opacity: 0.8;
        animation: true-breathe 0.8s ease-in-out infinite alternate;
    }

    @keyframes true-breathe {
        0% { r: 25px; opacity: 0.6; }
        100% { r: 35px; opacity: 1.0; }
    }

    /* --- MAGICAL SMOKE RING PHYSICS --- */
    .smoke-layer {
        fill: none; /* Hollow rings! */
        transform-origin: 0 0;
        mix-blend-mode: multiply;
        opacity: 0.7;
    }

    .smoke-layer.s1 {
        stroke: var(--active-bg-color);
        stroke-width: 8px;
        animation: smoke-spin 18s linear infinite, smoke-breathe 6s ease-in-out infinite alternate;
    }

    .smoke-layer.s2 {
        stroke: var(--active-accent-color);
        stroke-width: 4px;
        /* Spins the opposite way to create the twisting braid effect */
        animation: smoke-spin 24s linear infinite reverse, smoke-breathe 8s ease-in-out infinite alternate-reverse;
    }

    .smoke-layer.s3 {
        stroke: var(--theme-sindoor, #d32f2f);
        stroke-width: 12px;
        opacity: 0.4;
        animation: smoke-spin 30s linear infinite, smoke-breathe 10s ease-in-out infinite alternate;
    }

    .smoke-layer.s4 {
        stroke: var(--theme-terra, #8b4513);
        stroke-width: 2px;
        animation: smoke-spin 15s linear infinite reverse, smoke-breathe 5s ease-in-out infinite alternate;
    }

    @keyframes smoke-spin {
        100% { transform: rotate(360deg); }
    }

    /* Gently expands and contracts the rings */
    @keyframes smoke-breathe {
        0% { transform: rotate(0deg) scale(0.95); }
        100% { transform: rotate(0deg) scale(1.1); }
    }

</style>