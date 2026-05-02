<script>
    import { onDestroy } from 'svelte';
    import { browser } from '$app/environment';
    import * as Tone from 'tone';
    import { activeRaga } from '$lib/stores.js';
    import Cartouche from './Cartouche.svelte';

    export let activeNode;
    export let isPlaying = false;

    let windSynth, pluckSynth, droneSynth;
    let tablaBayan, tablaDayan; // The Drums!
    let reverb, delay;
    let droneSequence, tablaSequence;
    let currentPart;

    // --- USER CONTROLS ---
    // --- EXPORTED AUDIO PARAMS & METER ---
    export let droneVol = -12;
    export let melodyVol = -8;
    export let tablaVol = -10;
    export let complexity = 0.5;
    export let swingAmount = 0.3;
    export let currentBpm = 80;
    export let audioLevel = 0; // Tracks the live volume for the animation
    let meter;
    let animationFrameId;

    // User Instrument Choice
    let leadMode = 'auto'; // 'auto', 'veena', 'flute', 'duet'

    // --- SSR-SAFE REACTIVITY ---
    $: if (browser && isPlaying) {
        if (droneSynth) droneSynth.volume.rampTo(droneVol, 0.1);
        if (pluckSynth) pluckSynth.volume.rampTo(melodyVol, 0.1);
        if (windSynth) windSynth.volume.rampTo(melodyVol, 0.1);
        if (tablaBayan) tablaBayan.volume.rampTo(tablaVol, 0.1);
        if (tablaDayan) tablaDayan.volume.rampTo(tablaVol, 0.1);

        if (Tone.Transport && Tone.Transport.bpm) {
            Tone.Transport.swing = swingAmount;
            Tone.Transport.bpm.value = currentBpm;
        }
    }

    // Regenerate melody if the user clicks a new Raga OR changes the instrument mode!
    $: if (browser && isPlaying && ($activeRaga || leadMode)) {
        generateMelody();
    }

    const ragamalaScales = {
        'Grishma': ["C4", "Db4", "F4", "G4", "Bb4"],
        'Varsha': ["C4", "D4", "F4", "G4", "A4", "C5"],
        'Sharad': ["C4", "E4", "F4", "G4", "B4", "C5"],
        'Hemanta': ["C4", "D4", "Eb4", "G4", "A4", "C5"],
        'Shishira': ["C4", "Db4", "E4", "F4", "G4", "Ab4", "B4"],
        'Vasanta': ["C4", "E4", "F#4", "G4", "B4", "C5"],
    };

    async function initAudio() {
        await Tone.start();
        Tone.Transport.bpm.value = currentBpm;
        Tone.Transport.swingSubdivision = "16n";
        Tone.Transport.swing = swingAmount;

        if (!windSynth) {
            windSynth = new Tone.MonoSynth({
                oscillator: { type: "sine" },
                envelope: { attack: 0.1, decay: 0.3, sustain: 0.8, release: 1.0 }
            });

            pluckSynth = new Tone.Synth({
                oscillator: { type: "fmtriangle", modulationType: "sine", modulationIndex: 3 },
                envelope: { attack: 0.01, decay: 0.4, sustain: 0.0, release: 0.2 }
            });

            droneSynth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: "fmtriangle", modulationType: "sine", modulationIndex: 1 },
                envelope: { attack: 1.5, decay: 1, sustain: 1, release: 5 }
            });

            // NEW: TABLA DRUMS
            // Bayan (Deep Bass Drum)
            tablaBayan = new Tone.MembraneSynth({
                pitchDecay: 0.08,
                octaves: 2,
                oscillator: { type: "sine" },
                envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 0.4 }
            });

            // Dayan (High pitched resonant drum)
            tablaDayan = new Tone.MembraneSynth({
                pitchDecay: 0.01,
                octaves: 1.2,
                oscillator: { type: "triangle" },
                envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 }
            });

            droneSynth.volume.value = droneVol;
            pluckSynth.volume.value = melodyVol;
            windSynth.volume.value = melodyVol;
            tablaBayan.volume.value = tablaVol;
            tablaDayan.volume.value = tablaVol;

            delay = new Tone.PingPongDelay("8n.", 0.2);
            reverb = new Tone.Reverb({ decay: 5, wet: 0.6 });
            meter = new Tone.Meter(); // The visualizer meter
            // Connect instruments to the meter so it can "hear" them
            pluckSynth.connect(meter);
            windSynth.connect(meter);
            tablaBayan.connect(meter); // The bass drum gives it a great bounce!

            windSynth.chain(delay, reverb, Tone.Destination);
            pluckSynth.chain(delay, reverb, Tone.Destination);

            // Drums get a little reverb, but no delay so they stay punchy
            tablaBayan.chain(reverb, Tone.Destination);
            tablaDayan.chain(reverb, Tone.Destination);
            droneSynth.chain(reverb, Tone.Destination);

            await reverb.generate();

            droneSequence = new Tone.Sequence((time, note) => {
                droneSynth.triggerAttackRelease(note, "2m", time, 0.6);
            }, ["C3", "G3", "C4", "C3"], "1m");

            // NEW: 16-BEAT TEENTAL RHYTHM
            tablaSequence = new Tone.Sequence((time, step) => {
                // Downbeats (Sam) get the deep bass + high tone
                if (step === 0 || step === 8) {
                    tablaBayan.triggerAttackRelease("G2", "8n", time, 0.8);
                    tablaDayan.triggerAttackRelease("C4", "8n", time, 0.7);
                }
                // Mid beats get just the high tone
                else if (step === 4 || step === 12) {
                    tablaDayan.triggerAttackRelease("C4", "8n", time, 0.5);
                }
                // Fill in the spaces randomly based on complexity!
                else if (Math.random() < complexity * 0.7) {
                    tablaDayan.triggerAttackRelease("G4", "16n", time, 0.3);
                }
            }, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], "16n");
        }
    }

    function generateMelody() {
        if (currentPart) currentPart.dispose();

        const season = $activeRaga?.season || 'Shishira';
        const scale = $activeRaga?.scale || ragamalaScales[season] || ragamalaScales['Shishira'];

        // --- INSTRUMENT LOGIC ---
        const isRagini = $activeRaga?.type?.toLowerCase().includes("ragini");

        let playVeena = leadMode === 'veena' || leadMode === 'duet' || (leadMode === 'auto' && !isRagini);
        let playFlute = leadMode === 'flute' || leadMode === 'duet' || (leadMode === 'auto' && isRagini);

        const events = [];
        let timeOffset = 0;

        for (let i = 0; i < 16; i++) {
            if (Math.random() < complexity) {
                const note = scale[Math.floor(Math.random() * scale.length)];
                const velocity = 0.5 + Math.random() * 0.4;
                events.push({ time: timeOffset, note: note, dur: "8n", vel: velocity });
            }
            timeOffset += Tone.Time("8n").toSeconds();
        }

        currentPart = new Tone.Part((time, value) => {
            const humanizeOffset = (Math.random() - 0.5) * 0.04;

            // If Jugalbandi (Duet), we play both! We slightly delay the flute so it sounds like two humans playing.
            if (playVeena) pluckSynth.triggerAttackRelease(value.note, value.dur, time + humanizeOffset, value.vel);
            if (playFlute) windSynth.triggerAttackRelease(value.note, value.dur, time + humanizeOffset + 0.015, value.vel);

        }, events).start(0);

        currentPart.loop = true;
        currentPart.loopEnd = timeOffset;
    }

    async function togglePlay() {
        if (isPlaying) {
            isPlaying = false;
            Tone.Transport.stop();
            Tone.Transport.cancel(0);
            if (currentPart) currentPart.stop();
            if (droneSequence) droneSequence.stop();
            if (tablaSequence) tablaSequence.stop();
        } else {
            await initAudio();
            isPlaying = true;
            generateMelody();
            Tone.Transport.start();
            $: if (isPlaying && !animationFrameId) updateMeter();
            $: if (!isPlaying && animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
                audioLevel = 0;
            }
            droneSequence.start(0);
            tablaSequence.start(0); // Start the drums!
        }
    }

    function updateMeter() {
        if (isPlaying && meter) {
            const level = meter.getValue();
            const db = isFinite(level) ? level : -100;
            // Normalize -40dB -> 0 to 0dB -> 1
            const targetLevel = Math.max(0, Math.min(1, (db + 40) / 40));
            // Add smoothing so it breathes naturally instead of flashing
            audioLevel = audioLevel * 0.8 + targetLevel * 0.2;
            animationFrameId = requestAnimationFrame(updateMeter);
        }
    }

    onDestroy(() => {
        if (windSynth) {
            Tone.Transport.stop();
            windSynth.dispose();
            pluckSynth.dispose();
            droneSynth.dispose();
            tablaBayan.dispose();
            tablaDayan.dispose();
            if (droneSequence) droneSequence.dispose();
            if (tablaSequence) tablaSequence.dispose();
            if (currentPart) currentPart.dispose();
            reverb.dispose();
            delay.dispose();
        }
    });
