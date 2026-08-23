from google.genai import types
from cogniflow_scene_engine.schemas.analysis import ContentAnalysis
from cogniflow_scene_engine.schemas.processing import ProcessingResult
from cogniflow_scene_engine.schemas.scene_plan import ScenePlan
from cogniflow_scene_engine.schemas.scene import UniversalSceneGraph, ComputedMathResult
from cogniflow_scene_engine.services.gemini_service import get_gemini_client
from cogniflow_scene_engine.core.config import settings
from cogniflow_scene_engine.core.exceptions import SceneGenerationError
from cogniflow_scene_engine.core.logging_config import logger


def generate_scene_graph(analysis: ContentAnalysis, plan: ScenePlan, processing: ProcessingResult) -> UniversalSceneGraph:
    """Pass 2: Constructs the final Universal Scene Graph enforced with cross-entity validation."""
    logger.info("Executing Pass 2: Scene Graph Synthesis...")
    client = get_gemini_client()

    system_instruction = """You are CogniFlow's Scene Generator. Construct a valid UniversalSceneGraph based on the ScenePlan.
RULES:
1. Every entity must have a unique 'id'.
2. 'source_id' and 'target_id' in relationships MUST reference an existing entity 'id'.
3. 'target_entity_id' in actions MUST reference an existing entity 'id'."""

    prompt = f"""Analysis: {analysis.model_dump_json()}
Scene Plan: {plan.model_dump_json()}
Computed Results: {processing.results}"""

    try:
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=UniversalSceneGraph,
            ),
        )
        scene = UniversalSceneGraph.model_validate_json(response.text)
        if processing.results:
            scene.computed_results = ComputedMathResult.model_validate(processing.results)
        logger.info(f"Universal Scene Graph synthesized successfully! Entities: {len(scene.entities)}, Actions: {len(scene.actions)}")
        return scene
    except Exception as e:
        logger.error(f"Scene Graph synthesis failed: {str(e)}")
        raise SceneGenerationError("Failed to synthesize Universal Scene Graph.", details=str(e))