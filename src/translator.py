"""
AlpaRodh Translator — Multilingual plain-language explanations.

Converts technical HPC energy metrics into layman-friendly explanations
in English, Hindi (हिंदी), and Marathi (मराठी).

Design: Template-based with {value} placeholders — easily extensible
for future LLM API integration (BharatGen, IndicTrans2, etc.).
"""


# ─── Translation Templates ──────────────────────────────────────────────────

TRANSLATIONS = {
    # ── Baseline Energy ──────────────────────────────────────────────────
    "baseline_energy": {
        "en": "The supercomputer consumed a total of {value} kWh of electricity — enough to power an average Indian home for about {days} days.",
        "hi": "सुपरकंप्यूटर ने कुल {value} kWh बिजली खर्च की — यह एक भारतीय घर को लगभग {days} दिन चलाने के लिए पर्याप्त है।",
        "mr": "सुपरकंप्युटरने एकूण {value} kWh वीज वापरली — हे एका भारतीय घराला सुमारे {days} दिवस चालवण्यासाठी पुरेसे आहे।",
    },

    # ── Energy Savings ───────────────────────────────────────────────────
    "energy_savings": {
        "en": "AlpaRodh saved {value} kWh ({percent}%) by intelligently reducing idle power in over-allocated compute nodes — like turning off unused lights in a building.",
        "hi": "अल्परोध ने {value} kWh ({percent}%) बिजली बचाई — यह ऐसे है जैसे किसी बिल्डिंग में बेकार जलती लाइट्स बंद कर दी जाएं। सुपरकंप्यूटर के जो हिस्से बिना काम के चालू थे, उनकी बिजली कम कर दी गई।",
        "mr": "अल्परोधने {value} kWh ({percent}%) वीज वाचवली — जसे एखाद्या इमारतीतील न वापरलेले दिवे बंद करणे. सुपरकंप्युटरचे जे भाग विनाकारण चालू होते, त्यांची वीज कमी केली.",
    },

    # ── Variable Resistance ──────────────────────────────────────────────
    "variable_resistance": {
        "en": "The 'variable resistance' is the dynamic power a CPU uses during computation. When a job doesn't fully use its allocated cores, these cores still draw power — like an engine running in neutral. AlpaRodh identifies and reduces this waste.",
        "hi": "'वेरिएबल रेजिस्टेंस' (परिवर्तनीय प्रतिरोध) वह बिजली है जो CPU गणना के दौरान उपयोग करता है। जब कोई कार्य अपने आवंटित कोर का पूरा उपयोग नहीं करता, तो ये कोर फिर भी बिजली खींचते हैं — जैसे कार का इंजन न्यूट्रल में चलना। अल्परोध इस बर्बादी को पहचानता है और कम करता है।",
        "mr": "'व्हेरिएबल रेझिस्टन्स' (बदलणारा प्रतिरोध) म्हणजे CPU गणनेदरम्यान वापरत असलेली वीज. जेव्हा एखादे कार्य त्याच्या वाटप केलेल्या कोअर्सचा पूर्ण वापर करत नाही, तेव्हाही ते कोअर्स वीज वापरतात — जसे कार न्यूट्रलमध्ये चालू असणे. अल्परोध ही नासाडी ओळखतो आणि कमी करतो.",
    },

    # ── Carbon Footprint ─────────────────────────────────────────────────
    "carbon_saved": {
        "en": "We prevented {value} kg of CO₂ emissions — equivalent to planting {trees} trees or avoiding {km} km of car driving.",
        "hi": "हमने {value} kg CO₂ उत्सर्जन रोका — यह {trees} पेड़ लगाने या {km} km कार ड्राइविंग बचाने के बराबर है।",
        "mr": "आम्ही {value} kg CO₂ उत्सर्जन रोखले — हे {trees} झाडे लावण्याइतके किंवा {km} km कार चालवणे टाळण्याइतके आहे.",
    },

    # ── AlpaRodh Coefficient ─────────────────────────────────────────────
    "alpa_coefficient": {
        "en": "The AlpaRodh Coefficient (ηα = {value} gCO₂/kWh) measures how effectively our AI reduces pollution per unit of electricity optimized. A higher value means the AI is better at targeting the most wasteful workloads.",
        "hi": "अल्परोध गुणांक (ηα = {value} gCO₂/kWh) यह मापता है कि हमारा AI प्रति यूनिट बिजली कितना प्रदूषण कम करता है। जितना ऊंचा मान, उतना बेहतर — मतलब AI सबसे फालतू कार्यों को सटीक रूप से पकड़ रहा है।",
        "mr": "अल्परोध गुणांक (ηα = {value} gCO₂/kWh) हे मोजतो की आमचे AI प्रति युनिट वीज किती प्रदूषण कमी करतो. जितके जास्त मूल्य, तितके चांगले — म्हणजे AI सर्वात जास्त वाया जाणाऱ्या कामांना अचूकपणे ओळखतो.",
    },

    # ── Core Mismatch ────────────────────────────────────────────────────
    "core_mismatch": {
        "en": "We found {value} jobs where the computer allocated more processor cores than the job actually needed — like booking a 100-seat bus for 10 people. The empty seats still consume fuel (electricity).",
        "hi": "हमने {value} ऐसे कार्य पाए जहां कंप्यूटर ने जरूरत से ज्यादा प्रोसेसर कोर आवंटित किए — जैसे 10 लोगों के लिए 100 सीट की बस बुक करना। खाली सीटें भी ईंधन (बिजली) खर्च करती हैं।",
        "mr": "आम्हाला {value} कामे आढळली जिथे संगणकाने प्रत्यक्ष गरजेपेक्षा जास्त प्रोसेसर कोअर्स दिले — जसे 10 लोकांसाठी 100 आसनांची बस बुक करणे. रिकाम्या जागाही इंधन (वीज) वापरतात.",
    },

    # ── AI Prediction ────────────────────────────────────────────────────
    "ai_prediction": {
        "en": "Our AI model can predict wasteful jobs with {value}% accuracy BEFORE they run — like a smart traffic system that prevents jams before they happen.",
        "hi": "हमारा AI मॉडल {value}% सटीकता से बता सकता है कि कौन सा कार्य बिजली बर्बाद करेगा — चलने से पहले! यह ऐसे है जैसे एक स्मार्ट ट्रैफिक सिस्टम जो जाम होने से पहले ही रोक दे।",
        "mr": "आमचा AI मॉडेल {value}% अचूकतेने सांगू शकतो की कोणते काम वीज वाया घालवेल — चालू होण्यापूर्वीच! हे एखाद्या स्मार्ट ट्रॅफिक सिस्टमसारखे आहे जी जाम होण्यापूर्वीच रोखते.",
    },

    # ── PARAM Yuva-II ────────────────────────────────────────────────────
    "param_mapping": {
        "en": "When applied to India's PARAM Yuva-II supercomputer at CDAC Pune, AlpaRodh could save {value} kWh — preventing {co2} kg of CO₂ on India's carbon-intensive power grid.",
        "hi": "जब अल्परोध को CDAC पुणे के PARAM Yuva-II सुपरकंप्यूटर पर लागू किया जाए, तो {value} kWh बिजली बचाई जा सकती है — भारत के कार्बन-सघन बिजली ग्रिड पर {co2} kg CO₂ रोका जा सकता है।",
        "mr": "जेव्हा अल्परोध CDAC पुण्याच्या PARAM Yuva-II सुपरकंप्युटरवर लागू केला जातो, तेव्हा {value} kWh वीज वाचवता येते — भारताच्या कार्बन-सघन वीज ग्रिडवर {co2} kg CO₂ रोखता येतो.",
    },

    # ── India Impact ─────────────────────────────────────────────────────
    "india_impact": {
        "en": "India's power grid is {multiplier}x more carbon-intensive than Italy's. This means the SAME energy savings in India prevents {multiplier}x MORE pollution — making AlpaRodh even more impactful for Indian supercomputers.",
        "hi": "भारत का बिजली ग्रिड इटली से {multiplier} गुना ज्यादा कार्बन-सघन है। इसका मतलब है कि भारत में वही बिजली बचत {multiplier} गुना ज्यादा प्रदूषण रोकती है — अल्परोध भारतीय सुपरकंप्यूटर्स के लिए और भी ज्यादा प्रभावी है।",
        "mr": "भारताचे वीज ग्रिड इटलीपेक्षा {multiplier} पट अधिक कार्बन-सघन आहे. याचा अर्थ भारतात तीच वीज बचत {multiplier} पट अधिक प्रदूषण रोखते — अल्परोध भारतीय सुपरकंप्युटर्ससाठी आणखी प्रभावी आहे.",
    },

    # ── Green Score ──────────────────────────────────────────────────────
    "green_score": {
        "en": "Each job gets a Green Score from A (most efficient) to F (most wasteful) — like an energy star rating for your appliances, but for supercomputer tasks.",
        "hi": "हर कार्य को A (सबसे कुशल) से F (सबसे फालतू) तक एक ग्रीन स्कोर मिलता है — जैसे आपके उपकरणों की ऊर्जा स्टार रेटिंग, लेकिन सुपरकंप्यूटर के कार्यों के लिए।",
        "mr": "प्रत्येक कामाला A (सर्वात कार्यक्षम) ते F (सर्वात वाया) असा ग्रीन स्कोर मिळतो — जसे तुमच्या उपकरणांची ऊर्जा स्टार रेटिंग, पण सुपरकंप्युटर कामांसाठी.",
    },
}

