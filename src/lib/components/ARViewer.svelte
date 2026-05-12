<script>
    import { base } from '$app/paths';
    import { onMount, onDestroy, tick } from 'svelte';
    import { browser } from '$app/environment';

    export let arMindUrl;
    export let videoUrl;
    export let audioUrl = "";

    let scriptsLoaded = false;
    let userInteracted = false; // NEW: The Audio Lock State
    let container;
    const baseUrl = browser ? window.location.origin : "";
    let audioCtx = null;
    let audioBuffer = null;
    let audioBufferPromise = null;
    let activeAudioSource = null;
    let activeAudioGain = null;

    function resolveAssetUrl(assetPath) {
        if (!assetPath) return "";
        if (assetPath.startsWith('http') || assetPath.startsWith(baseUrl)) return assetPath;
        const cleanPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
        return `${baseUrl}${base}${cleanPath}`;
    }

    function deriveAudioUrl() {
        if (audioUrl) return audioUrl;

        const source = videoUrl || arMindUrl || "";
        const fileName = source.split('/').pop() || "";
        const stem = fileName.replace(/\.[^.]+$/, "");
        if (!stem) return "";

        const baseStem = stem.replace(/-main$/, "");
        return `/audio/${baseStem}-audio.wav`;
    }

    async function ensureAudioContext() {
        if (!browser) return null;

        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        if (audioCtx.state === 'suspended') {
            await audioCtx.resume();
        }

        return audioCtx;
    }

    async function loadAudioBuffer() {
        if (audioBuffer) return audioBuffer;
        if (audioBufferPromise) return audioBufferPromise;

        audioBufferPromise = (async () => {
            const ctx = await ensureAudioContext();
            const assetUrl = resolveAssetUrl(deriveAudioUrl());
            if (!ctx || !assetUrl) return null;

            const response = await fetch(assetUrl);
            if (!response.ok) {
                throw new Error(`Failed to load AR audio: ${response.status} ${response.statusText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            audioBuffer = await ctx.decodeAudioData(arrayBuffer);
            return audioBuffer;
        })();

        try {
            return await audioBufferPromise;
        } finally {
            audioBufferPromise = null;
        }
    }

    async function startRagaAudio() {
        const ctx = await ensureAudioContext();
        if (!ctx) return;

        if (!audioBuffer) {
            try {
                await loadAudioBuffer();
            } catch (err) {
                console.warn('Unable to load AR audio buffer:', err);
                return;
            }
        }

        if (!audioBuffer || activeAudioSource) return;

        const source = ctx.createBufferSource();
        const gain = ctx.createGain();
        source.buffer = audioBuffer;
        source.loop = true;
        gain.gain.setValueAtTime(0, ctx.currentTime);
        source.connect(gain);
        gain.connect(ctx.destination);
        source.start();
        gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.35);

        activeAudioSource = source;
        activeAudioGain = gain;
    }

    function stopRagaAudio() {
        if (!audioCtx || !activeAudioSource || !activeAudioGain) return;

        const ctx = audioCtx;
        const source = activeAudioSource;
        const gain = activeAudioGain;

        activeAudioSource = null;
        activeAudioGain = null;

        const now = ctx.currentTime;
        try {
            gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.001), now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.2);
        } catch (err) {
            console.warn('Unable to fade AR audio:', err);
        }

        setTimeout(() => {
            try { source.stop(); } catch (err) {}
            try { source.disconnect(); } catch (err) {}
            try { gain.disconnect(); } catch (err) {}
        }, 250);
    }

    onMount(() => {
        if (!browser) return;

        // Force a small delay to let the page stabilize
        setTimeout(() => {
            const aframeScript = document.createElement('script');
            aframeScript.src = "https://aframe.io/releases/1.3.0/aframe.min.js";

            aframeScript.onload = () => {
                if (!window.AFRAME) {
                    console.error("AFRAME failed to initialize");
                    return;
                }
                
                if (!window.AFRAME.components['video-controller']) {
                    window.AFRAME.registerComponent('video-controller', {
                        init: function () {
                            this.video = document.querySelector('#ar-video');
                            this.el.addEventListener('targetFound', () => { this.video.play(); });
                            this.el.addEventListener('targetLost', () => { this.video.pause(); });
                        }
                    });
                }

                if (!window.AFRAME.components['audio-controller']) {
                    window.AFRAME.registerComponent('audio-controller', {
                        init: function () {
                            this.el.addEventListener('targetFound', () => {
                                startRagaAudio();
                            });
                            this.el.addEventListener('targetLost', () => {
                                stopRagaAudio();
                            });
                        }
                    });
                }

                const mindarScript = document.createElement('script');
                mindarScript.src = "https://cdn.jsdelivr.net/npm/mind-ar@1.2.2/dist/mindar-image-aframe.prod.js";
                mindarScript.onload = () => { scriptsLoaded = true; };
                mindarScript.onerror = () => { alert("Failed to load AR engine. Check your connection."); };
                document.head.appendChild(mindarScript);
            };
            
            aframeScript.onerror = () => { alert("Failed to load 3D engine."); };
            document.head.appendChild(aframeScript);
        }, 100);
    });

    // NEW: The function that unlocks the audio engine AND forces camera perm
    async function startExperience() {
        try {
            // Explicitly request the BACK camera to force the browser's permission prompt
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            // IMMEDIATELY release the camera so MindAR can use it without conflict!
            stream.getTracks().forEach(track => track.stop());
            
            // Wait 1 second for the phone's hardware to fully release the camera lens.
            // Since permission is now permanently granted, MindAR can grab it without a click!
            setTimeout(async () => {
                userInteracted = true;
                await tick();
                try {
                    await loadAudioBuffer();
                } catch (err) {
                    console.warn('Unable to prime AR audio playback:', err);
                }
            }, 1000);
        } catch (err) {
            console.error("Camera access denied:", err);
            alert("Camera access is required for AR. Please enable it in your browser settings.");
        }
    }

    onDestroy(() => {
        if (browser) {
            stopRagaAudio();
            const videoElement = document.querySelector('#ar-video');
            if (videoElement) {
                videoElement.pause();
                videoElement.removeAttribute('src');
                videoElement.load();
            }
            const streamVideo = document.querySelector('video');
            if (streamVideo && streamVideo.srcObject) {
                streamVideo.srcObject.getTracks().forEach(track => track.stop());
            }
            if (audioCtx && audioCtx.state !== 'closed') {
                audioCtx.close();
            }
        }
    });
</script>

<div class="ar-container" bind:this={container}>
    {#if !scriptsLoaded}
        <div class="loading-ar">
            <p>Loading AR Engine...</p>
        </div>
    {:else if !userInteracted}
        <div class="interaction-gate">
            <div class="gate-content">
                <span class="icon">🔈</span>
                <h2>Ready to Scan</h2>
                <p>Tap below to enable sound and start the camera.</p>
                <button class="start-btn" on:click={startExperience}>Start Scanner</button>
            </div>
        </div>
    {:else if arMindUrl && videoUrl}
        {@const cleanVideoUrl = videoUrl.startsWith('/') ? videoUrl : `/${videoUrl}`}
        <a-scene
                mindar-image={`imageTargetSrc: ${baseUrl}${base}/${arMindUrl.replace(/^\//, '')}; autoStart: true; filterMinCF: 0.0001; filterBeta: 0.001; warmupTolerance: 10; missTolerance: 15;`}
                color-space="sRGB"
                renderer="colorManagement: true, physicallyCorrectLights: true, antialias: true, alpha: true, precision: high, powerPreference: high-performance"
                vr-mode-ui="enabled: false"
                device-orientation-permission-ui="enabled: false"
                embedded
        >
            <a-assets>
                <video id="ar-video"
                       src={`${baseUrl}${base}${cleanVideoUrl}`}
                       preload="auto"
                       loop crossorigin="anonymous"
                       playsinline
                       webkit-playsinline
                       muted>
                </video>
            </a-assets>

            <a-camera position="0 0 0" look-controls="enabled: false" cursor="fuse: false; rayOrigin: mouse;"></a-camera>

            <a-entity mindar-image-target="targetIndex: 0" video-controller audio-controller>
                <!-- Optimized video plane -->
                <a-video src="#ar-video" width="1" height="1.4" position="0 0 0" rotation="0 0 0"></a-video>
            </a-entity>
        </a-scene>
    {/if}
</div>

<style>
    .ar-container {
        width: 100%; height: 100%; min-height: 400px;
        position: relative; background: #000; border-radius: 8px; overflow: hidden;
    }

    .loading-ar, .interaction-gate {
        position: absolute; top: 0; left: 0; right: 0; bottom: 0;
        display: flex; justify-content: center; align-items: center;
        background: #111; color: var(--theme-parchment, #f4ece1);
        font-family: var(--font-ui, sans-serif);
    }

    .gate-content {
        text-align: center;
        padding: 30px;
    }

    .gate-content .icon { font-size: 3rem; display: block; margin-bottom: 10px; }
    .gate-content h2 { margin: 0 0 10px 0; color: #fff; }
    .gate-content p { color: #aaa; margin-bottom: 25px; }

    .start-btn {
        background-color: var(--active-accent-color, #ffaa00);
        color: #000; font-weight: bold; border: none;
        padding: 15px 30px; border-radius: 30px; font-size: 1.1rem;
        cursor: pointer; transition: transform 0.2s;
    }

    .start-btn:hover { transform: scale(1.05); }
</style>
