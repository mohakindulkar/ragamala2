<script>
    import { base } from '$app/paths';
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';
    import timeData from '$lib/data/time.json';
    import { currentLang } from '$lib/stores.js';

    let { onHoleClick } = $props();

    let timeRotation = $state(0);
    let currentHour = $state(new Date().getHours());
    let clockInterval;
    let translated = $state({ name: '', verse: '' });

    // Reactively calculates the correct verse
    let activeTime = $derived(
        timeData.find(t => currentHour >= t.startHour && currentHour < t.endHour) || timeData[0]
    );

    // THE HARVESTER: Runs whenever activeTime or language changes
    $effect(() => {
        const trigger = $currentLang;
        async function updateTranslation() {
            translated.name = await harvest(activeTime.name);
            translated.verse = await harvest(activeTime.verse);
        }
        updateTranslation();
    });

    onMount(() => {
        if (!browser) return;
        function updateClock() {
            const now = new Date();
            timeRotation = 180 + (now.getHours() * 15) + (now.getMinutes() * 0.25);
            currentHour = now.getHours(); // Syncs the text with the pointer
        }
        updateClock();
        clockInterval = setInterval(updateClock, 60000);
    });

    onDestroy(() => { if (clockInterval) clearInterval(clockInterval); });
</script>

<defs>
    <clipPath id="doughnut-clip">
        <path d="M 0 -100 A 100 100 0 1 1 0 100 A 100 100 0 1 1 0 -100 M 0 -38 A 38 38 0 1 0 0 38 A 38 38 0 1 0 0 -38" fill-rule="evenodd" />
    </clipPath>
    <clipPath id="quad-1"><path d="M 0 0 L 0 -100 A 100 100 0 0 1 100 0 Z"  /></clipPath>
    <clipPath id="quad-2"><path d="M 0 0 L 100 0 A 100 100 0 0 1 0 100 Z" /></clipPath>
    <clipPath id="quad-3"><path d="M 0 0 L 0 100 A 100 100 0 0 1 -100 0 Z" /></clipPath>
    <clipPath id="quad-4"><path d="M 0 0 L -100 0 A 100 100 0 0 1 0 -100 Z" /></clipPath>
</defs>

<g class="time-circle">
    <g clip-path="url(#doughnut-clip)">
        <image href="{ base }/images/day.png" x="0" y="-100" width="100" height="100" preserveAspectRatio="xMidYMid slice" clip-path="url(#quad-1)" />
        <image href="{ base }/images/dusk.png" x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice" clip-path="url(#quad-2)" />
        <image href="{ base }/images/night.png" x="-100" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice" clip-path="url(#quad-3)" />
        <image href="{ base }/images/dawn.png" x="-100" y="-100" width="100" height="100" preserveAspectRatio="xMidYMid slice" clip-path="url(#quad-4)" />
        {#if timeData[0] }
        <circle class="time-overlay-path" cx="0" cy="0" r="100"
                fill={timeData[2].color}
                opacity="0"
                clip-path="url(#quad-1)" />
        <circle class="time-overlay-path" cx="0" cy="0" r="100"
                fill={timeData[3].color}
                opacity="0"
                clip-path="url(#quad-2)" />
        <circle class="time-overlay-path" cx="0" cy="0" r="100"
                fill={timeData[0].color}
                opacity="0"
                clip-path="url(#quad-3)" />
        <circle class="time-overlay-path" cx="0" cy="0" r="100"
                fill={timeData[1].color}
                opacity="0"
                stroke="var(--theme-terra)"
                stroke-width="1"
                stroke-opacity="1"
                clip-path="url(#quad-4)" />
        {/if}
    </g>

    <circle cx="0" cy="0" r="100" fill="none" stroke="var(--theme-terra)" stroke-width="4"/>

    <g class="center-button-group" onclick={onHoleClick}>
        <!-- Decoupled Time-based Glow -->
        <circle cx="0" cy="0" r="38" fill="none" stroke="{activeTime.glow}" stroke-width="12" 
                style="filter: blur(6px);" class="doughnut-glow" />
                
        <circle cx="0" cy="0" r="38" fill="var(--theme-ink)" stroke="var(--active-accent-color)" stroke-width="3"
                class="doughnut-hole" />

        <foreignObject x="-36" y="-36" width="72" height="72" style="pointer-events: none;">
            <div xmlns="http://www.w3.org/1999/xhtml" class="center-info-hole">
                <span class="verse-title">{translated.name || activeTime.name}</span>
                <span class="verse-text">{translated.verse || activeTime.verse}</span>
                <div class="divider"></div>
            </div>
        </foreignObject>
    </g>
</g>

<g class="pointer-group" style="transform: rotate({timeRotation}deg);">
    <slot />
    <image 
        href="{base}/images/my-cool-pointer.svg" 
        x="-18" 
        y="-80" 
        width="36" 
        height="42" 
        style="filter: brightness(0) invert(1); opacity: 0.7;"
    />
</g>

<style>
    .pointer-group {
        transition: transform 1s cubic-bezier(0.25, 1, 0.5, 1);
    }
    .center-button-group {
        cursor: pointer;
        transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
    }
    .center-button-group:hover {
        transform: scale(1.1);
    }
    .center-button-group:hover .doughnut-hole {
        fill: var(--theme-terra);
    }
    .center-button-group:hover .doughnut-glow {
        opacity: 1;
    }
    .doughnut-hole { transition: fill 0.2s; }
    .doughnut-glow {
        opacity: 0.7;
        transition: opacity 0.3s;
    }

    /* CSS for the HTML inside the SVG */
    .center-info-hole {
        width: 100%; height: 100%;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        text-align: center; color: var(--theme-parchment);
        user-select: none;
        -webkit-user-select: none;
    }

    /* Font sizes are now mapped 1:1 with SVG user-units, making them perfectly scalable */
    .verse-title {
        font-family: var(--font-display, serif);
        font-size: 11px; font-weight: normal; color: var(--active-accent-color); margin-bottom: 2px;
    }

    .verse-text {
        font-family: var(--font-body, serif);
        font-size: 7px; font-style: italic; line-height: 1.1; opacity: 0.9;
        display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }

    .divider {
        width: 25px; height: 1px; background-color: var(--theme-terra); margin: 4px 0;
    }

    .enter-btn {
        font-family: var(--font-ui, sans-serif);
        font-size: 6px; text-transform: uppercase; letter-spacing: 1px;
    }

    .time-overlay-path {
        transition: opacity 0.5s ease;
        stroke: var(--theme-terra);
        stroke-opacity: 1;
        stroke-width: 1px;
    }
    .time-overlay-path:hover {
        opacity: 0.3;
    }
</style>