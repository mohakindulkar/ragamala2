<script>
    import { onMount, tick } from 'svelte';
    import { browser } from '$app/environment';

    let isCompiling = $state(false);
    let progress = $state(0);
    let scriptsLoaded = $state(false);
    let statusMessage = $state('');

    // NEW: A variable to hold the imported Compiler class
    let MindARCompiler = null;

    onMount(async () => {
        if (!browser) return;
        try {
            // NEW: Dynamically import the ES Module straight from the CDN!
            const mindar = await import('https://cdn.jsdelivr.net/npm/mind-ar@1.2.2/dist/mindar-image.prod.js');
            MindARCompiler = mindar.Compiler; // Extract the specific Compiler tool
            scriptsLoaded = true;
        } catch (err) {
            console.error("Failed to load AR Engine:", err);
            alert("Failed to load AR Engine. Check console for details.");
        }
    });

    async function handleImageUpload(event) {
        // NEW: Check against our imported class instead of the window object
        if (!scriptsLoaded || !MindARCompiler) {
            alert("Compiler engine is not ready.");
            return;
        }

        const file = event.target.files[0];
        if (!file) return;

        isCompiling = true;
        progress = 0;
        statusMessage = "Loading image into memory...";

        await tick();
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            console.log("Step 1: Reading image file...");
            const image = new Image();
            image.src = URL.createObjectURL(file);

            await new Promise((resolve, reject) => {
                image.onload = resolve;
                image.onerror = () => reject(new Error("Browser could not read this image file."));
            });

            statusMessage = "Initializing AI Compiler (Tab may freeze momentarily)...";
            await tick();
            await new Promise(resolve => setTimeout(resolve, 100));

            console.log("Step 2: Initializing MINDAR Compiler...");
            // NEW: Instantiate our dynamically imported class
            const compiler = new MindARCompiler();

            statusMessage = "Extracting feature points...";
            console.log("Step 3: Compiling targets...");

            await compiler.compileImageTargets([image], (compileProgress) => {
                progress = Math.round(compileProgress);
                console.log(`Progress: ${progress}%`);
            });

            statusMessage = "Packaging tracking data...";
            console.log("Step 4: Exporting...");

            const exportedBuffer = await compiler.exportData();
            const blob = new Blob([exportedBuffer]);
            const aLink = document.createElement('a');

            aLink.download = `${file.name.split('.')[0]}.mind`;
            aLink.href = URL.createObjectURL(blob);
            aLink.click();
            URL.revokeObjectURL(aLink.href);

            console.log("Done! File downloaded.");

        } catch (err) {
            console.error("Compilation Error:", err);
            alert("Error: " + err.message);
        } finally {
            isCompiling = false;
            statusMessage = "";
            event.target.value = '';
        }
    }
</script>

<div class="compiler-wrapper">
    <h1>Custom AR Target Compiler</h1>
    <p>Upload a painting to generate its <code>.mind</code> tracking file.</p>

    {#if !scriptsLoaded}
        <p class="loading">Loading Computer Vision Engine...</p>
    {:else}
        <div class="upload-box">
            <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    on:change={handleImageUpload}
                    disabled={isCompiling}
            />

            {#if isCompiling}
                <div class="progress-container">
                    <h3 class="status-text">{statusMessage}</h3>

                    {#if progress > 0}
                        <p>Progress: {progress}%</p>
                    {/if}

                    <div class="progress-bar">
                        <div class="progress-fill" style="width: {progress}%"></div>
                    </div>
                </div>
            {/if}
        </div>
    {/if}
</div>

<style>
    .compiler-wrapper {
        padding: 50px;
        max-width: 600px;
        margin: 0 auto;
        font-family: var(--font-ui, sans-serif);
        color: var(--theme-ink, #3e2723);
    }

    .upload-box {
        border: 2px dashed var(--theme-terra, #8b4513);
        padding: 40px;
        text-align: center;
        background-color: var(--theme-parchment, #f4ece1);
        border-radius: 8px;
        margin-top: 20px;
    }

    input[type="file"] {
        font-size: 1.1rem;
        cursor: pointer;
    }

    .progress-container {
        margin-top: 20px;
    }

    .progress-bar {
        width: 100%;
        height: 20px;
        background-color: rgba(139, 69, 19, 0.2);
        border-radius: 10px;
        overflow: hidden;
        margin-top: 10px;
    }

    .progress-fill {
        height: 100%;
        background-color: var(--theme-sindoor, #d32f2f);
        transition: width 0.2s ease-out;
    }

    .status-text {
        color: var(--theme-sindoor, #d32f2f);
        font-size: 1.1rem;
        margin-bottom: 10px;
        animation: pulse 1.5s infinite alternate;
    }

    @keyframes pulse {
        0% { opacity: 0.6; }
        100% { opacity: 1; }
    }
</style>