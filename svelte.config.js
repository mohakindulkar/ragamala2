import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: 'docs',
			assets: 'docs',
			fallback: '404.html' // <-- Change this back to 404.html
		}),
		appDir: 'app',
		paths: {
			base: process.argv.includes('dev') ? '' : '/ragamala2',
		},
		alias: {
			$src: 'src',
			$root: '.' // Points to the very base of your project
		}
	}
};

export default config;