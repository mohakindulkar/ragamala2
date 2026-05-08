import { w as writable } from "./index.js";
function getCurrentCalendarSeason() {
  const month = (/* @__PURE__ */ new Date()).getMonth();
  if (month >= 2 && month <= 3) return "Vasanta";
  if (month >= 4 && month <= 5) return "Grishma";
  if (month >= 6 && month <= 7) return "Varsha";
  if (month >= 8 && month <= 9) return "Sharad";
  if (month >= 10 && month <= 11) return "Hemant";
  return "Shishira";
}
const defaultSeason = getCurrentCalendarSeason();
const currentSeason = writable(defaultSeason);
const activeRaga = writable(null);
const currentLang = writable("en");
const overlayData = writable(null);
const audioBgDimmed = writable(false);
const isFullTreeMode = writable(false);
const baithakInstruments = writable({
  tanpura: false,
  sitar: false,
  pakhawaj: false,
  tabla: false,
  flute: false
});
export {
  activeRaga as a,
  audioBgDimmed as b,
  currentLang as c,
  baithakInstruments as d,
  currentSeason as e,
  isFullTreeMode as i,
  overlayData as o
};
