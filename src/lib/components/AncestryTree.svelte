<script>
    import { base } from "$app/paths";
    import * as d3 from "d3";
    import { onMount, onDestroy } from "svelte";
    import { fade, scale } from "svelte/transition";
    import { tweened } from "svelte/motion";
    import { cubicOut } from "svelte/easing";
    import { get } from "svelte/store";
    import CreeperLink from "$lib/components/CreeperLink.svelte";
    import {
        currentSeason,
        defaultSeason,
        activeRaga,
        currentLang,
        audioBgDimmed,
        baithakInstruments,
    } from "$lib/stores.js";
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
    let currentBhairavVariant = "flute"; // Randomly picked when Bhairav starts

    // Gapless Audio System (Web Audio API)
    let audioCtx = null;
    let currentSource = null;
    let currentGain = null;
    let currentAudioElement = null; // Track the <audio> tag for streaming
    let currentAudioUrl = null; // Track URL to prevent re-loading same audio

    const PIZZA_RADIUS = 110;
    // D3 Zoom Variables
    let svgElement; // Binds to the <svg> tag to capture mouse drags
    let zoomTransform = { x: 0, y: 0, k: 1 }; // Holds the current pan/zoom state [cite: 16]

    // --- SMOOTH STAGE ROTATION SYSTEM ---
    const globalRotation = tweened(0, {
        duration: 700,
        easing: cubicOut,
    });

    function rotateTo(angleRad) {
        const targetDeg = -((angleRad * 180) / Math.PI);
        const current = get(globalRotation);
        // Shortest path logic: find the smallest delta between current and target
        const delta = ((((targetDeg - current + 180) % 360) + 360) % 360) - 180;
        return globalRotation.set(current + delta);
    }

    function collapseAll(d) {
        if (!d) return;
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapseAll);
            d.children = null;
        } else if (d._children) {
            d._children.forEach(collapseAll);
        }
    }

    function buildHierarchy() {
        hierarchyNode = d3.hierarchy(data).each((d) => {
            // 1. Inherit Season (Already working perfectly!)
            if (!d.data.season && d.parent) {
                d.data.season = d.parent.data.season;
            }

            // 2. MUSICAL INHERITANCE
            if (d.parent && d.parent.data.musicalDNA) {
                // Clone the parent's DNA so we don't accidentally mutate the parent
                let inheritedDNA = JSON.parse(
                    JSON.stringify(d.parent.data.musicalDNA),
                );

                // If this child has specific mutations (like a Ragini flattening a note)
                if (d.data.musicalMutation) {
                    // Capture the notes to flatten, checking for both JSON key variations
                    const notesToFlatten =
                        d.data.musicalMutation.flattenNotes ||
                        d.data.musicalMutation.flatten;

                    if (notesToFlatten) {
                        // Flatten notes in the ascending scale
                        if (inheritedDNA.arohana) {
                            inheritedDNA.arohana = inheritedDNA.arohana.map(
                                (note) =>
                                    notesToFlatten.includes(note)
                                        ? note.replace("4", "b4")
                                        : note,
                            );
                        }

                        // Flatten notes in the descending scale
                        if (inheritedDNA.avarohana) {
                            inheritedDNA.avarohana = inheritedDNA.avarohana.map(
                                (note) =>
                                    notesToFlatten.includes(note)
                                        ? note.replace("4", "b4")
                                        : note,
                            );
                        }
                    }

                    // Example: Override the Vadi (King Note) or Tempo
                    if (d.data.musicalMutation.vadi)
                        inheritedDNA.vadi = d.data.musicalMutation.vadi;
                    if (d.data.musicalMutation.tempo)
                        inheritedDNA.tempo = d.data.musicalMutation.tempo;
                }

                // Save the newly combined DNA into the child's data
                d.data.musicalDNA = inheritedDNA;
            }
        });

        allNodesFlat = hierarchyNode.descendants();
        collapseAll(hierarchyNode);
        updateTree();
    }

    // Standard D3 Setup
    // Standard D3 Setup
    const tree = d3
        .tree()
        .size([2 * Math.PI, 1])
        .separation((a, b) => (a.parent == b.parent ? 1 : 1.5) / a.depth);

    const linkGen = d3
        .linkRadial()
        .angle((d) => d.x)
        .radius((d) => d.y);

    onMount(() => {
        buildHierarchy();

        // Initialize D3 Zoom and Pan
        const zoomBehavior = d3
            .zoom()
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
        if ((!currentSource && !currentAudioElement) || !currentGain) return;

        const source = currentSource;
        const gain = currentGain;
        const audio = currentAudioElement;

        currentSource = null;
        currentGain = null;
        currentAudioElement = null;
        currentAudioUrl = null;

        if (immediate) {
            if (audio) audio.pause();
            if (source && typeof source.stop === "function") source.stop();
        } else {
            // Fade out
            const now = audioCtx.currentTime;
            gain.gain.linearRampToValueAtTime(gain.gain.value, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5); // 1.5s fade
            setTimeout(() => {
                if (audio) audio.pause();
                if (source && typeof source.stop === "function")
                    try {
                        source.stop();
                    } catch (e) {}
            }, 1600);
        }
    }

    let loadingUrl = null;

    async function playRagaAudio(url) {
        if (currentAudioUrl === url || loadingUrl === url) return; // Already playing or loading this

        stopRagaAudio(true); // Stop previous immediately
        loadingUrl = url;
        currentAudioUrl = url; // Mark as current immediately to block other redundant triggers

        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        if (audioCtx.state === "suspended") {
            await audioCtx.resume();
        }

        try {
            console.log(`[Audio] Streaming raga: ${url}`);

            // Create a new Audio element for streaming
            const audio = new Audio(url);
            audio.loop = true;
            audio.crossOrigin = "anonymous"; // Important for Web Audio connection

            // Connect to Web Audio API for gain control
            const source = audioCtx.createMediaElementSource(audio);
            const gain = audioCtx.createGain();

            gain.gain.setValueAtTime(0, audioCtx.currentTime);
            source.connect(gain);
            gain.connect(audioCtx.destination);

            // Play and Fade in
            await audio.play();

            // --- RACE CONDITION CHECK ---
            // If another request came in while we were loading/playing, stop this one!
            if (loadingUrl !== url) {
                audio.pause();
                source.disconnect();
                return;
            }

            gain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 1.5);

            currentAudioElement = audio;
            currentSource = source;
            currentGain = gain;
            loadingUrl = null;

            console.log(`[Audio] Streaming playback started: ${url}`);
        } catch (err) {
            console.error(`[Audio] Failed to stream raga: ${url}`, err);
            currentAudioUrl = null;
            loadingUrl = null;
        }
    }

    // --- REACTIVE AUDIO MODE SWITCHING ---
    // Automatically switch between normal and flute versions of the raga audio
    $: if (hierarchyNode && $activeRaga && $baithakInstruments) {
        const ragaName = $activeRaga.name.toLowerCase();
        const mainRagas = [
            "bhairav",
            "malkauns",
            "hindol",
            "sri",
            "megh",
            "dipak",
        ];

        // Find the "owner" Raga for the current selection (if it's a sub-node)
        let targetRaga = null;
        if (mainRagas.includes(ragaName)) {
            targetRaga = $activeRaga;
        } else {
            // Check if our current selection belongs to a main raga branch
            const node = allNodesFlat.find(
                (n) => n.data.name === $activeRaga.name,
            );
            let ancestor = node;
            while (ancestor && ancestor.depth > 1) ancestor = ancestor.parent;
            if (ancestor && ancestor.depth === 1) targetRaga = ancestor.data;
        }

        if (targetRaga) {
            const name = targetRaga.name.toLowerCase();
            const node = allNodesFlat.find(
                (n) => n.data.name === targetRaga.name,
            );

            if (node && (node.children || node._children)) {
                if (!$baithakInstruments.sitar && !$baithakInstruments.flute) {
                    stopRagaAudio(false);
                } else {
                    let suffix = $baithakInstruments.flute ? "flute" : "";

                    // --- BHAIRAV SPECIAL LOGIC ---
                    if (name === "bhairav") {
                        // 1. Handle random variant suffix
                        if (suffix === "flute") {
                            suffix = currentBhairavVariant;
                        }

                        // 2. Handle Percussion Swap for Flute 2
                        const needsPakhawaj = suffix === "flute2";
                        if (needsPakhawaj && !$baithakInstruments.pakhawaj) {
                            baithakInstruments.update((b) => ({
                                ...b,
                                pakhawaj: true,
                                tabla: false,
                            }));
                        } else if (
                            !needsPakhawaj &&
                            $baithakInstruments.pakhawaj
                        ) {
                            baithakInstruments.update((b) => ({
                                ...b,
                                pakhawaj: false,
                                tabla: true,
                            }));
                        }
                    }

                    playRagaAudio(`${base}/audio/${name}${suffix}-audio.wav`);
                }
            } else {
                stopRagaAudio(false);
            }
        } else {
            // If we are at root or something unrelated, stop audio
            stopRagaAudio(false);
        }
    }

    // React to Window Resizes or Rotation!
    // Whenever the browser changes size, nodes open, or the wheel rotates, redraw the tree to fill the new space
    $: if (
        containerWidth &&
        containerHeight &&
        hierarchyNode &&
        $globalRotation !== undefined
    ) {
        updateTree();
    }
    // Reactive statement: When the language changes, redraw the tree!
    $: if (currentLanguage !== $currentLang) {
        updateTree();
    }

    // Roll for new Bhairav variant when flute is toggled manually
    $: if ($baithakInstruments.flute && $activeRaga?.name === "Bhairav") {
        currentBhairavVariant = Math.random() > 0.5 ? "flute2" : "flute";
    }

    function updateTree() {
        currentLanguage = $currentLang;
        if (!hierarchyNode) return;

        root = tree(hierarchyNode);
        const maxVisibleDepth = root.height;

        // --- STRICT ANGLE LOCKING ALGORITHM ---
        root.each((d) => {
            if (d.depth === 1) {
                const i = d.parent.children.indexOf(d);
                const numSiblings = d.parent.children.length;
                const fixedX = (i * 2 * Math.PI) / numSiblings;
                d.offset = fixedX - d.x;
                d.x = fixedX;
            } else if (d.depth > 1) {
                let ancestor = d;
                while (ancestor.depth > 1) {
                    ancestor = ancestor.parent;
                }
                d.x += ancestor.offset;
            }
        });

        // --- THE TRUE RECTANGULAR BOUNDARY ALGORITHM ---
        // Calculate safe padding so avatars don't clip off the screen
        const safeWidth = containerWidth / 2 - 80;
        const safeHeight = containerHeight / 2 - 80;
        const startDistance = PIZZA_RADIUS + 80; // Where the 1st generation starts (110 + 80 = 190)

        root.each((d) => {
            if (d.depth === 0) {
                d.y = 0;
                return;
            }

            // --- THE TRUE RECTANGULAR BOUNDARY ALGORITHM (SCREEN-SPACE) ---
            // Find the absolute maximum distance a node can travel at its VISUAL angle
            // before it hits the literal edge of the browser window.
            const visualX = d.x + ($globalRotation * Math.PI) / 180;

            let maxR = Math.min(
                safeWidth / (Math.abs(Math.sin(visualX)) || 0.001),
                safeHeight / (Math.abs(Math.cos(visualX)) || 0.001),
            );

            // Enforce a MINIMUM radial gap of 150px per generation so they NEVER overlap radially!
            const requiredMaxR = startDistance + (maxVisibleDepth - 1) * 150;
            maxR = Math.max(maxR, requiredMaxR);

            if (d.depth === 1) {
                // 1st generation ALWAYS sits securely at startDistance. No jumping.
                d.y = startDistance;
            } else {
                // Subsequent generations are pushed out into the available/forced space
                d.y =
                    startDistance +
                    (maxR - startDistance) *
                        ((d.depth - 1) / (maxVisibleDepth - 1));
            }
        });

        root = root; // Trigger Svelte Reactivity
    }

    function toggleNode(d) {
        if (!d) return;

        // --- 1. Initial State & Store Updates ---
        const isExpanding = !d.children && !!d._children;
        const isCollapsing = !!d.children;

        $activeRaga = d.data;

        // Note: Audio trigger is now handled in Section 3 to ensure instrument sync is applied first!
        if (d.depth === 0) {
            $currentSeason = "Vasanta";
            rotateTo(0);
        } else {
            $currentSeason = d.data.season;
        }

        // --- 2. Exclusive Logic (Immediate Collapse of others) ---
        if (d.depth === 1) {
            root.children?.forEach((sibling) => {
                if (sibling !== d && sibling.children) {
                    sibling._children = sibling.children;
                    sibling.children = null;
                }
            });
        }

        // --- 3. Instrument Sync (Immediate Feedback) ---
        if (d.depth === 1) {
            const ragaName = d.data.name.toLowerCase();
            const mainRagas = [
                "bhairav",
                "malkauns",
                "hindol",
                "sri",
                "megh",
                "dipak",
            ];

            if (mainRagas.includes(ragaName)) {
                if (isExpanding) {
                    const isSri = ragaName === "sri";

                    // --- FORCE RESET TO SITAR MODE ---
                    // Whenever a raga is expanded, we ALWAYS want Sitar + Tabla/Pakhawaj first.
                    baithakInstruments.set({
                        tanpura: true,
                        sitar: true,
                        pakhawaj: isSri,
                        tabla: !isSri,
                        flute: false,
                    });

                    // Trigger Sitar version immediately
                    playRagaAudio(`${base}/audio/${ragaName}-audio.wav`);
                } else {
                    baithakInstruments.set({
                        tanpura: false,
                        sitar: false,
                        pakhawaj: false,
                        tabla: false,
                        flute: false,
                    });
                }
            }
        }

        // --- 4. Choreographed Animation Flow ---
        if (d.depth === 1 && isExpanding) {
            // RAGA LEVEL: Rotate first, blossom later
            rotateTo(d.x)
                .then(() => {
                    // Safety check: ensure this is still the active raga
                    if ($activeRaga && $activeRaga.name === d.data.name) {
                        d.children = d._children;
                        d._children = null;
                        updateTree();
                    }
                })
                .catch(() => {});
        } else {
            // COLLAPSE or SUB-LEVEL: Immediate change for snappiness
            if (d.children) {
                d._children = d.children;
                d.children = null;
                if (d.depth === 1) rotateTo(0);
            } else if (d._children) {
                d.children = d._children;
                d._children = null;
            }
            updateTree();
        }
    }

    // --- THE PIZZA HUB ALGORITHM ---
    // Grabs the 1st level nodes (whether visible or hidden) to track their exact rotation
    $: activeFirstLevel =
        root && root.children
            ? root.children
            : root && root._children
              ? root._children
              : [];

    // Toggle AudioUI reactive color overlay when root is expanded and ragas are visible.
    $: audioBgDimmed.set(Boolean(root?.children?.length));

    // 1. Define the specific image for each deity/season
    const seasonImages = {
        Vasanta: `${base}/images/placeholder_hindol.png`,
        Grishma: `${base}/images/placeholder_dipak.png`,
        Varsha: `${base}/images/placeholder_megh.png`,
        Sharad: `${base}/images/placeholder_sri.png`,
        Hemant: `${base}/images/placeholder_malkauns.png`,
        Shishira: `${base}/images/placeholder_bhairav.png`,
    };

    $: backgroundWedges = activeFirstLevel.map((child, i, arr) => {
        const getAngle = (node, index) =>
            node.x !== undefined ? node.x : (index * (Math.PI * 2)) / 6;

        const prev = arr[i === 0 ? arr.length - 1 : i - 1];
        const next = arr[i === arr.length - 1 ? 0 : i + 1];

        const cx = getAngle(child, i);
        const px = getAngle(prev, i === 0 ? arr.length - 1 : i - 1);
        const nx = getAngle(next, i === arr.length - 1 ? 0 : i + 1);

        const startAngle =
            i === 0 ? (cx + px - 2 * Math.PI) / 2 : (cx + px) / 2;
        const endAngle =
            i === arr.length - 1 ? (cx + nx + 2 * Math.PI) / 2 : (cx + nx) / 2;

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
            endAngle: endAngle,
        });

        return {
            id: child.data.name,
            season: child.data.season,
            path: arcPath,
            rotation: rotationDegrees,

            // Pass the calculated width to the HTML
            imageWidth: dynamicWidth,

            color: `var(--${child.data.season.toLowerCase()}-bg})` || "#ffffff",
        };
    });

    // --- THE TRANSLATION HARVESTER (Loop-Proof) ---
    let harvestTimer; // Keeps track of the timeout
    // Scrapes the invisible DOM nodes after Google translates them
    $: if ($currentLang) {
        // Cancel any pending harvests if they click quickly
        clearTimeout(harvestTimer);

        if ($currentLang === "en") {
            updateTree();
        } else {
            harvestTimer = setTimeout(() => {
                allNodesFlat.forEach((node) => {
                    if (!node.data.i18n) node.data.i18n = {};
                    if (!node.data.i18n[$currentLang])
                        node.data.i18n[$currentLang] = {};

                    const nameEl = document.getElementById(
                        `trans-name-${node.data.name}`,
                    );
                    if (nameEl)
                        node.data.i18n[$currentLang].name = nameEl.innerText;

                    const descEl = document.getElementById(
                        `trans-desc-${node.data.name}`,
                    );
                    if (descEl && node.data.description) {
                        node.data.i18n[$currentLang].description =
                            descEl.innerText;
                    }
                });

                updateTree();

                // STEALTH UPDATE: Update activeRaga without triggering Svelte's $ reactive loop!
                const currentActive = get(activeRaga);
                if (currentActive) {
                    activeRaga.set({ ...currentActive });
                }
            }, 1500);
        }
    }

    // --- VISUAL HELPERS ---
    function getFloraSymbol(node) {
        if (node.depth === 0) return null; // Root is hidden/center

        // Depth 1: Main Ragas (Big Flowers)
        if (node.depth === 1) {
            return "lotus";
        }

        // Depth 2+: Raginis / Ragaputras (Buds and Leaves)
        const symbols = ["bud", "leaf", "double-leafs"];
        // Use a simple hash of the name to keep it consistent
        const index = node.data.name.length % symbols.length;
        return symbols[index];
    }

    function getRagaPalette(node) {
        const name = node.data.name.toLowerCase().trim();

        const palette = {
            bhairav: "#d8d8d4",
            hindol: "#f06ab6",
            dipak: "#f6b31f",
            megh: "#4aa3ff",
            sri: "#f1b768",
            malkauns: "#b71f34",
        };

        return palette[name] || null;
    }

    // --- ORGANIC STEM ALIGNMENT ---
    // Different floral assets have stems starting at different internal coordinates.
    // This ensures every flower "plugs into" the vine perfectly.
    function getFloraOffset(node) {
        const name = node.data.name.toLowerCase().trim();

        // Default for sub-nodes (Buds/Leaves)
        // -5, -10 matches the default vine ornament attachment
        let x = -5;
        let y = -10;

        // --- PRIMARY RAGAS PRECISION ALIGNMENT ---
        // Since we are now using local coordinates (aligned to the stem),
        // 0,0 naturally snaps the flower directly to the tip!

        if (name.includes("hindol")) {
            x = 0;
            y = 0;
        }

        if (name.includes("bhairav")) {
            x = 0;
            y = 0;
        }

        if (name.includes("dipak")) {
            x = 0;
            y = 0;
        }

        if (name.includes("sri")) {
            x = 0;
            y = 0;
        }

        if (name.includes("megh")) {
            x = 0;
            y = 0;
        }

        if (name.includes("malkauns")) {
            x = 0;
            y = 0;
        }

        return { x, y };
    }

    function normalizeAngle(angle) {
        const fullTurn = Math.PI * 2;
        return ((angle % fullTurn) + fullTurn) % fullTurn;
    }

    function getTextOffset(node) {
        if (node.depth !== 1) {
            return {
                radialDistance: 0,
                x: 0,
                y: 0,
                anchor: "middle",
            };
        }

        const visibleAngle = normalizeAngle(
            node.x + (get(globalRotation) * Math.PI) / 180,
        );
        const horizontal = Math.sin(visibleAngle);
        const isNearVertical = Math.abs(horizontal) < 0.28;

        return {
            radialDistance: 78,
            x: isNearVertical ? 0 : horizontal > 0 ? 12 : -12,
            y: 0,
            anchor: isNearVertical
                ? "middle"
                : horizontal > 0
                  ? "start"
                  : "end",
        };
    }
