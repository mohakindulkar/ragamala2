import { d as derived, h as head, a as attr_class, s as stringify, b as attr } from "../../chunks/index2.js";
import { p as page } from "../../chunks/index3.js";
import { G as GlobalOverlay, f as favicon } from "../../chunks/GlobalOverlay.js";
import "../../chunks/stores.js";
import "clsx";
import { b as base } from "../../chunks/server.js";
import "../../chunks/url.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/root.js";
import "@sveltejs/kit/internal";
import "../../chunks/utils.js";
import "../../chunks/exports.js";
import "../../chunks/state.svelte.js";
import { o as onDestroy } from "../../chunks/index-server.js";
function GoogleTranslate($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<div class="translate-container svelte-1qy18kn"><div id="google_translate_element" style="display: none;"></div> <button class="translate-btn svelte-1qy18kn" aria-label="Translate"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"></path></svg></button> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function Navigation($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    function normalizePath(pathname) {
      const cleanBase = (base || "").replace(/\/$/, "");
      const withoutBase = cleanBase && pathname.startsWith(cleanBase) ? pathname.slice(cleanBase.length) || "/" : pathname;
      return withoutBase.replace(/\/+$/, "") || "/";
    }
    let currentPath = derived(() => normalizePath(page.url.pathname));
    let showHomeButton = derived(() => currentPath() === "/family-tree" || currentPath() === "/famil-tree");
    if (showHomeButton()) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<nav class="global-nav svelte-ocbj1u"><button aria-label="Return Home" class="home-btn svelte-ocbj1u"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-50 -50 100 100" width="120" height="120"><use xlink:href="#heart" x="-40" y="-40" width="80" height="80"></use></svg></button></nav>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function AmbientAudio($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    onDestroy(() => {
    });
  });
}
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { children } = $$props;
    let currentRouteClass = derived(() => page.url.pathname === "/" ? "route-home" : `route-${page.url.pathname.replace(/^\//, "").replace(/\//g, "-")}`);
    head("12qhfyh", $$renderer2, ($$renderer3) => {
      $$renderer3.push(`<link rel="icon"${attr("href", favicon)}/>`);
    });
    $$renderer2.push(`<div${attr_class(`app-wrapper ${stringify(currentRouteClass())}`, "svelte-12qhfyh")}>`);
    Navigation($$renderer2);
    $$renderer2.push(`<!----> <div class="widget-layer svelte-12qhfyh"><div class="translate-container svelte-12qhfyh">`);
    GoogleTranslate($$renderer2);
    $$renderer2.push(`<!----></div></div> <main class="page-content svelte-12qhfyh">`);
    children($$renderer2);
    $$renderer2.push(`<!----></main> `);
    GlobalOverlay($$renderer2);
    $$renderer2.push(`<!----> `);
    AmbientAudio($$renderer2);
    $$renderer2.push(`<!----></div>`);
  });
}
export {
  _layout as default
};
