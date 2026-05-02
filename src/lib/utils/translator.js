export async function harvest(text) {
    if (typeof document === 'undefined' || !text) return text;

    const probe = document.createElement('div');
    // Off-screen but not hidden (Google Translate ignores hidden elements)
    probe.style.cssText = "position:fixed; top:-1000px; opacity:0; pointer-events:none;";
    probe.innerText = text;
    document.body.appendChild(probe);

    // Wait for translation to occur
    await new Promise(r => setTimeout(r, 150));

    const result = probe.innerText;
    document.body.removeChild(probe);
    return result;
}