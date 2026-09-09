import pytest

from app.compliance import engine


def test_categories_are_loaded():
    keys = {category.key for category in engine.list_categories()}
    assert {"food", "cosmetics", "supplements"} <= keys


def test_fully_compliant_food_label_is_verified():
    values = {
        "product_name": "Alpine Oat Granola",
        "ingredients": "Rolled oats, cane sugar, sunflower oil, almonds, honey",
        "allergens": "Oats, Almonds",
        "net_quantity": "500 g",
        "expiry_date": "12/08/2027",
        "manufacturer": "Alpine Foods Ltd, Leeds",
        "country_of_origin": "United Kingdom",
        "nutrition": "Energy 1840 kJ, Fat 16 g, Protein 9 g",
        "batch_number": "AG2471",
        "storage_instructions": "Store in a cool, dry place",
    }
    fields, issues, score, verdict = engine.evaluate("food", values)
    assert verdict == "verified"
    assert score == 100
    assert issues == []
    assert all(field.status == "present" for field in fields)


def test_missing_critical_field_is_flagged():
    values = {"product_name": "Trail Mix", "net_quantity": "500 g"}
    _, issues, score, verdict = engine.evaluate("food", values)
    assert verdict == "issues_found"
    assert score < 100
    assert any(issue.field == "ingredients" and issue.severity == "critical" for issue in issues)


def test_non_metric_net_quantity_is_invalid():
    values = {"net_quantity": "12 oz"}
    fields, issues, _, _ = engine.evaluate("food", values)
    quantity = next(field for field in fields if field.key == "net_quantity")
    assert quantity.status == "invalid"
    assert any("oz" in issue.message for issue in issues if issue.field == "net_quantity")


def test_optional_field_absence_does_not_create_issue():
    values = {"storage_instructions": None}
    _, issues, _, _ = engine.evaluate("food", values)
    assert all(issue.field != "storage_instructions" for issue in issues)


def test_values_absent_from_ocr_text_are_not_grounded():
    values = {"product_name": "Ghost Product"}
    fields, _, _, _ = engine.evaluate("food", values, ocr_text="Alpine Oat Granola 500 g")
    product = next(field for field in fields if field.key == "product_name")
    assert product.grounded is False


def test_values_present_in_ocr_text_are_grounded():
    values = {"product_name": "Alpine Oat Granola"}
    fields, _, _, _ = engine.evaluate("food", values, ocr_text="ALPINE OAT GRANOLA\n500 g")
    product = next(field for field in fields if field.key == "product_name")
    assert product.grounded is True


def test_unknown_category_raises():
    with pytest.raises(KeyError):
        engine.get_rules("spaceships")
