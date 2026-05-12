<script>
    import { base } from '$app/paths';
    import { fade, slide } from 'svelte/transition';
    import { browser } from '$app/environment';
    import { overlayData, currentLang } from '$lib/stores.js';
    import { onMount } from 'svelte';

    let voices = [];
    let isSpeaking = false;
    let isMagicMode = false;
    let qrImageUrl = "";

    function deriveAudioPath(data) {
        if (!data) return "";

        const explicitAudio = data.audio || data.audioUrl;
        if (explicitAudio) return explicitAudio.replace(/^\//, "");

        const source = data.video || data.ar || "";
        const fileName = source.split("/").pop() || "";
        const stem = fileName.replace(/\.[^.]+$/, "");
        if (!stem) return "";

        const baseStem = stem.replace(/-main$/, "");
        return `audio/${baseStem}-audio.wav`;
    }

    // Reactively generate the QR code URL whenever Magic Mode is opened
    $: if (isMagicMode && browser && $overlayData) {
        // Automatically grabs your current domain
        const baseUrl = window.location.origin;
        
        // Clean up paths: ENSURE RELATIVE PATHS for the URL params
        const mindPath = ($overlayData.ar || 'ar/default.mind').replace(/^\//, '');
        const videoPath = ($overlayData.video || 'video/default.mp4').replace(/^\//, '');
        const audioPath = deriveAudioPath($overlayData);
        
        const targetUrl = `${baseUrl}${base}/ar-lens?mind=${encodeURIComponent(mindPath)}&video=${encodeURIComponent(videoPath)}${audioPath ? `&audio=${encodeURIComponent(audioPath)}` : ""}`;
        
        // Feeds the link to the free QR generation API
        qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(targetUrl)}`;
    }

    onMount(() => {
        if (browser && window.speechSynthesis) {
            const loadVoices = () => { voices = window.speechSynthesis.getVoices(); };
            loadVoices();
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    });

    function closeOverlay() {
        if (browser && window.speechSynthesis) window.speechSynthesis.cancel();
        isSpeaking = false;
        isMagicMode = false;
        $overlayData = null;
    }

    function toggleMagicMode() {
        isMagicMode = !isMagicMode;
    }

    function readOverlayAloud(e) {
        e.stopPropagation();
        if (!browser || !window.speechSynthesis || !$overlayData?.txt) return;

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            isSpeaking = false;
            return;
        }

        let utterance = new SpeechSynthesisUtterance($overlayData.txt);
        let targetLang = $currentLang === 'sa' ? 'hi' : $currentLang;
        let matchingVoice = voices.find(v => v.lang.toLowerCase().startsWith(targetLang.toLowerCase()));

        utterance.voice = matchingVoice || voices[0];
        utterance.rate = 0.85;

        utterance.onstart = () => isSpeaking = true;
        utterance.onend = () => isSpeaking = false;
        utterance.onerror = () => isSpeaking = false;

        window.speechSynthesis.speak(utterance);
    }
</script>

{#if $overlayData}
    {@const fullUrl = $overlayData.url.startsWith('http') || $overlayData.url.startsWith(base) ? $overlayData.url : `${base}/${$overlayData.url.replace(/^\//, '')}`}
    <div class="overlay-backdrop" transition:fade={{ duration: 200 }} on:click={closeOverlay}>
        <div class="overlay-content" on:click|stopPropagation>

            <div class="target-stage">
                <div class="overlay-frame" class:magic-glow={isMagicMode}>
                    <img src={fullUrl} alt="Full screen ragamala" class="overlay-img" />
                </div>

                {#if isMagicMode}
                    <div class="instruction-panel" transition:slide={{ axis: 'x', duration: 300 }}>
                        <h3>✨ Bring the Art to Life</h3>
                        <ol>
                            <li>Open your phone's camera.</li>
                            <li>Scan the QR code below to open the Museum Lens.</li>
                            <li>Point your phone at the painting on this screen!</li>
                        </ol>

                        <div class="qr-placeholder">
                            {#if qrImageUrl}
                                <img src={qrImageUrl} alt="Scan to launch AR Lens" class="dynamic-qr" />
                            {:else}
                                <p>Generating code...</p>
                            {/if}
                        </div>
                    </div>
                {/if}
            </div>

            <div class="caption-container">
                <p class="overlay-caption">{$overlayData.txt}</p>

                <div class="overlay-controls">

                    <!-- Always show the AR button for any painting -->
                    <button class="voice-btn ar-btn" on:click={toggleMagicMode} class:active={isMagicMode}>
                        <span class="icon">📱✨</span>
                        {isMagicMode ? 'Hide Instructions' : 'Experience in AR'}
                    </button>

                    <button class="voice-btn" on:click={readOverlayAloud} class:active={isSpeaking} aria-label="Read description aloud">
                        <span class="state-listen"><span class="icon">🗣️</span> Listen</span>
                        <span class="state-stop"><span class="icon">🛑</span> Stop</span>
                    </button>

                    <button class="close-btn" on:click={closeOverlay} aria-label="Close overlay">✖</button>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    .overlay-backdrop {
        position: fixed;
        top: 0; left: 0; width: 100vw; height: 100vh;
        background-color: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(5px);
        display: flex; justify-content: center; align-items: center;
        z-index: 9999; cursor: zoom-out;
    }

    .overlay-content {
        display: flex; flex-direction: column; align-items: center;
        max-width: 90vw; max-height: 95vh; cursor: default;
    }

    .target-stage {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 30px;
        width: 100%;
        max-width: 1000px;
    }

    .overlay-frame {
        padding: 10px;
        background-color: var(--theme-parchment, #f4ece1);
        border: 3px solid var(--accent-color, #d32f2f);
        transition: all 0.5s ease-in-out;
        position: relative;
        border-radius: 16px;
    }

    .overlay-img {
        max-width: 100%; max-height: 85vh;
        object-fit: contain; display: block; margin: 0 auto;
        border-radius: 8px;
    }

    /* --- THE MAGICAL GLOW PHYSICS --- */
    .magic-glow {
        border-color: var(--active-accent-color, #ffaa00);
        box-shadow: 0 0 30px 5px var(--active-accent-color, rgba(255, 170, 0, 0.6));
        animation: pulse-glow 2s infinite alternate;
    }

    @keyframes pulse-glow {
        0% { box-shadow: 0 0 20px 2px var(--active-accent-color, rgba(255, 170, 0, 0.4)); }
        100% { box-shadow: 0 0 40px 10px var(--active-accent-color, rgba(255, 170, 0, 0.8)); }
    }

    /* --- INSTRUCTION PANEL --- */
    .instruction-panel {
        background-color: var(--theme-parchment, #f4ece1);
        border: 2px solid var(--theme-terra, #8b4513);
        padding: 25px;
        border-radius: 8px;
        width: 300px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        font-family: var(--font-ui, sans-serif);
        color: var(--theme-ink, #3e2723);
    }

    .instruction-panel h3 {
        margin-top: 0;
        color: var(--accent-color, #d32f2f);
        font-family: var(--font-display, serif);
    }

    .instruction-panel ol {
        padding-left: 20px;
        margin-bottom: 20px;
        line-height: 1.5;
    }

    .qr-placeholder {
        display: flex; flex-direction: column; align-items: center;
        padding: 20px; border: 2px dashed var(--theme-terra, #8b4513);
        background: rgba(139, 69, 19, 0.05); border-radius: 8px;
    }

    .qr-placeholder svg { width: 64px; height: 64px; color: var(--theme-terra); margin-bottom: 10px; }

    /* --- CAPTIONS AND CONTROLS --- */
    .caption-container {
        margin-top: 15px; width: 100%; max-width: 800px;
        display: flex; justify-content: space-between; align-items: center;
        gap: 20px; background-color: var(--theme-parchment, #f4ece1);
        border: 3px solid var(--theme-sindoor, #d32f2f);
        padding: 15px 20px;
        border-radius: 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }

    .overlay-caption { font-family: var(--font-ui, sans-serif); font-size: 1rem; color: var(--theme-ink, #3e2723); margin: 0; flex-grow: 1; }
    .overlay-controls { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

    .voice-btn {
        background-color: transparent; border: 2px solid var(--theme-terra, #8b4513); color: var(--theme-ink, #3e2723);
        border-radius: 20px; padding: 8px 15px; font-family: var(--font-ui, sans-serif); font-weight: bold; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 5px;
    }
    .voice-btn:hover { background-color: rgba(139, 69, 19, 0.1); }
    .voice-btn.active { background-color: var(--accent-color, #d32f2f); border-color: var(--theme-sindoor, #d32f2f); color: #fff; }

    .ar-btn {
        background-color: var(--theme-ink, #3e2723);
        color: #fff;
        border-color: var(--theme-ink, #3e2723);
    }
    .ar-btn:hover { background-color: var(--theme-terra, #8b4513); }
    .ar-btn.active {
        background-color: var(--active-accent-color, #ffaa00);
        border-color: var(--active-accent-color, #ffaa00);
        color: #000;
    }

    .state-stop { display: none; }
    .state-listen { display: flex; align-items: center; gap: 5px; }
    .voice-btn.active .state-stop { display: flex; align-items: center; gap: 5px; }
    .voice-btn.active .state-listen { display: none; }

    .close-btn {
        background-color: var(--accent-color, #d32f2f); color: var(--theme-parchment, #f4ece1); border: none; border-radius: 50%; width: 40px; height: 40px; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.2s; margin-left: 10px;
    }
    .close-btn:hover { transform: scale(1.1); background-color: var(--theme-ink, #3e2723); }
    .qr-placeholder {
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        padding: 15px; border: 2px dashed var(--theme-terra, #8b4513);
        background: #fff; border-radius: 8px; width: 200px; height: 200px; margin: 0 auto;
    }

    .dynamic-qr {
        width: 100%;
        height: auto;
        display: block;
    }
</style>
