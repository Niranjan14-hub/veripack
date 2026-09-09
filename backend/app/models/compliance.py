from typing import Literal, Optional

from pydantic import BaseModel, Field

RuleCheck = Literal["required", "pattern", "units", "min_length", "date"]


class FieldRule(BaseModel):
    key: str
    label: str
    description: str = ""
    required: bool = True
    severity: Literal["critical", "major", "minor"] = "major"
    pattern: Optional[str] = None
    allowed_units: list[str] = Field(default_factory=list)
    min_length: int = 0
    fix: str = ""


class CategoryRules(BaseModel):
    key: str
    label: str
    description: str = ""
    fields: list[FieldRule] = Field(default_factory=list)


class CategoryInfo(BaseModel):
    key: str
    label: str
    description: str
    required_fields: list[str]
