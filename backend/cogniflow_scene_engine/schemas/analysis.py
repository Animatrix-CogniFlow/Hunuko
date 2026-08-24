from typing import Literal, Any
from pydantic import BaseModel, Field

ContentType = Literal["mathematical", "scientific", "theoretical", "historical", "computational", "general"]
VisualizationStrategy = Literal["timeline", "process_animation", "step_by_step_solution", "concept_map", "3d_spatial_simulation"]
SpecialistDomain = Literal["physics", "geometry", "algebra", "none"]

class MathematicalVariable(BaseModel):
    name: str = Field(..., description="Variable or point identifier")
    value: float | None = Field(None, description="Numeric scalar value")
    coordinates: list[float] | None = Field(None, description="Coordinate array e.g. [x, y]")
    unit: str | None = Field(None, description="Unit of measurement")

class SpecialistExtraction(BaseModel):
    domain: SpecialistDomain = Field(default="none")
    operation: str | None = Field(None)
    variables: list[MathematicalVariable] = Field(default_factory=list)

class ContentAnalysis(BaseModel):
    subject: str = Field(...)
    content_type: ContentType = Field(...)
    key_concepts: list[str] = Field(default_factory=list)
    visualization_strategy: VisualizationStrategy = Field(...)
    requires_specialist_processing: bool = Field(...)
    specialist_domain: SpecialistDomain = Field(default="none")
    extraction: SpecialistExtraction | None = Field(None)
