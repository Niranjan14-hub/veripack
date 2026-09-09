import json
import re
from functools import lru_cache
from pathlib import Path

from app.models.compliance import CategoryInfo, CategoryRules, FieldRule
from app.models.scan import ComplianceIssue, ExtractedField

RULES_DIR = Path(__file__).parent / "rules"

SEVERITY_WEIGHT = {"critical": 25, "major": 12, "minor": 5}
UNIT_PATTERN = re.compile(r"(\d+(?:[.,]\d+)?)\s*([a-zA-Z]+)")


@lru_cache
def load_rule_sets() -> dict[str, CategoryRules]:
    rule_sets: dict[str, CategoryRules] = {}
    for path in sorted(RULES_DIR.glob("*.json")):
        data = json.loads(path.read_text())
        rules = CategoryRules(**data)
        rule_sets[rules.key] = rules
    return rule_sets


def get_rules(category: str) -> CategoryRules:
    rule_sets = load_rule_sets()
    if category not in rule_sets:
        raise KeyError(category)
    return rule_sets[category]


def list_categories() -> list[CategoryInfo]:
    return [
        CategoryInfo(
            key=rules.key,
            label=rules.label,
            description=rules.description,
            required_fields=[f.label for f in rules.fields if f.required],
        )
        for rules in load_rule_sets().values()
    ]


def _normalise(value: str | None) -> str:
    return (value or "").strip()


def _check_field(rule: FieldRule, raw_value: str | None) -> tuple[str, str | None]:
    """Return (status, problem) for a single field."""
    value = _normalise(raw_value)
    if not value or value.lower() in {"n/a", "none", "null", "not found"}:
        if rule.required:
            return "missing", f"{rule.label} is not present on the label."
        return "missing", None

    if rule.min_length and len(value) < rule.min_length:
        return "invalid", f"{rule.label} is too short to be a complete declaration."

    if rule.pattern and not re.search(rule.pattern, value):
        return "invalid", f"{rule.label} does not match the expected format."

    if rule.allowed_units:
        match = UNIT_PATTERN.search(value)
        if not match:
            return "invalid", f"{rule.label} must include a numeric amount and a unit."
        unit = match.group(2).lower().rstrip(".")
        if unit not in {u.lower() for u in rule.allowed_units}:
            allowed = ", ".join(rule.allowed_units)
            return "invalid", f"{rule.label} uses unit '{unit}'; allowed units are {allowed}."

    return "present", None


def evaluate(
    category: str,
    values: dict[str, str | None],
    confidences: dict[str, float] | None = None,
    ocr_text: str = "",
) -> tuple[list[ExtractedField], list[ComplianceIssue], int, str]:
    """Evaluate extracted label values against a category rule set.

    Returns (fields, issues, score, verdict).
    """
    rules = get_rules(category)
    confidences = confidences or {}
    haystack = re.sub(r"\s+", " ", ocr_text).lower()

    fields: list[ExtractedField] = []
    issues: list[ComplianceIssue] = []
    penalty = 0

    for rule in rules.fields:
        raw_value = values.get(rule.key)
        status, problem = _check_field(rule, raw_value)
        value = _normalise(raw_value) or None

        grounded = False
        if value and haystack:
            probe = re.sub(r"\s+", " ", value).lower()[:40]
            grounded = probe in haystack

        fields.append(
            ExtractedField(
                key=rule.key,
                label=rule.label,
                value=value,
                status=status,
                required=rule.required,
                confidence=round(float(confidences.get(rule.key, 0.0)), 3),
                grounded=grounded,
            )
        )

        if problem:
            issues.append(
                ComplianceIssue(
                    field=rule.key,
                    label=rule.label,
                    severity=rule.severity,
                    message=problem,
                    fix=rule.fix,
                )
            )
            penalty += SEVERITY_WEIGHT[rule.severity]

    score = max(0, 100 - penalty)
    verdict = "verified" if not issues else "issues_found"
    return fields, issues, score, verdict
