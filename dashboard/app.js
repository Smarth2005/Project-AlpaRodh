/**
 * AlpaRodh Dashboard — Interactive visualization & multilingual support
 * 
 * Loads analysis results (data.json or embedded fallback),
 * renders Chart.js visualizations, animates stats counters,
 * and handles language switching.
 */

// ═══ DEFAULT DATA (fallback if data.json not loaded) ═══════════════════════
const DEFAULT_DATA = {
    project: {
        name: "अल्परोध (AlpaRodh)",
        tagline: "AI-Driven Variable Resistance Reduction for India's Supercomputers",
    },
    baseline: {
        total_jobs: 231238,
        total_baseline_kwh: 1257.58,
        total_variable_kwh: 1249.90,
        total_static_kwh: 7.68,
        variable_percent: 99.39,
        static_floor_w: 0.02,
        mean_node_power_w: 2.96,
        max_node_power_w: 387.44,
        mismatch_count: 34681,
        mismatch_percent: 14.99,
    },
    optimization: {
        core_park: { savings_kwh: 37.21, savings_percent: 2.96 },
        dvfs: { savings_kwh: 5.12, savings_percent: 0.41, memory_bound_jobs: 45230 },
        consolidation: { score: 0.1499, potential_savings_kwh: 18.86 },
        combined: { savings_kwh: 39.80, savings_percent: 3.16, optimized_total_kwh: 1217.78 },
    },
    ai_models: {
        waste_classifier: {
            accuracy: 0.9742, precision: 0.9518, recall: 0.8934, f1_score: 0.9217,
            top_features: [
                { name: "mismatch_ratio", importance: 0.3421 },
                { name: "core_mismatch", importance: 0.2156 },
                { name: "power_per_core", importance: 0.1287 },
                { name: "num_cores_alloc", importance: 0.0934 },
                { name: "cpu_to_node_ratio", importance: 0.0812 },
                { name: "node_pwr_w", importance: 0.0567 },
                { name: "run_time", importance: 0.0423 },
            ],
        },
        energy_predictor: {
            r2_score: 0.8915, mae_wh: 0.2134, rmse_wh: 1.4523,
        },
    },
    param_mapping: {
        mapping_summary: {
            pm100_baseline_kwh: 1257.58,
            param_baseline_kwh: 761.34,
            scale_ratio: 0.6054,
        },
        projected_savings: {
            param_savings_kwh: 24.10,
            co2_saved_india_kg: 17.35,
        },
    },
    carbon: {
        baseline: { co2_italy_kg: 289.24, co2_india_kg: 905.46 },
        savings: { co2_italy_kg: 9.15, co2_india_kg: 28.66 },
        alpa_coefficient: 7.3241,
        per_job: { baseline_grade: "B", optimized_grade: "B" },
        grade_distribution: { A: 142350, B: 52410, C: 24560, D: 8918, F: 3000 },
        india_vs_italy: { india_multiplier: 3.13 },
        equivalences: { trees_year: 1.30, driving_km_avoided: 136.5, phone_charges_equivalent: 3487 },
    },
    translations: {
        en: {
            baseline_energy: "The supercomputer consumed a total of 1257.58 kWh of electricity — enough to power an average Indian home for about 359.3 days.",
            variable_resistance: "The 'variable resistance' is the dynamic power a CPU uses during computation. When a job doesn't fully use its allocated cores, these cores still draw power — like an engine running in neutral. AlpaRodh identifies and reduces this waste.",
            energy_savings: "AlpaRodh saved 39.80 kWh (3.16%) by intelligently reducing idle power in over-allocated compute nodes — like turning off unused lights in a building.",
            core_mismatch: "We found 34681 jobs where the computer allocated more processor cores than the job actually needed — like booking a 100-seat bus for 10 people. The empty seats still consume fuel (electricity).",
            carbon_saved: "We prevented 28.66 kg of CO₂ emissions — equivalent to planting 1.3 trees or avoiding 136 km of car driving.",
            alpa_coefficient: "The AlpaRodh Coefficient (ηα = 7.3241 gCO₂/kWh) measures how effectively our AI reduces pollution per unit of electricity optimized. A higher value means the AI is better at targeting the most wasteful workloads.",
            ai_prediction: "Our AI model can predict wasteful jobs with 97.4% accuracy BEFORE they run — like a smart traffic system that prevents jams before they happen.",
            param_mapping: "When applied to India's PARAM Yuva-II supercomputer at CDAC Pune, AlpaRodh could save 24.10 kWh — preventing 17.35 kg of CO₂ on India's carbon-intensive power grid.",
            india_impact: "India's power grid is 3.13x more carbon-intensive than Italy's. This means the SAME energy savings in India prevents 3.13x MORE pollution — making AlpaRodh even more impactful for Indian supercomputers.",
            green_score: "Each job gets a Green Score from A (most efficient) to F (most wasteful) — like an energy star rating for your appliances, but for supercomputer tasks.",
        },
        hi: {
            baseline_energy: "सुपरकंप्यूटर ने कुल 1257.58 kWh बिजली खर्च की — यह एक भारतीय घर को लगभग 359.3 दिन चलाने के लिए पर्याप्त है।",
            variable_resistance: "'वेरिएबल रेजिस्टेंस' (परिवर्तनीय प्रतिरोध) वह बिजली है जो CPU गणना के दौरान उपयोग करता है। जब कोई कार्य अपने आवंटित कोर का पूरा उपयोग नहीं करता, तो ये कोर फिर भी बिजली खींचते हैं — जैसे कार का इंजन न्यूट्रल में चलना। अल्परोध इस बर्बादी को पहचानता है और कम करता है।",
            energy_savings: "अल्परोध ने 39.80 kWh (3.16%) बिजली बचाई — यह ऐसे है जैसे किसी बिल्डिंग में बेकार जलती लाइट्स बंद कर दी जाएं। सुपरकंप्यूटर के जो हिस्से बिना काम के चालू थे, उनकी बिजली कम कर दी गई।",
            core_mismatch: "हमने 34681 ऐसे कार्य पाए जहां कंप्यूटर ने जरूरत से ज्यादा प्रोसेसर कोर आवंटित किए — जैसे 10 लोगों के लिए 100 सीट की बस बुक करना। खाली सीटें भी ईंधन (बिजली) खर्च करती हैं।",
            carbon_saved: "हमने 28.66 kg CO₂ उत्सर्जन रोका — यह 1.3 पेड़ लगाने या 136 km कार ड्राइविंग बचाने के बराबर है।",
            alpa_coefficient: "अल्परोध गुणांक (ηα = 7.3241 gCO₂/kWh) यह मापता है कि हमारा AI प्रति यूनिट बिजली कितना प्रदूषण कम करता है। जितना ऊंचा मान, उतना बेहतर — मतलब AI सबसे फालतू कार्यों को सटीक रूप से पकड़ रहा है।",
            ai_prediction: "हमारा AI मॉडल 97.4% सटीकता से बता सकता है कि कौन सा कार्य बिजली बर्बाद करेगा — चलने से पहले! यह ऐसे है जैसे एक स्मार्ट ट्रैफिक सिस्टम जो जाम होने से पहले ही रोक दे।",
            param_mapping: "जब अल्परोध को CDAC पुणे के PARAM Yuva-II सुपरकंप्यूटर पर लागू किया जाए, तो 24.10 kWh बिजली बचाई जा सकती है — भारत के कार्बन-सघन बिजली ग्रिड पर 17.35 kg CO₂ रोका जा सकता है।",
            india_impact: "भारत का बिजली ग्रिड इटली से 3.13 गुना ज्यादा कार्बन-सघन है। इसका मतलब है कि भारत में वही बिजली बचत 3.13 गुना ज्यादा प्रदूषण रोकती है — अल्परोध भारतीय सुपरकंप्यूटर्स के लिए और भी ज्यादा प्रभावी है।",
            green_score: "हर कार्य को A (सबसे कुशल) से F (सबसे फालतू) तक एक ग्रीन स्कोर मिलता है — जैसे आपके उपकरणों की ऊर्जा स्टार रेटिंग, लेकिन सुपरकंप्यूटर के कार्यों के लिए।",
        },
        mr: {
            baseline_energy: "सुपरकंप्युटरने एकूण 1257.58 kWh वीज वापरली — हे एका भारतीय घराला सुमारे 359.3 दिवस चालवण्यासाठी पुरेसे आहे.",
            variable_resistance: "'व्हेरिएबल रेझिस्टन्स' (बदलणारा प्रतिरोध) म्हणजे CPU गणनेदरम्यान वापरत असलेली वीज. जेव्हा एखादे कार्य त्याच्या वाटप केलेल्या कोअर्सचा पूर्ण वापर करत नाही, तेव्हाही ते कोअर्स वीज वापरतात — जसे कार न्यूट्रलमध्ये चालू असणे. अल्परोध ही नासाडी ओळखतो आणि कमी करतो.",
            energy_savings: "अल्परोधने 39.80 kWh (3.16%) वीज वाचवली — जसे एखाद्या इमारतीतील न वापरलेले दिवे बंद करणे. सुपरकंप्युटरचे जे भाग विनाकारण चालू होते, त्यांची वीज कमी केली.",
            core_mismatch: "आम्हाला 34681 कामे आढळली जिथे संगणकाने प्रत्यक्ष गरजेपेक्षा जास्त प्रोसेसर कोअर्स दिले — जसे 10 लोकांसाठी 100 आसनांची बस बुक करणे. रिकाम्या जागाही इंधन (वीज) वापरतात.",
            carbon_saved: "आम्ही 28.66 kg CO₂ उत्सर्जन रोखले — हे 1.3 झाडे लावण्याइतके किंवा 136 km कार चालवणे टाळण्याइतके आहे.",
            alpa_coefficient: "अल्परोध गुणांक (ηα = 7.3241 gCO₂/kWh) हे मोजतो की आमचे AI प्रति युनिट वीज किती प्रदूषण कमी करतो. जितके जास्त मूल्य, तितके चांगले — म्हणजे AI सर्वात जास्त वाया जाणाऱ्या कामांना अचूकपणे ओळखतो.",
            ai_prediction: "आमचा AI मॉडेल 97.4% अचूकतेने सांगू शकतो की कोणते काम वीज वाया घालवेल — चालू होण्यापूर्वीच! हे एखाद्या स्मार्ट ट्रॅफिक सिस्टमसारखे आहे जी जाम होण्यापूर्वीच रोखते.",
            param_mapping: "जेव्हा अल्परोध CDAC पुण्याच्या PARAM Yuva-II सुपरकंप्युटरवर लागू केला जातो, तेव्हा 24.10 kWh वीज वाचवता येते — भारताच्या कार्बन-सघन वीज ग्रिडवर 17.35 kg CO₂ रोखता येतो.",
            india_impact: "भारताचे वीज ग्रिड इटलीपेक्षा 3.13 पट अधिक कार्बन-सघन आहे. याचा अर्थ भारतात तीच वीज बचत 3.13 पट अधिक प्रदूषण रोखते — अल्परोध भारतीय सुपरकंप्युटर्ससाठी आणखी प्रभावी आहे.",
            green_score: "प्रत्येक कामाला A (सर्वात कार्यक्षम) ते F (सर्वात वाया) असा ग्रीन स्कोर मिळतो — जसे तुमच्या उपकरणांची ऊर्जा स्टार रेटिंग, पण सुपरकंप्युटर कामांसाठी.",
        },
    },
};

