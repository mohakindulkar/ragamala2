<script>
    import { slide } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    // Props we can pass into this component
    export let position = 'bottom-left'; // 'bottom-left' or 'bottom-right'
    export let mainIcon = '✨';
    export let isExpanded = false;

    // Mini button props
    export let showMiniBtn = false;
    export let miniIcon = '🛑';

    function handleMiniClick() {
        dispatch('miniAction');
    }
</script>

<div class="corner-wrapper {position}">

    {#if isExpanded}
        <div class="cartouche-panel" transition:slide={{ duration: 300 }}>
            <slot />
        </div>
    {/if}

    <div class="functional-corner">
        <button class="corner-toggle-btn" on:click={() => isExpanded = !isExpanded}>
            <span class="icon">{mainIcon}</span>
        </button>

        {#if showMiniBtn && !isExpanded}
            <button class="mini-control-btn" on:click={handleMiniClick}>
                {miniIcon}
            </button>
        {/if}
    </div>

</div>

<style>
    /* 1. THE SHARED WRAPPER */
    .corner-wrapper {
        position: fixed;
        bottom: 0;
        z-index: 1000;
        pointer-events: none;
        /* REMOVED flexbox so the elements don't push each other! */
    }

    .corner-wrapper.bottom-left {
        left: 0;
    }

    .corner-wrapper.bottom-right {
        right: 0;
    }

    /* 2. THE SHARED CORNER UI (The Anchor) */
    .functional-corner {
        position: absolute; /* Firmly anchors it to the wrapper */
        bottom: 0;
        pointer-events: auto;
        min-width: 60px;
        height: 60px;
        background-color: var(--accent-color);
        /*background-image: var(--corner-ornament);*/
        background-size: 130%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 0 10px;
    }

    .bottom-left .functional-corner {
        left: 0;
        background-position: left bottom;
        border-top-right-radius: 8px;
        box-shadow: 2px -2px 10px rgba(0,0,0,0.15);
    }

    .bottom-right .functional-corner {
        right: 0;
        background-position: right bottom;
        border-top-left-radius: 8px;
        box-shadow: -2px -2px 10px rgba(0,0,0,0.15);
        flex-direction: row-reverse;
    }

    /* 3. THE BUTTONS */
    .corner-toggle-btn, .mini-control-btn {
        background: rgba(244, 236, 225, 0.9);
        border: 2px solid var(--theme-terra);
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 1.2rem;
        transition: transform 0.2s;
    }

    .corner-toggle-btn:hover, .mini-control-btn:hover {
        transform: scale(1.1);
    }

    /* 4. THE SHARED PANEL STYLES (The Slide) */
    .cartouche-panel {
        position: absolute;
        bottom: 60px; /* Pins the bottom of the panel perfectly to the top of the 60px corner */
        pointer-events: auto;
        /*background-color: var(--theme-parchment-dark, #e8dcc7);*/
        border: 2px solid var(--theme-terra, #8b4513);
        box-shadow: 0 4px 15px rgba(0,0,0,0.25);
        backdrop-filter: blur(80px) opacity(0.8);
        -webkit-backdrop-filter: blur(10px) opacity(0.5);

        /* This prevents the border from looking glitchy when Svelte shrinks the height to 0 */
        overflow: hidden;
    }

    .bottom-left .cartouche-panel {
        left: 10px; /* Slight offset from the absolute left edge of the screen */
        border-radius: 8px 8px 8px 0;
    }

    .bottom-right .cartouche-panel {
        right: 10px; /* Slight offset from the absolute right edge of the screen */
        border-radius: 8px 8px 0 8px;
    }
</style>