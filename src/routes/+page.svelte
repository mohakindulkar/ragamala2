<script>
    import { base } from '$app/paths';
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import { goto } from '$app/navigation';
    import Clock from '$lib/components/Clock.svelte';
    import Seasons from '$lib/components/Seasons.svelte';
    import dipakData from '$lib/data/dipak.json';
    import SVGDefs from '$lib/components/SVGDefs.svelte';

    let isLoaded = $state(false);
    let innerWidth = $state(1000);
    let innerHeight = $state(500);
    let isNavigating = $state(false);

    let isPortrait = $derived(innerWidth < innerHeight);
    let dynamicViewBox = $derived(isPortrait ? "-135 -285 270 570" : "-230 -105 460 210");

    onMount(() => { setTimeout(() => isLoaded = true, 200); });

    function handleEnterTree() {
        isNavigating = true;
        setTimeout(() => { goto(`${ base }/family-tree`); }, 800);
    }
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<SVGDefs />

<div class="calendar-stage" class:zoom-dive={isNavigating} in:fade={{ duration: 800 }}>
    <svg xmlns="http://www.w3.org/2000/svg"
         xmlns:xlink="http://www.w3.org/1999/xlink"
         viewBox={dynamicViewBox} class="ragamala-system-svg"
         style="font-family: var(--font-bharvati, Bharvati, serif);">
        <Seasons {isLoaded} {isPortrait} ragaData={[dipakData]} />
        <g transform="scale(0.85)">
            <Clock onHoleClick={handleEnterTree}>
                <!-- Old pointer removed so it doesn't overlap -->
            </Clock>
        </g>
    </svg>
</div>

<style>
    .calendar-stage {
        position: relative;
        width: 100%; height: 100%;
        display: flex; justify-content: center; align-items: center;
        overflow: hidden;
        transition: transform 0.8s cubic-bezier(0.7, 0, 0.3, 1), opacity 0.8s;
    }

    .ragamala-system-svg {
        width: 100%; height: 100%;
        max-width: 100%; max-height: 100%;
    }

    .zoom-dive { transform: scale(5); opacity: 0; }
</style>
