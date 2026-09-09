import re
from dataclasses import dataclass

import numpy as np
import pytesseract

from app.models.scan import BoundingBox, OcrResult

TESSERACT_CONFIG = "--oem 3 --psm 6"


@dataclass
class Word:
    text: str
    confidence: float
    left: int
    top: int
    width: int
    height: int
    line_id: tuple[int, int, int, int]


@dataclass
class OcrOutput:
    result: OcrResult
    words: list[Word]
    image_width: int
    image_height: int


def _normalise(text: str) -> str:
    return re.sub(r"[^a-z0-9]", "", text.lower())


def run(image: np.ndarray) -> OcrOutput:
    data = pytesseract.image_to_data(
        image, config=TESSERACT_CONFIG, output_type=pytesseract.Output.DICT
    )
    words: list[Word] = []
    for index, raw_text in enumerate(data["text"]):
        text = raw_text.strip()
        if not text:
            continue
        confidence = float(data["conf"][index])
        if confidence < 0:
            continue
        words.append(
            Word(
                text=text,
                confidence=confidence,
                left=int(data["left"][index]),
                top=int(data["top"][index]),
                width=int(data["width"][index]),
                height=int(data["height"][index]),
                line_id=(
                    int(data["page_num"][index]),
                    int(data["block_num"][index]),
                    int(data["par_num"][index]),
                    int(data["line_num"][index]),
                ),
            )
        )

    lines: dict[tuple[int, int, int, int], list[Word]] = {}
    for word in words:
        lines.setdefault(word.line_id, []).append(word)
    text = "\n".join(" ".join(w.text for w in line) for line in lines.values())

    mean_confidence = round(sum(w.confidence for w in words) / len(words) / 100, 3) if words else 0.0
    height, width = image.shape[:2]
    return OcrOutput(
        result=OcrResult(
            text=text, confidence=mean_confidence, engine="tesseract", word_count=len(words)
        ),
        words=words,
        image_width=width,
        image_height=height,
    )


def locate(value: str, output: OcrOutput) -> BoundingBox | None:
    """Find the region of the image whose OCR words best match `value`."""
    target_tokens = [_normalise(token) for token in value.split() if _normalise(token)]
    if not target_tokens or not output.words:
        return None
    target_tokens = target_tokens[:12]

    normalised = [_normalise(w.text) for w in output.words]
    best_score = 0.0
    best_span: tuple[int, int] | None = None
    span_length = min(len(target_tokens), len(output.words))

    for start in range(len(output.words) - span_length + 1):
        window = normalised[start : start + span_length]
        matches = sum(1 for token in target_tokens if token in window)
        score = matches / len(target_tokens)
        if score > best_score:
            best_score = score
            best_span = (start, start + span_length)

    if not best_span or best_score < 0.5:
        return None

    selected = output.words[best_span[0] : best_span[1]]
    left = min(w.left for w in selected)
    top = min(w.top for w in selected)
    right = max(w.left + w.width for w in selected)
    bottom = max(w.top + w.height for w in selected)
    return BoundingBox(
        x=round(left / output.image_width, 4),
        y=round(top / output.image_height, 4),
        width=round((right - left) / output.image_width, 4),
        height=round((bottom - top) / output.image_height, 4),
    )