# Language names for display
LANGUAGE_NAMES = {
    "en": "English",
    "hi": "हिंदी (Hindi)",
    "mr": "मराठी (Marathi)",
}


# ─── Translation Functions ──────────────────────────────────────────────────

def get_explanation(metric_key, language="en", **kwargs):
    """
    Get a plain-language explanation for a specific metric.
    
    Args:
        metric_key: Key from TRANSLATIONS dict.
        language: 'en', 'hi', or 'mr'.
        **kwargs: Values to insert into template placeholders.
    
    Returns:
        str: Translated and filled explanation.
    """
    if metric_key not in TRANSLATIONS:
        return f"[Translation not available for: {metric_key}]"
    
    templates = TRANSLATIONS[metric_key]
    if language not in templates:
        language = "en"  # Fallback to English
    
    template = templates[language]
    try:
        return template.format(**kwargs)
    except KeyError:
        return template  # Return with unfilled placeholders


def explain_savings(savings_kwh, savings_pct, language="en"):
    """Explain energy savings in plain language."""
    return get_explanation(
        "energy_savings", language,
        value=f"{savings_kwh:.2f}",
        percent=f"{savings_pct:.2f}"
    )


def explain_carbon(co2_kg, trees, km, language="en"):
    """Explain carbon impact in plain language."""
    return get_explanation(
        "carbon_saved", language,
        value=f"{co2_kg:.2f}",
        trees=f"{trees:.1f}",
        km=f"{km:.0f}"
    )


