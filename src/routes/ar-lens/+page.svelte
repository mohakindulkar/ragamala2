<script>
    import { page } from "$app/stores";
    import { browser } from "$app/environment";
    import ARViewer from "$lib/components/ARViewer.svelte";

    // Extract the dynamic paths from the URL parameters
    $: arMindUrl = decodeURIComponent($page.url.searchParams.get("mind") || "");
    $: videoUrl = decodeURIComponent($page.url.searchParams.get("video") || "");

    function goBack() {
        if (browser) window.history.back();
    }
</script>

<svelte:head>
    <title>Museum AR Lens</title>
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
</svelte:head>

<div class="lens-wrapper">
    <header class="lens-header">
        <button class="back-btn" on:click={goBack}>← Back</button>
        <div class="instructions">
            <h1>Museum Lens</h1>
            <p>Point your camera at the glowing painting on the screen.</p>
        </div>
    </header>

    <main class="scanner-area">
        {#if arMindUrl && videoUrl}
            <div class="debug-info" style="display: none;">
                <p>Mind: {arMindUrl}</p>
                <p>Video: {videoUrl}</p>
            </div>
            <ARViewer {arMindUrl} {videoUrl} />
        {:else}
            <div class="error-state">
                <span class="icon">⚠️</span>
                <p>No artwork specified.</p>
                <p style="font-size: 0.7rem; opacity: 0.5;">
                    {$page.url.search}
                </p>
            </div>
        {/if}
    </main>
</div>

<style>
    /* Force a dark, full-screen mobile app feel */
    :global(body) {
        margin: 0;
        background-color: #000;
        color: #fff;
    }

    .lens-wrapper {
        display: flex;
        flex-direction: column;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
    }

    .lens-header {
        position: relative;
        z-index: 100;
        display: flex;
        align-items: center;
        padding: 15px 20px;
        background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.9),
            rgba(0, 0, 0, 0)
        );
        padding-bottom: 30px;
    }

    .back-btn {
        background: transparent;
        border: none;
        color: var(--active-accent-color, #ffaa00);
        font-family: var(--font-ui, sans-serif);
        font-size: 1rem;
        cursor: pointer;
        padding: 10px;
        margin-right: 15px;
    }

    .instructions h1 {
        margin: 0;
        font-family: var(--font-display, serif);
        font-size: 1.2rem;
        color: #fff;
    }

    .instructions p {
        margin: 5px 0 0 0;
        font-family: var(--font-ui, sans-serif);
        font-size: 0.85rem;
        color: #aaa;
    }

    .scanner-area {
        flex-grow: 1;
        position: relative;
    }

    /* Override the ARViewer container so it fills the whole mobile screen */
    :global(.ar-container) {
        height: 100% !important;
        width: 100% !important;
        border-radius: 0 !important;
    }

    .error-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        text-align: center;
        padding: 40px;
        color: var(--theme-sindoor, #d32f2f);
    }

    .error-state .icon {
        font-size: 3rem;
        margin-bottom: 10px;
    }
</style>
