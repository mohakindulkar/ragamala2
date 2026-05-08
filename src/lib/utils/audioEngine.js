import { base } from "$app/paths";

// Global audio state
let audioElements = {};
let activeAudio = null;
let fadeInterval = null;

export function crossfadeTo(seasonName) {
    if (typeof window === 'undefined') return;
    if (!seasonName) return;
    
    if (!audioElements[seasonName]) {
        const audio = new Audio(`${base}/audio/${seasonName.toLowerCase()}.mp3`);
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
    activeAudio.play().then(() => {
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
    }).catch(err => {
        console.warn("Autoplay blocked. Audio will start on first click/drag.");
        activeAudio = null; // reset so it can be re-triggered
    });
}

export function fadeOutAmbient(durationMs = 5000) {
    if (typeof window === 'undefined') return;
    if (!activeAudio || activeAudio.paused) return;
    
    if (fadeInterval) {
        clearInterval(fadeInterval);
        fadeInterval = null;
    }
    
    let vol = activeAudio.volume;
    const steps = 50; // Update 50 times over the duration
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

export function pauseAmbient() {
    if (activeAudio) {
        activeAudio.pause();
    }
}
