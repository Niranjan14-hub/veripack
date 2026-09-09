"""Synthetic sample package labels used by demo mode.

The images are rendered at request time and then pushed through the real
OCR + structuring + compliance pipeline, so demo mode exercises the whole
system rather than returning canned results.
"""

import io

from PIL import Image, ImageDraw, ImageFont

SAMPLES: dict[str, dict] = {
    "food-compliant": {
        "category": "food",
        "title": "Sample: compliant food label",
        "lines": [
            ("ALPINE OAT GRANOLA", 34),
            ("Crunchy baked oat clusters", 20),
            ("", 10),
            ("Ingredients: Rolled oats, cane sugar, sunflower oil,", 20),
            ("almonds, honey, cinnamon, sea salt.", 20),
            ("Contains: Oats, Almonds, may contain traces of milk.", 20),
            ("", 8),
            ("Nutrition Information per 100 g: Energy 1840 kJ,", 20),
            ("Fat 16 g, Carbohydrate 58 g, Protein 9 g, Salt 0.4 g.", 20),
            ("", 8),
            ("Net Weight: 500 g", 22),
            ("Best Before: 12/08/2027", 22),
            ("Batch No: AG2471", 20),
            ("Storage: Store in a cool, dry place away from sunlight.", 20),
            ("Manufactured by: Alpine Foods Ltd, 14 Mill Road, Leeds LS1 4AB", 19),
            ("Country of Origin: United Kingdom", 20),
        ],
    },
    "food-issues": {
        "category": "food",
        "title": "Sample: food label with gaps",
        "lines": [
            ("HARVEST TRAIL MIX", 34),
            ("Nuts and dried fruit blend", 20),
            ("", 10),
            ("Ingredients: Peanuts, raisins, cashews, cranberries,", 20),
            ("sunflower seeds, vegetable oil.", 20),
            ("", 8),
            ("Net Weight: 12 oz", 22),
            ("Batch No: HT8890", 20),
            ("Manufactured by: Harvest Snacks Inc, Ohio", 19),
        ],
    },
    "cosmetics-compliant": {
        "category": "cosmetics",
        "title": "Sample: compliant cosmetics label",
        "lines": [
            ("LUMEN HYDRATING FACE CREAM", 30),
            ("Daily moisturiser for dry skin", 20),
            ("", 10),
            ("Ingredients: Aqua, Glycerin, Cetearyl Alcohol, Butyrospermum", 19),
            ("Parkii Butter, Tocopherol, Panthenol, Phenoxyethanol, Parfum.", 19),
            ("", 8),
            ("Directions for use: Apply to cleansed face morning and night.", 19),
            ("Warnings: For external use only. Avoid contact with eyes.", 19),
            ("Discontinue use if irritation occurs.", 19),
            ("", 8),
            ("Net Content: 50 ml", 22),
            ("Expiry: 03/2028", 22),
            ("Batch: LM4412", 20),
            ("Responsible person: Lumen Skincare BV, Amsterdam, NL", 19),
            ("Country of Origin: Netherlands", 20),
        ],
    },
}


def _font(size: int) -> ImageFont.FreeTypeFont:
    for path in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ):
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def list_samples() -> list[dict]:
    return [
        {"key": key, "title": sample["title"], "category": sample["category"]}
        for key, sample in SAMPLES.items()
    ]


def render(key: str) -> tuple[bytes, str]:
    if key not in SAMPLES:
        raise KeyError(key)
    sample = SAMPLES[key]

    width, height = 1000, 1250
    image = Image.new("RGB", (width, height), (247, 246, 242))
    draw = ImageDraw.Draw(image)
    draw.rectangle([30, 30, width - 30, height - 30], outline=(28, 28, 30), width=3)

    y = 90
    for text, size in sample["lines"]:
        if text:
            draw.text((70, y), text, font=_font(size), fill=(18, 18, 20))
        y += size + 16

    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=92)
    return buffer.getvalue(), sample["category"]
