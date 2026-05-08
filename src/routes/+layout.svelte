<script>
    import { page } from "$app/state";
    import favicon from "$lib/assets/favicon.svg";
    import "$src/app.css";
    import { currentLang, bgColorPrimary, bgColorAccent } from "$lib/stores.js";
    import GlobalOverlay from "$lib/components/GlobalOverlay.svelte";
    import GoogleTranslate from "$lib/components/GoogleTranslate.svelte";
    import timeData from "$lib/data/time.json";
    import seasonsData from "$lib/data/seasons.json";
    import Navigation from "$lib/components/Navigation.svelte";
    import AmbientAudio from "$lib/components/AmbientAudio.svelte";

    // Determine colors based on active state
    $effect(() => {
        // Find current time color (you might want to add a "color" field to time.json)
        const hour = new Date().getHours();
        const activeTime = timeData.find(
            (t) => hour >= t.startHour && hour < t.endHour,
        );

        // Find current season color (from seasonsData)
        // For this example, let's use the first season of the left wing as a base
        const activeSeason = seasonsData[0];

        // Update the global CSS variables via the store or directly on document
        document.documentElement.style.setProperty(
            "--season-color",
            activeSeason.color,
        );
        document.documentElement.style.setProperty(
            "--time-color",
            activeTime.color || "#1a1a1a",
        );
        document.documentElement.style.setProperty(
            "--season-time-gradient",
            `radial-gradient(${activeTime.color}, ${activeSeason.color})`,
        );

        if (activeTime.id === "night") {
            // Force deep blue and violet during Ratri (Night)
            document.documentElement.style.setProperty(
                "--season-color-1",
                "#050515",
            ); // Deepest Black-Blue
            document.documentElement.style.setProperty(
                "--season-color-2",
                "#1a1a4a",
            ); // Midnight Blue
            document.documentElement.style.setProperty(
                "--season-color-3",
                "#2e1a4a",
            ); // Night Violet
            document.documentElement.style.setProperty(
                "--season-color-4",
                "#101030",
            ); // Shadow Blue
            document.documentElement.style.setProperty(
                "--season-color-5",
                "#1a0a2a",
            ); // Shadow Violet
        } else {
            document.documentElement.style.setProperty(
                "--season-color-1",
                `var(--${activeSeason.name.toLowerCase()}-1)`,
            );
            document.documentElement.style.setProperty(
                "--season-color-2",
                `var(--${activeSeason.name.toLowerCase()}-2)`,
            );
            document.documentElement.style.setProperty(
                "--season-color-3",
                `var(--${activeSeason.name.toLowerCase()}-3)`,
            );
            document.documentElement.style.setProperty(
                "--season-color-4",
                `var(--${activeSeason.name.toLowerCase()}-4)`,
            );
            document.documentElement.style.setProperty(
                "--season-color-5",
                `var(--${activeSeason.name.toLowerCase()}-5)`,
            );
        }
        document.documentElement.style.setProperty(
            "--damask",
            `var(--damask-${activeSeason.name.toLowerCase()})`,
        );

        // Watch for the 'lang' attribute change on the <html> tag
        const observer = new MutationObserver(() => {
            currentLang.set(document.documentElement.lang || "en");
        });

        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    });

    let { children } = $props();

    // Determines which page we are on to apply specific frame styles
    let currentRouteClass = $derived(
        page.url.pathname === "/"
            ? "route-home"
            : `route-${page.url.pathname.replace(/^\//, "").replace(/\//g, "-")}`,
    );
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<div class="app-wrapper {currentRouteClass}">
    <Navigation />
    <div class="ui-frame {currentRouteClass}">
        <!--        <div class="corner top-left cutout">
            <div class="background damask"></div>
        </div>

        <div class="corner top-right cutout">
            <div class="background damask"></div>
        </div>-->

        <div class="edge border-top"></div>
        <div class="edge border-bottom"></div>
        <div class="edge border-left"></div>
        <div class="edge border-right"></div>

        <div class="corner corner-image top-left"></div>
        <div class="corner corner-image top-right"></div>
        <div class="corner corner-image bottom-left"></div>
        <div class="corner corner-image bottom-right"></div>
    </div>

    <div class="widget-layer">
        <div class="translate-container"><GoogleTranslate /></div>
    </div>

    <main class="page-content">
        {@render children()}
    </main>

    <GlobalOverlay />
    <AmbientAudio />
