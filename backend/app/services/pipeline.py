import time
import uuid
from datetime import datetime, timezone
from pathlib import Path

from app.compliance import engine
from app.config import get_settings
from app.models.scan import Scan, Timings
from app.services import gemini, ocr, preprocess

LOW_CONFIDENCE_THRESHOLD = 0.35


class PipelineError(Exception):
    """Raised when an image cannot be processed into a scan."""


def _persist_image(scan_id: str, image_bytes: bytes) -> str:
    settings = get_settings()
    media_dir = Path(settings.media_path)
    media_dir.mkdir(parents=True, exist_ok=True)
    (media_dir / f"{scan_id}.jpg").write_bytes(image_bytes)
    return f"/media/{scan_id}.jpg"


def run(image_bytes: bytes, category: str) -> Scan:
    try:
        rules = engine.get_rules(category)
    except KeyError as exc:
        raise PipelineError(f"Unknown category '{category}'.") from exc

    started = time.perf_counter()
    try:
        original, prepared = preprocess.prepare(image_bytes)
    except ValueError as exc:
        raise PipelineError(str(exc)) from exc
    preprocess_ms = int((time.perf_counter() - started) * 1000)

    started = time.perf_counter()
    ocr_output = ocr.run(prepared)
    ocr_ms = int((time.perf_counter() - started) * 1000)

    if ocr_output.result.word_count < 5 or ocr_output.result.confidence < LOW_CONFIDENCE_THRESHOLD:
        raise PipelineError(
            "The label text could not be read reliably. Retake the photo with the label "
            "flat, well lit and filling the frame."
        )

    started = time.perf_counter()
    values, confidences, structurer = gemini.structure(ocr_output.result.text, rules)
    structure_ms = int((time.perf_counter() - started) * 1000)

    started = time.perf_counter()
    fields, issues, score, verdict = engine.evaluate(
        category, values, confidences, ocr_output.result.text
    )
    for field in fields:
        if field.value:
            field.bbox = ocr.locate(field.value, ocr_output)
    compliance_ms = int((time.perf_counter() - started) * 1000)

    scan_id = uuid.uuid4().hex[:12]
    image_url = _persist_image(scan_id, preprocess.encode_jpeg(original))

    product_name = next((f.value for f in fields if f.key == "product_name" and f.value), None)

    return Scan(
        id=scan_id,
        created_at=datetime.now(timezone.utc),
        category=rules.key,
        category_label=rules.label,
        product_name=product_name,
        image_url=image_url,
        verdict=verdict,
        score=score,
        fields=fields,
        issues=issues,
        ocr=ocr_output.result,
        timings=Timings(
            preprocess_ms=preprocess_ms,
            ocr_ms=ocr_ms,
            structure_ms=structure_ms,
            compliance_ms=compliance_ms,
        ),
        structurer=structurer,
    )
