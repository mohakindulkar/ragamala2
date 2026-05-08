<script>
    import { base } from '$app/paths';
    import * as d3 from 'd3';
    import { onMount, onDestroy } from 'svelte';
    import { fade } from 'svelte/transition';
    import { get } from 'svelte/store';
    import CreeperLink from "$lib/components/CreeperLink.svelte";
    import { currentSeason, defaultSeason, activeRaga, currentLang, audioBgDimmed, isFullTreeMode, baithakInstruments } from '$lib/stores.js';
    // Track the active node when a user clicks

    export let data;

    // Svelte tracks the real browser dimensions
    // Fixed NaN crash by providing defaults until Svelte binds them
    let containerWidth = 1000;
    let containerHeight = 800;
    let currentLanguage = $currentLang;

    let hierarchyNode = null;
    let root = null;
    let activeNode = null;
    let allNodesFlat = [];
    
    // Gapless Audio System (Web Audio API)
    let audioCtx = null;
    let currentSource = null;
    let currentGain = null;
    let currentAudioUrl = null; // Track URL to prevent re-loading same audio

    const PIZZA_RADIUS = 100;
    // D3 Zoom Variables
    let svgElement; // Binds to the <svg> tag to capture mouse drags
    let zoomTransform = { x: 0, y: 0, k: 1 }; // Holds the current pan/zoom state [cite: 16]

    // Standard D3 Setup
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
        
        // Apply initial transform: 10% up and 10% increased in size
        const initialTransform = d3.zoomIdentity
            .translate(0, -containerHeight * 0.1)
            .scale(1.1);
        d3.select(svgElement).call(zoomBehavior.transform, initialTransform);
    });

    onDestroy(() => {
        audioBgDimmed.set(false);
        stopRagaAudio(true); // Immediate stop
        if (audioCtx) {
            audioCtx.close();
            audioCtx = null;
        }
    });

    function stopRagaAudio(immediate = false) {
        if (!currentSource || !currentGain) return;

        const source = currentSource;
        const gain = currentGain;
        currentSource = null;
        currentGain = null;
        currentAudioUrl = null;

        if (immediate) {
            source.stop();
        } else {
            // Fade out
            const now = audioCtx.currentTime;
            gain.gain.linearRampToValueAtTime(gain.gain.value, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5); // 1.5s fade
            setTimeout(() => {
                try { source.stop(); } catch(e) {}
            }, 1600);
        }
    }

    async function playRagaAudio(url) {
        if (currentAudioUrl === url) return; // Already playing this
        
        stopRagaAudio(true); // Stop previous immediately
        currentAudioUrl = url;

        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        if (audioCtx.state === 'suspended') {
            await audioCtx.resume();
        }

        try {
            console.log(`[Audio] Fetching gapless buffer: ${url}`);
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

            // Create nodes
            const source = audioCtx.createBufferSource();
            const gain = audioCtx.createGain();

            source.buffer = audioBuffer;
            source.loop = true;
            
            // Fading logic
            gain.gain.setValueAtTime(0, audioCtx.currentTime);
            source.connect(gain);
            gain.connect(audioCtx.destination);

            source.start(0);
            gain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 1.5); // 1.5s fade in

            currentSource = source;
            currentGain = gain;
            console.log(`[Audio] Gapless playback started: ${url}`);
        } catch (err) {
            console.error(`[Audio] Failed to load gapless raga: ${url}`, err);
            currentAudioUrl = null;
        }
    }

    // --- REACTIVE AUDIO MODE SWITCHING ---
    // Automatically switch between normal and flute versions of the raga audio
    $: if (hierarchyNode && $activeRaga) {
        const ragaName = $activeRaga.name.toLowerCase();
        const mainRagas = ['bhairav', 'malkauns', 'hindol', 'sri', 'megh', 'dipak'];
        
        if (mainRagas.includes(ragaName)) {
            // Check if we are currently "expanded" (this is tracked by looking at the node in hierarchyNode)
            const node = allNodesFlat.find(n => n.data.name === $activeRaga.name);
            
            if (node && node.children) {
                // Sound only plays if at least one lead instrument (Sitar or Flute) is active
                if (!$baithakInstruments.sitar && !$baithakInstruments.flute) {
                    stopRagaAudio(false);
                } else {
                    const suffix = $baithakInstruments.flute ? 'flute' : '';
                    const audioPath = `${base}/audio/${ragaName}${suffix}-audio.wav`;
                    playRagaAudio(audioPath);
                }
            } else {
                // If the raga node exists but is collapsed, ensure audio is stopped
                stopRagaAudio(false);
            }
        }
    }

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

        if (!$isFullTreeMode) {
            // --- STRICT ANGLE LOCKING ALGORITHM (NORMAL MODE) ---
            root.each(d => {
                if (d.depth === 1) {
                    const i = d.parent.children.indexOf(d);
                    const numSiblings = d.parent.children.length;
                    const fixedX = (i * 2 * Math.PI) / numSiblings;
                    d.offset = fixedX - d.x;
                    d.x = fixedX;
                } else if (d.depth > 1) {
                    let ancestor = d;
                    while (ancestor.depth > 1) { ancestor = ancestor.parent; }
                    d.x += ancestor.offset;
                }
            });
        }

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

        if (!$isFullTreeMode) {
            // --- EXCLUSIVE COLLAPSE LOGIC (NORMAL MODE) ---
            if (d.depth === 1) {
                root.children.forEach(sibling => {
                    if (sibling !== d && sibling.children) {
                        sibling._children = sibling.children;
                        sibling.children = null;
                    }
                });
            }
        }

        let isExpanding = false;
        if (d.children) {
            d._children = d.children;
            d.children = null;
            isExpanding = false;
        } else if (d._children) {
            d.children = d._children;
            d._children = null;
            isExpanding = true;
        }

        // --- RAGA AUDIO TRIGGER ---
        // Note: Playback is now handled reactively by the block above!
        // We just need to handle instrument states here.
        if (d.depth === 1) {
            const ragaName = d.data.name.toLowerCase();
            const mainRagas = ['bhairav', 'malkauns', 'hindol', 'sri', 'megh', 'dipak'];
            
            if (mainRagas.includes(ragaName)) {
                if (isExpanding) {
                    // --- BAITHAK INSTRUMENT SYNC ---
                    const isSri = ragaName === 'sri';
                    baithakInstruments.set({
                        tanpura: true,
                        sitar: true,
                        pakhawaj: isSri,
                        tabla: !isSri,
                        flute: false
                    });
                } else {
                    // --- BAITHAK INSTRUMENT CLEAR ---
                    baithakInstruments.set({
                        tanpura: false,
                        sitar: false,
                        pakhawaj: false,
                        tabla: false,
                        flute: false
                    });
                }
            }
        }

        updateTree();
    }

    // --- THE PIZZA HUB ALGORITHM ---
    // Grabs the 1st level nodes (whether visible or hidden) to track their exact rotation
    $: activeFirstLevel = (root && root.children) ? root.children : (root && root._children ? root._children : []);
        
    // Toggle AudioUI reactive color overlay when root is expanded and ragas are visible.
    $: audioBgDimmed.set(Boolean(root?.children?.length));

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

    function toggleFullTreeMode() {
        $isFullTreeMode = !$isFullTreeMode;

        if ($isFullTreeMode) {
            // EXPAND ALL
            function expandAll(d) {
                if (d._children) {
                    d.children = d._children;
                    d._children = null;
                }
                if (d.children) d.children.forEach(expandAll);
            }
            expandAll(hierarchyNode);
        } else {
            // COLLAPSE ALL
            function collapseAll(d) {
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                }
                if (d._children) d._children.forEach(collapseAll);
            }
            if (hierarchyNode.children) hierarchyNode.children.forEach(collapseAll);
            else if (hierarchyNode._children) hierarchyNode._children.forEach(collapseAll);
        }
        updateTree();
    }
