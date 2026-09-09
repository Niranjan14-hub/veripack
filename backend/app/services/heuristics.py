"""Regex-based label parser used when no Gemini API key is configured."""

import re

PATTERNS: dict[str, list[str]] = {
    "ingredients": [r"ingredients?\s*[:\-]\s*(.+)"],
    "supplement_facts": [r"supplement facts\s*[:\-]?\s*(.+)"],
    "allergens": [r"(?:contains|allergen[s]?(?: information)?)\s*[:\-]\s*(.+)"],
    "net_quantity": [
        r"net\s*(?:wt\.?|weight|quantity|content[s]?|vol\.?)\s*[:\-]?\s*(.+)",
        r"\b(\d+(?:[.,]\d+)?\s*(?:g|kg|mg|ml|l|cl)\b)",
    ],
    "expiry_date": [
        r"(?:best before|use by|exp(?:iry)?(?: date)?|bb)\s*[:\-]?\s*(.+)",
        r"\b(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4})\b",
    ],
    "batch_number": [r"(?:batch|lot|b\.?no\.?)\s*(?:no\.?|number)?\s*[:\-]?\s*([A-Za-z0-9\-]+)"],
    "manufacturer": [
        r"(?:manufactured|marketed|packed|distributed)\s*(?:by|for)\s*[:\-]?\s*(.+)",
        r"(?:manufacturer|responsible person)\s*[:\-]\s*(.+)",
    ],
    "country_of_origin": [
        r"(?:country of origin|made in|product of)\s*[:\-]?\s*(.+)",
    ],
    "nutrition": [r"(?:nutrition(?:al)? (?:information|facts)|energy)\s*[:\-]?\s*(.+)"],
    "storage_instructions": [r"(?:store|storage(?: instructions)?)\s*[:\-]?\s*(.+)"],
    "warnings": [r"(?:warning[s]?|caution|precautions?)\s*[:\-]?\s*(.+)"],
    "usage_instructions": [r"(?:directions(?: for use)?|how to use|usage)\s*[:\-]?\s*(.+)"],
    "dosage": [r"(?:recommended (?:dosage|daily (?:dose|intake))|dosage|serving size)\s*[:\-]?\s*(.+)"],
}


def _clean(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip(" .:-")


def parse(text: str, field_keys: list[str]) -> tuple[dict[str, str | None], dict[str, float]]:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    flat = " \n".join(lines)
    values: dict[str, str | None] = {}
    confidences: dict[str, float] = {}

    for key in field_keys:
        if key == "product_name":
            continue
        found: str | None = None
        for pattern in PATTERNS.get(key, []):
            match = re.search(pattern, flat, flags=re.IGNORECASE)
            if match:
                candidate = _clean(match.group(1))
                if candidate:
                    found = candidate[:400]
                    break
        values[key] = found
        confidences[key] = 0.6 if found else 0.0

    if "product_name" in field_keys:
        candidates = [line for line in lines[:6] if 2 < len(line) < 60 and not line.isdigit()]
        best = max(candidates, key=lambda line: sum(c.isupper() for c in line), default=None)
        values["product_name"] = _clean(best) if best else None
        confidences["product_name"] = 0.5 if best else 0.0

    return values, confidences
