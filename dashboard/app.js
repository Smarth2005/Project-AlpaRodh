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
            alpa_coefficient: "The AlpaRodh Coefficient (ηα = 7.3241 gCO₂/kWh) measures how effectively our AI reduces pollution per unit of electricity optimized.",
            ai_prediction: "Our AI model can predict wasteful jobs with 97.4% accuracy BEFORE they run.",
            param_mapping: "When applied to India's PARAM Yuva-II supercomputer at CDAC Pune, AlpaRodh could save 24.10 kWh — preventing 17.35 kg of CO₂.",
            india_impact: "India's power grid is 3.13x more carbon-intensive than Italy's. The SAME energy savings in India prevents 3.13x MORE pollution.",
            green_score: "Each job gets a Green Score from A (most efficient) to F (most wasteful) — like an energy star rating for supercomputer tasks.",
            // Report-specific strings
            report_title: "Job Energy Analysis Report",
            report_subtitle: "AI-powered telemetry analysis by AlpaRodh",
            section_inputs: "Job Telemetry Inputs",
            section_verdict: "AI Analysis Verdict",
            section_carbon: "Environmental Impact (This Job)",
            section_reco: "Optimization Recommendations",
            section_context: "System Context",
            section_conclusion: "Conclusion",
            verdict_wasteful: "WASTEFUL — Inefficient Resource Allocation Detected",
            verdict_efficient: "EFFICIENT — Optimal Resource Allocation",
            verdict_wasteful_explain: "Your job has been allocated significantly more compute cores than it needs. Idle cores still draw power, wasting electricity and generating unnecessary CO₂ emissions.",
            verdict_efficient_explain: "Your job is using its allocated resources effectively. The core utilization is within optimal bounds.",
            reco_corepark: "Apply Core-Park: Power-gate the idle cores on this job's nodes to eliminate variable resistance.",
            reco_dvfs: "Apply DVFS: This is a memory-bound job. Reducing CPU frequency by ~20% can save ~12% power with minimal performance impact.",
            reco_consolidate: "Consider Job Consolidation: Co-schedule smaller jobs on underutilized nodes to improve bin-packing efficiency.",
            reco_none: "No immediate optimization needed. Continue monitoring for resource drift over time.",
            conclusion_wasteful: "This job is a prime candidate for AlpaRodh's optimization pipeline. Applying Core-Park alone could reduce its power footprint by up to 15%. On India's carbon-intensive grid, every Wh saved matters.",
            conclusion_efficient: "This job is running efficiently. No corrective action needed. AlpaRodh recommends scheduling it during low-grid-intensity hours for maximum green impact.",
            lang_label: "English",
        },
        hi: {
            baseline_energy: "सुपरकंप्यूटर ने कुल 1257.58 kWh बिजली खर्च की — यह एक भारतीय घर को लगभग 359.3 दिन चलाने के लिए पर्याप्त है।",
            variable_resistance: "'वेरिएबल रेजिस्टेंस' वह बिजली है जो CPU गणना के दौरान उपयोग करता है। जब कोई कार्य अपने आवंटित कोर का पूरा उपयोग नहीं करता, तो ये कोर फिर भी बिजली खींचते हैं। अल्परोध इस बर्बादी को पहचानता है और कम करता है।",
            energy_savings: "अल्परोध ने 39.80 kWh (3.16%) बिजली बचाई — जैसे किसी बिल्डिंग में बेकार जलती लाइट्स बंद कर दी जाएं।",
            core_mismatch: "हमने 34681 ऐसे कार्य पाए जहां कंप्यूटर ने जरूरत से ज्यादा प्रोसेसर कोर आवंटित किए — जैसे 10 लोगों के लिए 100 सीट की बस बुक करना।",
            carbon_saved: "हमने 28.66 kg CO₂ उत्सर्जन रोका — यह 1.3 पेड़ लगाने या 136 km कार ड्राइविंग बचाने के बराबर है।",
            alpa_coefficient: "अल्परोध गुणांक (ηα = 7.3241 gCO₂/kWh) यह मापता है कि हमारा AI प्रति यूनिट बिजली कितना प्रदूषण कम करता है।",
            ai_prediction: "हमारा AI मॉडल 97.4% सटीकता से बता सकता है कि कौन सा कार्य बिजली बर्बाद करेगा — चलने से पहले!",
            param_mapping: "CDAC पुणे के PARAM Yuva-II पर लागू करने पर 24.10 kWh बिजली और 17.35 kg CO₂ बचाया जा सकता है।",
            india_impact: "भारत का बिजली ग्रिड इटली से 3.13 गुना ज्यादा कार्बन-सघन है — अल्परोध यहाँ और भी ज्यादा प्रभावी है।",
            green_score: "हर कार्य को A (सबसे कुशल) से F (सबसे फालतू) तक एक ग्रीन स्कोर मिलता है।",
            // Report-specific strings
            report_title: "जॉब ऊर्जा विश्लेषण रिपोर्ट",
            report_subtitle: "अल्परोध द्वारा AI-संचालित टेलीमेट्री विश्लेषण",
            section_inputs: "जॉब टेलीमेट्री इनपुट",
            section_verdict: "AI विश्लेषण निर्णय",
            section_carbon: "पर्यावरणीय प्रभाव (यह जॉब)",
            section_reco: "ऑप्टिमाइज़ेशन सिफारिशें",
            section_context: "सिस्टम संदर्भ",
            section_conclusion: "निष्कर्ष",
            verdict_wasteful: "बर्बाद — अकुशल संसाधन आवंटन पाया गया",
            verdict_efficient: "कुशल — संसाधन आवंटन सही है",
            verdict_wasteful_explain: "आपके जॉब को जरूरत से कहीं ज्यादा प्रोसेसर कोर आवंटित किए गए हैं। बेकार कोर भी बिजली खींचते हैं — यह बिजली और CO₂ की बर्बादी है।",
            verdict_efficient_explain: "आपका जॉब अपने आवंटित संसाधनों का प्रभावी उपयोग कर रहा है। कोर उपयोग इष्टतम सीमा में है।",
            reco_corepark: "Core-Park लागू करें: बेकार कोर को पावर-गेट करके वेरिएबल रेजिस्टेंस को खत्म करें।",
            reco_dvfs: "DVFS लागू करें: यह मेमोरी-बाउंड जॉब है। CPU फ्रीक्वेंसी ~20% कम करने से ~12% बिजली बचती है।",
            reco_consolidate: "जॉब कंसोलिडेशन पर विचार करें: छोटे जॉब्स को एक साथ शेड्यूल करें।",
            reco_none: "अभी कोई तत्काल ऑप्टिमाइज़ेशन जरूरी नहीं। निगरानी जारी रखें।",
            conclusion_wasteful: "यह जॉब अल्परोध के ऑप्टिमाइज़ेशन पाइपलाइन का एक प्रमुख उम्मीदवार है। सिर्फ Core-Park से इसका पावर फुटप्रिंट 15% तक कम हो सकता है।",
            conclusion_efficient: "यह जॉब कुशलता से चल रहा है। अल्परोध सुझाता है कि इसे कम ग्रिड-इंटेंसिटी के समय शेड्यूल करें।",
            lang_label: "हिंदी",
        },
        mr: {
            baseline_energy: "सुपरकंप्युटरने एकूण 1257.58 kWh वीज वापरली — हे एका भारतीय घराला सुमारे 359.3 दिवस चालवण्यासाठी पुरेसे आहे.",
            variable_resistance: "'व्हेरिएबल रेझिस्टन्स' म्हणजे CPU गणनेदरम्यान वापरत असलेली वीज. जेव्हा एखादे कार्य त्याच्या वाटप केलेल्या कोअर्सचा पूर्ण वापर करत नाही, तेव्हाही ते कोअर्स वीज वापरतात. अल्परोध ही नासाडी ओळखतो.",
            energy_savings: "अल्परोधने 39.80 kWh (3.16%) वीज वाचवली — जसे इमारतीतील न वापरलेले दिवे बंद करणे.",
            core_mismatch: "आम्हाला 34681 कामे आढळली जिथे संगणकाने प्रत्यक्ष गरजेपेक्षा जास्त कोअर्स दिले — जसे 10 लोकांसाठी 100 आसनांची बस.",
            carbon_saved: "आम्ही 28.66 kg CO₂ उत्सर्जन रोखले — हे 1.3 झाडे लावण्याइतके आहे.",
            alpa_coefficient: "अल्परोध गुणांक (ηα = 7.3241 gCO₂/kWh) हे मोजतो की AI प्रति युनिट वीज किती प्रदूषण कमी करतो.",
            ai_prediction: "आमचा AI मॉडेल 97.4% अचूकतेने सांगू शकतो की कोणते काम वीज वाया घालवेल — चालू होण्यापूर्वीच!",
            param_mapping: "CDAC पुण्याच्या PARAM Yuva-II वर लागू केल्यास 24.10 kWh वीज आणि 17.35 kg CO₂ वाचवता येते.",
            india_impact: "भारताचे वीज ग्रिड इटलीपेक्षा 3.13 पट अधिक कार्बन-सघन आहे — अल्परोध येथे अधिक प्रभावी आहे.",
            green_score: "प्रत्येक कामाला A (सर्वात कार्यक्षम) ते F (सर्वात वाया) असा ग्रीन स्कोर मिळतो.",
            // Report-specific strings
            report_title: "जॉब ऊर्जा विश्लेषण अहवाल",
            report_subtitle: "अल्परोध द्वारे AI-चालित टेलीमेट्री विश्लेषण",
            section_inputs: "जॉब टेलीमेट्री इनपुट",
            section_verdict: "AI विश्लेषण निकाल",
            section_carbon: "पर्यावरणीय परिणाम (हे काम)",
            section_reco: "ऑप्टिमायझेशन शिफारसी",
            section_context: "सिस्टम संदर्भ",
            section_conclusion: "निष्कर्ष",
            verdict_wasteful: "वाया — अकार्यक्षम संसाधन वाटप आढळले",
            verdict_efficient: "कार्यक्षम — संसाधन वाटप योग्य आहे",
            verdict_wasteful_explain: "तुमच्या कामाला गरजेपेक्षा जास्त प्रोसेसर कोअर्स दिले गेले आहेत. निष्क्रिय कोअर्सही वीज वापरतात — ही वीज आणि CO₂ ची नासाडी आहे.",
            verdict_efficient_explain: "तुमचे काम वाटप केलेल्या संसाधनांचा प्रभावी वापर करत आहे. कोअर वापर इष्टतम मर्यादेत आहे.",
            reco_corepark: "Core-Park लागू करा: निष्क्रिय कोअर्सना पावर-गेट करून व्हेरिएबल रेझिस्टन्स कमी करा.",
            reco_dvfs: "DVFS लागू करा: हे मेमरी-बाउंड काम आहे. CPU वारंवारता ~20% कमी केल्यास ~12% वीज वाचते.",
            reco_consolidate: "जॉब कन्सॉलिडेशनचा विचार करा: लहान कामे एकत्र शेड्यूल करा.",
            reco_none: "सध्या कोणतेही तातडीचे ऑप्टिमायझेशन आवश्यक नाही. निरीक्षण सुरू ठेवा.",
            conclusion_wasteful: "हे काम अल्परोधच्या ऑप्टिमायझेशन पाइपलाइनसाठी प्रमुख उमेदवार आहे. फक्त Core-Park ने त्याचा पॉवर फूटप्रिंट 15% पर्यंत कमी होऊ शकतो.",
            conclusion_efficient: "हे काम कार्यक्षमतेने चालत आहे. अल्परोध सुचवतो की कमी ग्रिड-इंटेन्सिटीच्या वेळी हे शेड्यूल करा.",
            lang_label: "मराठी",
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
            // Deep-merge so data.json never wipes report-specific translation keys
            const mergedTranslations = {};
            const langs = new Set([...Object.keys(DEFAULT_DATA.translations), ...Object.keys((loaded.translations || {}))]);
            for (const lang of langs) {
                mergedTranslations[lang] = {
                    ...(DEFAULT_DATA.translations[lang] || {}),
                    ...((loaded.translations || {})[lang] || {}),
                };
            }
            DATA = { ...DEFAULT_DATA, ...loaded, translations: mergedTranslations };
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
        const originalText = pdfBtn.textContent;
        pdfBtn.disabled = true;
        pdfBtn.textContent = "⏳ Analyzing & Building Report...";

        try {
            const inp = {
                node_pwr_w:     parseFloat(document.getElementById("inp-node-pwr").value)   || 300,
                cpu_pwr_w:      parseFloat(document.getElementById("inp-cpu-pwr").value)    || 150,
                mem_pwr_w:      parseFloat(document.getElementById("inp-mem-pwr").value)    || 45,
                num_cores_req:  parseInt(document.getElementById("inp-req-cores").value)   || 16,
                num_cores_alloc:parseInt(document.getElementById("inp-alloc-cores").value) || 32,
                run_time:       parseInt(document.getElementById("inp-runtime").value)      || 3600,
                num_gpus_alloc: 0
            };

            // Run BOTH predictions in parallel
            let energyWh = null, isWasteful = null;
            try {
                const [eRes, wRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/predict/energy`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(inp) }),
                    fetch(`${API_BASE_URL}/api/predict/waste`,  { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(inp) })
                ]);
                if (eRes.ok) { const d = await eRes.json(); energyWh   = d.energy_wh_prediction; }
                if (wRes.ok) { const d = await wRes.json(); isWasteful  = d.is_wasteful; }
            } catch(apiErr) {
                console.warn("API unavailable, using heuristic estimates", apiErr);
            }

            // Fallback heuristic if API is down
            if (energyWh === null) {
                energyWh = parseFloat(((inp.node_pwr_w * inp.run_time) / 3600).toFixed(4));
            }
            if (isWasteful === null) {
                isWasteful = inp.num_cores_alloc > inp.num_cores_req * 1.2;
            }

            const reportHTML = buildJobAnalysisReport(inp, energyWh, isWasteful);
            openPrintWindow(reportHTML);

        } catch (err) {
            console.error("Report generation failed:", err);
            alert("Could not generate report: " + err.message);
        } finally {
            pdfBtn.disabled = false;
            pdfBtn.textContent = originalText;
        }
    });
});

// ═══ PRINT WINDOW HELPER ═════════════════════════════════════════════════════
function openPrintWindow(reportHTML) {
    const win = window.open("", "AlpaRodh_Report", "width=900,height=680");
    if (!win) {
        alert("Popup blocked! Please allow popups for this site and try again.");
        return;
    }
    win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>AlpaRodh Job Analysis Report</title>
<style>
  @page { margin: 0.5in; size: A4 portrait; }
  @media print {
    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .no-print { display: none !important; }
  }
  @media screen {
    body { margin:0; padding:0; background:#f1f5f9; font-family:Arial,sans-serif; }
    .no-print { position:sticky; top:0; z-index:100; background:#0f172a; color:white; padding:12px 24px; text-align:center; border-bottom:2px solid #00f5d4; }
    .no-print p { margin:0 0 8px 0; font-size:13px; color:#94a3b8; }
    .save-btn { background:#00f5d4; color:#0f172a; border:none; padding:10px 28px; font-size:15px; font-weight:700; border-radius:6px; cursor:pointer; margin:0 6px; }
    .close-btn { background:transparent; color:#94a3b8; border:1px solid #334155; padding:10px 18px; font-size:14px; border-radius:6px; cursor:pointer; margin:0 6px; }
    .print-wrapper { max-width:820px; margin:24px auto 40px auto; background:white; padding:32px; box-shadow:0 4px 24px rgba(0,0,0,0.12); border-radius:8px; }
  }
</style>
</head>
<body>
<div class="no-print">
  <p>📋 Your AlpaRodh Job Analysis Report is ready</p>
  <button class="save-btn" onclick="window.print()">🖨️ Save as PDF (Ctrl+P)</button>
  <button class="close-btn" onclick="window.close()">Close</button>
</div>
<div class="print-wrapper">${reportHTML}</div>
<script>window.onload=function(){ setTimeout(function(){ window.print(); },700); };<\/script>
</body></html>`);
    win.document.close();
}


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
                    labels: {
                        color: "#94a3b8",
                        font: { family: "Inter", size: 11 },
                        padding: 16,
                        boxWidth: 14,
                        boxHeight: 14,
                        // Wrap into symmetric 2-column grid
                        generateLabels: (chart) => {
                            const dataset = chart.data.datasets[0];
                            return chart.data.labels.map((label, i) => ({
                                text: label,
                                fillStyle: dataset.backgroundColor[i],
                                strokeStyle: dataset.backgroundColor[i],
                                lineWidth: 0,
                                hidden: !chart.getDataVisibility(i),
                                index: i,
                            }));
                        },
                    },
                    // Max 2 items per row for symmetry
                    maxWidth: 320,
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


// ═══ JOB ANALYSIS REPORT BUILDER ══════════════════════════════════════════════
function buildJobAnalysisReport(inp, energyWh, isWasteful) {
    const T = (DATA.translations[currentLang] || DATA.translations.en);
    const langLabel = T.lang_label || currentLang.toUpperCase();
    const timestamp = new Date().toLocaleString("en-IN", { dateStyle:"long", timeStyle:"short", timeZone:"Asia/Kolkata" });

    // ── Per-job calculations ──
    const energyKwh    = energyWh / 1000;
    const co2IndiaG    = (energyKwh * 720 * 1000).toFixed(2);
    const co2ItalyG    = (energyKwh * 230 * 1000).toFixed(2);
    const co2IndiaKg   = (energyKwh * 720).toFixed(4);
    const coreUtil     = inp.num_cores_alloc > 0 ? ((inp.num_cores_req / inp.num_cores_alloc) * 100).toFixed(1) : 100;
    const coreWasted   = Math.max(0, inp.num_cores_alloc - inp.num_cores_req);
    const isMemBound   = inp.mem_pwr_w > inp.cpu_pwr_w * 0.5;
    const cpParkSaveWh = isWasteful ? (energyWh * 0.15).toFixed(2) : 0;
    const dvfsSaveWh   = isMemBound  ? (energyWh * 0.12).toFixed(2) : 0;
    const phoneCharges = Math.round(parseFloat(co2IndiaG) / 8.22);
    const drivingKm    = (parseFloat(co2IndiaKg) / 0.00021).toFixed(1);

    // ── Green Score ──
    const co2g = parseFloat(co2IndiaG);
    const grade = co2g <= 0.5 ? "A" : co2g <= 1.0 ? "B" : co2g <= 2.0 ? "C" : co2g <= 5.0 ? "D" : "F";
    const gradeColor = {A:"#059669",B:"#0ea5e9",C:"#f59e0b",D:"#f97316",F:"#ef4444"}[grade];
    const gradeText  = {A:"Excellent",B:"Good",C:"Average",D:"Below Average",F:"Poor"}[grade];

    // ── CSS helpers ──
    const H2   = "font-size:17px;font-weight:700;color:#0f172a;margin:24px 0 10px 0;padding-bottom:6px;border-bottom:2px solid #cbd5e1;";
    const P    = "font-size:13px;color:#475569;margin:5px 0;line-height:1.65;";
    const TH   = "padding:9px 12px;font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;background:#f1f5f9;border:1px solid #e2e8f0;text-align:left;";
    const TD   = "padding:9px 12px;font-size:13px;border:1px solid #e2e8f0;color:#1e293b;vertical-align:top;";
    const TD2  = "padding:9px 12px;font-size:13px;border:1px solid #e2e8f0;color:#1e293b;background:#f8fafc;vertical-align:top;";
    const CARD = "background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;margin-bottom:12px;";

    function tbl(headers, rows) {
        let h = "<table style='width:100%;border-collapse:collapse;margin:8px 0 16px 0;'><thead><tr>";
        h += headers.map(hd => "<th style='" + TH + "'>" + hd + "</th>").join("");
        h += "</tr></thead><tbody>";
        rows.forEach((row, i) => {
            h += "<tr>" + row.map(cell => "<td style='" + (i%2===0?TD:TD2) + "'>" + cell + "</td>").join("") + "</tr>";
        });
        h += "</tbody></table>";
        return h;
    }

    function accentBlock(color, titleEmoji, title, bodyHTML) {
        return "<div style='background:#f8fafc;border-left:5px solid " + color + ";border-radius:6px;padding:14px 16px;margin-bottom:14px;'>" +
               "<p style='font-size:10px;color:" + color + ";text-transform:uppercase;letter-spacing:1px;margin:0 0 6px 0;font-weight:700;'>" + titleEmoji + " " + title + "</p>" +
               bodyHTML + "</div>";
    }

    // ── Verdict ──
    const verdictColor   = isWasteful ? "#ef4444" : "#059669";
    const verdictText    = isWasteful ? T.verdict_wasteful : T.verdict_efficient;
    const verdictExplain = isWasteful ? T.verdict_wasteful_explain : T.verdict_efficient_explain;
    const verdictEmoji   = isWasteful ? "&#x26A0;&#xFE0F;" : "&#x2705;";

    // ── Recommendations ──
    let recoList = "";
    if (isWasteful) recoList += "<p style='" + P + "'>&#x1F17F;&#xFE0F; " + T.reco_corepark + "</p>";
    if (isMemBound) recoList += "<p style='" + P + "'>&#x1F504; " + T.reco_dvfs + "</p>";
    recoList += "<p style='" + P + "'>&#x1F4E6; " + T.reco_consolidate + "</p>";
    if (!isWasteful && !isMemBound) recoList = "<p style='" + P + "'>&#x2714;&#xFE0F; " + T.reco_none + "</p>";

    const conclusion = isWasteful ? T.conclusion_wasteful : T.conclusion_efficient;

    return "<div style='font-family:Arial,Helvetica,sans-serif;color:#1e293b;background:#ffffff;width:760px;padding:30px;box-sizing:border-box;'>" +

    // HEADER
    "<div style='background:#0f172a;padding:24px;border-radius:10px;margin-bottom:22px;text-align:center;'>" +
    "<p style='font-size:30px;font-weight:800;color:#00f5d4;margin:0;'>&#x0905;&#x0932;&#x094D;&#x092A;&#x0930;&#x094B;&#x0927; AlpaRodh</p>" +
    "<p style='font-size:15px;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;margin:6px 0 0 0;'>" + T.report_title + "</p>" +
    "<p style='font-size:11px;color:#64748b;margin:8px 0 0 0;'>" + T.report_subtitle + "</p>" +
    "<p style='margin:10px 0 0 0;'>" +
    "<span style='display:inline-block;padding:3px 10px;border:1px solid #00f5d4;border-radius:12px;font-size:11px;color:#00f5d4;margin:0 3px;'>PARAM Yuva-II</span>" +
    "<span style='display:inline-block;padding:3px 10px;border:1px solid #ffd166;border-radius:12px;font-size:11px;color:#ffd166;margin:0 3px;'>CDAC Pune</span>" +
    "<span style='display:inline-block;padding:3px 10px;border:1px solid #a78bfa;border-radius:12px;font-size:11px;color:#a78bfa;margin:0 3px;'>" + langLabel + "</span>" +
    "</p></div>" +

    // TELEMETRY INPUTS
    "<h2 style='" + H2 + "'>&#x1F4CB; " + T.section_inputs + "</h2>" +
    tbl(["Parameter", "Value", "Parameter", "Value"], [
        ["&#x1F50C; Node Power",   inp.node_pwr_w + " W",   "&#x1F9E0; Memory Power", inp.mem_pwr_w + " W"],
        ["&#x1F4BB; CPU Power",    inp.cpu_pwr_w + " W",    "&#x1F4CB; Requested Cores", inp.num_cores_req],
        ["&#x23F1;&#xFE0F; Run Time", inp.run_time + " s",  "&#x1F4E6; Allocated Cores", inp.num_cores_alloc],
    ]) +

    // AI VERDICT
    "<h2 style='" + H2 + "'>&#x1F916; " + T.section_verdict + "</h2>" +
    "<table style='width:100%;border-collapse:collapse;margin-bottom:14px;'><tr>" +
    "<td style='width:48%;vertical-align:top;padding-right:8px;'>" +
    accentBlock(verdictColor, verdictEmoji, isWasteful ? "Waste Classification" : "Efficiency Status",
        "<p style='font-size:17px;font-weight:700;color:" + verdictColor + ";margin:0 0 8px 0;'>" + verdictText + "</p>" +
        "<p style='" + P + "'>" + verdictExplain + "</p>"
    ) + "</td>" +
    "<td style='width:4%;'></td>" +
    "<td style='width:48%;vertical-align:top;padding-left:8px;'>" +
    accentBlock("#0ea5e9", "&#x26A1;", "Energy Prediction",
        "<p style='font-size:17px;font-weight:700;color:#0ea5e9;margin:0 0 6px 0;'>" + energyWh.toFixed(4) + " Wh</p>" +
        "<p style='" + P + "'>&#x1F50B; " + (energyKwh * 1000).toFixed(4) + " mWh &nbsp;|&nbsp; " + energyKwh.toFixed(6) + " kWh</p>" +
        "<p style='" + P + "'>Core utilization: <strong>" + coreUtil + "%</strong> &nbsp;|&nbsp; Wasted cores: <strong>" + coreWasted + "</strong></p>" +
        (isMemBound ? "<p style='" + P + "'>&#x1F9E0; Memory-bound workload detected</p>" : "")
    ) + "</td></tr></table>" +

    // ENVIRONMENTAL IMPACT
    "<h2 style='" + H2 + "'>&#x1F33F; " + T.section_carbon + "</h2>" +
    "<table style='width:100%;border-collapse:collapse;margin-bottom:14px;'><tr>" +
    "<td style='width:30%;vertical-align:top;padding-right:8px;'>" +
    "<div style='" + CARD + "text-align:center;border-top:5px solid " + gradeColor + ";'>" +
    "<p style='font-size:11px;color:#64748b;margin:0 0 4px 0;text-transform:uppercase;letter-spacing:1px;'>Green Score</p>" +
    "<p style='font-size:52px;font-weight:900;color:" + gradeColor + ";margin:0;'>" + grade + "</p>" +
    "<p style='font-size:12px;font-weight:600;color:" + gradeColor + ";margin:2px 0 0 0;'>" + gradeText + "</p>" +
    "</div></td>" +
    "<td style='width:3%;'></td>" +
    "<td style='width:67%;vertical-align:top;'>" +
    tbl(["Metric", "India &#x1F1EE;&#x1F1F3; (720 gCO&#x2082;/kWh)", "Italy &#x1F1EE;&#x1F1F9; (230 gCO&#x2082;/kWh)"], [
        ["CO&#x2082; Emitted", co2IndiaG + " g", co2ItalyG + " g"],
        ["Energy Used", energyWh.toFixed(4) + " Wh", energyWh.toFixed(4) + " Wh"],
        ["Grid Multiplier", "3.13x more carbon", "Baseline"],
    ]) +
    "<p style='" + P + "'>&#x1F697; Equivalent to <strong>" + drivingKm + " km</strong> of driving &nbsp;|&nbsp; &#x1F4F1; <strong>" + phoneCharges + "</strong> phone charges</p>" +
    "</td></tr></table>" +

    // RECOMMENDATIONS
    "<h2 style='" + H2 + "'>&#x1F527; " + T.section_reco + "</h2>" +
    "<div style='" + CARD + "'>" + recoList +
    (cpParkSaveWh > 0 || dvfsSaveWh > 0 ?
        "<hr style='border:none;border-top:1px solid #e2e8f0;margin:10px 0;'>" +
        "<p style='" + P + "'><strong>&#x1F4C9; Estimated savings if applied:</strong> Core-Park: <strong>" + cpParkSaveWh + " Wh</strong>" +
        (dvfsSaveWh > 0 ? " | DVFS: <strong>" + dvfsSaveWh + " Wh</strong>" : "") + "</p>" : "") +
    "</div>" +

    // SYSTEM CONTEXT
    "<h2 style='" + H2 + "'>&#x1F4CA; " + T.section_context + "</h2>" +
    tbl(["System Metric", "PM100 (Dataset)", "PARAM Yuva-II (Target)"], [
        ["Peak Performance", "32 PFlops", "524 TFlops"],
        ["CPU", "IBM POWER9", "Intel Xeon E5-2670/2650"],
        ["GPU", "NVIDIA Tesla V100", "NVIDIA Tesla M2090"],
        ["Grid CO&#x2082; Factor", "230 gCO&#x2082;/kWh (Italy)", "720 gCO&#x2082;/kWh (India)"],
        ["System-wide Jobs", "231,238", "Projected scaling"],
        ["System AlpaRodh Savings", "39.80 kWh", "24.10 kWh (projected)"],
    ]) +

    // CONCLUSION
    "<h2 style='" + H2 + "'>&#x1F3C1; " + T.section_conclusion + "</h2>" +
    "<div style='background:#0f172a;border-radius:8px;padding:16px 20px;margin-bottom:20px;'>" +
    "<p style='font-size:14px;color:#e2e8f0;margin:0;line-height:1.7;'>" + conclusion + "</p>" +
    "</div>" +

    // FOOTER
    "<div style='margin-top:24px;padding-top:12px;border-top:2px solid #e2e8f0;text-align:center;'>" +
    "<p style='font-size:13px;font-weight:700;color:#0f172a;margin:0;'>&#x0905;&#x0932;&#x094D;&#x092A;&#x0930;&#x094B;&#x0927; AlpaRodh v1.0</p>" +
    "<p style='font-size:11px;color:#94a3b8;margin:4px 0 0 0;'>AI-Driven Variable Resistance Reduction for India's Supercomputers</p>" +
    "<p style='font-size:10px;color:#cbd5e1;margin:6px 0 0 0;'>Report generated: " + timestamp + "</p>" +
    "</div></div>";
}

