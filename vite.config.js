import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl'; // NEW: Import the plugin

export default defineConfig({
	plugins: [
		sveltekit(),
		// basicSsl() // Temporarily disabled for Ngrok testing
	],
	server: {
		host: true, // Keeps your network IP open
        allowedHosts: ['gizzard-parole-carload.ngrok-free.dev', '.ngrok-free.app', 'all'], // Force allow Ngrok
	}
});
