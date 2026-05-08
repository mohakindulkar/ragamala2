<script>
    import { audioBgDimmed, baithakInstruments } from '$lib/stores.js';

    function toggleInstrument(name) {
        baithakInstruments.update(state => {
            const newState = { ...state, [name]: !state[name] };
            
            // SPECIAL LOGIC: Flute and Sitar are mutually exclusive lead instruments
            if (name === 'flute' && newState.flute) {
                newState.sitar = false;
            } else if (name === 'sitar' && newState.sitar) {
                newState.flute = false;
            }
            
            return newState;
        });
    }
</script>

<section
    class="audio-baithak"
    aria-label="Baithak scene"
    style={`--audio-reactive-opacity: ${$audioBgDimmed ? 0.3 : 0}; --audio-bg-blur: ${$audioBgDimmed ? 5 : 0}px;`}
>
    <img class="instrument tanpura" class:active={$baithakInstruments.tanpura} src="/images/AudioUI_Tanpura.png" alt="Tanpura" role="button" tabindex="0" onclick={() => toggleInstrument('tanpura')} onkeydown={(e) => e.key === 'Enter' && toggleInstrument('tanpura')}>
    <img class="instrument sitar" class:active={$baithakInstruments.sitar} src="/images/AudioUI_Sitar.png" alt="Sitar" role="button" tabindex="0" onclick={() => toggleInstrument('sitar')} onkeydown={(e) => e.key === 'Enter' && toggleInstrument('sitar')}>
    <img class="instrument pakhawaj" class:active={$baithakInstruments.pakhawaj} src="/images/AudioUI_Pakhawaj.png" alt="Pakhawaj" role="button" tabindex="0" onclick={() => toggleInstrument('pakhawaj')} onkeydown={(e) => e.key === 'Enter' && toggleInstrument('pakhawaj')}>
    <img class="instrument tabla" class:active={$baithakInstruments.tabla} src="/images/AudioUI_Tabla.png" alt="Tabla" role="button" tabindex="0" onclick={() => toggleInstrument('tabla')} onkeydown={(e) => e.key === 'Enter' && toggleInstrument('tabla')}>
    <img class="instrument flute" class:active={$baithakInstruments.flute} src="/images/AudioUI_Flute.png" alt="Flute" role="button" tabindex="0" onclick={() => toggleInstrument('flute')} onkeydown={(e) => e.key === 'Enter' && toggleInstrument('flute')}>
</section>

<style>
    .audio-baithak {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        pointer-events: none;
    }

    .audio-baithak::before {
        content: '';
        position: absolute;
        inset: 0;
        z-index: 0;
        background-image: url('/images/AudioUI_BG.png');
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
        filter: blur(var(--audio-bg-blur, 0px));
        transform: scale(1.02);
        transition: filter 480ms ease-in-out, opacity 280ms ease;
        pointer-events: none;
    }

    .audio-baithak::after {
        content: '';
        position: absolute;
        inset: 0;
        z-index: 1;
        background:
            radial-gradient(circle at 18% 18%, color-mix(in srgb, var(--active-bg-color) 85%, transparent), transparent 58%),
            radial-gradient(circle at 82% 76%, color-mix(in srgb, var(--active-accent-color) 80%, transparent), transparent 60%),
            linear-gradient(
                135deg,
                color-mix(in srgb, var(--active-bg-color) 62%, transparent),
                color-mix(in srgb, var(--active-accent-color) 54%, transparent)
            );
        mix-blend-mode: color;
        opacity: var(--audio-reactive-opacity, 0);
        transition: opacity 280ms ease;
        pointer-events: none;
    }

    .instrument {
        position: absolute;
        object-fit: contain;
        user-select: none;
        -webkit-user-drag: none;
        pointer-events: auto;
        cursor: pointer;
        opacity: 0.4;
        scale: 1;
        transition: scale 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease;
    }

    .instrument:hover,
    .instrument.active {
        opacity: 1;
        scale: 1.05;
    }

    .tanpura {
        height: 71.5%;
        left: 12%;
        bottom: 18.5%;
        z-index: 2;
        rotate: -15deg;
    }

    .sitar {
        height: 64.9%;
        right: 15.5%;
        bottom: 18.8%;
        z-index: 3;
        rotate: 10deg;
    }

    .pakhawaj {
        width: 23%;
        left: 29%;
        bottom: 14%;
        z-index: 4;
    }

    .tabla {
        width: 19.5%;
        left: 49.8%;
        bottom: 18.5%;
        z-index: 5;
    }

    .flute {
        width: 21%;
        left: 34%;
        bottom: 14.9%;
        z-index: 6;
        rotate: 3deg;
        transform: scaleX(-1);
    }

</style>
