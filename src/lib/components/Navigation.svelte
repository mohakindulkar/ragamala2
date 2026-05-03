<script>
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { fade } from 'svelte/transition';

    function normalizePath(pathname) {
        const cleanBase = (base || '').replace(/\/$/, '');
        const withoutBase =
            cleanBase && pathname.startsWith(cleanBase)
                ? pathname.slice(cleanBase.length) || '/'
                : pathname;

        return withoutBase.replace(/\/+$/, '') || '/';
    }

    let currentPath = $derived(normalizePath(page.url.pathname));
    // Only show on family-tree route (plus tolerated legacy typo alias).
    let showHomeButton = $derived(
        currentPath === '/family-tree' || currentPath === '/famil-tree'
    );

    function goHome() {
        goto(`${base}/`);
    }
</script>

{#if showHomeButton}
    <nav class="global-nav" in:fade>
        <button onclick={goHome} aria-label="Return Home" class="home-btn">
            <svg xmlns="http://www.w3.org/2000/svg"
                 xmlns:xlink="http://www.w3.org/1999/xlink"
                 viewBox="-50 -50 100 100" width="120" height="120"
            >
                <use xlink:href="#heart" x="-40" y="-40" width="80" height="80" />
            </svg>
        </button>
    </nav>
{/if}

<style>
    .global-nav {
        position: fixed;
        top: 20px;
        left: 10px;
        z-index: 1000;
        pointer-events: auto;
    }

    .home-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        filter: drop-shadow(0 0 10px rgba(0,0,0,0.3));
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        fill: #fff;
        opacity: 0.5;
    }

    .home-btn:hover {
        opacity: 1;
        transform: scale(1.15);
        fill: var(--accent-color);
    }

    .home-btn:active {
        transform: scale(0.95);
    }
</style>
