<script>
    import { base } from "$app/paths";
    import { currentSeason } from "$lib/stores.js";
    import { onMount, onDestroy } from "svelte";
    import { page } from "$app/state";

    let audioElements = {};
    let activeAudio = null;
    let fadeInterval = null;

    // Reactively monitor the page URL. If we are on /family-tree, fade out!
    $effect(() => {
        if (typeof window !== "undefined") {
            if (page.url.pathname === "/family-tree") {
                fadeOutAll(5000);
            } else if (page.url.pathname === "/") {
                if ($currentSeason) {
                    crossfadeTo($currentSeason);
                }
            }
        }
    });

    // Also react to season changes if we are on the home page
    $effect(() => {
        if (
            typeof window !== "undefined" &&
            page.url.pathname === "/" &&
            $currentSeason
        ) {
            crossfadeTo($currentSeason);
        }
    });

    function crossfadeTo(seasonName) {
        if (!seasonName) return;

        if (!audioElements[seasonName]) {
            const audio = new Audio(
                `${base}/audio/${seasonName.toLowerCase()}.mp3`,
            );
            audio.loop = true;
            audio.volume = 0;
            audioElements[seasonName] = audio;
        }

        const newAudio = audioElements[seasonName];
        if (activeAudio === newAudio && !newAudio.paused) return;

        if (fadeInterval) {
            clearInterval(fadeInterval);
            fadeInterval = null;
        }

        // Fade out previous
        if (activeAudio && activeAudio !== newAudio) {
            const old = activeAudio;
            let vol = old.volume;
            const fadeOut = setInterval(() => {
                if (vol > 0.05) {
                    vol -= 0.05;
                    old.volume = vol;
                } else {
                    old.pause();
                    clearInterval(fadeOut);
                }
            }, 100);
        }

        activeAudio = newAudio;
        activeAudio
            .play()
            .then(() => {
                let vol = activeAudio.volume;
                fadeInterval = setInterval(() => {
                    if (vol < 0.95) {
                        vol += 0.05;
                        activeAudio.volume = vol;
                    } else {
                        activeAudio.volume = 1;
                        clearInterval(fadeInterval);
                        fadeInterval = null;
                    }
                }, 100);
            })
            .catch((err) => {
                console.warn("Ambient Audio Autoplay Blocked.");
                activeAudio = null;
                const unlockAudio = () => {
                    crossfadeTo($currentSeason);
                    window.removeEventListener("pointerdown", unlockAudio);
                };
                window.addEventListener("pointerdown", unlockAudio);
            });
    }

    function fadeOutAll(durationMs) {
        if (!activeAudio || activeAudio.paused) return;

        if (fadeInterval) {
            clearInterval(fadeInterval);
            fadeInterval = null;
        }

        let vol = activeAudio.volume;
        const steps = 50;
        const stepTime = durationMs / steps;
        const volStep = vol / steps;

        fadeInterval = setInterval(() => {
            if (vol > volStep) {
                vol -= volStep;
                activeAudio.volume = vol;
            } else {
                activeAudio.volume = 0;
                activeAudio.pause();
                clearInterval(fadeInterval);
                fadeInterval = null;
                activeAudio = null;
            }
        }, stepTime);
    }

    onDestroy(() => {
        if (activeAudio) activeAudio.pause();
    });
</script>
