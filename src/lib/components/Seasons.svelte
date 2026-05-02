<script>
    import { base } from "$app/paths";
    import seasonsData from "$lib/data/seasons.json";
    import { currentLang } from "$lib/stores.js";
    import { harvest } from "$lib/utils/translator.js";

    let { isLoaded, isPortrait, ragaData = [] } = $props();

    const R = 90;
    const SLIDE = 120;

    let leftRotation = $state(0);
    let rightRotation = $state(-180);
    let harvestedLabels = $state({});

    $effect(() => {
        if (isLoaded) {
            leftRotation = 90;
            rightRotation = -90;
        }
    });

    // 1. DATA FIX: Filter data specifically for each wing
    const leftSeasons = seasonsData.filter((s) => s.wing === "left");
    const rightSeasons = seasonsData.filter((s) => s.wing === "right");

    // 2. TRANSLATION FIX: Harvests text reactively
    $effect(() => {
        const lang = $currentLang;
        seasonsData.forEach(async (s) => {
            const result = await harvest(s.name);
            harvestedLabels[s.name] = result;
        });
    });

    function getImageUrl(seasonName) {
        const raga = ragaData.find((r) => r.season === seasonName);
        return (raga && raga.image?.[0]?.url) || `${base}/avatar.png`;
    }

    // --- MATH HELPERS (Restored getSlicePath) ---

    function getSlicePath(startAngle, endAngle) {
        const s = (startAngle - 90) * (Math.PI / 180);
        const e = (endAngle - 90) * (Math.PI / 180);
        return `M 0 0 L ${R * Math.cos(s)} ${R * Math.sin(s)} A ${R} ${R} 0 0 1 ${R * Math.cos(e)} ${R * Math.sin(e)} Z`;
    }

    function getArcPath(start, end, radius) {
        const s = (start - 90) * (Math.PI / 180);
        const e = (end - 90) * (Math.PI / 180);
        return `M ${radius * Math.cos(s)} ${radius * Math.sin(s)} A ${radius} ${radius} 0 0 1 ${radius * Math.cos(e)} ${radius * Math.sin(e)}`;
    }

    function getSymbolPos(start, end, radius = 75) {
        const mid = (start + end) / 2 - 90;
        const rad = mid * (Math.PI / 180);
        return { x: radius * Math.cos(rad), y: radius * Math.sin(rad) };
    }

    // 3. INTERACTIVE LOGIC
    function handleIconClick(season) {
        // This will now log the detailed poetic description from the JSON above
        console.log(`Season: ${season.name}`);
        console.log(`Symbolism: ${season.symbol}`);
        console.log(`Description: ${season.description}`);
    }

    function startSpin(e, side) {
        const startX = e.clientX;
        const startY = e.clientY;
        const initialRotation = side === "left" ? leftRotation : rightRotation;

        function onPointerMove(moveEvent) {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;
            const sensitivity = 0.5;
            if (side === "left")
                leftRotation =
                    initialRotation + (deltaY + deltaX) * sensitivity;
            else
                rightRotation =
                    initialRotation + (deltaY - deltaX) * sensitivity;
        }

        function onPointerUp() {
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
        }

        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
    }
</script>

<defs>
    {#each seasonsData as season}
        <path
            id="text-arc-{season.name}"
            d={getArcPath(season.start, season.end, 92)}
        />
        <clipPath id="clip-{season.name}"
            ><path d={getSlicePath(season.start, season.end)} /></clipPath
        >
    {/each}
</defs>

{#snippet wingTemplate(side, seasonsList, currentRotation, slideDirection)}
    <g
        class="wing"
        onpointerdown={(e) => startSpin(e, side)}
        style="transform: {isLoaded
            ? isPortrait
                ? `translateY(${slideDirection * SLIDE}px)`
                : `translateX(${slideDirection * SLIDE}px)`
            : 'translate(0px, 0px)'} rotate({currentRotation}deg);"
    >
        <circle
            cx="0"
            cy="0"
            r="100"
            fill="var(--theme-parchment)"
            stroke="var(--theme-terra)"
            stroke-width="3"
        />

        {#each seasonsList as season}
            <g clip-path="url(#clip-{season.name})">
                <image
                    href={getImageUrl(season.name)}
                    x="-100"
                    y="-100"
                    width="200"
                    height="200"
                    preserveAspectRatio="xMidYMid slice"
                    transform="rotate({(season.start + season.end) / 2})"
                />
                <path
                    class="season-overlay-path"
                    d={getSlicePath(season.start, season.end)}
                    fill={season.color}
                    opacity="0.6"
                />
            </g>

            <text font-size="7" font-weight="bold" letter-spacing="1">
                <textPath
                    href="#text-arc-{season.name}"
                    startOffset="50%"
                    text-anchor="middle"
                    fill="var(--theme-terra)"
                >
                    {(
                        harvestedLabels[season.name] || season.name
                    ).toUpperCase()}
                </textPath>
            </text>

            {@const pos = getSymbolPos(season.start, season.end)}
            <g
                transform="translate({pos.x}, {pos.y})"
                onclick={(e) => {
                    e.stopPropagation();
                    handleIconClick(season);
                }}
                style="cursor: pointer; pointer-events: auto;"
            >
                <circle
                    r="9"
                    class="icon-circle"
                    fill="var(--theme-parchment)"
                    opacity="0.8"
                    stroke="none"
                    stroke-width="0"
                />
                <text
                    class="icon-in-circle"
                    dy=".3em"
                    text-anchor="middle"
                    font-size="6"
                    fill="var(--theme-ink)"
                >
                    {season.icon}
                </text>
            </g>
        {/each}

        <circle
            cx="0"
            cy="0"
            r="90"
            fill="none"
            stroke="var(--theme-terra)"
            stroke-width="1"
        />
        <circle
            cx="0"
            cy="0"
            r="20"
            fill="var(--theme-parchment)"
            stroke="var(--theme-terra)"
            stroke-width="1"
        />
        <use
            width="40"
            height="40"
            transform="translate(-20, -20)"
            fill="var(--theme-terra)"
            xlink:href="#mandala"
        />
    </g>
{/snippet}

{@render wingTemplate("left", leftSeasons, leftRotation, -1)}
{@render wingTemplate("right", rightSeasons, rightRotation, 1)}

<style>
    .wing {
        transition: transform 1.2s cubic-bezier(0.25, 1, 0.5, 1);
        cursor: grab;
        stroke: var(--active-accent-color);
        stroke-width: 3px;
        user-select: none;
        -webkit-user-select: none;
    }
    .wing:active {
        cursor: grabbing;
    }
    .icon-circle:hover {
        opacity: 0.7;
    }
    .icon-in-circle {
        pointer-events: none;
    }
    .season-overlay-path {
        transition: opacity 0.5s ease;
    }
    .season-overlay-path:hover {
        opacity: 0.3;
    }
</style>
