from typing import Literal, Any
from pydantic import BaseModel, Field

class LearningInput(BaseModel):
    content: str = Field(..., description="Raw text content extracted from user prompt, note, or document")
    source_type: Literal["text", "question", "notes", "document"] = Field(
        default="text",
        description="Source classification of input material"
    )
    metadata: dict[str, Any] = Field(
        default_factory=dict,
        description="Optional metadata such as document title, page numbers, or user tags"
    )