// ═══ GLOBALS ══════════════════════════════════════════════════════════════════
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? "http://localhost:8000" 
    : window.location.origin; // Configurable base URL

let DATA = DEFAULT_DATA;
let currentLang = "en";
window.lastPrediction = null;

// ═══ INITIALIZE ══════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", async () => {
    // Try loading data.json, fall back to defaults
    try {
        const resp = await fetch("data.json");
        if (resp.ok) {
            const loaded = await resp.json();
            DATA = { ...DEFAULT_DATA, ...loaded };
        }
    } catch (e) {
        console.log("Using embedded default data");
    }

    renderStats();
    renderCharts();
    renderModelComparisonCharts();
    renderTranslations(currentLang);
    setupLanguageSwitcher();
    setupScrollAnimations();
    setupLivePredictor();

    const pdfBtn = document.getElementById("btn-download-pdf");
    pdfBtn.addEventListener("click", async () => {
        if (!window.html2pdf) {
            alert("PDF library is still loading (or failed to load — check your internet connection). Please try again in a moment.");
            return;
        }

        const originalBtnText = pdfBtn.textContent;
        pdfBtn.disabled = true;
        pdfBtn.textContent = "⏳ Generating PDF...";

        try {
            const reportHTML = buildPDFReport();

            // Create a temporary container, append to body for proper rendering
            const container = document.createElement("div");
            container.id = "pdf-render-container";
            container.style.cssText = "position: absolute; left: -9999px; top: 0; width: 800px; background: white;";
            container.innerHTML = reportHTML;
            document.body.appendChild(container);

            const opt = {
                margin:       [0.3, 0.3, 0.3, 0.3],
                filename:     'AlpaRodh_Report.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true, logging: false },
                jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' },
                pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
            };

            await window.html2pdf().set(opt).from(container).save();

            // Cleanup
            document.body.removeChild(container);
        } catch (err) {
            console.error("PDF generation failed:", err);
            alert("Sorry, the PDF could not be generated: " + err.message);
            // Cleanup on error too
            const leftover = document.getElementById("pdf-render-container");
            if (leftover) document.body.removeChild(leftover);
        } finally {
            pdfBtn.disabled = false;
            pdfBtn.textContent = originalBtnText;
        }
    });
});

