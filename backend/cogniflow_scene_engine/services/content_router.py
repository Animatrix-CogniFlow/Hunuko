from cogniflow_scene_engine.schemas.analysis import ContentAnalysis
from cogniflow_scene_engine.schemas.processing import ProcessingResult
from cogniflow_scene_engine.specialist_engines.math.physics import solve_physics_variables
from cogniflow_scene_engine.specialist_engines.math.geometry import calculate_midpoint_2d
from cogniflow_scene_engine.specialist_engines.math.algebra import solve_linear_equation
from cogniflow_scene_engine.core.logging_config import logger

def route_content(analysis: ContentAnalysis) -> ProcessingResult:
    """Generic Content Router: Invokes specialist engines only when required."""
    if not analysis.requires_specialist_processing or not analysis.extraction:
        logger.info("Routing: Generic processing path selected (No specialist computation needed).")
        return ProcessingResult(route="generic", success=True)

    domain = analysis.extraction.domain
    logger.info(f"Routing: Specialist path activated for domain '{domain}'.")
    ext = analysis.extraction

    try:
        if domain == "physics":
            var_map = {v.name.lower(): v.value for v in ext.variables if v.value is not None}
            results = solve_physics_variables(var_map)
            return ProcessingResult(route="specialist", success=True, specialist_domain="physics", results=results)

        elif domain == "geometry":
            coords = [v.coordinates for v in ext.variables if v.coordinates is not None]
            if len(coords) >= 2:
                results = calculate_midpoint_2d(coords[0], coords[1])
                return ProcessingResult(route="specialist", success=True, specialist_domain="geometry", results=results)

        elif domain == "algebra":
            if ext.operation:
                results = solve_linear_equation(ext.operation)
                return ProcessingResult(route="specialist", success=True, specialist_domain="algebra", results=results)

        return ProcessingResult(route="specialist", success=True, specialist_domain=domain, results={}, warnings=["No matching engine handler."])

    except Exception as e:
        logger.error(f"Specialist Engine Execution failed: {str(e)}")
        return ProcessingResult(route="specialist", success=False, specialist_domain=domain, warnings=[str(e)])
