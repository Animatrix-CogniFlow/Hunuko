# All supported languages
SUPPORTED_LANGUAGES = {
    # Global
    "en":   "English",
    "fr":   "French",
    "pt":   "Portuguese",
    "es":   "Spanish",
    "it":   "Italian",
    "ar":   "Arabic",
    "zh":   "Chinese (Mandarin)",
    "ja":   "Japanese",
    "ko":   "Korean",
    "hi":   "Hindi",

    # African languages — West Africa
    "ha":   "Hausa",
    "yo":   "Yoruba",
    "ig":   "Igbo",
    "tw":   "Twi",
    "pcm":  "Nigerian Pidgin",

    # African languages — East Africa
    "sw":   "Swahili",
    "am":   "Amharic",
    "so":   "Somali",

    # African languages — Southern Africa
    "zu":   "Zulu",

    # Fun / engagement
    "genZ": "Gen Z English",
}

# African + non-Latin languages — route through Gemini instead of Groq for better quality
GEMINI_ONLY_LANGUAGES = {
    "sw", "ha", "yo", "ig", "am", "tw", "pcm", "so", "zu",
    "ar", "zh", "ja", "ko", "hi"
}


def get_language_instruction(output_language_code: str) -> str:
    """
    Returns a DOMINANT language instruction placed at the very top of every
    agent prompt. Phrased as a critical system command so Gemini cannot ignore it.
    """
    language_name = SUPPORTED_LANGUAGES.get(output_language_code, "English")

    if output_language_code == "en":
        return "OUTPUT LANGUAGE: Respond in clear standard English."

    if output_language_code == "genZ":
        return """OUTPUT LANGUAGE — MANDATORY INSTRUCTION (highest priority):
You MUST respond entirely in Gen Z English. This overrides everything else.
Use Gen Z slang naturally: "no cap", "lowkey", "it's giving", "slay", "bussin",
"understood the assignment", "main character energy", "rent free", "vibe check", "fr fr" etc.
Keep it fun and informal but make sure the student fully understands the content.
Do not force slang where it does not fit — keep it natural and authentic.
"""

    if output_language_code == "pcm":
        return """OUTPUT LANGUAGE — MANDATORY INSTRUCTION (highest priority):
You MUST respond entirely in Nigerian Pidgin English (Naija Pidgin). This overrides everything else.
Use natural Pidgin expressions: "wetin", "dey", "na", "abi", "e don",
"no wahala", "sabi", "chop", "waka", "oga", "abeg" etc.
Make sure the student fully understands the educational content.
Keep it authentic — write exactly how a Nigerian would naturally speak Pidgin.
"""

    return f"""OUTPUT LANGUAGE — CRITICAL MANDATORY INSTRUCTION (highest priority, overrides all other instructions):
You MUST respond ENTIRELY in {language_name}. No exceptions.
- The source material may be in ANY language — ignore the source language completely.
- Translate ALL concepts, explanations, questions, feedback, and JSON text values into {language_name}.
- Do NOT write any English in your response unless {language_name} naturally uses English loanwords.
- Do NOT mix languages. Every single word must be in {language_name}.
- If a technical term has no direct translation, use the closest {language_name} equivalent and explain it.
VIOLATION: Responding in any language other than {language_name} is a critical failure.
"""


def should_use_gemini(language_code: str) -> bool:
    return language_code in GEMINI_ONLY_LANGUAGES


def validate_language(language_code: str) -> bool:
    return language_code in SUPPORTED_LANGUAGES


def get_all_languages() -> list:
    return [{"code": code, "name": name} for code, name in SUPPORTED_LANGUAGES.items()]
