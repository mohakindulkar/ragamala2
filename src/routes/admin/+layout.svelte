<script>
    import { browser } from '$app/environment';

    let { children } = $props();

    // NEW: Wrapped these in $state() so the UI knows to update when they change!
    let isAuthenticated = $state(browser ? localStorage.getItem('adminAuth') === 'true' : false);
    let passwordInput = $state('');
    let isError = $state(false);

    // The secret password!
    const SECRET_PIN = "ragamala";

    function handleLogin() {
        if (passwordInput === SECRET_PIN) {
            isAuthenticated = true; // This will now instantly trigger a UI update
            if (browser) localStorage.setItem('adminAuth', 'true');
            isError = false;
        } else {
            isError = true;
            passwordInput = '';
        }
    }

    function handleLogout() {
        isAuthenticated = false;
        if (browser) localStorage.removeItem('adminAuth');
    }
</script>

{#if isAuthenticated}
    <div class="admin-header">
        <span class="badge">Museum Admin Mode</span>
        <button on:click={handleLogout} class="logout-btn">Lock Interface</button>
    </div>

    {@render children()}
{:else}
    <div class="lock-screen">
        <div class="lock-box">
            <span class="icon">🔒</span>
            <h2>Restricted Access</h2>
            <p>This area is for museum staff and developers.</p>

            <form on:submit|preventDefault={handleLogin}>
                <input
                        type="password"
                        bind:value={passwordInput}
                        placeholder="Enter Admin PIN"
                        class:error={isError}
                />
                {#if isError}
                    <p class="error-msg">Incorrect PIN. Please try again.</p>
                {/if}
                <button type="submit" class="login-btn">Unlock</button>
            </form>
        </div>
    </div>
{/if}

<style>
    /* Bouncer UI Styles */
    .lock-screen {
        width: 100vw; height: 100vh;
        display: flex; justify-content: center; align-items: center;
        background-color: var(--theme-ink, #3e2723);
        font-family: var(--font-ui, sans-serif);
    }

    .lock-box {
        background-color: var(--theme-parchment, #f4ece1);
        padding: 40px; border-radius: 8px; text-align: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        border: 2px solid var(--theme-terra, #8b4513);
        max-width: 400px;
    }

    .icon { font-size: 3rem; display: block; margin-bottom: 10px; }
    h2 { margin: 0 0 10px 0; color: var(--theme-sindoor, #d32f2f); }
    p { color: #555; margin-bottom: 20px; }

    input {
        width: 100%; padding: 12px; margin-bottom: 15px;
        border: 2px solid var(--theme-terra); border-radius: 4px;
        font-size: 1rem; text-align: center;
        box-sizing: border-box;
    }

    input.error { border-color: red; background-color: #ffeaea; }
    .error-msg { color: red; font-size: 0.85rem; margin-top: -10px; margin-bottom: 15px; }

    .login-btn {
        width: 100%; padding: 12px; background-color: var(--theme-sindoor, #d32f2f);
        color: white; border: none; border-radius: 4px; font-weight: bold;
        cursor: pointer; transition: background 0.2s;
    }
    .login-btn:hover { background-color: var(--theme-ink); }

    /* Authenticated Header Styles */
    .admin-header {
        display: flex; justify-content: space-between; align-items: center;
        background-color: var(--theme-ink, #3e2723); padding: 10px 20px;
        color: var(--theme-parchment); font-family: var(--font-ui);
        margin-top: 0;
        position: fixed;
        width: 50%;
    }

    .badge { font-weight: bold; color: var(--active-accent-color, #ffaa00); }

    .logout-btn {
        background: transparent; border: 1px solid var(--theme-parchment);
        color: var(--theme-parchment); padding: 5px 10px; border-radius: 4px;
        cursor: pointer;
    }
    .logout-btn:hover { background: var(--theme-parchment); color: var(--theme-ink); }
</style>