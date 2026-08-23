from pydantic import BaseModel, Field

class ScenePlanStep(BaseModel):
    step_number: int = Field(...)
    purpose: str = Field(...)
    focus_entities: list[str] = Field(...)
    visual_description: str = Field(...)

class ScenePlan(BaseModel):
    title: str = Field(...)
    subject: str = Field(...)
    summary: str = Field(...)
    steps: list[ScenePlanStep] = Field(default_factory=list)