// ═══ STAT COUNTERS ═══════════════════════════════════════════════════════════
function animateCounter(element, target, decimals = 2, duration = 2000) {
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const current = start + (target - start) * eased;
        element.textContent = current.toFixed(decimals);
        if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
}

function renderStats() {
    const b = DATA.baseline;
    const o = DATA.optimization.combined;
    const c = DATA.carbon;

    animateCounter(document.getElementById("stat-baseline"), b.total_baseline_kwh);
    animateCounter(document.getElementById("stat-savings"), o.savings_kwh);
    animateCounter(document.getElementById("stat-co2"), c.savings.co2_india_kg);
    animateCounter(document.getElementById("stat-eta"), c.alpa_coefficient, 4);

    // Strategy stats
    document.getElementById("strat-corepark").textContent =
        `${DATA.optimization.core_park.savings_kwh} kWh (${DATA.optimization.core_park.savings_percent}%)`;
    document.getElementById("strat-dvfs").textContent =
        `${DATA.optimization.dvfs.savings_kwh} kWh (${DATA.optimization.dvfs.savings_percent}%)`;
    document.getElementById("strat-consol").textContent =
        `${DATA.optimization.consolidation.potential_savings_kwh} kWh (Score: ${DATA.optimization.consolidation.score})`;

    // AI metrics
    const wc = DATA.ai_models.waste_classifier;
    document.getElementById("ai-accuracy").textContent = `${(wc.accuracy * 100).toFixed(1)}%`;
    document.getElementById("ai-precision").textContent = `${(wc.precision * 100).toFixed(1)}%`;
    document.getElementById("ai-recall").textContent = `${(wc.recall * 100).toFixed(1)}%`;
    document.getElementById("ai-f1").textContent = `${(wc.f1_score * 100).toFixed(1)}%`;

    const ep = DATA.ai_models.energy_predictor;
    document.getElementById("ai-r2").textContent = ep.r2_score.toFixed(4);
    document.getElementById("ai-mae").textContent = `${ep.mae_wh.toFixed(2)} Wh`;
    document.getElementById("ai-rmse").textContent = `${ep.rmse_wh.toFixed(2)} Wh`;

    // PARAM mapping
    const pm = DATA.param_mapping.mapping_summary;
    document.getElementById("pm100-energy").textContent = `${pm.pm100_baseline_kwh} kWh`;
    document.getElementById("param-energy").textContent = `${pm.param_baseline_kwh} kWh`;

    const ind = DATA.param_mapping.projected_savings;
    document.getElementById("india-multiplier").textContent = DATA.carbon.india_vs_italy.india_multiplier;
    document.getElementById("india-co2").textContent = ind.co2_saved_india_kg;

    // Equivalences
    const eq = DATA.carbon.equivalences;
    document.getElementById("equiv-trees").textContent = eq.trees_year;
    document.getElementById("equiv-driving").textContent = eq.driving_km_avoided;
    document.getElementById("equiv-phones").textContent = eq.phone_charges_equivalent;
}

// ═══ CHARTS ══════════════════════════════════════════════════════════════════
function renderCharts() {
    renderEnergyChart();
    renderFeatureChart();
    renderGreenScoreChart();
    renderComparisonChart();
}

function renderEnergyChart() {
    const ctx = document.getElementById("energyChart").getContext("2d");
    const b = DATA.baseline.total_baseline_kwh;
    const o = DATA.optimization.combined.optimized_total_kwh;

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Baseline Energy", "AlpaRodh Optimized"],
            datasets: [{
                data: [b, o],
                backgroundColor: [
                    "rgba(239, 71, 111, 0.7)",
                    "rgba(0, 245, 212, 0.7)",
                ],
                borderColor: [
                    "rgba(239, 71, 111, 1)",
                    "rgba(0, 245, 212, 1)",
                ],
                borderWidth: 2,
                borderRadius: 8,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "rgba(10, 14, 26, 0.9)",
                    titleColor: "#f1f5f9",
                    bodyColor: "#94a3b8",
                    borderColor: "rgba(0, 245, 212, 0.3)",
                    borderWidth: 1,
                    callbacks: {
                        label: (ctx) => `${ctx.parsed.y.toFixed(2)} kWh`,
                    },
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: "rgba(255,255,255,0.05)" },
                    ticks: { color: "#94a3b8", font: { family: "Inter" } },
                    title: { display: true, text: "Energy (kWh)", color: "#94a3b8" },
                },
                x: {
                    grid: { display: false },
                    ticks: { color: "#94a3b8", font: { family: "Inter", weight: 500 } },
                },
            },
        },
    });
}

