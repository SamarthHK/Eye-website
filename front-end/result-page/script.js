let compare = document.getElementById("compare");
let handle = document.getElementById("handle");
let blurWrapper = document.getElementById("blurWrapper");
let blurImg = document.getElementById("blurImg");
let isDragging = false;

/* ── Vision score → blur strength ──────────────────────────────────────────
 * Reads the vision score from sessionStorage (or URL param as fallback).
 * Score is assumed to be 0–100 where:
 *   100 = perfect vision → blur 0px
 *   0   = worst vision   → blur 20px
 * Adjust the scale below to match whatever your quiz outputs.
 * -------------------------------------------------------------------------- */
function getBlurFromScore() {
    // Try sessionStorage first, then URL param ?score=XX
    let score = sessionStorage.getItem("visionScore");
    if (score === null) {
        const params = new URLSearchParams(window.location.search);
        score = params.get("score");
    }

    if (score !== null) {
        const s = Math.max(0, Math.min(100, parseFloat(score)));
        // Linear mapping: score 100 → 0px, score 0 → 20px
        return ((100 - s) / 100) * 20;
    }

    // Default fallback if no score found
    return 8;
}

const blurPx = getBlurFromScore();
blurImg.style.filter = `blur(${blurPx}px)`;

/* Optional: show score text */
const outputEl = document.getElementById("output");
if (outputEl) {
    const score = sessionStorage.getItem("visionScore") ??
                  new URLSearchParams(window.location.search).get("score");
    outputEl.textContent = score !== null
        ? `Vision Score: ${parseFloat(score).toFixed(0)} / 100`
        : "Vision Score: —";
}

/* ── Slider logic ───────────────────────────────────────────────────────────
 * We move the wrapper's width instead of using clip-path on the image,
 * which eliminates the grey-blur artefact at the cut edge.
 * -------------------------------------------------------------------------- */
function setSliderPosition(x) {
    const rect = compare.getBoundingClientRect();
    let pos = x - rect.left;
    pos = Math.max(0, Math.min(rect.width, pos));
    const percent = (pos / rect.width) * 100;

    handle.style.left = percent + "%";
    blurWrapper.style.width = percent + "%";
}

/* Mouse */
handle.addEventListener("mousedown", (e) => {
    isDragging = true;
    e.preventDefault();        // prevents text-selection flicker while dragging
});

window.addEventListener("mouseup", () => { isDragging = false; });

window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    setSliderPosition(e.clientX);
});

/* Touch */
handle.addEventListener("touchstart", (e) => {
    isDragging = true;
    e.preventDefault();
}, { passive: false });

window.addEventListener("touchend", () => { isDragging = false; });

window.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    setSliderPosition(e.touches[0].clientX);
}, { passive: true });
