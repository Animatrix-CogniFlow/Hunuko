from google import genai
from cogniflow_scene_engine.core.config import settings
from cogniflow_scene_engine.core.exceptions import GeminiServiceError

def get_gemini_client() -> genai.Client:
    """Initializes and returns the official Gemini Client."""
    if not settings.gemini_api_key:
        raise GeminiServiceError("GEMINI_API_KEY is missing. Check your .env file.")
    return genai.Client(api_key=settings.gemini_api_key)
