<script>
    import { base } from '$app/paths';
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';

    export let arMindUrl;
    export let videoUrl;

    let scriptsLoaded = false;
    let userInteracted = false; // NEW: The Audio Lock State
    let container;
    const baseUrl = window.location.origin;

    onMount(() => {
        if (!browser) return;

        const aframeScript = document.createElement('script');
        aframeScript.src = "https://aframe.io/releases/1.3.0/aframe.min.js";

        aframeScript.onload = () => {
            if (!window.AFRAME.components['video-controller']) {
                window.AFRAME.registerComponent('video-controller', {
                    init: function () {
                        this.video = document.querySelector('#ar-video');

                        this.el.addEventListener('targetFound', () => {
                            this.video.play();
                        });
                        this.el.addEventListener('targetLost', () => {
                            this.video.pause();
                        });
                    }
                });
            }

            const mindarScript = document.createElement('script');
            mindarScript.src = "https://cdn.jsdelivr.net/npm/mind-ar@1.2.2/dist/mindar-image-aframe.prod.js";
            mindarScript.onload = () => {
                scriptsLoaded = true;
            };
            document.head.appendChild(mindarScript);
        };

        document.head.appendChild(aframeScript);
    });

    // NEW: The function that unlocks the audio engine AND forces camera perm
    async function startExperience() {
        try {
            // Explicitly request camera to force the browser's permission prompt
            await navigator.mediaDevices.getUserMedia({ video: true });
            userInteracted = true;
        } catch (err) {
            console.error("Camera access denied:", err);
            alert("Camera access is required for AR. Please enable it in your browser settings.");
        }
    }

    onDestroy(() => {
        if (browser) {
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
        <a-scene
                mindar-image={`imageTargetSrc: ${baseUrl}${base}/${arMindUrl}; autoStart: true;`}
                color-space="sRGB"
                renderer="colorManagement: true, physicallyCorrectLights"
                vr-mode-ui="enabled: false"
                device-orientation-permission-ui="enabled: false"
                embedded
        >
            <a-assets>
                <video id="ar-video"
                       src={`${baseUrl}${base}${videoUrl}`}
                       preload="auto"
                       loop crossorigin="anonymous"
                       playsinline
                       webkit-playsinline>
                </video>
            </a-assets>

            <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

            <a-entity mindar-image-target="targetIndex: 0" video-controller>
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