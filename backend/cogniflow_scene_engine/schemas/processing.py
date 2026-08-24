from typing import Any, Literal
from pydantic import BaseModel, Field

class ProcessingResult(BaseModel):
    route: Literal["specialist", "generic"] = Field(...)
    success: bool = Field(...)
    specialist_domain: str | None = Field(None)
    results: dict[str, Any] = Field(default_factory=dict)
    warnings: list[str] = Field(default_factory=list)
