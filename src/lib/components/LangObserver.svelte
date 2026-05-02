<script>
    import { onMount } from 'svelte';
    import { currentLang } from '$lib/stores.js';

    onMount(() => {
        // Watches for the HTML lang attribute changes (triggered by GTranslate)
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'lang') {
                    currentLang.set(document.documentElement.lang);
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    });
</script>