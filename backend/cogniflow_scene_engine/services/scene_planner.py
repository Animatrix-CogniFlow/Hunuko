from google.genai import types
from cogniflow_scene_engine.schemas.input import LearningInput
from cogniflow_scene_engine.schemas.analysis import ContentAnalysis
from cogniflow_scene_engine.schemas.processing import ProcessingResult
from cogniflow_scene_engine.schemas.scene_plan import ScenePlan
from cogniflow_scene_engine.services.gemini_service import get_gemini_client
from cogniflow_scene_engine.core.config import settings
from cogniflow_scene_engine.core.logging_config import logger


def plan_scene(input_data: LearningInput, analysis: ContentAnalysis, processing: ProcessingResult) -> ScenePlan:
    """Intermediary Scene Planner: Builds high-level step-by-step scene objectives."""
    logger.info("Executing Scene Planner...")
    client = get_gemini_client()

    prompt = f"""Original Content: {input_data.content}
Analysis: {analysis.model_dump_json()}
Deterministic Results: {processing.results}

Create a high-level ScenePlan detailing sequential steps and visual goals."""

    response = client.models.generate_content(
        model=settings.gemini_model,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ScenePlan,
        ),
    )
    return ScenePlan.model_validate_json(response.text)
