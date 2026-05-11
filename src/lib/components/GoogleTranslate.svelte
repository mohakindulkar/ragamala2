<script>
    import { tick } from 'svelte';
    import { activeRaga, currentLang } from '$lib/stores.js';

    let isOpen = false;
    let showAll = false; // Toggles between Curated list and Full list
    let allLanguages = []; // We will populate this from Google's hidden data

    const curatedLanguages = [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'Hindi (हिन्दी)' },
        { code: 'sa', name: 'Sanskrit (संस्कृतम्)' },
        { code: 'uk', name: 'Ukrainian (Українська)' },
        { code: 'bn', name: 'Bengali (বাংলা)' },
        { code: 'ta', name: 'Tamil (தமிழ்)' },
        { code: 'ru', name: 'Russian (Русский)' },
        { code: 'fr', name: 'French (Français)' },
        { code: 'es', name: 'Spanish (Español)' }
    ];

    function toggleMenu() {
        isOpen = !isOpen;
        if (!isOpen) showAll = false; // Reset to curated list when closed
    }

    // STEAL GOOGLE'S DATA
    function loadAllLanguages() {
        const select = document.querySelector('.goog-te-combo');
        if (select) {
            // Extract all options from Google's hidden dropdown
            allLanguages = Array.from(select.options)
                .filter(opt => opt.value) // Ignore the blank default option
                .map(opt => ({ code: opt.value, name: opt.text }));

            showAll = true; // Switch our UI to show the full list
        } else {
            console.warn("Google Translate hasn't finished loading yet.");
        }
    }

    async function setLanguage(langCode) {
        // 1. UPDATE THE GLOBAL STORE! This is crucial for the Narrator.
        $currentLang = langCode;

        // 2. Trigger Google Translate
        const googleSelect = document.querySelector('.goog-te-combo');
        if (googleSelect) {
            googleSelect.value = langCode;
            googleSelect.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        }

        isOpen = false;
        showAll = false;
    }

    // REACTIVITY FIX: Re-translate when the D3 Tree/Song changes!
    // $: if ($activeRaga && $currentLang !== 'en') {
    //     tick().then(() => {
    //         const googleSelect = document.querySelector('.goog-te-combo');
    //         if (googleSelect) {
    //             googleSelect.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    //         }
    //     });
    // }
</script>

<div class="translate-container">

    <div id="google_translate_element" style="display: none;"></div>

    <button class="translate-btn" on:click={toggleMenu} aria-label="Translate">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
        </svg>
    </button>

    {#if isOpen}
        <div class="menu-dropdown">
            <div class="scrollable-list">

                {#if !showAll}
                    {#each curatedLanguages as lang}
                        <button class:active={$currentLang === lang.code} on:click={() => setLanguage(lang.code)}>
                            {lang.name}
                        </button>
                    {/each}
                    <hr>
                    <button class="other-btn" on:click={loadAllLanguages}>Other languages...</button>

                {:else}
                    <button class="back-btn" on:click={() => showAll = false}>← Back to curated</button>
                    <hr>
                    {#each allLanguages as lang}
                        <button class:active={$currentLang === lang.code} on:click={() => setLanguage(lang.code)}>
                            {lang.name}
                        </button>
                    {/each}
                {/if}

            </div>
        </div>
    {/if}
</div>

<style>
    .translate-container {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 10px;
        pointer-events: auto;
    }

    /* THE ICON BUTTON */
    .translate-btn {
        background-color: var(--theme-parchment, #f4ece1);
        border: 2px solid var(--theme-terra, #8b4513);
        border-radius: 50%;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--theme-ink, #3e2723);
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        transition: transform 0.2s, box-shadow 0.2s;
    }

    .translate-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 12px rgba(0,0,0,0.3);
    }

    /* THE DROPDOWN PANEL */
    .menu-dropdown {
        background-color: var(--theme-parchment, #f4ece1);
        border: 2px solid var(--theme-terra, #8b4513);
        border-radius: 8px;
        padding: 10px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        width: 220px;
    }

    /* THE SCROLLABLE LIST (Fixes the 2613px bug forever) */
    .scrollable-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
        max-height: 50vh; /* Limits height to half the screen */
        overflow-y: auto; /* Enables scrolling for the full list! */
        padding-right: 5px; /* Space for the scrollbar */
    }

    /* Custom Scrollbar for the list */
    .scrollable-list::-webkit-scrollbar {
        width: 6px;
    }
    .scrollable-list::-webkit-scrollbar-thumb {
        background-color: var(--theme-terra, #8b4513);
        border-radius: 3px;
    }

    /* BUTTON STYLES */
    .scrollable-list button {
        background: none;
        border: none;
        text-align: left;
        padding: 8px 12px;
        font-family: var(--font-ui, sans-serif);
        font-size: 14px;
        color: var(--theme-ink, #3e2723);
        cursor: pointer;
        border-radius: 4px;
        transition: background-color 0.2s;
    }

    .scrollable-list button:hover {
        background-color: rgba(139, 69, 19, 0.1);
    }

    .scrollable-list button.active {
        font-weight: bold;
        color: var(--theme-sindoor, #d32f2f);
        background-color: rgba(211, 47, 47, 0.1);
    }

    .scrollable-list hr {
        border: none;
        border-top: 1px solid rgba(139, 69, 19, 0.3);
        margin: 4px 0;
    }

    .other-btn { font-style: italic; }
    .back-btn { font-weight: bold; color: var(--theme-terra, #8b4513) !important; }

    /* --- GOOGLE NATIVE OVERRIDES --- */
    :global(.skiptranslate) { display: none !important; }
    :global(body) { top: 0 !important; }
</style>
