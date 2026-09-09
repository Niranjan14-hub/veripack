import json
import logging
import re

from app.config import get_settings
from app.models.compliance import CategoryRules
from app.services import heuristics

logger = logging.getLogger(__name__)

PROMPT = """You are a packaging label data extractor.

Below is raw OCR text from a photograph of a product package in the "{category}" category.
The OCR is noisy: characters may be wrong, words may be split, and lines may be out of order.

Extract ONLY the following fields:
{field_spec}

Rules:
- Return a single JSON object with exactly the keys listed above and no others.
- Every value must be a string copied (lightly cleaned) from the OCR text, or null.
- Use null when the field is genuinely absent. NEVER invent, infer or complete a value
  that is not visible in the OCR text.
- Do not add commentary, markdown fences or explanations.

OCR TEXT:
\"\"\"
{ocr_text}
\"\"\"
"""


def _field_spec(rules: CategoryRules) -> str:
    return "\n".join(f'- "{f.key}": {f.label}. {f.description}' for f in rules.fields)


def _extract_json(raw: str) -> dict:
    cleaned = re.sub(r"^```(?:json)?|```$", "", raw.strip(), flags=re.MULTILINE).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
        if not match:
            raise
        return json.loads(match.group(0))


def _call_gemini(prompt: str) -> str:
    import google.generativeai as genai

    settings = get_settings()
    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel(settings.gemini_model)
    response = model.generate_content(
        prompt,
        generation_config={"temperature": 0.0, "response_mime_type": "application/json"},
    )
    return response.text or ""


def structure(ocr_text: str, rules: CategoryRules) -> tuple[dict[str, str | None], dict[str, float], str]:
    """Turn raw OCR text into structured label fields.

    Returns (values, confidences, structurer_name).
    """
    field_keys = [f.key for f in rules.fields]
    settings = get_settings()

    if not settings.gemini_enabled or not ocr_text.strip():
        values, confidences = heuristics.parse(ocr_text, field_keys)
        return values, confidences, "heuristic"

    prompt = PROMPT.format(
        category=rules.label, field_spec=_field_spec(rules), ocr_text=ocr_text[:12000]
    )
    try:
        payload = _extract_json(_call_gemini(prompt))
    except Exception as exc:  # noqa: BLE001 - any failure falls back to heuristics
        logger.warning("Gemini structuring failed, falling back to heuristics: %s", exc)
        values, confidences = heuristics.parse(ocr_text, field_keys)
        return values, confidences, "heuristic-fallback"

    values: dict[str, str | None] = {}
    confidences: dict[str, float] = {}
    for key in field_keys:
        raw = payload.get(key)
        value = re.sub(r"\s+", " ", str(raw)).strip() if isinstance(raw, (str, int, float)) else None
        values[key] = value or None
        confidences[key] = 0.9 if value else 0.0

    return values, confidences, "gemini"