</script>

<div
    class="tree-container"
    bind:clientWidth={containerWidth}
    bind:clientHeight={containerHeight}
    style="--bg-color: var(--{$currentSeason.toLowerCase()}-bg, #f4ece1);"
>
    <div
        class="translation-matrix"
        style="position: absolute; opacity: 0; pointer-events: none; z-index: -1;"
        aria-hidden="true"
    >
        {#each allNodesFlat as node}
            <span id="trans-name-{node.data.name}">{node.data.name}</span>
            {#if node.data.description}
                <span id="trans-desc-{node.data.name}"
                    >{node.data.description}</span
                >
            {/if}
        {/each}
    </div>

    <svg
        bind:this={svgElement}
        width="100%"
        height="100%"
        viewBox="-{containerWidth / 2} -{containerHeight /
            2} {containerWidth} {containerHeight}"
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
            <g
                transform="translate({zoomTransform.x}, {zoomTransform.y}) scale({zoomTransform.k}) rotate({$globalRotation})"
            >
                <g class="links">
                    {#each root.links() as link (link.target.data.name)}
                        <CreeperLink
                            pathData={linkGen(link)}
                            ragaData={link.target.data}
                            terminalOffset={getFloraOffset(link.target)}
                            terminalSymbol={getFloraSymbol(link.target) ||
                                "lotus"}
                            showTerminal={link.target.depth !== 1}
                            accentColor={link.target.depth === 1
                                ? getRagaPalette(link.target)
                                : null}
                        />
                        <path
                            d={linkGen(link)}
                            fill="none"
                            stroke="#8b4513"
                            stroke-width="0.5"
                            opacity="1"
                        />
                    {/each}
                </g>

                {#if backgroundWedges.length > 0}
                    <g
                        class="pizza-root"
                        on:click={() => toggleNode(root)}
                        style="cursor: pointer; pointer-events: auto;"
                    >
                        <circle
                            class="pizza-cta-glow-outer"
                            r={PIZZA_RADIUS + 8}
                        />
                        <circle
                            class="pizza-cta-glow-inner"
                            r={PIZZA_RADIUS + 4}
                        />

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

                            <path
                                d={wedge.path}
                                fill="none"
                                stroke="#d7ccc8"
                                stroke-width="2"
                            />
                        {/each}

                        <circle
                            r={PIZZA_RADIUS}
                            fill="none"
                            stroke="#8b4513"
                            stroke-width="3"
                        />
                    </g>
                {/if}

                {#each root.descendants() as node (node.data.name)}
                    {#if node.depth > 0}
                        {@const symbol = getFloraSymbol(node)}
                        {@const offset = getTextOffset(node)}
                        {@const floraOffset = getFloraOffset(node)}
                        {@const accentColor = getRagaPalette(node)}
                        <g
                            class="node {node._children ? 'has-children' : ''}"
                            transform="rotate({(node.x * 180) / Math.PI -
                                90}) translate({node.y},0)"
                            on:click={() => toggleNode(node)}
                            style="cursor: pointer; pointer-events: auto;"
                            in:scale|local={{
                                start: 0,
                                duration: 500,
                                delay: 100,
                            }}
                            out:fade|local={{ duration: 300 }}
                        >
                            <!-- 
                            Hitbox: Clickable area for the raga node.
                         -->
                            <circle
                                r="45"
                                fill="transparent"
                                style="pointer-events: auto;"
                            />

                            {#if node.depth === 1}
                                <g
                                    class="main-raga-flora raga-accent"
                                    style={`--raga-vine: ${accentColor}; --raga-bloom: ${accentColor};`}
                                    transform="rotate(90)"
                                >
                                    <use
                                        href="#{symbol}"
                                        x={floraOffset.x}
                                        y={floraOffset.y}
                                        class="vine node-flora symbol-{symbol}"
                                        class:active={$activeRaga &&
                                            $activeRaga.name === node.data.name}
                                        style={`pointer-events: auto; fill: ${accentColor} !important;`}
                                    />
                                </g>
                            {/if}

                            <g transform="translate({offset.radialDistance},0)">
                                <!-- Node Label: Counter-rotated to stay upright (horizontal) on the screen -->
                                <g
                                    transform="rotate({90 -
                                        (node.x * 180) / Math.PI -
                                        $globalRotation})"
                                >
                                    <text
                                        dy="0.35em"
                                        x={offset.x}
                                        y={offset.y}
                                        text-anchor={offset.anchor}
                                        class="node-text"
                                        class:interactive={node.depth === 1}
                                        class:active={$activeRaga &&
                                            $activeRaga.name === node.data.name}
                                        style="font-family: var(--font-bharvati), serif; font-size: 1.4rem; font-weight: normal; pointer-events: auto; fill: #000000; text-shadow: 0 0 10px white, 0 0 5px white;"
                                    >
                                        {node.data.i18n?.[$currentLang]?.name ||
                                            node.data.name}
                                    </text>
                                </g>
                            </g>
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

    .node-text {
        fill: var(--text-color);
        opacity: 0.8;
        font-weight: 500;
        text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
        transition: all 0.3s ease;
    }

    .node:hover .node-text,
    .node-text.active {
        opacity: 1;
        font-weight: 600;
        scale: 1.15;
    }

    .node-flora {
        transform-box: fill-box;
        transform-origin: bottom center;
        transform: translate(-50%, -100%) scale(0.5);
        opacity: 0.96;
        transition:
            transform 0.3s ease,
            opacity 0.3s ease,
            filter 0.3s ease;
        filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.14));
    }

    .node:hover .node-flora,
    .node-flora.active {
        opacity: 1;
        transform: translate(-50%, -100%) scale(0.56);
        filter: drop-shadow(0 5px 10px rgba(0, 0, 0, 0.22));
    }

    .node:hover .node-flora.symbol-lotus,
    .node-flora.symbol-lotus.active {
        --steps: 5;
    }

    .main-raga-flora {
        pointer-events: auto;
    }

    .node-text.interactive {
        cursor: pointer;
    }

    @keyframes spin {
        100% {
            transform: rotate(360deg);
        }
    }

    @keyframes pizzaGlowPulse {
        0% {
            opacity: 0.28;
            stroke-width: 10px;
        }
        50% {
            opacity: 0.78;
            stroke-width: 16px;
        }
        100% {
            opacity: 0.28;
            stroke-width: 10px;
        }
    }

    @keyframes pizzaGlowPulseInner {
        0% {
            opacity: 0.32;
        }
        50% {
            opacity: 0.9;
        }
        100% {
            opacity: 0.32;
        }
    }
</style>
