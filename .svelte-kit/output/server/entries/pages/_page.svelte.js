import { b as attr, e as escape_html, l as attr_style, c as slot, d as derived, s as stringify, k as ensure_array_like, a as attr_class, j as store_get, u as unsubscribe_stores } from "../../chunks/index2.js";
import "../../chunks/url.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/root.js";
import { g as goto } from "../../chunks/client.js";
import { b as base } from "../../chunks/server.js";
import { o as onDestroy } from "../../chunks/index-server.js";
import { e as currentSeason } from "../../chunks/stores.js";
import { S as SVGDefs } from "../../chunks/SVGDefs.js";
const timeData = [
  {
    id: "night",
    name: "Ratri",
    startHour: 0,
    endHour: 6,
    icon: "night-clear",
    color: "#050515",
    glow: "#4a90e2",
    description: "The deep peace of midnight. A time for introspection, secrets, and the cooling of the earth.",
    verse: "The world sleeps in shadows."
  },
  {
    id: "dawn",
    name: "Prabhat",
    startHour: 6,
    endHour: 12,
    icon: "sunrise",
    color: "#ffb347",
    glow: "#ffb347",
    description: "The birth of light. Birds announce the day and the scent of fresh blossoms fills the air.",
    verse: "Awakening with the sun."
  },
  {
    id: "day",
    name: "Madhyahna",
    startHour: 12,
    endHour: 18,
    icon: "sun-high",
    color: "#ffc400",
    glow: "#ffc400",
    description: "The peak of vitality. Life is in full motion under the golden gaze of the meridian sun.",
    verse: "The peak of light and heat."
  },
  {
    id: "dusk",
    name: "Sandhya",
    startHour: 18,
    endHour: 24,
    icon: "sunset",
    color: "#d35400",
    glow: "#e65100",
    description: "The union of day and night. A meditative hour where colors bleed into orange and indigo.",
    verse: "Colors fade into the twilight."
  }
];
const seasonsData = [
  {
    name: "Vasanta",
    wing: "left",
    start: 0,
    end: 120,
    color: "#8bc34a",
    symbol: "Cuckoo / Mango Blossom",
    icon: "❀",
    description: "Spring: The king of seasons. It is associated with rebirth, the flowering of mango trees, and the song of the cuckoo bird."
  },
  {
    name: "Grishma",
    wing: "left",
    start: 120,
    end: 240,
    color: "#ffb300",
    symbol: "Sun / Gazelle",
    icon: "☀",
    description: "Summer: A season of intense heat. Iconography often features gazelles seeking water in mirages and parched earth."
  },
  {
    name: "Varsha",
    wing: "left",
    start: 240,
    end: 360,
    color: "#1e88e5",
    symbol: "Dark Clouds / Peacock",
    icon: "⛈",
    description: "Monsoon: The arrival of life-giving rains. Symbolized by heavy clouds and the peacock dancing in ecstasy."
  },
  {
    name: "Sharad",
    wing: "right",
    start: 0,
    end: 120,
    color: "#fb8c00",
    symbol: "Full Moon / Lotus",
    icon: "☾",
    description: "Autumn: A time of clarity and calm. The harvest moon shines brightest and white lotuses bloom in still waters."
  },
  {
    name: "Hemant",
    wing: "right",
    start: 120,
    end: 240,
    color: "#8d6e63",
    symbol: "Ripened Grain / Sugarcane",
    icon: "🌾",
    description: "Early Winter: The season of abundance and harvest. Represented by fields of gold grain and a pleasant chill."
  },
  {
    name: "Shishira",
    wing: "right",
    start: 240,
    end: 360,
    color: "#546e7a",
    symbol: "Frost / Barren Branch",
    icon: "❄",
    description: "Late Winter: Deep cold and mist. Represents the quiet stillness of nature and the inward focus of energy."
  }
];
function Clock($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { onHoleClick } = $$props;
    let timeRotation = 0;
    let currentHour = (/* @__PURE__ */ new Date()).getHours();
    let activeTime = derived(() => timeData.find((t) => currentHour >= t.startHour && currentHour < t.endHour) || timeData[0]);
    onDestroy(() => {
    });
    $$renderer2.push(`<defs><clipPath id="doughnut-clip"><path d="M 0 -100 A 100 100 0 1 1 0 100 A 100 100 0 1 1 0 -100 M 0 -38 A 38 38 0 1 0 0 38 A 38 38 0 1 0 0 -38" fill-rule="evenodd"></path></clipPath><clipPath id="quad-1"><path d="M 0 0 L 0 -100 A 100 100 0 0 1 100 0 Z"></path></clipPath><clipPath id="quad-2"><path d="M 0 0 L 100 0 A 100 100 0 0 1 0 100 Z"></path></clipPath><clipPath id="quad-3"><path d="M 0 0 L 0 100 A 100 100 0 0 1 -100 0 Z"></path></clipPath><clipPath id="quad-4"><path d="M 0 0 L -100 0 A 100 100 0 0 1 0 -100 Z"></path></clipPath></defs><g class="time-circle"><g clip-path="url(#doughnut-clip)"><image${attr("href", `${stringify(base)}/images/day.png`)} x="0" y="-100" width="100" height="100" preserveAspectRatio="xMidYMid slice" clip-path="url(#quad-1)"></image><image${attr("href", `${stringify(base)}/images/dusk.png`)} x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice" clip-path="url(#quad-2)"></image><image${attr("href", `${stringify(base)}/images/night.png`)} x="-100" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice" clip-path="url(#quad-3)"></image><image${attr("href", `${stringify(base)}/images/dawn.png`)} x="-100" y="-100" width="100" height="100" preserveAspectRatio="xMidYMid slice" clip-path="url(#quad-4)"></image>`);
    if (timeData[0]) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<circle class="time-overlay-path svelte-13d36y" cx="0" cy="0" r="100"${attr("fill", timeData[2].color)} opacity="0" clip-path="url(#quad-1)"></circle><circle class="time-overlay-path svelte-13d36y" cx="0" cy="0" r="100"${attr("fill", timeData[3].color)} opacity="0" clip-path="url(#quad-2)"></circle><circle class="time-overlay-path svelte-13d36y" cx="0" cy="0" r="100"${attr("fill", timeData[0].color)} opacity="0" clip-path="url(#quad-3)"></circle><circle class="time-overlay-path svelte-13d36y" cx="0" cy="0" r="100"${attr("fill", timeData[1].color)} opacity="0" stroke="var(--theme-terra)" stroke-width="1" stroke-opacity="1" clip-path="url(#quad-4)"></circle>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></g><circle cx="0" cy="0" r="100" fill="none" stroke="var(--theme-terra)" stroke-width="4"></circle><g class="center-button-group svelte-13d36y"><circle cx="0" cy="0" r="38" fill="none"${attr("stroke", activeTime().glow)} stroke-width="12" style="filter: blur(6px);" class="doughnut-glow svelte-13d36y"></circle><circle cx="0" cy="0" r="38" fill="var(--theme-ink)" stroke="var(--active-accent-color)" stroke-width="3" class="doughnut-hole svelte-13d36y"></circle><foreignObject x="-36" y="-36" width="72" height="72" style="pointer-events: none;"><div xmlns="http://www.w3.org/1999/xhtml" class="center-info-hole svelte-13d36y"><span class="verse-title svelte-13d36y">${escape_html(activeTime().name)}</span> <span class="verse-text svelte-13d36y">${escape_html(activeTime().verse)}</span> <div class="divider svelte-13d36y"></div> <span class="enter-btn svelte-13d36y">Play (${escape_html(activeTime().startHour)}-${escape_html(activeTime().endHour)})</span></div></foreignObject></g></g><g class="pointer-group svelte-13d36y"${attr_style(`transform: rotate(${stringify(timeRotation)}deg);`)}><!--[-->`);
    slot($$renderer2, $$props, "default", {});
    $$renderer2.push(`<!--]--><image${attr("href", `${stringify(base)}/images/my-cool-pointer.svg`)} x="-18" y="-80" width="36" height="42" style="filter: brightness(0) invert(1); opacity: 0.7;"></image></g>`);
  });
}
function Seasons($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const R = 90;
    let leftRotation = 0;
    let rightRotation = -180;
    let harvestedLabels = {};
    const leftSeasons = seasonsData.filter((s) => s.wing === "left");
    const rightSeasons = seasonsData.filter((s) => s.wing === "right");
    const seasonMainImages = {
      Vasanta: `${base}/images/vasant_main.jpg`,
      Grishma: `${base}/images/grishma_main.jpg`,
      Varsha: `${base}/images/varsha_main.jpg`,
      Sharad: `${base}/images/sharad_main.jpg`,
      Hemant: `${base}/images/hemant_main.jpg`,
      Shishira: `${base}/images/shishir_main.jpg`
    };
    const seasonImageScale = {
      Vasanta: 0.92,
      Grishma: 0.9,
      Varsha: 0.9,
      Sharad: 0.92,
      Hemant: 0.9,
      Shishira: 0.92
    };
    function getImageUrl(seasonName) {
      return seasonMainImages[seasonName] || `${base}/avatar.png`;
    }
    function getImageFrame(seasonName) {
      const scale = seasonImageScale[seasonName] || 1;
      const size = 170 * scale;
      let yOffset = -4;
      if (seasonName === "Hemant") {
        yOffset -= 4;
      }
      return { x: -size / 2, y: -size + yOffset, width: size, height: size };
    }
    function getSlicePath(startAngle, endAngle) {
      const s = (startAngle - 90) * (Math.PI / 180);
      const e = (endAngle - 90) * (Math.PI / 180);
      return `M 0 0 L ${R * Math.cos(s)} ${R * Math.sin(s)} A ${R} ${R} 0 0 1 ${R * Math.cos(e)} ${R * Math.sin(e)} Z`;
    }
    function getArcPath(start, end, radius) {
      const s = (start - 90) * (Math.PI / 180);
      const e = (end - 90) * (Math.PI / 180);
      return `M ${radius * Math.cos(s)} ${radius * Math.sin(s)} A ${radius} ${radius} 0 0 1 ${radius * Math.cos(e)} ${radius * Math.sin(e)}`;
    }
    function getSymbolPos(start, end, radius = 75) {
      const mid = (start + end) / 2 - 90;
      const rad = mid * (Math.PI / 180);
      return { x: radius * Math.cos(rad), y: radius * Math.sin(rad) };
    }
    function wingTemplate($$renderer3, side, seasonsList, currentRotation, slideDirection) {
      $$renderer3.push(`<g class="wing svelte-14nai0m"${attr_style(`transform: ${stringify("translate(0px, 0px)")} rotate(${stringify(currentRotation)}deg);`)}><circle cx="0" cy="0" r="100" fill="var(--theme-parchment)" stroke="var(--theme-terra)" stroke-width="3"></circle><!--[-->`);
      const each_array = ensure_array_like(seasonsList);
      for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
        let season = each_array[$$index_1];
        const frame = getImageFrame(season.name);
        const pos = getSymbolPos(season.start, season.end);
        $$renderer3.push(`<g${attr("clip-path", `url(#clip-${stringify(season.name)})`)} style="cursor: pointer;"><image${attr("href", getImageUrl(season.name))}${attr("x", frame.x)}${attr("y", frame.y)}${attr("width", frame.width)}${attr("height", frame.height)} preserveAspectRatio="xMidYMax meet"${attr("transform", `rotate(${stringify((season.start + season.end) / 2)})`)}></image><path${attr_class("season-overlay-path svelte-14nai0m", void 0, {
          "active-season": store_get($$store_subs ??= {}, "$currentSeason", currentSeason) === season.name
        })}${attr("d", getSlicePath(season.start, season.end))}${attr("fill", season.color)}${attr("opacity", store_get($$store_subs ??= {}, "$currentSeason", currentSeason) === season.name ? "0.15" : "0.4")}></path></g><text font-size="7" font-weight="bold" letter-spacing="1"><textPath${attr("href", `#text-arc-${stringify(season.name)}`)} startOffset="50%" text-anchor="middle" fill="var(--theme-terra)">${escape_html((harvestedLabels[season.name] || season.name).toUpperCase())}</textPath></text><g${attr("transform", `translate(${stringify(pos.x)}, ${stringify(pos.y)})`)} style="cursor: pointer; pointer-events: auto;"><circle r="9" class="icon-circle svelte-14nai0m" fill="var(--theme-parchment)" opacity="0.8" stroke="none" stroke-width="0"></circle><text class="icon-in-circle svelte-14nai0m" dy=".3em" text-anchor="middle" font-size="6" fill="var(--theme-ink)">${escape_html(season.icon)}</text></g>`);
      }
      $$renderer3.push(`<!--]--><circle cx="0" cy="0" r="90" fill="none" stroke="var(--theme-terra)" stroke-width="1"></circle><circle cx="0" cy="0" r="20" fill="var(--theme-parchment)" stroke="var(--theme-terra)" stroke-width="1"></circle><use width="40" height="40" transform="translate(-20, -20)" fill="var(--theme-terra)" xlink:href="#mandala"></use></g>`);
    }
    $$renderer2.push(`<defs><!--[-->`);
    const each_array_1 = ensure_array_like(seasonsData);
    for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
      let season = each_array_1[$$index];
      $$renderer2.push(`<path${attr("id", `text-arc-${stringify(season.name)}`)}${attr("d", getArcPath(season.start, season.end, 92))}></path><clipPath${attr("id", `clip-${stringify(season.name)}`)}><path${attr("d", getSlicePath(season.start, season.end))}></path></clipPath>`);
    }
    $$renderer2.push(`<!--]--></defs>`);
    wingTemplate($$renderer2, "left", leftSeasons, leftRotation);
    $$renderer2.push(`<!---->`);
    wingTemplate($$renderer2, "right", rightSeasons, rightRotation);
    $$renderer2.push(`<!---->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let innerWidth = 1e3;
    let innerHeight = 500;
    let isNavigating = false;
    let isPortrait = derived(() => innerWidth < innerHeight);
    let dynamicViewBox = derived(() => isPortrait() ? "-135 -285 270 570" : "-230 -105 460 210");
    function handleEnterTree() {
      isNavigating = true;
      setTimeout(
        () => {
          goto();
        },
        800
      );
    }
    SVGDefs($$renderer2);
    $$renderer2.push(`<!----> <div${attr_class("calendar-stage svelte-1uha8ag", void 0, { "zoom-dive": isNavigating })}><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"${attr("viewBox", dynamicViewBox())} class="ragamala-system-svg svelte-1uha8ag" style="font-family: var(--font-ui, sans-serif);">`);
    Seasons($$renderer2, { isPortrait: isPortrait() });
    $$renderer2.push(`<!----><g transform="scale(0.85)">`);
    Clock($$renderer2, { onHoleClick: handleEnterTree });
    $$renderer2.push(`<!----></g></svg></div>`);
  });
}
export {
  _page as default
};
