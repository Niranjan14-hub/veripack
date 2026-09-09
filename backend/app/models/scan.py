from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field

FieldStatus = Literal["present", "missing", "invalid"]
Severity = Literal["critical", "major", "minor"]
Verdict = Literal["verified", "issues_found"]


class BoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float


class ExtractedField(BaseModel):
    key: str
    label: str
    value: Optional[str] = None
    status: FieldStatus = "missing"
    required: bool = True
    confidence: float = 0.0
    bbox: Optional[BoundingBox] = None
    grounded: bool = False


class ComplianceIssue(BaseModel):
    field: str
    label: str
    severity: Severity
    message: str
    fix: str


class OcrResult(BaseModel):
    text: str = ""
    confidence: float = 0.0
    engine: str = "tesseract"
    word_count: int = 0


class Timings(BaseModel):
    preprocess_ms: int = 0
    ocr_ms: int = 0
    structure_ms: int = 0
    compliance_ms: int = 0

    @property
    def total_ms(self) -> int:
        return self.preprocess_ms + self.ocr_ms + self.structure_ms + self.compliance_ms


class Scan(BaseModel):
    id: str
    user_id: Optional[str] = None
    created_at: datetime
    category: str
    category_label: str
    product_name: Optional[str] = None
    image_url: Optional[str] = None
    verdict: Verdict
    score: int = 0
    fields: list[ExtractedField] = Field(default_factory=list)
    issues: list[ComplianceIssue] = Field(default_factory=list)
    ocr: OcrResult = Field(default_factory=OcrResult)
    timings: Timings = Field(default_factory=Timings)
    structurer: str = "heuristic"
    demo: bool = False


class ScanSummary(BaseModel):
    id: str
    created_at: datetime
    category: str
    category_label: str
    product_name: Optional[str] = None
    image_url: Optional[str] = None
    verdict: Verdict
    score: int
    issue_count: int


class ScanListResponse(BaseModel):
    items: list[ScanSummary]
    total: int
    page: int
    page_size: int
