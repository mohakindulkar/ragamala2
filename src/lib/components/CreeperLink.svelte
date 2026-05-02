<script>
    import { tick } from 'svelte'; // Import tick to wait for DOM updates
    export let pathData;
    export let ragaData;

    let pathEl;
    let ornaments = [];
    const spacing = 35;

    const seasonalPools = {
        'Vasanta': ['leaf', 'double-leafs', 'bud', 'flower', 'mango-blossom', 'branch-l', 'branch-r'],
        'Grishma': ['bud', 'wiggle', 'swiggle', 'leaf'],
        'Varsha': ['leaf', 'double-leafs', 'lotus', 'swiggle', 'branch-l'],
        'Sharad': ['leaf', 'mango-blossom', 'bud', 'branch-r'],
        'Hemant': ['leaf', 'wiggle', 'branch-l'],
        'Shishira': ['wiggle', 'swiggle']
    };

    function shuffleArray(array) {
        let shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // 1. REACTIVE STATEMENT: This replaces onMount.
    // It runs automatically every single time pathData changes!
    $: if (pathData && pathEl) {
        drawCreepers();
    }

    async function drawCreepers() {
        // 2. Wait for Svelte to apply the new pathData to the invisible path element
        await tick();

        const length = pathEl.getTotalLength();
        if (length === 0) return;

        const count = Math.floor(length / spacing);
        const basePool = seasonalPools[ragaData.season] || ['leaf', 'bud', 'swiggle'];
        const branchPool = shuffleArray(basePool);

        // 3. Generate new ornaments
        ornaments = Array.from({ length: count }, (_, i) => {
            const isLast = i === count - 1;
            const dist = isLast ? length - 1 : i * spacing + (spacing / 2);

            const point = pathEl.getPointAtLength(dist);
            const nextPoint = pathEl.getPointAtLength(Math.min(dist + 1, length));

            const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);

            return {
                id: Math.random().toString(36).slice(2),
                x: point.x,
                y: point.y,
                angle: angle,
                type: isLast ? 'lotus' : branchPool[i % branchPool.length],
                flip: Math.random() > 0.5 // randomly set true or false
            };
        });
    }
</script>

<g class="creeper-branch {ragaData.season}">
    <path bind:this={pathEl} d={pathData} fill="none" stroke="transparent" />

    {#key pathData}
        <path d={pathData} class="vine-line" />

        {#each ornaments as orni, i (orni.id)}
            <g transform="translate({orni.x}, {orni.y}) rotate({orni.angle + 90})">
                <use
                        href="#{orni.type}"
                        class="vine creeper-item symbol-{orni.type}"
                        x="0" y="0"
                        style="
                        --scale-factor: {orni.type === 'lotus' ? 0.5 : 0.3};
                        --flip-factor: {(orni.type === 'lotus') ? 1 : (orni.flip ? -1 : 1) };
                        /* Distribute the pop-in delay across the 5 second line draw */
                        animation-delay: {(i / ornaments.length) * 5}s;
                    "
                />
            </g>
        {/each}
    {/key}
</g>

<style>
    @keyframes dash {
        to {
            stroke-dashoffset: 0;
        }
    }
    .creeper-item {
        fill: var(--current-vine);
        transform-box: fill-box;
        transform-origin: bottom center;
        /* Set base state using the calculated flip */
        transform: translate(-50%, -100%) scaleX(calc(var(--scale-factor) * var(--flip-factor))) scaleY(var(--scale-factor));

        opacity: 0;
        animation: popIn 0.5s ease-out forwards;
    }

    @keyframes popIn {
        0% {
            opacity: 0;
            /* Start from zero scale */
            transform: translate(-50%, -100%) scaleX(0) scaleY(0);
        }
        100% {
            opacity: 1;
            /* Expand to full scale, applying the flip on the X-axis */
            transform: translate(-50%, -100%) scaleX(calc(var(--scale-factor) * var(--flip-factor))) scaleY(var(--scale-factor));
        }
    }

    .creeper-branch {
        stroke-width: 3px;
        stroke-opacity: 0.5;
        fill: none;
    }
    .creeper-branch g:nth-child(2n) .creeper-item:not(.symbol-lotus) {
        /* scaleX mirrors the element horizontally when --flip-factor is -1 */
        /*transform: translate(-50%, -100%) scaleX(-1) scale(var(--scale-factor));*/
        /*transform: translate(-50%, -100%) scaleX(var(--flip-factor)) scale(var(--scale-factor));*/
        /*transform: translate(-50%, -100%) scaleX(-1) scale(var(--scale-factor));*/
    }

    /* CreeperLink.svelte */
    /* Spring: Full bloom */
    .creeper-branch.Vasanta {
        --current-vine: var(--vasanta-vine);
        --current-bloom: var(--vasanta-bloom);
        --max-steps: 5;
    }
    /* Summer: Full bloom */
    .creeper-branch.Grishma {
        --current-vine: var(--grishma-vine);
        --current-bloom: var(--grishma-bloom);
        --max-steps: 5;
    }
    /* Monsoon: Heavy bloom */
    .creeper-branch.Varsha {
        --current-vine: var(--varsha-vine);
        --current-bloom: var(--varsha-bloom);
        --max-steps: 4;
    }
    /* Autumn: Partial bloom */
    .creeper-branch.Sharad {
        --current-vine: var(--sharad-vine);
        --current-bloom: var(--sharad-bloom);
        --max-steps: 3;
    }
    /* Pre-Winter: Fading bloom */
    .creeper-branch.Hemant {
        --current-vine: var(--hemant-vine);
        --current-bloom: var(--hemant-bloom);
        --max-steps: 2;
    }
    /* Winter: Tight bud / minimal bloom */
    .creeper-branch.Shishira {
        --current-vine: var(--shishira-vine);
        --current-bloom: var(--shishira-bloom);
        --max-steps: 1;
    }

    .vine-line {
        fill: none;
        stroke: var(--current-vine);
        stroke-dasharray: 1000;
        stroke-dashoffset: 1000;
        animation: dash 5s linear forwards;
    }

    .symbol-lotus, .symbol-flower .bud, .symbol-bud {
        fill: var(--current-bloom);
    }

    .symbol-lotus .stem {
        fill: var(--current-vine);
    }

    /* Lotus Animation Steps (0 to 5) */
    .symbol-lotus {
        --steps: 0;
        transition: --steps 0.8s ease;
    }

    .creeper-branch:hover .symbol-lotus {
        /* On hover, transition up to the season's maximum limit */
        --steps: var(--max-steps, 5);
    }

    /* Default (Spring/Summer) - All petals visible */
     .creeper-branch {
         --show-p5: block;
         --show-p4: block;
         --show-p3: block;
         --show-p2: block;
     }

    /* Monsoon: Hide step 5 */
    .creeper-branch.Varsha {
        --show-p5: none;
    }

    /* Autumn: Hide steps 4 and 5 */
    .creeper-branch.Sharad {
        --show-p5: none;
        --show-p4: none;
    }

    /* Pre-Winter: Hide steps 3, 4, and 5 */
    .creeper-branch.Hemant {
        --show-p5: none;
        --show-p4: none;
        --show-p3: none;
    }

    /* Winter: Hide everything except the bud (step 1) */
    .creeper-branch.Shishira {
        --show-p5: none;
        --show-p4: none;
        --show-p3: none;
        --show-p2: none;
    }

</style>