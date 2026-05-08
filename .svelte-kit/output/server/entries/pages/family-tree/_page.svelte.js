import "clsx";
import { j as store_get, a as attr_class, l as attr_style, s as stringify, k as ensure_array_like, b as attr, e as escape_html, u as unsubscribe_stores, i as bind_props } from "../../../chunks/index2.js";
import "../../../chunks/url.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/root.js";
import * as d3 from "d3";
import { o as onDestroy } from "../../../chunks/index-server.js";
import { g as get } from "../../../chunks/index.js";
import { b as audioBgDimmed, a as activeRaga, c as currentLang, i as isFullTreeMode, e as currentSeason } from "../../../chunks/stores.js";
const name$5 = "Dipak";
const season$5 = "Grishma";
const type$5 = "Parent Raga";
const description$5 = "Intense passion; associated with flames and glowing lamps.";
const color$4 = "Fiery Red";
const time$5 = "Summer Night";
const image$5 = [{ "url": "images/dipak-main.jpg", "ar": "ar/dipak-main.mind", "video": "video/dipak-main.mp4", "txt": "Dipak Raga painting." }];
const musicalDNA$5 = { "arohana": ["C4", "Db4", "E4", "F#4", "G4", "Ab4", "B4", "C5"], "avarohana": ["C5", "B4", "Ab4", "G4", "F#4", "E4", "Db4", "C4"], "vadi": "C4", "samvadi": "G4", "tempo": "medium", "playStyle": "intense" };
const children$5 = [{ "name": "Todi", "type": "Ragini", "description": "A radiant woman playing the veena in a grove, charming the wild deer.", "musicalMutation": { "description": "Flattens the 2nd and 3rd notes for a feeling of tender longing.", "flattenNotes": ["Db4", "Eb4"], "vadi": "Eb4" }, "image": [{ "url": "images/todi-ragini.jpg", "ar": "ar/todi-ragini.mind", "video": "video/todi-ragini.mp4", "txt": "Todi Ragini. Opaque watercolor and gold on paper." }], "children": [{ "name": "Kusum", "type": "Ragaputra", "musicalMutation": { "tempo": "fast", "octaveShift": 1 } }, { "name": "Rama", "type": "Ragaputra" }] }, { "name": "Patmanjari", "type": "Ragini", "description": "A woman suffering the heat of separation, consoled by her attendants.", "musicalMutation": { "description": "Drops the 5th note (G4) entirely to create a feeling of emptiness.", "vadi": "F#4", "tempo": "slow" } }, { "name": "Gujri", "type": "Ragini", "description": "A southern village maiden singing sweetly while carrying milk.", "musicalMutation": { "playStyle": "playful", "tempo": "medium-fast" } }, { "name": "Kachheli", "type": "Ragini", "description": "A woman adorning herself in anticipation of her lover." }, { "name": "Kamodi", "type": "Ragini", "description": "A wandering ascetic woman seeking her beloved in the forest." }];
const dipak = {
  name: name$5,
  season: season$5,
  type: type$5,
  description: description$5,
  color: color$4,
  time: time$5,
  image: image$5,
  musicalDNA: musicalDNA$5,
  children: children$5
};
function AncestryTree($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let activeFirstLevel, backgroundWedges;
    let data = $$props["data"];
    let containerWidth = 1e3;
    let containerHeight = 800;
    let currentLanguage = store_get($$store_subs ??= {}, "$currentLang", currentLang);
    let root = null;
    let allNodesFlat = [];
    const PIZZA_RADIUS = 100;
    d3.tree().size([2 * Math.PI, 1]).separation((a, b) => (a.parent == b.parent ? 1 : 1.5) / a.depth);
    d3.linkRadial().angle((d) => d.x).radius((d) => d.y);
    onDestroy(() => {
      audioBgDimmed.set(false);
    });
    function updateTree() {
      currentLanguage = store_get($$store_subs ??= {}, "$currentLang", currentLang);
      return;
    }
    let harvestTimer;
    if (currentLanguage !== store_get($$store_subs ??= {}, "$currentLang", currentLang)) {
      updateTree();
    }
    activeFirstLevel = [];
    audioBgDimmed.set(Boolean(root?.children?.length));
    backgroundWedges = activeFirstLevel.map((child, i, arr) => {
      const getAngle = (node, index) => node.x !== void 0 ? node.x : index * (Math.PI * 2) / 6;
      const prev = arr[i === 0 ? arr.length - 1 : i - 1];
      const next = arr[i === arr.length - 1 ? 0 : i + 1];
      const cx = getAngle(child, i);
      const px = getAngle(prev, i === 0 ? arr.length - 1 : i - 1);
      const nx = getAngle(next, i === arr.length - 1 ? 0 : i + 1);
      const startAngle = i === 0 ? (cx + px - 2 * Math.PI) / 2 : (cx + px) / 2;
      const endAngle = i === arr.length - 1 ? (cx + nx + 2 * Math.PI) / 2 : (cx + nx) / 2;
      const centerAngle = (startAngle + endAngle) / 2;
      const rotationDegrees = centerAngle * (180 / Math.PI);
      const wedgeAngle = Math.abs(endAngle - startAngle);
      const chordWidth = 2 * PIZZA_RADIUS * Math.sin(wedgeAngle / 2);
      const dynamicWidth = Math.max(PIZZA_RADIUS, chordWidth) + 4;
      const arcPath = d3.arc()({
        innerRadius: 0,
        outerRadius: PIZZA_RADIUS,
        startAngle,
        endAngle
      });
      return {
        id: child.data.name,
        season: child.data.season,
        path: arcPath,
        rotation: rotationDegrees,
        // Pass the calculated width to the HTML
        imageWidth: dynamicWidth,
        color: `var(--${child.data.season.toLowerCase()}-bg})` || "#ffffff"
      };
    });
    if (store_get($$store_subs ??= {}, "$currentLang", currentLang)) {
      clearTimeout(harvestTimer);
      if (store_get($$store_subs ??= {}, "$currentLang", currentLang) === "en") {
        updateTree();
      } else {
        harvestTimer = setTimeout(
          () => {
            allNodesFlat.forEach((node) => {
              if (!node.data.i18n) node.data.i18n = {};
              if (!node.data.i18n[store_get($$store_subs ??= {}, "$currentLang", currentLang)]) node.data.i18n[store_get($$store_subs ??= {}, "$currentLang", currentLang)] = {};
              const nameEl = document.getElementById(`trans-name-${node.data.name}`);
              if (nameEl) node.data.i18n[store_get($$store_subs ??= {}, "$currentLang", currentLang)].name = nameEl.innerText;
              const descEl = document.getElementById(`trans-desc-${node.data.name}`);
              if (descEl && node.data.description) {
                node.data.i18n[store_get($$store_subs ??= {}, "$currentLang", currentLang)].description = descEl.innerText;
              }
            });
            updateTree();
            const currentActive = get(activeRaga);
            if (currentActive) {
              activeRaga.set({ ...currentActive });
            }
          },
          1500
        );
      }
    }
    $$renderer2.push(`<div${attr_class("tree-container svelte-1s6c9t7", void 0, {
      "animate-tree": store_get($$store_subs ??= {}, "$isFullTreeMode", isFullTreeMode)
    })}${attr_style(`--bg-color: var(--${stringify(
      // EXPAND ALL
      // COLLAPSE ALL
      store_get($$store_subs ??= {}, "$currentSeason", currentSeason).toLowerCase()
    )}-bg, #f4ece1);`)}><button${attr_class("expand-btn svelte-1s6c9t7", void 0, {
      "active": store_get($$store_subs ??= {}, "$isFullTreeMode", isFullTreeMode)
    })} aria-label="Toggle Full Tree"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24" class="svelte-1s6c9t7">`);
    if (store_get($$store_subs ??= {}, "$isFullTreeMode", isFullTreeMode)) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" class="svelte-1s6c9t7"></path>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" class="svelte-1s6c9t7"></path>`);
    }
    $$renderer2.push(`<!--]--></svg></button> <div class="translation-matrix svelte-1s6c9t7" style="position: absolute; opacity: 0; pointer-events: none; z-index: -1;" aria-hidden="true"><!--[-->`);
    const each_array = ensure_array_like(allNodesFlat);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let node = each_array[$$index];
      $$renderer2.push(`<span${attr("id", `trans-name-${stringify(node.data.name)}`)} class="svelte-1s6c9t7">${escape_html(node.data.name)}</span> `);
      if (node.data.description) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span${attr("id", `trans-desc-${stringify(node.data.name)}`)} class="svelte-1s6c9t7">${escape_html(node.data.description)}</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div> <svg width="100%" height="100%"${attr("viewBox", `-${stringify(containerWidth / 2)} -${stringify(containerHeight / 2)} ${stringify(containerWidth)} ${stringify(containerHeight)}`)} style="cursor: grab; pointer-events: none;" class="svelte-1s6c9t7"><defs class="svelte-1s6c9t7"><clipPath id="avatar-clip" class="svelte-1s6c9t7"><circle r="20" cx="0" cy="0" class="svelte-1s6c9t7"></circle></clipPath><!--[-->`);
    const each_array_1 = ensure_array_like(backgroundWedges);
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let wedge = each_array_1[$$index_1];
      $$renderer2.push(`<clipPath${attr("id", `clip-${stringify(wedge.id)}`)} class="svelte-1s6c9t7"><path${attr("d", wedge.path)} class="svelte-1s6c9t7"></path></clipPath>`);
    }
    $$renderer2.push(`<!--]--></defs>`);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></svg></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { data });
  });
}
const name$4 = "Hindol";
const season$4 = "Vasanta";
const type$4 = "Parent Raga";
const description$4 = "Joyous and playful; personified as Lord Krishna on a swing (hindola).";
const color$3 = "Vibrant/Fertile (associated with Holi)";
const time$4 = "Spring";
const image$4 = [{ "url": "images/hindol-main.jpg", "ar": "ar/hindol-main.mind", "video": "video/hindol-main.mp4", "txt": "Hindol Raga painting." }];
const musicalDNA$4 = { "arohana": ["C4", "E4", "F#4", "A4", "B4", "C5"], "avarohana": ["C5", "B4", "A4", "F#4", "E4", "C4"], "vadi": "A4", "samvadi": "E4", "tempo": "medium-fast", "playStyle": "playful" };
const children$4 = [{ "name": "Basanti", "type": "Ragini", "description": "A radiant woman plucking spring blossoms to offer to the gods.", "musicalMutation": { "description": "Raises the 4th note to create a sharp, bright springtime feeling.", "vadi": "E4", "tempo": "fast" }, "children": [{ "name": "Vasant", "type": "Ragaputra", "musicalMutation": { "description": "Plays strictly in the upper register.", "octaveShift": 1, "playStyle": "playful" } }, { "name": "Pancham", "type": "Ragaputra" }] }, { "name": "Sindhoori", "type": "Ragini", "description": "Lovers playfully throwing vibrant red powder (sindoor) during the Holi festival.", "musicalMutation": { "playStyle": "staccato-plucks", "tempo": "medium-fast" } }, { "name": "Telangi", "type": "Ragini", "description": "A woman applying cooling sandalwood paste to her body in the warming spring air.", "musicalMutation": { "vadi": "C5", "tempo": "medium" } }, { "name": "Devkari", "type": "Ragini", "description": "A devoted woman offering prayers at a forest shrine." }, { "name": "Aheeri", "type": "Ragini", "description": "A cowherd girl waiting for Krishna by the riverbank." }];
const hindol = {
  name: name$4,
  season: season$4,
  type: type$4,
  description: description$4,
  color: color$3,
  time: time$4,
  image: image$4,
  musicalDNA: musicalDNA$4,
  children: children$4
};
const name$3 = "Megh";
const season$3 = "Varsha";
const type$3 = "Parent Raga";
const description$3 = "Refreshing and romantic; personified as Krishna dancing in the rain.";
const color$2 = "Dark Storm Clouds / Deep Blue";
const time$3 = "Monsoon";
const image$3 = [{ "url": "images/megh-main.jpg", "ar": "ar/megh-main.mind", "video": "video/megh-main.mp4", "txt": "Megh Raga painting." }];
const musicalDNA$3 = { "arohana": ["C4", "D4", "F4", "G4", "Bb4", "C5"], "avarohana": ["C5", "Bb4", "G4", "F4", "D4", "C4"], "vadi": "C4", "samvadi": "G4", "tempo": "slow", "playStyle": "heavy-slides" };
const children$3 = [{ "name": "Gaundi-Malari", "type": "Ragini", "description": "A joyous woman celebrating the first monsoon rains, surrounded by dancing peacocks.", "musicalMutation": { "description": "Adds a natural 3rd (E4) to brighten the storm clouds.", "vadi": "F4", "playStyle": "heavy-slides" }, "image": [{ "url": "images/kakubha-ragini-roseberys-london.jpeg", "ar": "ar/kakubha-ragini-roseberys-london.mind", "video": "video/kakubha-ragini-roseberys-london.mp4", "txt": "Gaundi-Malari Ragini. Opaque watercolor and gold on paper." }], "children": [{ "name": "Jalandhar", "type": "Ragaputra", "musicalMutation": { "description": "Mimics the rapid patter of heavy rain.", "tempo": "fast", "vadi": "C5" } }, { "name": "Gond", "type": "Ragaputra" }] }, { "name": "Sorath", "type": "Ragini", "description": "A woman feeding a peacock under a heavily overcast sky.", "musicalMutation": { "description": "Flattens the 6th note for a moody, humid atmosphere.", "flattenNotes": ["Ab4"], "tempo": "slow" } }, { "name": "Asa", "type": "Ragini", "description": "A confident woman preparing her bedchamber for a rainy night." }, { "name": "Gunguni", "type": "Ragini", "description": "A woman shivering slightly in the cool monsoon breeze." }, { "name": "Sooho", "type": "Ragini", "description": "A spirited woman riding a horse through a lightning storm." }];
const megh = {
  name: name$3,
  season: season$3,
  type: type$3,
  description: description$3,
  color: color$2,
  time: time$3,
  image: image$3,
  musicalDNA: musicalDNA$3,
  children: children$3
};
const name$2 = "Sri";
const season$2 = "Sharad";
const type$2 = "Parent Raga";
const description$2 = "Grand and heroic; an aristocratic king seated on a terrace.";
const color$1 = "Lavish Gold";
const time$2 = "Autumn / Early Evening";
const image$2 = [{ "url": "images/sri-main.jpg", "ar": "ar/sri-main.mind", "video": "video/sri-main.mp4", "txt": "Sri Raga painting." }];
const musicalDNA$2 = { "arohana": ["C4", "Db4", "E4", "F#4", "G4", "Ab4", "B4", "C5"], "avarohana": ["C5", "B4", "Ab4", "G4", "F#4", "E4", "Db4", "C4"], "vadi": "Db4", "samvadi": "G4", "tempo": "slow-medium", "playStyle": "hesitant-leaps" };
const children$2 = [{ "name": "Asavari", "type": "Ragini", "description": "A wild, ascetic woman sitting on a mountaintop, charming snakes with her flute.", "musicalMutation": { "description": "Introduces a flat 2nd (Db4) to create a hypnotic, undulating melody.", "vadi": "Db4", "playStyle": "gliding" }, "children": [{ "name": "Bangal", "type": "Ragaputra", "musicalMutation": { "description": "Jumps erratically between the lower and upper registers.", "playStyle": "hesitant-leaps" } }] }, { "name": "Gauri", "type": "Ragini", "description": "A woman wandering in the autumn woods, holding wands of blossoming flowers.", "musicalMutation": { "description": "Rests heavily on the 5th note (G4) to create a feeling of golden, autumnal stability.", "vadi": "G4", "tempo": "slow-medium" }, "children": [{ "name": "Kumbh", "type": "Ragaputra" }] }, { "name": "Bairavi", "type": "Ragini", "description": "A devotee offering white lotuses to a Shiva lingam at dawn.", "musicalMutation": { "tempo": "slow", "playStyle": "meditative" } }, { "name": "Karnati", "type": "Ragini", "description": "A regal woman reading a manuscript by the light of an oil lamp." }, { "name": "Sindhavi", "type": "Ragini", "description": "A passionate woman confronting her lover after a night of betrayal." }];
const sri = {
  name: name$2,
  season: season$2,
  type: type$2,
  description: description$2,
  color: color$1,
  time: time$2,
  image: image$2,
  musicalDNA: musicalDNA$2,
  children: children$2
};
const name$1 = "Malkauns";
const season$1 = "Hemant";
const type$1 = "Parent Raga";
const description$1 = "Royal grandeur and youthful love; an aristocratic human lord holding court.";
const color = "Fair-complexioned (Raginis: 'Color of Love')";
const time$1 = "Midnight";
const image$1 = [{ "url": "images/malkauns-main.jpg", "ar": "ar/malkauns-main.mind", "video": "video/malkauns-main.mp4", "txt": "Malkauns Raga painting." }];
const musicalDNA$1 = { "arohana": ["C4", "Eb4", "F4", "Ab4", "Bb4", "C5"], "avarohana": ["C5", "Bb4", "Ab4", "F4", "Eb4", "C4"], "vadi": "F4", "samvadi": "C4", "tempo": "slow", "playStyle": "meditative" };
const children$1 = [{ "name": "Dhanasri", "type": "Ragini", "description": "A weeping woman painting a portrait of her absent lover to ease her sorrow.", "musicalMutation": { "description": "Flattens the 3rd and 6th notes heavily to evoke Karuna (compassion and longing).", "flattenNotes": ["Eb4", "Ab4"], "vadi": "Eb4", "tempo": "slow" }, "children": [{ "name": "Maru", "type": "Ragaputra", "musicalMutation": { "tempo": "slow", "playStyle": "meditative" } }, { "name": "Mewar", "type": "Ragaputra" }] }, { "name": "Devagandhari", "type": "Ragini", "description": "An ascetic woman practicing austerities in a ruined temple.", "musicalMutation": { "description": "Uses slow, heavy slides between notes to create a mystic atmosphere.", "playStyle": "heavy-slides", "vadi": "F4" } }, { "name": "Gaundkari", "type": "Ragini", "description": "A restless woman pacing a palace terrace under the winter moon." }, { "name": "Gandhari", "type": "Ragini", "description": "A wandering female mendicant singing spiritual verses." }, { "name": "Seehute", "type": "Ragini", "description": "A warrior woman holding a sword, waiting by a midnight fire." }];
const malkauns = {
  name: name$1,
  season: season$1,
  type: type$1,
  description: description$1,
  color,
  time: time$1,
  image: image$1,
  musicalDNA: musicalDNA$1,
  children: children$1
};
const name = "Bhairav";
const season = "Shishira";
const type = "Parent Raga";
const description = "Solemn, devotional, and ascetic; personified as Lord Shiva.";
const time = "Dawn";
const image = [{ "url": "images/bhairav-main.jpg", "ar": "ar/bhairav-main.mind", "video": "video/bhairav-main.mp4", "txt": "Bhairav Raga painting." }];
const musicalDNA = { "arohana": ["C4", "Db4", "E4", "F4", "G4", "Ab4", "B4", "C5"], "avarohana": ["C5", "B4", "Ab4", "G4", "F4", "E4", "Db4", "C4"], "vadi": "Ab4", "samvadi": "Db4", "tempo": "slow", "playStyle": "gliding" };
const children = [{ "name": "Bhairavi", "type": "Ragini", "musicalMutation": { "description": "Flattens the 3rd and 7th to create compassion (Karuna)", "flatten": ["E4", "B4"], "vadi": "F4" }, "children": [{ "name": "Pancham", "type": "ragaputra", "musicalMutation": { "description": "Takes the mother's scale but plays it in a playful, double-time tempo", "tempo": "fast", "octaveShift": 1 } }, { "name": "Harakh", "type": "ragaputra" }] }, { "name": "Bilawali", "type": "Ragini" }, { "name": "Punyaki", "type": "Ragini" }, { "name": "Bangali", "type": "Ragini" }, { "name": "Aslekhi", "type": "Ragini" }];
const bhairav = {
  name,
  season,
  type,
  description,
  time,
  image,
  musicalDNA,
  children
};
function _page($$renderer) {
  const data = {
    name: "Ragamala",
    children: [hindol, dipak, megh, sri, malkauns, bhairav]
  };
  AncestryTree($$renderer, {
    // Now pass 'data' to d3.hierarchy(data) as usual
    data
  });
}
export {
  _page as default
};
