import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl'; // NEW: Import the plugin

export default defineConfig({
	plugins: [
		sveltekit(),
		basicSsl() // NEW: Add it here!
	],
	server: {
		host: true // Keeps your network IP open
	}
});