function renderFeatureChart() {
    const ctx = document.getElementById("featureChart").getContext("2d");
    const features = DATA.ai_models.waste_classifier.top_features || [];

    const labels = features.map(f => f.name.replace(/_/g, " "));
    const values = features.map(f => f.importance);

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    "rgba(0, 245, 212, 0.7)",
                    "rgba(167, 139, 250, 0.7)",
                    "rgba(255, 209, 102, 0.7)",
                    "rgba(239, 71, 111, 0.7)",
                    "rgba(6, 214, 160, 0.7)",
                    "rgba(0, 245, 212, 0.4)",
                    "rgba(167, 139, 250, 0.4)",
                ],
                borderRadius: 6,
            }],
        },
        options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    grid: { color: "rgba(255,255,255,0.05)" },
                    ticks: { color: "#94a3b8", font: { size: 10 } },
                },
                y: {
                    grid: { display: false },
                    ticks: { color: "#f1f5f9", font: { family: "Inter", size: 11 } },
                },
            },
        },
    });
}

function renderGreenScoreChart() {
    const ctx = document.getElementById("greenScoreChart").getContext("2d");
    const dist = DATA.carbon.grade_distribution;

    new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["A — Excellent", "B — Good", "C — Average", "D — Below Avg", "F — Poor"],
            datasets: [{
                data: [dist.A || 0, dist.B || 0, dist.C || 0, dist.D || 0, dist.F || 0],
                backgroundColor: [
                    "rgba(0, 245, 212, 0.8)",
                    "rgba(6, 214, 160, 0.8)",
                    "rgba(255, 209, 102, 0.8)",
                    "rgba(239, 71, 111, 0.6)",
                    "rgba(239, 71, 111, 0.9)",
                ],
                borderWidth: 0,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "60%",
            plugins: {
                legend: {
                    position: "bottom",
                    labels: { color: "#94a3b8", font: { family: "Inter", size: 11 }, padding: 12 },
                },
            },
        },
    });
}

function renderComparisonChart() {
    const ctx = document.getElementById("comparisonChart").getContext("2d");
    const c = DATA.carbon;

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Italy (PM100)", "India (PARAM)"],
            datasets: [
                {
                    label: "Baseline CO₂ (kg)",
                    data: [c.baseline.co2_italy_kg, c.baseline.co2_india_kg],
                    backgroundColor: "rgba(239, 71, 111, 0.6)",
                    borderRadius: 6,
                },
                {
                    label: "CO₂ Saved (kg)",
                    data: [c.savings.co2_italy_kg, c.savings.co2_india_kg],
                    backgroundColor: "rgba(0, 245, 212, 0.7)",
                    borderRadius: 6,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: "#94a3b8", font: { family: "Inter" } },
                },
            },
            scales: {
                y: {
                    grid: { color: "rgba(255,255,255,0.05)" },
                    ticks: { color: "#94a3b8" },
                    title: { display: true, text: "kg CO₂", color: "#94a3b8" },
                },
                x: {
                    grid: { display: false },
                    ticks: { color: "#94a3b8" },
                },
            },
        },
    });
}

// ═══ TRANSLATIONS ════════════════════════════════════════════════════════════
const EXPLAIN_TITLES = {
    baseline_energy: "⚡ Energy Consumption",
    variable_resistance: "🔌 Variable Resistance",
    energy_savings: "📉 Energy Savings",
    core_mismatch: "⚠️ Core Over-Allocation",
    carbon_saved: "🌿 Carbon Impact",
    alpa_coefficient: "📈 AlpaRodh Coefficient",
    ai_prediction: "🤖 AI Prediction",
    param_mapping: "🇮🇳 PARAM Yuva-II",
    india_impact: "🌏 India Impact",
    green_score: "⭐ Green Score",
};

function renderTranslations(lang) {
    const grid = document.getElementById("explain-grid");
    const translations = DATA.translations[lang] || DATA.translations.en;

    grid.innerHTML = "";

    for (const [key, title] of Object.entries(EXPLAIN_TITLES)) {
        const text = translations[key] || "[Translation pending]";
        const card = document.createElement("div");
        card.className = "explain-card";
        card.innerHTML = `
            <div class="explain-card-title">${title}</div>
            <div class="explain-card-text">${text}</div>
        `;
        grid.appendChild(card);
    }
}

function setupLanguageSwitcher() {
    document.querySelectorAll(".lang-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".lang-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentLang = btn.dataset.lang;
            renderTranslations(currentLang);
        });
    });
}

// ═══ SCROLL ANIMATIONS ══════════════════════════════════════════════════════
function setupScrollAnimations() {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add("visible");
                    }, index * 100);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    document.querySelectorAll("[data-animate]").forEach(el => observer.observe(el));
}

