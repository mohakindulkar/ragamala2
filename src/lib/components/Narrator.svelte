<script>
    import { base } from '$app/paths';
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { fade } from 'svelte/transition'; // Needed for the overlay animation!
    import { activeRaga, currentLang, overlayData } from '$lib/stores.js';
    import Cartouche from './Cartouche.svelte';

    let voices = [];
    let isSpeaking = false;
    let selectedImage = null;
    let isExpanded = false;
    // Auto-open when a Raga is clicked
    $: if ($activeRaga) isExpanded = true;

    onMount(() => {
        if (browser && window.speechSynthesis) {
            const loadVoices = () => { voices = window.speechSynthesis.getVoices(); };
            loadVoices();
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    });

    $: textToRead = $activeRaga?.i18n?.[$currentLang]?.description || $activeRaga?.description;
    $: displayName = $activeRaga?.i18n?.[$currentLang]?.name || $activeRaga?.name;

    // --- OVERLAY CONTROLS ---
    function openOverlay(img) {
        $overlayData = img; // Pushes the image to the Global Overlay!
    }

/*    function closeOverlay() {
        selectedImage = null;
        // Stop reading the overlay description if they close it!
        if (browser && window.speechSynthesis) window.speechSynthesis.cancel();
    }*/

    // --- REUSABLE SPEECH ENGINE ---
    function speakText(text) {
        if (!browser || !window.speechSynthesis || !text.trim()) return;

        // If it's already speaking, stop the audio, reset the state, and EXIT.
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            isSpeaking = false;
            return;
        }

        // Otherwise, clear any stuck audio and start fresh!
        window.speechSynthesis.cancel();

        let utterance = new SpeechSynthesisUtterance(text);
        let targetVoiceLang = $currentLang === 'sa' ? 'hi' : $currentLang;
        let matchingVoice = voices.find(v => v.lang.toLowerCase().startsWith(targetVoiceLang.toLowerCase()));

        utterance.voice = matchingVoice || voices[0];
        utterance.rate = 0.85;
        utterance.pitch = 1.0;

        utterance.onstart = () => isSpeaking = true;
        utterance.onend = () => isSpeaking = false;
        utterance.onerror = () => isSpeaking = false;

        window.speechSynthesis.speak(utterance);
    }

    // Triggered by the Main Panel "Listen" button
    function readMainAloud() {
        let titleText = document.querySelector('.raga-title')?.innerText || '';
        let descText = document.querySelector('.poetry-text')?.innerText || '';
        speakText(`${titleText}... ${descText}`);
    }

    // Triggered by the new Overlay "Listen" button
    function readOverlayAloud() {
        // Scrape the translated text directly from the overlay caption!
        let captionText = document.querySelector('.overlay-caption')?.innerText || '';
        speakText(captionText);
    }

    $: if (browser && ($activeRaga || $currentLang)) {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            isSpeaking = false;
        }
        // Auto-close overlay if the song or language changes
        selectedImage = null;
    }
</script>

