import time
from cogniflow_scene_engine.schemas.input import LearningInput
from cogniflow_scene_engine.services.content_analyzer import analyze_content
from cogniflow_scene_engine.services.content_router import route_content
from cogniflow_scene_engine.services.scene_planner import plan_scene
from cogniflow_scene_engine.services.scene_generator import generate_scene_graph
from cogniflow_scene_engine.core.logging_config import logger


def run_pipeline(text_input: str) -> None:
    logger.info(f"=== STARTING PIPELINE FOR INPUT: '{text_input}' ===")

    # 1. Normalize Input
    input_data = LearningInput(content=text_input)

    # 2. Content Analysis (Pass 1)
    analysis = analyze_content(input_data)

    # 3. Content Router & Specialist Engine Execution
    processing = route_content(analysis)

    # 4. Scene Planning
    plan = plan_scene(input_data, analysis, processing)

    # 5. Scene Graph Generation (Pass 2)
    final_scene = generate_scene_graph(analysis, plan, processing)

    logger.info("=== PIPELINE EXECUTION SUCCESSFUL ===")
    print(final_scene.model_dump_json(indent=2))


if __name__ == "__main__":
    # Path A: Theoretical Content (Biology)
    run_pipeline("Photosynthesis is the process where plants convert light energy into chemical energy in chloroplasts.")

    print("\n--- Pausing 12s for API rate-limit cooling ---\n")
    time.sleep(12)

    # Path B: Physics Engine (SymPy)
    run_pipeline("A 10 kg object accelerates at 9.8 m/s^2. Calculate the force.")

    print("\n--- Pausing 12s for API rate-limit cooling ---\n")
    time.sleep(12)

    # Path C: Geometry Engine
    run_pipeline("Find the midpoint between A(2,4) and B(6,8).")