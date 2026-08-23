from google.genai import types
from cogniflow_scene_engine.schemas.input import LearningInput
from cogniflow_scene_engine.schemas.analysis import ContentAnalysis
from cogniflow_scene_engine.services.gemini_service import get_gemini_client
from cogniflow_scene_engine.core.config import settings
from cogniflow_scene_engine.core.exceptions import ContentAnalysisError
from cogniflow_scene_engine.core.logging_config import logger


def analyze_content(input_data: LearningInput) -> ContentAnalysis:
    """Pass 1: Gemini analyzes the material and extracts subject, type, strategy, and variables."""
    logger.info("Executing Pass 1: Content Analysis...")
    client = get_gemini_client()

    system_instruction = (
        "You are CogniFlow's Content Analyzer. Analyze uploaded educational content across ANY domain. "
        "1. Classify content_type (mathematical, scientific, theoretical, historical, computational, general). "
        "2. Choose a visualization_strategy (timeline, process_animation, step_by_step_solution, concept_map, 3d_spatial_simulation). "
        "3. Set requires_specialist_processing to True ONLY if deterministic computation (e.g. SymPy) is required, "
        "and extract variables into the extraction field if applicable."
    )

    try:
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=input_data.content,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=ContentAnalysis,
            ),
        )
        analysis = ContentAnalysis.model_validate_json(response.text)
        logger.info(f"Analysis complete: Subject='{analysis.subject}', Type='{analysis.content_type}', SpecialistNeeded={analysis.requires_specialist_processing}")
        return analysis
    except Exception as e:
        logger.error(f"Content Analysis failed: {str(e)}")
        raise ContentAnalysisError("Failed to analyze input content.", details=str(e))