def explain_alpa_coefficient(eta, language="en"):
    """Explain the AlpaRodh Coefficient in plain language."""
    return get_explanation(
        "alpa_coefficient", language,
        value=f"{eta:.4f}"
    )


def get_full_report(results, language="en"):
    """
    Generate a complete multilingual report from analysis results.
    
    Args:
        results: Dict with all analysis results (from run_analysis).
        language: Target language code.
    
    Returns:
        dict: Keyed explanations in the target language.
    """
    baseline = results.get("baseline", {})
    optimization = results.get("optimization", {})
    carbon = results.get("carbon", {})
    param = results.get("param_mapping", {})
    ai = results.get("ai_models", {})

    # Calculate auxiliary values
    baseline_kwh = baseline.get("total_baseline_kwh", 0)
    avg_indian_home_kwh_per_day = 3.5  # ~3.5 kWh/day average
    days = round(baseline_kwh / avg_indian_home_kwh_per_day, 1)

    combined = optimization.get("combined", {})
    savings_kwh = combined.get("savings_kwh", 0)
    savings_pct = combined.get("savings_percent", 0)

    equivalences = carbon.get("equivalences", {})
    co2_saved = carbon.get("savings", {}).get("co2_india_kg", 0)

    param_savings = param.get("projected_savings", {})
    india_comparison = carbon.get("india_vs_italy", {})

    classifier = ai.get("waste_classifier", {})
    accuracy = classifier.get("accuracy", 0) * 100

    report = {
        "baseline_energy": get_explanation(
            "baseline_energy", language, value=f"{baseline_kwh:.2f}", days=str(days)
        ),
        "variable_resistance": get_explanation("variable_resistance", language),
        "energy_savings": explain_savings(savings_kwh, savings_pct, language),
        "core_mismatch": get_explanation(
            "core_mismatch", language, value=str(baseline.get("mismatch_count", 0))
        ),
        "carbon_saved": explain_carbon(
            co2_saved,
            equivalences.get("trees_year", 0),
            equivalences.get("driving_km_avoided", 0),
            language
        ),
        "alpa_coefficient": explain_alpa_coefficient(
            carbon.get("alpa_coefficient", 0), language
        ),
        "ai_prediction": get_explanation(
            "ai_prediction", language, value=f"{accuracy:.1f}"
        ),
        "param_mapping": get_explanation(
            "param_mapping", language,
            value=f"{param_savings.get('param_savings_kwh', 0):.2f}",
            co2=f"{param_savings.get('co2_saved_india_kg', 0):.2f}"
        ),
        "india_impact": get_explanation(
            "india_impact", language,
            multiplier=str(india_comparison.get("india_multiplier", 3.13))
        ),
        "green_score": get_explanation("green_score", language),
    }

    return report


def get_all_languages_report(results):
    """
    Generate reports in all supported languages.
    
    Args:
        results: Full analysis results dict.
    
    Returns:
        dict: {language_code: {metric: explanation}}.
    """
    return {
        lang: get_full_report(results, lang)
        for lang in LANGUAGE_NAMES
    }
