import { f as fallback, a as attr_class, c as slot, e as escape_html, i as bind_props, s as stringify, j as store_get, u as unsubscribe_stores, k as ensure_array_like, b as attr, l as attr_style, h as head } from "../../../chunks/index2.js";
import "../../../chunks/url.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/root.js";
import { G as GlobalOverlay, f as favicon } from "../../../chunks/GlobalOverlay.js";
import { S as SVGDefs } from "../../../chunks/SVGDefs.js";
import { a as activeRaga, c as currentLang, b as audioBgDimmed, d as baithakInstruments, e as currentSeason } from "../../../chunks/stores.js";
import { b as base } from "../../../chunks/server.js";
function Cartouche($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let position = fallback(
      $$props["position"],
      "bottom-left"
      // 'bottom-left' or 'bottom-right'
    );
    let mainIcon = fallback($$props["mainIcon"], "✨");
    let isExpanded = fallback($$props["isExpanded"], false);
    let showMiniBtn = fallback($$props["showMiniBtn"], false);
    let miniIcon = fallback($$props["miniIcon"], "🛑");
    $$renderer2.push(`<div${attr_class(`corner-wrapper ${stringify(position)}`, "svelte-13npihg")}>`);
    if (isExpanded) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="cartouche-panel svelte-13npihg"><!--[-->`);
      slot($$renderer2, $$props, "default", {});
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="functional-corner svelte-13npihg"><button class="corner-toggle-btn svelte-13npihg"><span class="icon">${escape_html(mainIcon)}</span></button> `);
    if (showMiniBtn && !isExpanded) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="mini-control-btn svelte-13npihg">${escape_html(miniIcon)}</button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div>`);
    bind_props($$props, { position, mainIcon, isExpanded, showMiniBtn, miniIcon });
  });
}
function Narrator($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let textToRead, displayName;
    let isSpeaking = false;
    let isExpanded = false;
    if (store_get($$store_subs ??= {}, "$activeRaga", activeRaga)) isExpanded = true;
    textToRead = store_get($$store_subs ??= {}, "$activeRaga", activeRaga)?.i18n?.[store_get($$store_subs ??= {}, "$currentLang", currentLang)]?.description || store_get($$store_subs ??= {}, "$activeRaga", activeRaga)?.description;
    displayName = store_get($$store_subs ??= {}, "$activeRaga", activeRaga)?.i18n?.[store_get($$store_subs ??= {}, "$currentLang", currentLang)]?.name || store_get($$store_subs ??= {}, "$activeRaga", activeRaga)?.name;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (store_get($$store_subs ??= {}, "$activeRaga", activeRaga) && textToRead) {
        $$renderer3.push("<!--[-->");
        Cartouche($$renderer3, {
          position: "bottom-left",
          mainIcon: "🗣️",
          showMiniBtn: isSpeaking,
          miniIcon: "🛑",
          get isExpanded() {
            return isExpanded;
          },
          set isExpanded($$value) {
            isExpanded = $$value;
            $$settled = false;
          },
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="narrator-content svelte-1l9d8sz"><div class="top-section svelte-1l9d8sz">`);
            if (store_get($$store_subs ??= {}, "$activeRaga", activeRaga).image) {
              $$renderer4.push("<!--[-->");
              $$renderer4.push(`<div class="gallery-container svelte-1l9d8sz"><!--[-->`);
              const each_array = ensure_array_like(Array.isArray(store_get($$store_subs ??= {}, "$activeRaga", activeRaga).image) ? store_get($$store_subs ??= {}, "$activeRaga", activeRaga).image : [
                {
                  url: store_get($$store_subs ??= {}, "$activeRaga", activeRaga).image,
                  txt: ""
                }
              ]);
              for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
                let img = each_array[$$index];
                const cleanUrl = img.url.startsWith("/") ? img.url : `/${img.url}`;
                $$renderer4.push(`<button class="thumbnail-btn svelte-1l9d8sz" aria-label="View painting full size"><img${attr("src", `${base}${cleanUrl}`)}${attr("alt", displayName)} class="thumbnail-img svelte-1l9d8sz"/></button>`);
              }
              $$renderer4.push(`<!--]--></div>`);
            } else {
              $$renderer4.push("<!--[!-->");
            }
            $$renderer4.push(`<!--]--> <div class="header-column svelte-1l9d8sz"><button${attr_class("voice-btn svelte-1l9d8sz", void 0, { "active": isSpeaking })} aria-label="Read description aloud"><span class="state-listen svelte-1l9d8sz"><span class="icon svelte-1l9d8sz">🗣️</span> Listen</span> <span class="state-stop svelte-1l9d8sz"><span class="icon svelte-1l9d8sz">🛑</span> Stop</span></button> `);
            if (store_get($$store_subs ??= {}, "$activeRaga", activeRaga).time) {
              $$renderer4.push("<!--[-->");
              $$renderer4.push(`<div class="metadata svelte-1l9d8sz"><span class="meta-label svelte-1l9d8sz">Time:</span> ${escape_html(store_get($$store_subs ??= {}, "$activeRaga", activeRaga).time)}</div>`);
            } else {
              $$renderer4.push("<!--[!-->");
            }
            $$renderer4.push(`<!--]--> <h3 class="raga-title svelte-1l9d8sz">${escape_html(displayName)}</h3></div></div> <p class="poetry-text svelte-1l9d8sz">${escape_html(textToRead)}</p></div>`);
          },
          $$slots: { default: true }
        });
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]-->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function AudioBaithak($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    $$renderer2.push(`<section class="audio-baithak svelte-iehota" aria-label="Baithak scene"${attr_style(`--audio-reactive-opacity: ${store_get($$store_subs ??= {}, "$audioBgDimmed", audioBgDimmed) ? 0.3 : 0}; --audio-bg-blur: ${store_get($$store_subs ??= {}, "$audioBgDimmed", audioBgDimmed) ? 5 : 0}px; --bg-image: url('${base}/images/AudioUI_BG.png');`)}><img${attr_class("instrument tanpura svelte-iehota", void 0, {
      "active": store_get($$store_subs ??= {}, "$baithakInstruments", baithakInstruments).tanpura
    })}${attr("src", `${stringify(base)}/images/AudioUI_Tanpura.png`)} alt="Tanpura" role="button" tabindex="0"/> <img${attr_class("instrument sitar svelte-iehota", void 0, {
      "active": store_get($$store_subs ??= {}, "$baithakInstruments", baithakInstruments).sitar
    })}${attr("src", `${stringify(base)}/images/AudioUI_Sitar.png`)} alt="Sitar" role="button" tabindex="0"/> <img${attr_class("instrument pakhawaj svelte-iehota", void 0, {
      "active": store_get($$store_subs ??= {}, "$baithakInstruments", baithakInstruments).pakhawaj
    })}${attr("src", `${stringify(base)}/images/AudioUI_Pakhawaj.png`)} alt="Pakhawaj" role="button" tabindex="0"/> <img${attr_class("instrument tabla svelte-iehota", void 0, {
      "active": store_get($$store_subs ??= {}, "$baithakInstruments", baithakInstruments).tabla
    })}${attr("src", `${stringify(base)}/images/AudioUI_Tabla.png`)} alt="Tabla" role="button" tabindex="0"/> <img${attr_class("instrument flute svelte-iehota", void 0, {
      "active": store_get($$store_subs ??= {}, "$baithakInstruments", baithakInstruments).flute
    })}${attr("src", `${stringify(base)}/images/AudioUI_Flute.png`)} alt="Flute" role="button" tabindex="0"/></section>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { children } = $$props;
    head("1t3w9jl", $$renderer2, ($$renderer3) => {
      $$renderer3.push(`<link rel="icon"${attr("href", favicon)}/>`);
    });
    SVGDefs($$renderer2);
    $$renderer2.push(`<!----> <div class="app-wrapper svelte-1t3w9jl"${attr_style(` --active-bg-color: var(--${stringify(store_get($$store_subs ??= {}, "$currentSeason", currentSeason).toLowerCase())}-1); --border-color: var(--${stringify(store_get($$store_subs ??= {}, "$currentSeason", currentSeason).toLowerCase())}-vine); --text-color: var(--${stringify(store_get($$store_subs ??= {}, "$currentSeason", currentSeason).toLowerCase())}-vine); --accent-color: var(--${stringify(store_get($$store_subs ??= {}, "$currentSeason", currentSeason).toLowerCase())}-7); --active-accent-color: var(--${stringify(store_get($$store_subs ??= {}, "$currentSeason", currentSeason).toLowerCase())}-5); --active-damask: var(--damask-${stringify(store_get($$store_subs ??= {}, "$currentSeason", currentSeason).toLowerCase())}); --damask-size: var(--damask-size-${stringify(store_get($$store_subs ??= {}, "$currentSeason", currentSeason).toLowerCase())}, 150px 200px); --active-damask-w: var(--damask-w-${stringify(store_get($$store_subs ??= {}, "$currentSeason", currentSeason).toLowerCase())}, 150px); --active-damask-h: var(--damask-h-${stringify(store_get($$store_subs ??= {}, "$currentSeason", currentSeason).toLowerCase())}, 200px); `)}>`);
    Narrator($$renderer2);
    $$renderer2.push(`<!----> `);
    AudioBaithak($$renderer2);
    $$renderer2.push(`<!----> <div class="page-content svelte-1t3w9jl">`);
    children($$renderer2);
    $$renderer2.push(`<!----></div> `);
    GlobalOverlay($$renderer2);
    $$renderer2.push(`<!----></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _layout as default
};
