import * as universal from '../entries/pages/_layout.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.js";
export const imports = ["app/immutable/nodes/0.QM_boRx-.js","app/immutable/chunks/DMAE-uXb.js","app/immutable/chunks/C4vc2zeP.js","app/immutable/chunks/BhuULCLL.js","app/immutable/chunks/CsQB06Or.js","app/immutable/chunks/CAontmVo.js","app/immutable/chunks/DdmVunps.js","app/immutable/chunks/C4yBMGFJ.js","app/immutable/chunks/BKuqSeVd.js","app/immutable/chunks/L-ApMFij.js","app/immutable/chunks/Btl8vM7_.js","app/immutable/chunks/T2U6HFee.js","app/immutable/chunks/D_B3Ac1u.js","app/immutable/chunks/lgUOpW6L.js","app/immutable/chunks/CJD-84YO.js","app/immutable/chunks/DrEL6ocM.js","app/immutable/chunks/BWahjdXb.js","app/immutable/chunks/kUgHR4Xd.js","app/immutable/chunks/CefJpvA-.js","app/immutable/chunks/BmYlyl3X.js","app/immutable/chunks/CiInD2tB.js","app/immutable/chunks/dap0wcy5.js"];
export const stylesheets = ["app/immutable/assets/GlobalOverlay.C5HMy86z.css","app/immutable/assets/0.jALdU5i7.css"];
export const fonts = [];