// ═══ MODEL COMPARISON CHARTS ════════════════════════════════════════════════
function renderModelComparisonCharts() {
    const classData = DATA.ai_models.classifier_comparison;
    const regData = DATA.ai_models.regressor_comparison;

    if (!classData || !regData) return;

    const classCtx = document.getElementById("classifierChart").getContext("2d");
    new Chart(classCtx, {
        type: "bar",
        data: {
            labels: classData.map(d => d.Model),
            datasets: [
                {
                    label: "F1 Score",
                    data: classData.map(d => d.F1_Score),
                    backgroundColor: "rgba(0, 245, 212, 0.7)",
                    borderRadius: 4,
                },
                {
                    label: "Accuracy",
                    data: classData.map(d => d.Accuracy),
                    backgroundColor: "rgba(167, 139, 250, 0.7)",
                    borderRadius: 4,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: "#94a3b8", font: { family: "Inter" } } } },
            scales: {
                y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#94a3b8" } },
                x: { grid: { display: false }, ticks: { color: "#94a3b8" } }
            }
        }
    });

    const regCtx = document.getElementById("regressorChart").getContext("2d");
    new Chart(regCtx, {
        type: "bar",
        data: {
            labels: regData.map(d => d.Model),
            datasets: [
                {
                    label: "R² Score",
                    data: regData.map(d => d.R2_Score),
                    backgroundColor: "rgba(239, 71, 111, 0.7)",
                    borderRadius: 4,
                },
                {
                    label: "MAE (Wh)",
                    data: regData.map(d => d.MAE_Wh),
                    backgroundColor: "rgba(255, 209, 102, 0.7)",
                    borderRadius: 4,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: "#94a3b8", font: { family: "Inter" } } } },
            scales: {
                y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#94a3b8" } },
                x: { grid: { display: false }, ticks: { color: "#94a3b8" } }
            }
        }
    });
}

// ═══ LIVE PREDICTOR API ═════════════════════════════════════════════════════
function setupLivePredictor() {
    const resultBox = document.getElementById("predictor-result");
    
    function getTelemetryData() {
        return {
            node_pwr_w: parseFloat(document.getElementById("inp-node-pwr").value) || 0,
            cpu_pwr_w: parseFloat(document.getElementById("inp-cpu-pwr").value) || 0,
            mem_pwr_w: parseFloat(document.getElementById("inp-mem-pwr").value) || 0,
            num_cores_req: parseInt(document.getElementById("inp-req-cores").value) || 0,
            num_cores_alloc: parseInt(document.getElementById("inp-alloc-cores").value) || 0,
            run_time: parseInt(document.getElementById("inp-runtime").value) || 0,
            num_gpus_alloc: 0
        };
    }

    const energyBtn = document.getElementById("btn-predict-energy");
    if(energyBtn) {
        energyBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            resultBox.innerHTML = '<p style="color: var(--cyan)">Loading prediction...</p>';
            try {
                const res = await fetch(`${API_BASE_URL}/api/predict/energy`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(getTelemetryData())
                });
                if(!res.ok) throw new Error("API not running or model not loaded.");
                const data = await res.json();
                
                // Save for PDF export
                window.lastPrediction = {
                    type: "energy",
                    value: data.energy_wh_prediction,
                    inputs: getTelemetryData()
                };

                resultBox.innerHTML = `<h3><span style="color: var(--cyan)">Energy Prediction:</span> ${data.energy_wh_prediction} Wh</h3>`;
            } catch (err) {
                resultBox.innerHTML = `<p style="color: var(--coral)">Error: ${err.message}. Make sure FastAPI is running.</p>`;
            }
        });
    }

    const wasteBtn = document.getElementById("btn-predict-waste");
    if(wasteBtn) {
        wasteBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            resultBox.innerHTML = '<p style="color: var(--cyan)">Loading prediction...</p>';
            try {
                const res = await fetch(`${API_BASE_URL}/api/predict/waste`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(getTelemetryData())
                });
                if(!res.ok) throw new Error("API not running or model not loaded.");
                const data = await res.json();
                
                // Save for PDF export
                window.lastPrediction = {
                    type: "waste",
                    value: data.is_wasteful,
                    inputs: getTelemetryData()
                };

                const text = data.is_wasteful ? '<span style="color: var(--coral)">Wasteful!</span>' : '<span style="color: var(--emerald)">Efficient!</span>';
                resultBox.innerHTML = `<h3><span style="color: var(--cyan)">Waste Classification:</span> ${text}</h3>`;
            } catch (err) {
                resultBox.innerHTML = `<p style="color: var(--coral)">Error: ${err.message}. Make sure FastAPI is running.</p>`;
            }
        });
    }
}

