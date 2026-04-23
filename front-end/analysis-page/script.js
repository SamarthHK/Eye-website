const BACKEND = "http://localhost:8080";

function categorise(v) {
    const n = parseInt(v, 10);
    if (isNaN(n))    return { label: "Unknown",          cls: "tag-mild"     };
    if (n <= 20)     return { label: "Normal",           cls: "tag-good"     };
    if (n <= 40)     return { label: "Mild Impairment",  cls: "tag-mild"     };
    if (n <= 70)     return { label: "Moderate",         cls: "tag-moderate" };
    if (n <= 100)    return { label: "Poor",             cls: "tag-poor"     };
    return               { label: "Severely Impaired", cls: "tag-severe"   };
}

async function load() {
    let submissions = [];
    try {
        const res  = await fetch(`${BACKEND}/api/submissions`);
        submissions = await res.json();
    } catch {
        document.querySelector(".page").insertAdjacentHTML("afterbegin",
            `<div style="text-align:center;color:#e63946;padding:20px;font-family:'DM Sans',sans-serif;">
             Could not reach backend. Make sure server.py is running on port 8080.</div>`);
        return;
    }

    const total  = submissions.length;
    const values = submissions.map(s => parseInt(s.vision, 10)).filter(n => !isNaN(n));
    const avg    = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;
    const best   = values.length ? Math.min(...values) : null;
    const worst  = values.length ? Math.max(...values) : null;

    document.getElementById("statTotal").textContent = total;
    document.getElementById("statAvg").textContent   = avg   != null ? `20/${avg}`   : "—";
    document.getElementById("statBest").textContent  = best  != null ? `20/${best}`  : "—";
    document.getElementById("statWorst").textContent = worst != null ? `20/${worst}` : "—";

    /* Category counts for pie + bar */
    const cats = { "Normal": 0, "Mild Impairment": 0, "Moderate": 0, "Poor": 0, "Severely Impaired": 0, "Unknown": 0 };
    submissions.forEach(s => { cats[categorise(s.vision).label]++; });

    const catLabels = Object.keys(cats).filter(k => cats[k] > 0);
    const catValues = catLabels.map(k => cats[k]);
    const catColors = {
        "Normal":           "#d9f0ff",
        "Mild Impairment":  "#fff4cc",
        "Moderate":         "#ffe4b2",
        "Poor":             "#ffd6d6",
        "Severely Impaired":"#f0d0ff",
        "Unknown":          "#e0e0e0",
    };
    const catBorder = {
        "Normal":           "#1a5a8a",
        "Mild Impairment":  "#7a5a00",
        "Moderate":         "#8a4000",
        "Poor":             "#8a0000",
        "Severely Impaired":"#5a007a",
        "Unknown":          "#999",
    };

    /* Pie chart */
    new Chart(document.getElementById("pieChart"), {
        type: "pie",
        data: {
            labels:   catLabels,
            datasets: [{
                data:            catValues,
                backgroundColor: catLabels.map(l => catColors[l]),
                borderColor:     catLabels.map(l => catBorder[l]),
                borderWidth: 2,
            }]
        },
        options: { plugins: { legend: { position: "bottom" } } }
    });

    /* Bar chart */
    new Chart(document.getElementById("barChart"), {
        type: "bar",
        data: {
            labels:   catLabels,
            datasets: [{
                label:           "Submissions",
                data:            catValues,
                backgroundColor: catLabels.map(l => catColors[l]),
                borderColor:     catLabels.map(l => catBorder[l]),
                borderWidth: 2,
                borderRadius: 6,
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales:  { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
    });

    /* Line chart — vision value per submission */
    new Chart(document.getElementById("lineChart"), {
        type: "line",
        data: {
            labels:   submissions.map((s, i) => s.name || `#${i + 1}`),
            datasets: [{
                label:       "Vision (20/X)",
                data:        submissions.map(s => parseInt(s.vision, 10) || null),
                borderColor: "#1a5a8a",
                backgroundColor: "rgba(26,90,138,0.08)",
                pointBackgroundColor: "#1a5a8a",
                pointRadius: 5,
                tension: 0.3,
                fill: true,
            }]
        },
        options: {
            scales: {
                y: {
                    reverse: true,         // lower number = better vision = top of chart
                    beginAtZero: false,
                    title: { display: true, text: "20/X (lower = better)" }
                }
            }
        }
    });

    /* Table */
    const tbody = document.getElementById("tableBody");
    submissions.forEach((s, i) => {
        const cat = categorise(s.vision);
        const tr  = document.createElement("tr");
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td>${s.name}</td>
            <td>20/${s.vision}</td>
            <td><span class="tag ${cat.cls}">${cat.label}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

load();