{#if $activeRaga && textToRead}
    <Cartouche
            position="bottom-left"
            mainIcon="🗣️"
            bind:isExpanded={isExpanded}
            showMiniBtn={isSpeaking}
            miniIcon="🛑"
            on:miniAction={readMainAloud}
    >
        <div class="narrator-content">
            <div class="top-section">
                {#if $activeRaga.image}
                    <div class="gallery-container">
                        {#each Array.isArray($activeRaga.image) ? $activeRaga.image : [{ url: $activeRaga.image, txt: '' }] as img}
                            {@const cleanUrl = img.url.startsWith('/') ? img.url : `/${img.url}`}
                            <button class="thumbnail-btn" on:click={() => openOverlay(img)} aria-label="View painting full size">
                                <img src={`${base}${cleanUrl}`} alt={displayName} class="thumbnail-img" />
                            </button>
                        {/each}
                    </div>
                {/if}

                <div class="header-column">
                    <button class="voice-btn" on:click={readMainAloud} class:active={isSpeaking} aria-label="Read description aloud">
                        <span class="state-listen"><span class="icon">🗣️</span> Listen</span>
                        <span class="state-stop"><span class="icon">🛑</span> Stop</span>
                    </button>

                    <h3 class="raga-title">{displayName}</h3>
                </div>
            </div>

            <p class="poetry-text">{textToRead}</p>
        </div>
    </Cartouche>
{/if}

<style>
    .narrator-content {
        width: 310px; /* Slightly increased width to accommodate horizontal layout */
        padding: 15px;
    }

    .top-section {
        display: flex;
        gap: 15px;
        margin-bottom: 15px;
        align-items: stretch;
    }

    .header-column {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        gap: 12px;
        flex: 1;
        border-left: 1px solid rgba(139, 69, 19, 0.2);
        padding-left: 12px;
    }

    .raga-title {
        font-family: var(--font-display, serif);
        color: var(--accent-color, #d32f2f);
        margin: auto 0 0 0; /* Pushes to bottom */
        font-size: 1.6rem;
        line-height: 1.1;
    }

    .poetry-text {
        color: var(--theme-ink, #3e2723);
        line-height: 1.5;
        margin: 0 0 15px 0;
        font-size: 1.1rem;
        font-family: var(--font-ikaros, 'Ikaros Sans', sans-serif);
    }

    .metadata {
        font-family: var(--font-ui, sans-serif);
        font-size: 0.9rem;
        color: var(--theme-ink, #3e2723);
    }

    .voice-btn {
        background: transparent;
        border: 1px solid var(--accent-color, #d32f2f);
        color: var(--accent-color, #d32f2f);
        padding: 4px 8px;
        cursor: pointer;
        border-radius: 4px;
        font-family: var(--font-ui, sans-serif);
        font-size: 0.85rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 5px;
        transition: all 0.2s;
        flex-shrink: 0; /* Prevents button from squishing */
        font-family: var(--font-ikaros, 'Ikaros Sans', sans-serif);
    }

    .voice-btn:hover { background: rgba(211, 47, 47, 0.1); }

    .voice-btn.active {
        background: var(--accent-color, #d32f2f);
        color: var(--theme-parchment, #f4ece1);
    }

    .icon { font-size: 1.1rem; }

    /* The Traditional Miniature Painting Frame */
    .painting-frame {
        width: 100%;
        margin-bottom: 15px;
        padding: 6px;
        background-color: var(--theme-parchment, #f4ece1);
        /* Creates the classic double-border look of Rajput miniatures */
        border: 2px solid var(--accent-color, #d32f2f);
        outline: 1px solid var(--theme-ink, #3e2723);
        outline-offset: 3px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .ragamala-painting {
        width: 100%;
        height: auto;
        max-height: 250px; /* Keeps the panel from getting too tall */
        object-fit: cover; /* Zooms in nicely if dimensions are weird */
        object-position: center top;
        display: block;
        border: 1px solid rgba(0,0,0,0.2);
    }
    /* --- THE THUMBNAIL GALLERY --- */
    .gallery-container {
        display: flex;
        flex-direction: row;
        gap: 10px;
        overflow-x: auto;
        padding: 10px; 
        margin: -10px 0 0 -10px;
        flex-shrink: 0;
    }

    .gallery-container::-webkit-scrollbar { height: 4px; }
    .gallery-container::-webkit-scrollbar-thumb {
        background-color: rgba(139, 69, 19, 0.4);
        border-radius: 2px;
    }

    .thumbnail-btn {
        flex: 0 0 150px; /* Increased size as requested */
        height: 200px; /* Increased size as requested */
        padding: 3px;
        background-color: var(--theme-parchment, #f4ece1);
        border: 2px solid var(--theme-sindoor, #d32f2f);
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
        animation: thumbnailBreathe 3s ease-in-out infinite alternate;
    }

    .thumbnail-btn:hover {
        animation-play-state: paused; /* Pause at current state or we can force it */
        transform: scale(1.08); /* Slightly bigger on hover */
        box-shadow: 0 0 25px var(--theme-sindoor, #d32f2f);
    }

    .thumbnail-img {
        width: 100%;
        height: 100%;
        object-fit: cover; /* Makes perfect squares without distorting the art */
        display: block;
    }

    /* --- THE FULL-SCREEN OVERLAY --- */

    .overlay-backdrop {
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.85); /* Dark cinematic backdrop */
        backdrop-filter: blur(4px);
        z-index: 99999; /* On top of everything */
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 40px;
    }

    .overlay-content {
        position: relative;
        max-width: 90vw;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    /* NEW: Controls Layout */
    .overlay-controls {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        gap: 15px;
    }

    .close-btn {
        background-color: var(--theme-sindoor, #d32f2f);
        color: var(--theme-parchment, #f4ece1);
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        font-size: 1.2rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        transition: transform 0.2s;
        flex-shrink: 0;
    }

    .close-btn:hover {
        transform: scale(1.1);
        background-color: var(--theme-ink, #3e2723);
    }

    .overlay-frame {
        padding: 10px;
        background-color: var(--theme-parchment, #f4ece1);
        border: 3px solid var(--theme-sindoor, #d32f2f);
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    }

    .overlay-img {
        max-width: 100%;
        max-height: 70vh; /* Leaves room for the caption */
        object-fit: contain; /* Ensures the whole painting is visible */
        display: block;
    }

    .overlay-caption {
        margin-top: 15px;
        padding: 10px 20px;
        background-color: var(--theme-parchment, #f4ece1);
        border-left: 3px solid var(--theme-sindoor, #d32f2f);
        font-family: var(--font-ui, sans-serif);
        font-size: 1rem;
        color: var(--theme-ink, #3e2723);
        max-width: 800px;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    /* --- STATE TOGGLE LOGIC --- */

    /* Default State (Not Speaking) */
    .state-stop { display: none; }
    .state-listen {
        display: flex;
        align-items: center;
        gap: 5px;
    }

    /* Active State (Speaking) */
    .voice-btn.active .state-stop {
        display: flex;
        align-items: center;
        gap: 5px;
    }
    .voice-btn.active .state-listen {
        display: none;
    }

    @keyframes thumbnailBreathe {
        0% {
            transform: scale(0.96);
            box-shadow: 0 0 5px var(--theme-sindoor, #d32f2f);
        }
        100% {
            transform: scale(1.04);
            box-shadow: 0 0 18px 3px var(--theme-sindoor, #d32f2f);
        }
    }
</style>
