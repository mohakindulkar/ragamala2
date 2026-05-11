import { writable } from 'svelte/store';

// Helper to determine the current season based on the calendar month
function getCurrentCalendarSeason() {
    const month = new Date().getMonth(); // 0-11 (Jan is 0)

    // Traditional Indian Ritu mapping (approximate Gregorian months)
    if (month >= 2 && month <= 3) return 'Vasanta';  // March, April
    if (month >= 4 && month <= 5) return 'Grishma';  // May, June
    if (month >= 6 && month <= 7) return 'Varsha';   // July, August
    if (month >= 8 && month <= 9) return 'Sharad';   // Sept, Oct
    if (month >= 10 && month <= 11) return 'Hemant'; // Nov, Dec
    return 'Shishira';                               // Jan, Feb
}

export const defaultSeason = getCurrentCalendarSeason();

// Default season
export const currentSeason = writable(defaultSeason);
// The globally active Raga data
/** @type {import('svelte/store').Writable<any>} */
export const activeRaga = writable(null);
// The globally active language code (defaults to English)
export const currentLang = writable('en');
// Holds the data for the global overlay. Null means it's closed!
export const overlayData = writable(null);
// We can derive the background colors from the activeSeason and activeTime
export const bgColorPrimary = writable('#3e2723'); // Default fallback
export const bgColorAccent = writable('#ffaa00');  // Default fallback
// Controls only the AudioUI background brightness state
export const audioBgDimmed = writable(false);
// Tracks the instrument currently hovered in the Audio Baithak UI
/** @type {import('svelte/store').Writable<string | null>} */
export const hoveredInstrument = writable(null);
// Persists the preferred lead instrument mode for family-tree playback
export const audioLeadMode = writable('sitar');
// Controls whether the family tree is in full expansion dynamic mode
export const isFullTreeMode = writable(false);

// Controls the active state of instruments in the Audio Baithak
export const baithakInstruments = writable({
    tanpura: false,
    sitar: false,
    pakhawaj: false,
    tabla: false,
    flute: false
});
