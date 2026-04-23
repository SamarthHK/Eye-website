const RAW_VISION = parseInt(localStorage.getItem("vision"), 10);
const BACKEND    = "http://localhost:8080";

function visionToBlur(value) {
    const v = Math.max(20, Math.min(200, isNaN(value) ? 20 : value));
    const t = (v - 20) / (200 - 20);
    return Math.pow(t, 1.8) * 14;
}

function visionLabel(value) {
    if (!value || isNaN(value)) return "Vision: Unknown";
    if (value <= 20) return "Your Vision: 20/20 — Normal";
    if (value <= 40) return `Your Vision: 20/${value} — Mild loss`;
    if (value <= 70) return `Your Vision: 20/${value} — Moderate loss`;
    if (value <= 100) return `Your Vision: 20/${value} — Poor`;
    return `Your Vision: 20/${value} — Severely impaired`;
}

const VISION_INFO = {
    4:   { tag: "Exceptional",       cls: "tag-excellent", text: "20/4 vision is extraordinarily sharp — far beyond normal. You can read at 20 feet what most people need to be 4 feet away to see. This is rare and typically only seen in young people with naturally superior optics." },
    5:   { tag: "Exceptional",       cls: "tag-excellent", text: "20/5 vision is well above average. You can resolve fine detail at a distance that most people simply cannot. You likely have very little need for any corrective eyewear." },
    6:   { tag: "Excellent",         cls: "tag-excellent", text: "20/6 vision is significantly better than the standard normal. Detail, contrast, and sharpness at distance are all very strong. No correction is needed." },
    8:   { tag: "Very Good",         cls: "tag-excellent", text: "20/8 vision is above normal. You can pick out fine detail at distance comfortably. Most activities — driving, reading signs, sport — require no effort." },
    10:  { tag: "Good",              cls: "tag-good",      text: "20/10 vision is above the standard threshold. You see more detail at distance than the average person. No corrective lenses are typically required at this level." },
    13:  { tag: "Good",              cls: "tag-good",      text: "20/13 is slightly above normal. Vision is clear and functional for all everyday tasks without any correction." },
    15:  { tag: "Normal",            cls: "tag-good",      text: "20/15 is considered normal and healthy. The vast majority of daily tasks — reading, driving, sport — are performed comfortably without any aids." },
    20:  { tag: "Normal (20/20)",    cls: "tag-good",      text: "20/20 is the benchmark for normal vision. You can see at 20 feet what a person with typical vision sees at 20 feet. No correction is required. This is the standard that eye tests are calibrated around." },
    25:  { tag: "Near Normal",       cls: "tag-mild",      text: "20/25 is just below the standard benchmark but still functional for most tasks. Many people at this level do not wear glasses. Fine print or fast-moving detail may occasionally be slightly soft." },
    30:  { tag: "Mild Reduction",    cls: "tag-mild",      text: "20/30 is mildly below normal. You may notice very slight softness in distant text or fine detail. Glasses or contacts are not always prescribed here but may help for driving or detailed screen work." },
    40:  { tag: "Mild Impairment",   cls: "tag-mild",      text: "20/40 is the threshold at which most countries legally require corrective lenses to drive. Distant road signs, subtitles, and small print will appear noticeably soft. Glasses or contacts will make a clear difference." },
    50:  { tag: "Moderate",          cls: "tag-moderate",  text: "20/50 means you need to be 3× closer than a normally-sighted person to resolve the same detail. Faces at distance become unclear, reading signs requires effort, and night driving grows uncomfortable. Correction is recommended." },
    60:  { tag: "Moderate",          cls: "tag-moderate",  text: "20/60 represents a meaningful reduction in sharpness. Detail at distance is blurred, and everyday tasks like watching TV, driving, or recognising people across a room are noticeably affected. Corrective lenses are advised." },
    70:  { tag: "Moderate–Poor",     cls: "tag-moderate",  text: "20/70 is classed as moderate visual impairment by many health bodies. Text and faces at distance are significantly blurred, and most tasks beyond arm's length will feel effortful without correction." },
    100: { tag: "Poor",              cls: "tag-poor",      text: "20/100 is poor vision. You need to stand 5× closer than a normally-sighted person to resolve the same detail. Driving is not safe uncorrected, and many public spaces become genuinely hard to navigate." },
    200: { tag: "Severely Impaired", cls: "tag-severe",    text: "20/200 is the legal definition of blindness in most countries. At this level, even large letters and high-contrast shapes at distance become difficult. Fine detail is essentially lost without strong correction, and specialist low-vision support is recommended." },
};

