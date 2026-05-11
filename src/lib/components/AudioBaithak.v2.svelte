<script>
    import { base } from '$app/paths';
</script>

<section class="audio-baithak" aria-label="Baithak scene" style={`--bg-image: url('${base}/images/AudioUI_BG.png');`}>
    <img class="instrument tanpura" src="{base}/images/AudioUI_Tanpura.png" alt="Tanpura">
    <img class="instrument sitar" src="{base}/images/AudioUI_Sitar.png" alt="Sitar">
    <img class="instrument pakhawaj" src="{base}/images/AudioUI_Pakhawaj.png" alt="Pakhawaj">
    <img class="instrument tabla" src="{base}/images/AudioUI_Tabla.png" alt="Tabla">
    <img class="instrument flute" src="{base}/images/AudioUI_Flute.png" alt="Flute">
</section>

<style>
    .audio-baithak {
        position: fixed;
        right: 18px;
        bottom: 10px;
        width: min(42vw, 560px);
        aspect-ratio: 3840 / 2068;
        z-index: 70;
        overflow: hidden;
        pointer-events: none;
        isolation: isolate;
    }

    .audio-baithak::before,
    .audio-baithak::after {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
    }

    .audio-baithak::before {
        z-index: 0;
        background: var(--bg-image) center / cover no-repeat;
        filter: grayscale(1) contrast(1.06) brightness(1.03);
    }

    .audio-baithak::after {
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
        opacity: 0.9;
        transition: background 500ms ease, opacity 500ms ease;
    }

    .instrument {
        position: absolute;
        object-fit: contain;
        user-select: none;
        -webkit-user-drag: none;
    }

    .tanpura {
        height: 71.5%;
        left: 8.9%;
        bottom: 15.5%;
        transform: none;
        z-index: 2;
    }

    .sitar {
        height: 64.9%;
        right: 15.5%;
        bottom: 20.8%;
        transform: none;
        z-index: 3;
    }

    .pakhawaj {
        width: 25%;
        left: 29.5%;
        bottom: 16.7%;
        transform: none;
        z-index: 4;
    }

    .tabla {
        width: 20.5%;
        left: 49.8%;
        bottom: 18.5%;
        z-index: 5;
    }

    .flute {
        width: 21%;
        left: 42.8%;
        bottom: 16.9%;
        transform: none;
        z-index: 6;
    }

    @media (max-width: 980px) {
        .audio-baithak {
            right: 8px;
            bottom: 8px;
            width: min(48vw, 470px);
        }
    }
</style>
