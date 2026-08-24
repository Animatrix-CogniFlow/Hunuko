from typing import Any
from pydantic import BaseModel, Field, model_validator


class Vector3(BaseModel):
    x: float = 0.0
    y: float = 0.0
    z: float = 0.0


class Transform3D(BaseModel):
    position: Vector3 = Field(default_factory=Vector3)
    rotation: Vector3 = Field(default_factory=Vector3)
    scale: Vector3 = Field(default_factory=lambda: Vector3(x=1.0, y=1.0, z=1.0))


class SceneEntity(BaseModel):
    id: str = Field(..., description="Unique entity ID")
    type: str = Field(..., description="Entity visual type")
    label: str = Field(..., description="Display label")
    transform: Transform3D = Field(default_factory=Transform3D)


class EntityRelationship(BaseModel):
    source_id: str = Field(..., description="Source entity ID")
    target_id: str = Field(..., description="Target entity ID")
    relationship_type: str = Field(..., description="Connection type")


class ActionTrigger(BaseModel):
    timestamp_sec: float = Field(..., description="Trigger time in seconds")
    target_entity_id: str = Field(..., description="Target entity ID")
    action_type: str = Field(..., description="Action type")
    narration_caption: str = Field(..., description="Caption text")


class ComputedMathResult(BaseModel):
    formula: str | None = Field(None, description="Applied formula e.g. 'F = m * a'")
    calculated_variable: str | None = Field(None, description="Calculated variable name")
    result_value: float | None = Field(None, description="Calculated numeric value")
    unit: str | None = Field(None, description="Unit of measurement e.g. 'N'")
    operation: str | None = Field(None, description="Mathematical operation name")
    status: str | None = Field(None, description="Execution status")


class UniversalSceneGraph(BaseModel):
    schema_version: str = Field(default="1.0.0")
    scene_id: str = Field(..., description="Scene ID")
    title: str = Field(..., description="Title")
    subject: str = Field(..., description="Subject")
    content_type: str = Field(..., description="Content type")
    visualization_strategy: str = Field(..., description="Visualization strategy")
    entities: list[SceneEntity] = Field(default_factory=list)
    relationships: list[EntityRelationship] = Field(default_factory=list)
    actions: list[ActionTrigger] = Field(default_factory=list)
    computed_results: ComputedMathResult | None = Field(default=None)

    @model_validator(mode="after")
    def validate_scene_integrity(self) -> "UniversalSceneGraph":
        valid_ids = {entity.id for entity in self.entities}
        for rel in self.relationships:
            if rel.source_id not in valid_ids or rel.target_id not in valid_ids:
                raise ValueError("Invalid relationship endpoint ID")
        for action in self.actions:
            if action.target_entity_id not in valid_ids:
                raise ValueError("Invalid action target ID")
        return self