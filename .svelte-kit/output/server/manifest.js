export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "app",
	appPath: "ragamala2/app",
	assets: new Set(["ar/bhairav-main.mind","ar/dipak-main.mind","ar/kakubha-ragini-roseberys-london.mind","ar/malkauns-main.mind","ar/targets-gallery.mind","ar/todi-ragini.mind","arch-mask.svg","audio/bhairav-audio.wav","audio/bhairavflute-audio.wav","audio/dipak-audio.wav","audio/dipakflute-audio.wav","audio/grishma.mp3","audio/hemant.mp3","audio/hindol-audio.wav","audio/hindolflute-audio.wav","audio/malkauns-audio.wav","audio/malkaunsflute-audio.wav","audio/megh-audio.wav","audio/meghflute-audio.wav","audio/sharad.mp3","audio/shishira.mp3","audio/sri-audio.wav","audio/sriflute-audio.wav","audio/varsha.mp3","audio/vasanta.mp3","avatar.png","half-arch-mask.svg","images/AudioUI_BG.png","images/AudioUI_Flute.png","images/AudioUI_Pakhawaj.png","images/AudioUI_Sitar.png","images/AudioUI_Tabla.png","images/AudioUI_Tanpura.png","images/bhairav-main.jpg","images/dawn.png","images/day.png","images/dipak-main.jpg","images/dusk.png","images/grishma_main.jpg","images/hemant_main.jpg","images/hindol-main.jpg","images/malkauns-main.jpg","images/megh-main.jpg","images/my-cool-pointer.svg","images/night.png","images/placeholder_bhairav.png","images/placeholder_dipak.png","images/placeholder_hindol.png","images/placeholder_malkauns.png","images/placeholder_megh.png","images/placeholder_sri.png","images/sharad_main.jpg","images/shishir_main.jpg","images/sri-main.jpg","images/todi-ragini.jpg","images/varsha_main.jpg","images/vasant_main.jpg","robots.txt","seamless.svg","video/bhairav-main.mp4","video/dancing-video.mp4","video/kakubha-ragini-roseberys-london.mp4","video/malkauns-main.mp4","video/Raga-Sri.mp4","video/todi-ragini.mp4"]),
	mimeTypes: {".svg":"image/svg+xml",".wav":"audio/wav",".mp3":"audio/mpeg",".png":"image/png",".jpg":"image/jpeg",".txt":"text/plain",".mp4":"video/mp4"},
	_: {
		client: {start:"app/immutable/entry/start.Cf9eET6t.js",app:"app/immutable/entry/app.BRadQTOK.js",imports:["app/immutable/entry/start.Cf9eET6t.js","app/immutable/chunks/C0y0xgsl.js","app/immutable/chunks/C4vc2zeP.js","app/immutable/chunks/D_B3Ac1u.js","app/immutable/chunks/CGEji7Dl.js","app/immutable/chunks/T2U6HFee.js","app/immutable/entry/app.BRadQTOK.js","app/immutable/chunks/PPVm8Dsz.js","app/immutable/chunks/C4vc2zeP.js","app/immutable/chunks/BWahjdXb.js","app/immutable/chunks/DMAE-uXb.js","app/immutable/chunks/T2U6HFee.js","app/immutable/chunks/CsQB06Or.js","app/immutable/chunks/C8H7Gzi1.js","app/immutable/chunks/DC1-aycO.js","app/immutable/chunks/BmYlyl3X.js","app/immutable/chunks/D_B3Ac1u.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/6.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/ar-lens",
				pattern: /^\/ar-lens\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set(["/ragamala2/","/ragamala2/admin/compiler","/ragamala2/family-tree"]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
