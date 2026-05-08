import { g as getContext, i as bind_props, j as store_get, h as head, e as escape_html, u as unsubscribe_stores } from "../../../chunks/index2.js";
import "clsx";
import "@sveltejs/kit/internal";
import "../../../chunks/url.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/root.js";
import "../../../chunks/exports.js";
import "../../../chunks/state.svelte.js";
import { o as onDestroy } from "../../../chunks/index-server.js";
const getStores = () => {
  const stores$1 = getContext("__svelte__");
  return {
    /** @type {typeof page} */
    page: {
      subscribe: stores$1.page.subscribe
    },
    /** @type {typeof navigating} */
    navigating: {
      subscribe: stores$1.navigating.subscribe
    },
    /** @type {typeof updated} */
    updated: stores$1.updated
  };
};
const page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
function ARViewer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let arMindUrl = $$props["arMindUrl"];
    let videoUrl = $$props["videoUrl"];
    onDestroy(() => {
    });
    $$renderer2.push(`<div class="ar-container svelte-19g7uhz">`);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="loading-ar svelte-19g7uhz"><p>Loading AR Engine...</p></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { arMindUrl, videoUrl });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let arMindUrl, videoUrl;
    arMindUrl = decodeURIComponent(store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("mind") || "");
    videoUrl = decodeURIComponent(store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("video") || "");
    head("1d4gg95", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Museum AR Lens</title>`);
      });
      $$renderer3.push(`<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>`);
    });
    $$renderer2.push(`<div class="lens-wrapper svelte-1d4gg95"><header class="lens-header svelte-1d4gg95"><button class="back-btn svelte-1d4gg95">← Back</button> <div class="instructions svelte-1d4gg95"><h1 class="svelte-1d4gg95">Museum Lens</h1> <p class="svelte-1d4gg95">Point your camera at the glowing painting on the screen.</p></div></header> <main class="scanner-area svelte-1d4gg95">`);
    if (arMindUrl && videoUrl) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="debug-info" style="display: none;"><p>Mind: ${escape_html(arMindUrl)}</p> <p>Video: ${escape_html(videoUrl)}</p></div> `);
      ARViewer($$renderer2, { arMindUrl, videoUrl });
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="error-state svelte-1d4gg95"><span class="icon svelte-1d4gg95">⚠️</span> <p>No artwork specified.</p> <p style="font-size: 0.7rem; opacity: 0.5;">${escape_html(store_get($$store_subs ??= {}, "$page", page).url.search)}</p></div>`);
    }
    $$renderer2.push(`<!--]--></main></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