</script>

<Cartouche
        position="bottom-right"
        mainIcon="🎵"
        showMiniBtn={isPlaying}
        miniIcon="⏸️"
        on:miniAction={togglePlay}
>
    <div class="audio-content">
        <div class="controls-left">
            <button class="play-btn" on:click={togglePlay}>
                {isPlaying ? 'Pause' : 'Play'}
            </button>

            {#if $activeRaga && $activeRaga.name}
                <div class="now-playing">
                    <span class="label">Playing: <span class="raga-name">{$activeRaga.name}</span></span>

                    <select class="instrument-select" bind:value={leadMode}>
                        <option value="auto">Auto (Tradition)</option>
                        <option value="veena">Veena (Pluck)</option>
                        <option value="flute">Bansuri (Wind)</option>
                        <option value="duet">Jugalbandi (Duet)</option>
                    </select>
                </div>
            {/if}
        </div>

        <div class="sliders-grid">
            <div class="slider-group">
                <label>Tanpura Drone <span class="val-readout">{Math.round(droneVol + 40)}</span></label>
                <input type="range" min="-40" max="0" bind:value={droneVol}>
            </div>

            <div class="slider-group">
                <label>Lead Volume <span class="val-readout">{Math.round(melodyVol + 40)}</span></label>
                <input type="range" min="-40" max="10" bind:value={melodyVol}>
            </div>

            <div class="slider-group">
                <label>Tabla Rhythm <span class="val-readout">{Math.round(tablaVol + 40)}</span></label>
                <input type="range" min="-40" max="10" bind:value={tablaVol}>
            </div>

            <div class="slider-group">
                <label>Note Density <span class="val-readout">{Math.round(complexity * 100)}%</span></label>
                <input type="range" min="0.1" max="1" step="0.05" bind:value={complexity}>
            </div>

            <div class="slider-group">
                <label>Tempo (BPM) <span class="val-readout">{currentBpm}</span></label>
                <input type="range" min="40" max="180" bind:value={currentBpm}>
            </div>

            <div class="slider-group">
                <label>Swing <span class="val-readout">{Math.round(swingAmount * 100)}%</span></label>
                <input type="range" min="0" max="0.8" step="0.05" bind:value={swingAmount}>
            </div>

            {#if isPlaying}
                <button class="regen-btn" on:click={generateMelody}>🎲 Regenerate Melody</button>
            {/if}
        </div>
    </div>
</Cartouche>

<style>
    .audio-content {
        padding: 15px 25px;
        display: flex;
        align-items: flex-start;
        gap: 30px;
    }

    .controls-left {
        display: flex;
        flex-direction: column;
        gap: 20px;
        border-right: 1px solid var(--theme-terra);
        padding-right: 20px;
        min-width: 140px;
    }

    .play-btn {
        background-color: var(--accent-color);
        color: var(--theme-parchment);
        border: none;
        border-radius: 4px;
        padding: 10px 20px;
        font-family: var(--font-body);
        font-size: 16px;
        cursor: pointer;
        transition: opacity 0.3s;
    }

    .play-btn:hover { opacity: 0.8; }

    .now-playing {
        display: flex;
        flex-direction: column;
        font-family: var(--font-display);
        color: var(--theme-ink);
        gap: 5px;
    }

    .raga-name {
        font-size: 20px;
        font-weight: bold;
    }

    .instrument-select {
        margin-top: 5px;
        padding: 4px;
        font-family: var(--font-ui, sans-serif);
        font-size: 12px;
        background-color: transparent;
        border: 1px solid var(--theme-terra);
        border-radius: 4px;
        color: var(--theme-ink);
        cursor: pointer;
    }

    .sliders-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr; /* Changed to 3 columns to fit the Tabla slider! */
        column-gap: 20px;
        row-gap: 15px;
        min-width: 450px;
    }

    .slider-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
        font-family: var(--font-ui, sans-serif);
        font-size: 0.85rem;
        color: var(--theme-ink, #3e2723);
        font-weight: 500;
    }

    .slider-group label {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .val-readout {
        color: var(--accent-color, #d32f2f);
        font-weight: bold;
    }

    input[type="range"] {
        -webkit-appearance: none;
        width: 100%;
        background: transparent;
    }

    input[type="range"]::-webkit-slider-runnable-track {
        width: 100%;
        height: 4px;
        background: rgba(139, 69, 19, 0.3);
        border-radius: 2px;
    }

    input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        height: 16px;
        width: 16px;
        border-radius: 50%;
        background: var(--accent-color, #d32f2f);
        cursor: pointer;
        margin-top: -6px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .regen-btn {
        grid-column: span 3; /* Spans all 3 columns */
        background: transparent;
        border: 1px solid var(--accent-color, #d32f2f);
        color: var(--accent-color, #d32f2f);
        border-radius: 4px;
        padding: 6px;
        font-size: 0.85rem;
        cursor: pointer;
        transition: background 0.2s;
        font-family: var(--font-ui, sans-serif);
    }

    .regen-btn:hover {
        background: rgba(211, 47, 47, 0.1);
    }
</style>