// ═══ PDF REPORT BUILDER (html2canvas-safe — no flex/gap, no webkit gradient text) ═══
function buildPDFReport() {
    const b  = DATA.baseline;
    const o  = DATA.optimization;
    const ai = DATA.ai_models;
    const pm = DATA.param_mapping;
    const c  = DATA.carbon;
    const eq = c.equivalences;
    const translations = DATA.translations[currentLang] || DATA.translations.en;

    const timestamp = new Date().toLocaleString("en-IN", {
        dateStyle: "long", timeStyle: "short", timeZone: "Asia/Kolkata"
    });

    // ── html2canvas-SAFE shared styles (no flex/gap, no webkit gradient text) ──
    const H2   = `font-size:18px;font-weight:700;color:#0f172a;margin:28px 0 12px 0;padding-bottom:8px;border-bottom:2px solid #cbd5e1;`;
    const H3   = `font-size:14px;font-weight:600;color:#334155;margin:16px 0 8px 0;`;
    const P    = `font-size:13px;color:#475569;margin:5px 0;line-height:1.6;`;
    const CARD = `background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;margin-bottom:12px;`;
    const TH   = `padding:9px 12px;font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;background:#f1f5f9;border-bottom:2px solid #cbd5e1;text-align:left;border:1px solid #e2e8f0;`;
    const TD   = `padding:9px 12px;font-size:13px;border:1px solid #e2e8f0;color:#1e293b;vertical-align:top;`;
    const TD_ALT = `padding:9px 12px;font-size:13px;border:1px solid #e2e8f0;color:#1e293b;background:#f8fafc;vertical-align:top;`;

    // ── Helper: build table with alternating rows ──
    function tbl(headers, rows, colWidths) {
        const wAttrs = colWidths ? colWidths.map(w => `style="width:${w}"`) : headers.map(() => '');
        let h = `<table style="width:100%;border-collapse:collapse;margin:8px 0 18px 0;"><thead><tr>`;
        h += headers.map((hd, i) => `<th ${wAttrs[i]} style="${TH}">${hd}</th>`).join('');
        h += `</tr></thead><tbody>`;
        rows.forEach((row, i) => {
            h += `<tr>${row.map(cell => `<td style="${i%2===0 ? TD : TD_ALT}">${cell}</td>`).join('')}</tr>`;
        });
        h += `</tbody></table>`;
        return h;
    }

    // ── Two-column layout using a table (flex-safe alternative) ──
    function twoCol(leftHTML, rightHTML) {
        return `<table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
            <tr>
                <td style="width:49%;vertical-align:top;padding-right:8px;">${leftHTML}</td>
                <td style="width:2%;text-align:center;vertical-align:middle;font-size:22px;color:#94a3b8;">&#x2192;</td>
                <td style="width:49%;vertical-align:top;padding-left:8px;">${rightHTML}</td>
            </tr>
        </table>`;
    }

    // ── Three-column layout using a table ──
    function threeCol(c1, c2, c3) {
        return `<table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
            <tr>
                <td style="width:32%;vertical-align:top;padding-right:6px;">${c1}</td>
                <td style="width:2%;"></td>
                <td style="width:32%;vertical-align:top;padding-right:6px;">${c2}</td>
                <td style="width:2%;"></td>
                <td style="width:32%;vertical-align:top;">${c3}</td>
            </tr>
        </table>`;
    }

    function accentCard(color, label, valueHTML) {
        return `<div style="background:#f8fafc;border-left:4px solid ${color};border-radius:6px;padding:14px;margin-bottom:12px;">
            <p style="font-size:10px;color:#64748b;margin:0 0 4px 0;text-transform:uppercase;letter-spacing:1px;">${label}</p>
            <div>${valueHTML}</div>
        </div>`;
    }

    function metricCard(emoji, value, label) {
        return `<div style="${CARD}text-align:center;">
            <p style="font-size:22px;margin:0 0 4px 0;">${emoji}</p>
            <p style="font-size:20px;font-weight:700;color:#0f172a;margin:2px 0;">${value}</p>
            <p style="font-size:11px;color:#64748b;margin:0;">${label}</p>
        </div>`;
    }

    // ── Classifier rows ──
    const classRows = (ai.classifier_comparison || []).map(m => [
        `<strong>${m.Model}</strong>${m.Rank === 1 ? ' &#x1F3C6;' : ''}`,
        (m.Accuracy * 100).toFixed(1) + '%',
        (m.F1_Score  * 100).toFixed(1) + '%',
        m.Training_Time_s + 's',
        `#${m.Rank}`
    ]);

    // ── Regressor rows ──
    const regRows = (ai.regressor_comparison || []).map(m => [
        `<strong>${m.Model}</strong>${m.Rank === 1 ? ' &#x1F3C6;' : ''}`,
        m.R2_Score.toFixed(4),
        m.MAE_Wh.toFixed(4) + ' Wh',
        m.Training_Time_s + 's',
        `#${m.Rank}`
    ]);

    // ── Live prediction section ──
    let predictionSection = '';
    if (window.lastPrediction) {
        const inp = window.lastPrediction.inputs;
        let resultCard = '';
        if (window.lastPrediction.type === "energy") {
            resultCard = accentCard('#0ea5e9', '&#x26A1; AI Prediction Result',
                `<p style="font-size:20px;font-weight:700;color:#0ea5e9;margin:0;">Predicted Energy: ${window.lastPrediction.value} Wh</p>`);
        } else {
            const isWaste = window.lastPrediction.value;
            const wCol   = isWaste ? '#ef4444' : '#10b981';
            const wText  = isWaste ? '&#x26A0;&#xFE0F; Wasteful — Inefficient Resource Allocation'
                                   : '&#x2705; Efficient — Proper Resource Allocation';
            resultCard = accentCard(wCol, '&#x1F50D; Waste Classification',
                `<p style="font-size:18px;font-weight:700;color:${wCol};margin:0;">${wText}</p>`);
        }
        predictionSection = `
            <h2 style="${H2}">&#x26A1; Live AI Prediction</h2>
            <h3 style="${H3}">Telemetry Inputs</h3>
            ${tbl(['Parameter','Value'],[
                ['&#x1F50C; Node Power',   `${inp.node_pwr_w} W`],
                ['&#x1F4BB; CPU Power',    `${inp.cpu_pwr_w} W`],
                ['&#x1F9E0; Memory Power', `${inp.mem_pwr_w} W`],
                ['Requested Cores',        `${inp.num_cores_req}`],
                ['Allocated Cores',        `${inp.num_cores_alloc}`],
                ['&#x23F1;&#xFE0F; Run Time', `${inp.run_time} s`],
            ],['50%','50%'])}
            ${resultCard}`;
    }

    // ── Build the report HTML ──
    return `<div style="font-family:Arial,Helvetica,sans-serif;color:#1e293b;background:#ffffff;width:760px;padding:30px;box-sizing:border-box;">

        <!-- HEADER -->
        <div style="background:#0f172a;padding:28px 24px;border-radius:10px;margin-bottom:24px;text-align:center;">
            <p style="font-size:34px;font-weight:800;color:#00f5d4;margin:0;letter-spacing:1px;">&#x0905;&#x0932;&#x094D;&#x092A;&#x0930;&#x094B;&#x0927;</p>
            <p style="font-size:18px;font-weight:400;color:#94a3b8;letter-spacing:4px;text-transform:uppercase;margin:6px 0 0 0;">AlpaRodh</p>
            <p style="font-size:12px;color:#64748b;margin:10px 0 0 0;">AI-Driven Variable Resistance Reduction for India's Supercomputers</p>
            <p style="margin:12px 0 0 0;">
                <span style="display:inline-block;padding:3px 12px;border:1px solid #00f5d4;border-radius:12px;font-size:11px;color:#00f5d4;margin:0 4px;">PARAM Yuva-II</span>
                <span style="display:inline-block;padding:3px 12px;border:1px solid #ffd166;border-radius:12px;font-size:11px;color:#ffd166;margin:0 4px;">CDAC Pune</span>
                <span style="display:inline-block;padding:3px 12px;border:1px solid #ef476f;border-radius:12px;font-size:11px;color:#ef476f;margin:0 4px;">PM100 Dataset</span>
            </p>
        </div>

        <!-- KEY METRICS (4 cols via table) -->
        <h2 style="${H2}">&#x1F4CA; System Overview</h2>
        ${threeCol(
            metricCard('&#x26A1;', b.total_baseline_kwh + ' kWh', 'Baseline Energy'),
            metricCard('&#x1F4C9;', o.combined.savings_kwh + ' kWh', 'Energy Saved'),
            metricCard('&#x1F333;', c.savings.co2_india_kg + ' kg', 'CO&#x2082; Prevented')
        )}
        ${tbl(['Metric','Value'],[
            ['Total Jobs Analyzed',   b.total_jobs.toLocaleString()],
            ['Variable Energy',       `${b.total_variable_kwh} kWh (${b.variable_percent}%)`],
            ['Core Mismatch Jobs',    `${b.mismatch_count.toLocaleString()} (${b.mismatch_percent}%)`],
            ['Mean Node Power',       `${b.mean_node_power_w} W`],
            ['Max Node Power',        `${b.max_node_power_w} W`],
            ['AlpaRodh Coefficient',  `${c.alpa_coefficient} gCO&#x2082;/kWh`],
        ],['55%','45%'])}

        <!-- OPTIMIZATION -->
        <h2 style="${H2}">&#x1F527; Energy Optimization Strategies</h2>
        ${threeCol(
            `<div style="${CARD}text-align:center;"><p style="font-size:13px;font-weight:600;color:#0f172a;margin:0 0 6px 0;">&#x1F17F;&#xFE0F; Core-Park</p><p style="font-size:17px;font-weight:700;color:#059669;margin:0;">${o.core_park.savings_kwh} kWh</p><p style="font-size:11px;color:#64748b;margin:4px 0 0 0;">${o.core_park.savings_percent}% savings</p></div>`,
            `<div style="${CARD}text-align:center;"><p style="font-size:13px;font-weight:600;color:#0f172a;margin:0 0 6px 0;">&#x1F504; DVFS</p><p style="font-size:17px;font-weight:700;color:#059669;margin:0;">${o.dvfs.savings_kwh} kWh</p><p style="font-size:11px;color:#64748b;margin:4px 0 0 0;">${o.dvfs.savings_percent}% savings</p></div>`,
            `<div style="${CARD}text-align:center;"><p style="font-size:13px;font-weight:600;color:#0f172a;margin:0 0 6px 0;">&#x1F4E6; Consolidation</p><p style="font-size:17px;font-weight:700;color:#059669;margin:0;">${o.consolidation.potential_savings_kwh} kWh</p><p style="font-size:11px;color:#64748b;margin:4px 0 0 0;">Score: ${o.consolidation.score}</p></div>`
        )}
        ${accentCard('#059669','&#x1F3C6; Combined AlpaRodh Optimization',
            `<p style="font-size:18px;font-weight:700;color:#059669;margin:0;">${o.combined.savings_kwh} kWh saved (${o.combined.savings_percent}%) &#x2192; Optimized total: ${o.combined.optimized_total_kwh} kWh</p>`)}

        <!-- AI MODELS -->
        <h2 style="${H2}">&#x1F9E0; AI Prediction Engine</h2>
        ${twoCol(
            `<div style="background:#f0f0ff;border-left:4px solid #6366f1;border-radius:6px;padding:14px;">
                <p style="font-size:10px;color:#6366f1;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px 0;">Waste Classifier</p>
                <p style="font-size:14px;font-weight:700;color:#4338ca;margin:0 0 10px 0;">${ai.waste_classifier.model_type || 'XGBoost'}</p>
                <p style="${P}">Accuracy: <strong>${(ai.waste_classifier.accuracy*100).toFixed(1)}%</strong></p>
                <p style="${P}">Precision: <strong>${(ai.waste_classifier.precision*100).toFixed(1)}%</strong></p>
                <p style="${P}">Recall: <strong>${(ai.waste_classifier.recall*100).toFixed(1)}%</strong></p>
                <p style="${P}">F1 Score: <strong>${(ai.waste_classifier.f1_score*100).toFixed(1)}%</strong></p>
            </div>`,
            `<div style="background:#f0f9ff;border-left:4px solid #0ea5e9;border-radius:6px;padding:14px;">
                <p style="font-size:10px;color:#0ea5e9;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px 0;">Energy Predictor</p>
                <p style="font-size:14px;font-weight:700;color:#0369a1;margin:0 0 10px 0;">${ai.energy_predictor.model_type || 'XGBoost'}</p>
                <p style="${P}">R&#xB2; Score: <strong>${ai.energy_predictor.r2_score}</strong></p>
                <p style="${P}">MAE: <strong>${ai.energy_predictor.mae_wh} Wh</strong></p>
                <p style="${P}">RMSE: <strong>${ai.energy_predictor.rmse_wh} Wh</strong></p>
            </div>`
        )}

        <h3 style="${H3}">&#x1F4CA; Classifier Shootout — TOPSIS Ranked</h3>
        ${classRows.length ? tbl(['Model','Accuracy','F1 Score','Train Time','Rank'], classRows) : `<p style="${P}">No data.</p>`}

        <h3 style="${H3}">&#x1F4CA; Regressor Shootout — TOPSIS Ranked</h3>
        ${regRows.length ? tbl(['Model','R&#xB2; Score','MAE','Train Time','Rank'], regRows) : `<p style="${P}">No data.</p>`}

        <!-- PARAM MAPPING -->
        <h2 style="${H2}">&#x1F1EE;&#x1F1F3; PARAM Yuva-II Projection</h2>
        ${twoCol(
            `<div style="${CARD}text-align:center;border-top:4px solid #f59e0b;">
                <p style="font-size:13px;font-weight:700;color:#0f172a;margin:0 0 6px 0;">Marconi100 (PM100)</p>
                <p style="font-size:11px;color:#64748b;margin:2px 0;">IBM POWER9 + NVIDIA V100</p>
                <p style="font-size:11px;color:#64748b;margin:2px 0;">980 nodes &#x2022; 32 PFlops</p>
                <p style="font-size:11px;color:#64748b;margin:2px 0;">CINECA, Bologna, Italy</p>
                <p style="font-size:18px;font-weight:700;color:#f59e0b;margin:10px 0 0 0;">${pm.mapping_summary.pm100_baseline_kwh} kWh</p>
            </div>`,
            `<div style="${CARD}text-align:center;border-top:4px solid #00d4aa;">
                <p style="font-size:13px;font-weight:700;color:#0f172a;margin:0 0 6px 0;">PARAM Yuva-II</p>
                <p style="font-size:11px;color:#64748b;margin:2px 0;">Intel Xeon E5-2670/2650 + Tesla M2090</p>
                <p style="font-size:11px;color:#64748b;margin:2px 0;">376 nodes &#x2022; 524 TFlops</p>
                <p style="font-size:11px;color:#64748b;margin:2px 0;">CDAC, Pune, India</p>
                <p style="font-size:18px;font-weight:700;color:#00d4aa;margin:10px 0 0 0;">${pm.mapping_summary.param_baseline_kwh} kWh</p>
            </div>`
        )}
        ${accentCard('#f59e0b','&#x1F30F; India Impact',
            `<p style="font-size:13px;color:#475569;margin:0;">India's grid is <strong style="color:#ef4444;">${c.india_vs_italy.india_multiplier}x</strong> more carbon-intensive than Italy's. Projected PARAM savings: <strong style="color:#059669;">${pm.projected_savings.param_savings_kwh} kWh</strong> &#x2192; <strong style="color:#059669;">${pm.projected_savings.co2_saved_india_kg} kg CO&#x2082;</strong> prevented.</p>`
        )}

        <!-- CARBON -->
        <h2 style="${H2}">&#x1F33F; Carbon Footprint Analysis</h2>
        ${tbl(['Metric','Italy &#x1F1EE;&#x1F1F9;','India &#x1F1EE;&#x1F1F3;'],[
            ['Baseline CO&#x2082;', `${c.baseline.co2_italy_kg} kg`, `${c.baseline.co2_india_kg} kg`],
            ['CO&#x2082; Saved',   `${c.savings.co2_italy_kg} kg`,  `${c.savings.co2_india_kg} kg`],
            ['Grid Factor',  '230 gCO&#x2082;/kWh', '720 gCO&#x2082;/kWh'],
        ])}
        <h3 style="${H3}">&#x1F30D; Real-World Equivalences</h3>
        ${threeCol(
            `<div style="${CARD}text-align:center;"><p style="font-size:24px;margin:0;">&#x1F333;</p><p style="font-size:20px;font-weight:700;color:#059669;margin:4px 0;">${eq.trees_year}</p><p style="font-size:11px;color:#64748b;margin:0;">Trees planted/year</p></div>`,
            `<div style="${CARD}text-align:center;"><p style="font-size:24px;margin:0;">&#x1F697;</p><p style="font-size:20px;font-weight:700;color:#059669;margin:4px 0;">${eq.driving_km_avoided}</p><p style="font-size:11px;color:#64748b;margin:0;">km driving avoided</p></div>`,
            `<div style="${CARD}text-align:center;"><p style="font-size:24px;margin:0;">&#x1F4F1;</p><p style="font-size:20px;font-weight:700;color:#059669;margin:4px 0;">${eq.phone_charges_equivalent.toLocaleString()}</p><p style="font-size:11px;color:#64748b;margin:0;">Phone charges saved</p></div>`
        )}

        <!-- LIVE PREDICTION -->
        ${predictionSection}

        <!-- KEY CONCEPTS -->
        <h2 style="${H2}">&#x1F310; Key Concepts Explained</h2>
        <div style="${CARD}">
            <p style="${P}"><strong>&#x1F50C; Variable Resistance:</strong> ${translations.variable_resistance}</p>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:10px 0;">
            <p style="${P}"><strong>&#x26A0;&#xFE0F; Core Mismatch:</strong> ${translations.core_mismatch}</p>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:10px 0;">
            <p style="${P}"><strong>&#x1F4C8; AlpaRodh Coefficient:</strong> ${translations.alpa_coefficient}</p>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:10px 0;">
            <p style="${P}"><strong>&#x1F916; AI Prediction:</strong> ${translations.ai_prediction}</p>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:10px 0;">
            <p style="${P}"><strong>&#x1F30F; India Impact:</strong> ${translations.india_impact}</p>
        </div>

        <!-- FOOTER -->
        <div style="margin-top:28px;padding-top:14px;border-top:2px solid #e2e8f0;text-align:center;">
            <p style="font-size:13px;font-weight:700;color:#0f172a;margin:0;">&#x0905;&#x0932;&#x094D;&#x092A;&#x0930;&#x094B;&#x0927; AlpaRodh v1.0</p>
            <p style="font-size:11px;color:#94a3b8;margin:4px 0 0 0;">AI-Driven Variable Resistance Reduction for India's Supercomputers</p>
            <p style="font-size:11px;color:#94a3b8;margin:2px 0 0 0;">Dataset: PM100 (Marconi100) &#x2022; Target: PARAM Yuva-II, CDAC Pune</p>
            <p style="font-size:10px;color:#cbd5e1;margin:8px 0 0 0;">Report generated: ${timestamp}</p>
        </div>

    </div>`;
}

