<script>
    import { base } from "$app/paths";
    import { currentSeason } from "$lib/stores.js";
    import { onMount, onDestroy } from "svelte";
    import { page } from "$app/state";

    let audioContext = null;
    let audioBuffers = {};
    let activeSource = null;
    let activeGain = null;

    async function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }
    }

    async function loadAudioBuffer(url) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return await audioContext.decodeAudioData(arrayBuffer);
    }

    // Determine if we are on the homepage or a specific page
    const isHomePage = $derived(page.url.pathname === base || page.url.pathname === base + '/');
    const isFamilyTree = $derived(page.url.pathname.includes('/family-tree'));
    const isArLens = $derived(page.url.pathname.includes('/ar-lens'));

    // Reactively monitor the page URL.
    $effect(() => {
        if (typeof window !== 'undefined') {
            if (isFamilyTree || isArLens) {
                fadeOutAll(5000);
            } else if (isHomePage) {
                if ($currentSeason) {
                    crossfadeTo($currentSeason);
                }
            }
        }
    });

    // Also react to season changes if we are on the home page
    $effect(() => {
        if (typeof window !== 'undefined' && isHomePage && $currentSeason) {
            crossfadeTo($currentSeason);
        }
    });

    async function crossfadeTo(seasonName) {
        if (!seasonName) return;
        
        try {
            await initAudio();
        } catch (e) {
            console.warn("Ambient Audio Autoplay Blocked.", e);
            const unlockAudio = () => {
                crossfadeTo($currentSeason);
                window.removeEventListener('pointerdown', unlockAudio);
            };
            window.addEventListener('pointerdown', unlockAudio, { once: true });
            return;
        }

        const url = `${base}/audio/${seasonName.toLowerCase()}.mp3`;

        if (!audioBuffers[seasonName]) {
            try {
                audioBuffers[seasonName] = await loadAudioBuffer(url);
            } catch (err) {
                console.error("Error loading ambient audio", err);
                return;
            }
        }

        // Check if this season's buffer is already active
        if (activeSource && activeSource.buffer === audioBuffers[seasonName]) return;

        const buffer = audioBuffers[seasonName];
        
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.connect(audioContext.destination);
        
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(gainNode);
        
        source.start(0);

        // Fade out previous
        if (activeGain && activeSource) {
            const oldGain = activeGain;
            const oldSource = activeSource;
            oldGain.gain.setValueAtTime(oldGain.gain.value, audioContext.currentTime);
            oldGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 5);
            
            setTimeout(() => {
                try { oldSource.stop(); } catch(e) {}
                oldSource.disconnect();
                oldGain.disconnect();
            }, 5000);
        }

        // Fade in new
        gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 5);

        activeSource = source;
        activeGain = gainNode;
    }

    function fadeOutAll(durationMs) {
        if (!activeGain || !activeSource) return;
        
        const durationSec = durationMs / 1000;
        
        activeGain.gain.setValueAtTime(activeGain.gain.value, audioContext.currentTime);
        activeGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + durationSec);
        
        const sourceToStop = activeSource;
        const gainToDisconnect = activeGain;
        
        setTimeout(() => {
            if (sourceToStop) {
                try { sourceToStop.stop(); } catch (e) {}
                sourceToStop.disconnect();
            }
            if (gainToDisconnect) gainToDisconnect.disconnect();
        }, durationMs);
        
        activeSource = null;
        activeGain = null;
    }

    onDestroy(() => {
        if (activeSource) {
            try { activeSource.stop(); } catch (e) {}
            activeSource.disconnect();
        }
        if (activeGain) activeGain.disconnect();
        if (audioContext && audioContext.state !== 'closed') {
            audioContext.close();
        }
    });
</script>