function getVisionInfo(value) {
    if (isNaN(value)) return { tag: "Unknown", cls: "tag-mild", text: "No vision score was recorded. Please return to the eye test and select the smallest line you can read clearly." };
    const keys = Object.keys(VISION_INFO).map(Number).sort((a, b) => a - b);
    const match = keys.find(k => k >= value) ?? keys[keys.length - 1];
    return VISION_INFO[match];
}

/* Apply blur */
document.getElementById("blurImg").style.filter = `blur(${visionToBlur(RAW_VISION)}px)`;

/* Vision label */
const outputEl = document.getElementById("output");
if (outputEl) outputEl.textContent = visionLabel(RAW_VISION);

/* Description box */
const info   = getVisionInfo(RAW_VISION);
const descEl = document.getElementById("visionDesc");
const tagEl  = document.getElementById("visionTag");
if (descEl) descEl.textContent = info.text;
if (tagEl)  { tagEl.textContent = info.tag; tagEl.className = `vision-tag ${info.cls}`; }

/* Return button */
const returnBtn = document.querySelector(".return-btn");
if (returnBtn) returnBtn.onclick = () => window.location.href = "/front-end/front-page/index.html";

/* ── Submit box ─────────────────────────────────────────────────────────── */
const submitBox  = document.getElementById("submitBox");
const submitBtn  = document.getElementById("submitBtn");
const nameInput  = document.getElementById("nameInput");
const submitRow  = document.getElementById("submitRow");
const alreadyMsg = document.getElementById("alreadyMsg");
const submitHint = document.getElementById("submitHint");

// Check cookie
function getCookie(name) {
    return document.cookie.split("; ").find(r => r.startsWith(name + "="))?.split("=")[1] || null;
}

function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

if (getCookie("vision_submitted")) {
    submitBox.classList.add("greyed");
    submitRow.style.display  = "none";
    submitHint.style.display = "none";
    alreadyMsg.style.display = "block";
}

/* ── Modal ──────────────────────────────────────────────────────────────── */
const overlay   = document.getElementById("modalOverlay");
const modalText = document.getElementById("modalText");
const modalYes  = document.getElementById("modalYes");
const modalNo   = document.getElementById("modalNo");

submitBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    if (!name) { nameInput.focus(); return; }
    const visionStr = isNaN(RAW_VISION) ? "Unknown" : `20/${RAW_VISION}`;
    modalText.innerHTML = `Are you sure you want to submit?<br><br><strong>${name}</strong><br>Vision: <strong>${visionStr}</strong>`;
    overlay.classList.add("active");
});

modalNo.addEventListener("click", () => {
    overlay.classList.remove("active");
});

modalYes.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    overlay.classList.remove("active");

    try {
        const res = await fetch(`${BACKEND}/api/submit`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ name, vision: isNaN(RAW_VISION) ? "Unknown" : String(RAW_VISION) }),
        });
        const data = await res.json();
        if (data.ok) {
            setCookie("vision_submitted", "1", 365);
            submitBox.classList.add("greyed");
            submitRow.style.display  = "none";
            submitHint.style.display = "none";
            alreadyMsg.style.display = "block";
            alreadyMsg.textContent   = "Submitted! Thank you.";
        } else {
            alert("Submission failed: " + (data.error || "unknown error"));
        }
    } catch (e) {
        alert("Could not reach the server. Make sure the backend is running.");
    }
});

/* ── Slider ─────────────────────────────────────────────────────────────── */
const compare      = document.getElementById("compare");
const handle       = document.getElementById("handle");
const sharpWrapper = document.getElementById("sharpWrapper");
let isDragging     = false;

function setSliderPosition(clientX) {
    const rect = compare.getBoundingClientRect();
    const pos  = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const pct  = (pos / rect.width) * 100;
    handle.style.left           = pct + "%";
    sharpWrapper.style.clipPath = `inset(0 0 0 ${pct}%)`;
}

handle.addEventListener("mousedown", e => { isDragging = true; e.preventDefault(); });
window.addEventListener("mouseup",   ()  => { isDragging = false; });
window.addEventListener("mousemove", e   => { if (isDragging) setSliderPosition(e.clientX); });
handle.addEventListener("touchstart", e => { isDragging = true; e.preventDefault(); }, { passive: false });
window.addEventListener("touchend",   ()  => { isDragging = false; });
window.addEventListener("touchmove",  e   => { if (isDragging) setSliderPosition(e.touches[0].clientX); }, { passive: true });