</div>

<style>
    :global(body),
    :global(html) {
        margin: 0;
        padding: 0;
    }

    .app-wrapper {
        width: 100vw;
        height: 100vh;
        background-color: var(--theme-ink, #3e2723); /* Global background */
        overflow: hidden;
        margin: 0;
        padding: 0;
    }

    .page-content {
        width: 100%;
        height: 100vh;
        position: relative;
        z-index: 1; /* Sits under the widgets and corners */
        margin: 0;
        padding: 0;
    }

    .widget-layer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none; /* Let clicks pass through to the calendar/tree */
        z-index: 50;
    }

    .translate-container {
        pointer-events: auto; /* Reactivate clicks just for the buttons */
        position: absolute;
    }

    /* Position your widgets as you like */
    .translate-container {
        top: 20px;
        right: 20px;
    }

    /* --- THE MAGIC ROUTE RESTYLING --- */
    /* Hides the cutouts ONLY when we are on the Calendar (home) page */
    :global(.route-home .cutout),
    :global(.route-ragamala- .cutout),
    :global(.route-home .home-btn),
    :global(.route-ragamala- .home-btn) {
        display: none !important;
    }

    /*    !* Optional: Alter frame border color on the Calendar page *!
    :global(.route-home .ui-frame) {
        border-color: var(--theme-sindoor, #d32f2f);
    }*/

    /* THE FRAME CONTAINER */
    .ui-frame {
        position: absolute;
        inset: 0; /* Touch the actual screen edges */
        pointer-events: none; /* CRITICAL: Lets clicks pass through to the SVG tree */
        z-index: 10;
        margin: 0;
        padding: 0;
    }

    /* THE CORNERS */
    .corner {
        position: absolute;
        width: 100px; /* Size of corner SVG */
        height: 100px;
        background-color: var(
            --accent-color
        ); /* Placeholder for arabesque corner image */
        background: var(--accent-gradient);
    }

    .corner-image {
        mask-image: var(--corner-ornament);
        mask-size: cover;
        mask-repeat: no-repeat;
        mask-position: 0 0;
    }

    .top-left {
        top: 0;
        left: 0;
    }
    .top-right {
        top: 0;
        right: 0;
        transform: scaleX(-1);
    } /* Flips the same SVG horizontally */
    .bottom-left {
        bottom: 0;
        left: 0;
        transform: scaleY(-1);
    } /* Flips vertically */
    .bottom-right {
        bottom: 0;
        right: 0;
        transform: scale(-1, -1);
    } /* Flips both ways */

    /* THE EDGES */
    .edge {
        position: absolute;
        mask: var(--damask) center repeat;
        background-color: var(--border-color); /* Placeholder */
        background: var(--accent-gradient);
        mask-repeat: repeat;
        mask-size: auto;
        mask-position: top center;
        /* Add a second, fully opaque layer (linear-gradient(#000 0 0) creates a solid black rectangle) */
        /*mask-image: var(--damask), linear-gradient(var(--accent-color), var(--border-color));*/
        /* Use mask-composite: exclude to cut the shape out of the solid background */
        mask-composite: exclude;
        /* Use the -webkit- prefix for broader compatibility in older browsers */
        -webkit-mask-composite: xor;
        border-radius: 10px;
    }

    .border-top,
    .border-bottom {
        height: var(--border-width); /* Thickness of top/bottom border */
        left: 60px; /* Start after the corner */
        right: 60px; /* End before the corner */
        /* background-repeat: repeat-x; */
    }

    .border-top {
        top: 0;
        height: 60px;
    }
    .border-bottom {
        bottom: 0;
        height: 60px;
    }

    .border-left,
    .border-right {
        width: 60px; /* Thickness of side border */
        top: 60px; /* Start after top corner */
        bottom: 60px; /* End before bottom corner */
        /* background-repeat: repeat-y; */
    }

    .border-left {
        left: 0;
    }
    .border-right {
        right: 0;
        width: 60px;
    }

    :global(.ui-frame.route-family-tree),
    :global(.ui-frame.route-ragamala-family-tree) {
        display: none !important;
    }
</style>
