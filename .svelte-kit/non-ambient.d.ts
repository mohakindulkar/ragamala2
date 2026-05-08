
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/admin" | "/admin/compiler" | "/ar-lens" | "/family-tree";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/admin": Record<string, never>;
			"/admin/compiler": Record<string, never>;
			"/ar-lens": Record<string, never>;
			"/family-tree": Record<string, never>
		};
		Pathname(): "/" | "/admin/compiler" | "/ar-lens" | "/family-tree";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/ar/bhairav-main.mind" | "/ar/dipak-main.mind" | "/ar/kakubha-ragini-roseberys-london.mind" | "/ar/malkauns-main.mind" | "/ar/targets-gallery.mind" | "/ar/todi-ragini.mind" | "/arch-mask.svg" | "/audio/bhairav-audio.wav" | "/audio/bhairavflute-audio.wav" | "/audio/dipak-audio.wav" | "/audio/dipakflute-audio.wav" | "/audio/grishma.mp3" | "/audio/hemant.mp3" | "/audio/hindol-audio.wav" | "/audio/hindolflute-audio.wav" | "/audio/malkauns-audio.wav" | "/audio/malkaunsflute-audio.wav" | "/audio/megh-audio.wav" | "/audio/meghflute-audio.wav" | "/audio/sharad.mp3" | "/audio/shishira.mp3" | "/audio/sri-audio.wav" | "/audio/sriflute-audio.wav" | "/audio/varsha.mp3" | "/audio/vasanta.mp3" | "/avatar.png" | "/half-arch-mask.svg" | "/images/AudioUI_BG.png" | "/images/AudioUI_Flute.png" | "/images/AudioUI_Pakhawaj.png" | "/images/AudioUI_Sitar.png" | "/images/AudioUI_Tabla.png" | "/images/AudioUI_Tanpura.png" | "/images/bhairav-main.jpg" | "/images/dawn.png" | "/images/day.png" | "/images/dipak-main.jpg" | "/images/dusk.png" | "/images/grishma_main.jpg" | "/images/hemant_main.jpg" | "/images/hindol-main.jpg" | "/images/malkauns-main.jpg" | "/images/megh-main.jpg" | "/images/my-cool-pointer.svg" | "/images/night.png" | "/images/placeholder_bhairav.png" | "/images/placeholder_dipak.png" | "/images/placeholder_hindol.png" | "/images/placeholder_malkauns.png" | "/images/placeholder_megh.png" | "/images/placeholder_sri.png" | "/images/sharad_main.jpg" | "/images/shishir_main.jpg" | "/images/sri-main.jpg" | "/images/todi-ragini.jpg" | "/images/varsha_main.jpg" | "/images/vasant_main.jpg" | "/robots.txt" | "/seamless.svg" | "/video/bhairav-main.mp4" | "/video/dancing-video.mp4" | "/video/kakubha-ragini-roseberys-london.mp4" | "/video/malkauns-main.mp4" | "/video/Raga-Sri.mp4" | "/video/todi-ragini.mp4" | string & {};
	}
}