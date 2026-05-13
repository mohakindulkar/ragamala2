<script>
    import { activeRaga, audioLeadMode, baithakInstruments, hoveredInstrument } from '$lib/stores.js';

    /** @param {'sitar' | 'flute'} mode */
    function setLeadInstrument(mode) {
        audioLeadMode.set(mode);

        baithakInstruments.update((state) => ({
            ...state,
            sitar: mode === 'sitar',
            flute: mode === 'flute',
        }));
    }

    let activeInstrumentNames = [];

    $: displayInfo = $activeRaga?.lineageInfo || {
        time: $activeRaga?.time || '',
        season: $activeRaga?.season || '',
        vadi: $activeRaga?.musicalDNA?.vadi || $activeRaga?.vadi || '',
        samvadi: $activeRaga?.musicalDNA?.samvadi || $activeRaga?.samvadi || '',
    };

    $: {
        activeInstrumentNames = [];
        if ($baithakInstruments.tanpura) activeInstrumentNames.push('Tanpura');
        if ($baithakInstruments.pakhawaj) activeInstrumentNames.push('Pakhawaj');
        if ($baithakInstruments.flute) activeInstrumentNames.push('Flute');
        if ($baithakInstruments.tabla) activeInstrumentNames.push('Tabla');
        if ($baithakInstruments.sitar) activeInstrumentNames.push('Sitar');
    }

    $: centerMode = $hoveredInstrument ? 'hover' : $activeRaga ? 'active' : 'idle';
    $: centerNames = $hoveredInstrument
        ? [$hoveredInstrument]
        : $activeRaga && activeInstrumentNames.length
          ? activeInstrumentNames
          : [];
    $: showInfo = Boolean($activeRaga?.lineageInfo || $activeRaga);
</script>

<div class="family-console" aria-label="Family tree instrument panel">
    <div class="center-panel">
        <div class="instrument-readout" class:hover={centerMode === 'hover'} class:active={centerMode === 'active'} class:idle={centerMode === 'idle'} aria-live="polite">
            {#if centerNames.length}
                <span class="instrument-name">
                    {#each centerNames as instrument}
                        <span>{instrument}</span>
                    {/each}
                </span>
            {/if}
        </div>
    </div>

    <div class="mode-panel" aria-label="Lead instrument mode">
        {#if showInfo && $activeRaga}
            <div class="info-panel" aria-label="Raga details">
                <div class="info-row">
                    <span class="info-label">Time:</span>
                    <span class="info-value">{displayInfo.time || '—'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Season:</span>
                    <span class="info-value">{displayInfo.season || '—'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Vadi:</span>
                    <span class="info-value">{displayInfo.vadi || '—'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Samvadi:</span>
                    <span class="info-value">{displayInfo.samvadi || '—'}</span>
                </div>
            </div>
        {/if}

        <button
            type="button"
            class:active={$audioLeadMode !== 'flute'}
            onclick={() => setLeadInstrument('sitar')}
        >
            Sitar
        </button>
        <button
            type="button"
            class:active={$audioLeadMode === 'flute'}
            onclick={() => setLeadInstrument('flute')}
        >
            Flute
        </button>
    </div>
</div>

<style>
    .family-console {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 25;
        position: absolute;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: clamp(14px, 2vw, 32px);
        padding: clamp(18px, 2vw, 28px) clamp(20px, 3vw, 42px) clamp(18px, 2vw, 26px);
        min-height: clamp(140px, 18vh, 210px);
        background: transparent;
        border-top: none;
        box-shadow: none;
        backdrop-filter: none;
        pointer-events: none;
    }

    .center-panel {
        position: absolute;
        left: 50%;
        bottom: clamp(18px, 2vw, 26px);
        transform: translate(-50%, 20%);
        display: flex;
        justify-content: center;
        align-items: flex-end;
        min-width: 0;
        width: max-content;
        pointer-events: none;
    }

    .instrument-readout {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: clamp(0.9rem, 2vw, 2rem);
        width: max-content;
        text-align: center;
        font-family: var(--font-bharvati, Bharvati, serif);
        color: #b5532d;
        text-shadow: 0 1px 0 rgba(255, 255, 255, 0.65);
        transition:
            transform 180ms ease,
            opacity 180ms ease,
            font-size 180ms ease;
        min-height: 1.6em;
        max-width: 100%;
        line-height: 0.9;
    }

    .instrument-name {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.18em;
        white-space: nowrap;
    }

    .info-panel {
        display: flex;
        flex-direction: column;
        gap: 0.12rem;
        justify-content: center;
        align-items: flex-start;
        font-family: var(--font-ikaros, 'Ikaros Sans', sans-serif);
        color: #b5532d;
        font-size: clamp(0.88rem, 1.05vw, 1.4rem);
        line-height: 1.02;
        letter-spacing: 0.01em;
        transform: translateY(20%);
    }

    .info-row {
        display: grid;
        grid-template-columns: auto auto;
        gap: 0.5rem;
        align-items: baseline;
        white-space: nowrap;
    }

    .info-label {
        min-width: 4.8em;
    }

    .info-value {
        color: #a84d28;
    }

    .instrument-readout.hover {
        font-size: clamp(2.3rem, 4.6vw, 4.8rem);
        letter-spacing: 0.01em;
    }

    .instrument-readout.active {
        font-size: clamp(1.25rem, 2.1vw, 2.15rem);
        gap: 0.08em;
        letter-spacing: 0.015em;
    }

    .instrument-readout.idle {
        font-size: clamp(2rem, 3.9vw, 4.4rem);
    }

    .mode-panel {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: clamp(12px, 2vw, 26px);
        flex-wrap: wrap;
        justify-self: end;
        align-self: center;
        pointer-events: auto;
        transform: translateY(20%);
        margin-left: auto;
    }

    .mode-panel button {
        min-width: clamp(112px, 9.5vw, 164px);
        height: clamp(52px, 5.4vw, 70px);
        padding: 0 1.2rem;
        border-radius: 20px;
        border: 1px solid rgba(181, 83, 45, 0.18);
        background: rgba(255, 248, 240, 0.9);
        color: #b5532d;
        font-family: var(--font-ikaros, 'Ikaros Sans', sans-serif);
        font-size: clamp(1.6rem, 2.4vw, 3rem);
        line-height: 1;
        cursor: pointer;
        transition:
            transform 160ms ease,
            box-shadow 160ms ease,
            background-color 160ms ease,
            color 160ms ease,
            border-color 160ms ease;
        box-shadow: 0 6px 16px rgba(85, 53, 29, 0.08);
    }

    .mode-panel button:hover {
        transform: translateY(9%);
        box-shadow: 0 10px 24px rgba(85, 53, 29, 0.13);
    }

    .mode-panel button.active {
        background: #fbf4e8;
        border-color: rgba(181, 83, 45, 0.36);
        box-shadow: inset 0 0 0 1px rgba(181, 83, 45, 0.08), 0 8px 20px rgba(85, 53, 29, 0.14);
        transform: translateY(10%);
    }

    @media (max-width: 1100px) {
        .family-console {
            flex-direction: column;
            align-items: center;
            gap: 12px;
        }

        .center-panel,
        .mode-panel {
            align-self: center;
        }

        .mode-panel {
            justify-content: center;
            transform: translateY(20%);
            margin-left: 0;
        }
    }
</style>
