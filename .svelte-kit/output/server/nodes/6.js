import * as universal from '../entries/pages/ar-lens/_page.js';

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/ar-lens/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/ar-lens/+page.js";
export const imports = ["app/immutable/nodes/6.DVKPt3bM.js","app/immutable/chunks/DMAE-uXb.js","app/immutable/chunks/C4vc2zeP.js","app/immutable/chunks/DrEL6ocM.js","app/immutable/chunks/BWahjdXb.js","app/immutable/chunks/CsQB06Or.js","app/immutable/chunks/CAontmVo.js","app/immutable/chunks/CefJpvA-.js","app/immutable/chunks/BmYlyl3X.js","app/immutable/chunks/D_B3Ac1u.js","app/immutable/chunks/lgUOpW6L.js","app/immutable/chunks/Btl8vM7_.js","app/immutable/chunks/T2U6HFee.js","app/immutable/chunks/DdmVunps.js","app/immutable/chunks/C8H7Gzi1.js","app/immutable/chunks/DC1-aycO.js"];
export const stylesheets = ["app/immutable/assets/6.CSS4nLrk.css"];
export const fonts = [];
