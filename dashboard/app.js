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
            const template = document.getElementById("pdf-report-template");
            const tbody = document.getElementById("pdf-telemetry-body");
            const resultDiv = document.getElementById("pdf-prediction-result");
            const explainDiv = document.getElementById("pdf-explanations");

            if (window.lastPrediction) {
                // ── A live prediction exists: report the exact telemetry & result ──
                const inputs = window.lastPrediction.inputs;
                tbody.innerHTML = `
                    <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; width: 40%;">Node Power</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${inputs.node_pwr_w} W</td></tr>
                    <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">CPU Power</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${inputs.cpu_pwr_w} W</td></tr>
                    <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">Memory Power</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${inputs.mem_pwr_w} W</td></tr>
                    <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">Requested Cores</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${inputs.num_cores_req}</td></tr>
                    <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">Allocated Cores</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${inputs.num_cores_alloc}</td></tr>
                    <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">Run Time</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${inputs.run_time} s</td></tr>
                `;

                if (window.lastPrediction.type === "energy") {
                    resultDiv.style.borderLeftColor = "#00f5d4";
                    resultDiv.innerHTML = `Predicted Energy: <span style="color: #00f5d4;">${window.lastPrediction.value} Wh</span>`;
                } else if (window.lastPrediction.value) {
                    resultDiv.style.borderLeftColor = "#ef476f";
                    resultDiv.innerHTML = `Waste Classification: <span style="color: #ef476f;">Wasteful (Inefficient Resource Allocation)</span>`;
                } else {
                    resultDiv.style.borderLeftColor = "#06d6a0";
                    resultDiv.innerHTML = `Waste Classification: <span style="color: #06d6a0;">Efficient (Proper Resource Allocation)</span>`;
                }
            } else {
                // ── No live prediction yet (e.g. FastAPI backend isn't running): ──
                // ── fall back to a project-summary report instead of blocking. ──
                tbody.innerHTML = `
                    <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; width: 40%;">Jobs Analyzed</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${DATA.baseline.total_jobs.toLocaleString()}</td></tr>
                    <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">Baseline Energy</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${DATA.baseline.total_baseline_kwh} kWh</td></tr>
                    <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">Energy Saved</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${DATA.optimization.combined.savings_kwh} kWh (${DATA.optimization.combined.savings_percent}%)</td></tr>
                    <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">CO₂ Prevented (India)</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${DATA.carbon.savings.co2_india_kg} kg</td></tr>
                    <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">Waste Classifier Accuracy</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${(DATA.ai_models.waste_classifier.accuracy * 100).toFixed(1)}%</td></tr>
                    <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">Energy Predictor R²</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${DATA.ai_models.energy_predictor.r2_score}</td></tr>
                `;
                resultDiv.style.borderLeftColor = "#00f5d4";
                resultDiv.innerHTML = `Project Summary Report <span style="color: #64748b; font-weight: 400;">— run a Live AI Prediction above for a report on your own telemetry.</span>`;
            }

            // Populate translations/explanations (always included)
            const translations = DATA.translations[currentLang] || DATA.translations.en;
            explainDiv.innerHTML = `
                <p><strong>${EXPLAIN_TITLES.variable_resistance}:</strong> ${translations.variable_resistance}</p>
                <p><strong>${EXPLAIN_TITLES.core_mismatch}:</strong> ${translations.core_mismatch}</p>
                <p><strong>${EXPLAIN_TITLES.alpa_coefficient}:</strong> ${translations.alpa_coefficient}</p>
            `;

            const opt = {
                margin:       0,
                filename:     'AlpaRodh_Prediction_Report.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
            };

            await window.html2pdf().set(opt).from(template).save();
        } catch (err) {
            console.error("PDF generation failed:", err);
            alert("Sorry, the PDF could not be generated: " + err.message);
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

