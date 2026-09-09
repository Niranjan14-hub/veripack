from app.services import heuristics

OCR_TEXT = """ALPINE OAT GRANOLA
Crunchy baked oat clusters
Ingredients: Rolled oats, cane sugar, sunflower oil, almonds, honey
Contains: Oats, Almonds
Net Weight: 500 g
Best Before: 12/08/2027
Batch No: AG2471
Manufactured by: Alpine Foods Ltd, Leeds
Country of Origin: United Kingdom
"""

KEYS = [
    "product_name",
    "ingredients",
    "allergens",
    "net_quantity",
    "expiry_date",
    "batch_number",
    "manufacturer",
    "country_of_origin",
]


def test_parses_core_fields():
    values, confidences = heuristics.parse(OCR_TEXT, KEYS)
    assert values["ingredients"].startswith("Rolled oats")
    assert values["allergens"] == "Oats, Almonds"
    assert values["net_quantity"] == "500 g"
    assert values["expiry_date"] == "12/08/2027"
    assert values["batch_number"] == "AG2471"
    assert values["country_of_origin"] == "United Kingdom"
    assert values["product_name"] == "ALPINE OAT GRANOLA"
    assert confidences["ingredients"] > 0


def test_absent_fields_are_none():
    values, confidences = heuristics.parse("SOME PRODUCT\n", KEYS)
    assert values["ingredients"] is None
    assert confidences["ingredients"] == 0.0