</script>

<div class="tree-container"
     class:animate-tree={$isFullTreeMode}
     bind:clientWidth={containerWidth}
     bind:clientHeight={containerHeight}
     style="--bg-color: var(--{$currentSeason.toLowerCase()}-bg, #f4ece1);"
>

    <!-- FULL TREE TOGGLE BUTTON -->
    <button class="expand-btn" class:active={$isFullTreeMode} on:click={toggleFullTreeMode} aria-label="Toggle Full Tree">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            {#if $isFullTreeMode}
                <!-- Collapse Icon -->
                <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
            {:else}
                <!-- Expand Icon -->
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
            {/if}
        </svg>
    </button>

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
            style="cursor: grab; pointer-events: none;"
    >
        <defs>
            <clipPath id="avatar-clip">
                <circle r="20" cx="0" cy="0" />
            </clipPath>

            {#each backgroundWedges as wedge (wedge.id)}
                <clipPath id="clip-{wedge.id}">
                    <path d={wedge.path} />
                </clipPath>
            {/each}
        </defs>

        {#if root}
            <g transform="translate({zoomTransform.x}, {zoomTransform.y}) scale({zoomTransform.k})">
            <g class="links">
                {#each root.links() as link (link.target.data.name)}
                    <CreeperLink pathData={linkGen(link)} ragaData={link.target.data} />
                    <path d={linkGen(link)} fill="none" stroke="#8b4513" stroke-width="0.5" opacity="1" />
                {/each}
            </g>

            {#if backgroundWedges.length > 0}
                <g class="pizza-root" on:click={() => toggleNode(root)} style="cursor: pointer; pointer-events: auto;">
                    <circle class="pizza-cta-glow-outer" r={PIZZA_RADIUS + 8} />
                    <circle class="pizza-cta-glow-inner" r={PIZZA_RADIUS + 4} />

                    {#each backgroundWedges as wedge, index (wedge.id)}
                        <g clip-path="url(#clip-{wedge.id})">

                            <path d={wedge.path} fill={wedge.color} />

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
                            "
                            />

                        </g>

                        <path d={wedge.path} fill="none" stroke="#d7ccc8" stroke-width="2" />

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
                            style="cursor: pointer; pointer-events: auto;"
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
</div>

<style>
    .tree-container {
        width: 100vw;
        height: 100vh;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: transparent;
        pointer-events: none;
    }

    /* --- EXPAND BTN UI --- */
    .expand-btn {
        position: absolute;
        top: 20px;
        right: 90px; /* Next to the Translate Button */
        z-index: 9999;
        background-color: var(--theme-parchment, #f4ece1);
        border: 2px solid var(--theme-terra, #8b4513);
        border-radius: 50%;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--theme-ink, #3e2723);
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s;
        pointer-events: auto;
    }
    .expand-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 12px rgba(0,0,0,0.3);
    }
    .expand-btn.active {
        background-color: var(--theme-sindoor, #d32f2f);
        color: var(--theme-parchment, #f4ece1);
        border-color: var(--theme-sindoor, #d32f2f);
    }

    /* --- CONDITIONAL ANIMATION SYSTEM --- */
    .animate-tree .pizza-root path {
        transition: d 1.2s cubic-bezier(0.25, 1, 0.5, 1);
    }
    .animate-tree image {
        transition: transform 1.2s cubic-bezier(0.25, 1, 0.5, 1), width 1.2s cubic-bezier(0.25, 1, 0.5, 1), x 1.2s cubic-bezier(0.25, 1, 0.5, 1);
    }
    .animate-tree .links path {
        transition: d 1.2s cubic-bezier(0.25, 1, 0.5, 1);
    }
    .animate-tree .node {
        transition: transform 1.2s cubic-bezier(0.25, 1, 0.5, 1);
    }

    .pizza-root {
    }

    .pizza-root path {
    }

    .pizza-cta-glow-outer,
    .pizza-cta-glow-inner {
        fill: none;
        pointer-events: none;
    }

    .pizza-cta-glow-outer {
        stroke: rgba(255, 168, 41, 0.7);
        stroke-width: 8px;
        filter: blur(5px);
        animation: pizzaGlowPulse 1.8s ease-in-out infinite;
    }

    .pizza-cta-glow-inner {
        stroke: rgba(255, 123, 0, 0.78);
        stroke-width: 4px;
        filter: blur(1px);
        animation: pizzaGlowPulseInner 1.8s ease-in-out infinite;
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

    /* --- BACKGROUND LAYER DISABLED: AudioUI_BG sits underneath --- */
    .tree-container {
        width: 100vw;
        height: 100vh;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        background: transparent;
        animation: none;
        pointer-events: none;
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

    @keyframes pizzaGlowPulse {
        0% { opacity: 0.28; stroke-width: 10px; }
        50% { opacity: 0.78; stroke-width: 16px; }
        100% { opacity: 0.28; stroke-width: 10px; }
    }

    @keyframes pizzaGlowPulseInner {
        0% { opacity: 0.32; }
        50% { opacity: 0.9; }
        100% { opacity: 0.32; }
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

</style>
