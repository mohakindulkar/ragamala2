import { j as store_get, a as attr_class, b as attr, e as escape_html, u as unsubscribe_stores } from "./index2.js";
import { b as base } from "./server.js";
import "./url.js";
import "@sveltejs/kit/internal/server";
import "./root.js";
import { o as overlayData } from "./stores.js";
const favicon = "/ragamala2/app/immutable/assets/favicon.CNdglpCw.svg";
function GlobalOverlay($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let isSpeaking = false;
    let isMagicMode = false;
    if (store_get($$store_subs ??= {}, "$overlayData", overlayData)) {
      $$renderer2.push("<!--[-->");
      const fullUrl = store_get($$store_subs ??= {}, "$overlayData", overlayData).url.startsWith("http") || store_get($$store_subs ??= {}, "$overlayData", overlayData).url.startsWith(base) ? store_get($$store_subs ??= {}, "$overlayData", overlayData).url : `${base}/${store_get($$store_subs ??= {}, "$overlayData", overlayData).url.replace(/^\//, "")}`;
      $$renderer2.push(`<div class="overlay-backdrop svelte-19jl3wp"><div class="overlay-content svelte-19jl3wp"><div class="target-stage svelte-19jl3wp"><div${attr_class("overlay-frame svelte-19jl3wp", void 0, { "magic-glow": isMagicMode })}><img${attr("src", fullUrl)} alt="Full screen ragamala" class="overlay-img svelte-19jl3wp"/></div> `);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div> <div class="caption-container svelte-19jl3wp"><p class="overlay-caption svelte-19jl3wp">${escape_html(store_get($$store_subs ??= {}, "$overlayData", overlayData).txt)}</p> <div class="overlay-controls svelte-19jl3wp"><button${attr_class("voice-btn ar-btn svelte-19jl3wp", void 0, { "active": isMagicMode })}><span class="icon svelte-19jl3wp">📱✨</span> ${escape_html("Experience in AR")}</button> <button${attr_class("voice-btn svelte-19jl3wp", void 0, { "active": isSpeaking })} aria-label="Read description aloud"><span class="state-listen svelte-19jl3wp"><span class="icon svelte-19jl3wp">🗣️</span> Listen</span> <span class="state-stop svelte-19jl3wp"><span class="icon svelte-19jl3wp">🛑</span> Stop</span></button> <button class="close-btn svelte-19jl3wp" aria-label="Close overlay">✖</button></div></div></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  GlobalOverlay as G,
  favicon as f
};
