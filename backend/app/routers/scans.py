from typing import Literal, Optional

from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile

from app.compliance import engine
from app.config import get_settings
from app.db import get_repository
from app.models.compliance import CategoryInfo
from app.models.scan import Scan, ScanListResponse, ScanSummary
from app.services import pipeline, samples

router = APIRouter(prefix="/api", tags=["scans"])


def _summarise(document: dict) -> ScanSummary:
    return ScanSummary(
        id=document["id"],
        created_at=document["created_at"],
        category=document["category"],
        category_label=document.get("category_label", document["category"]),
        product_name=document.get("product_name"),
        image_url=document.get("image_url"),
        verdict=document["verdict"],
        score=document.get("score", 0),
        issue_count=len(document.get("issues", [])),
    )


async def _store(scan: Scan) -> Scan:
    await get_repository().insert(scan.model_dump(mode="json"))
    return scan


@router.get("/rules/categories", response_model=list[CategoryInfo])
async def get_categories() -> list[CategoryInfo]:
    return engine.list_categories()


@router.get("/samples")
async def get_samples() -> list[dict]:
    return samples.list_samples()


@router.post("/scans", response_model=Scan, status_code=201)
async def create_scan(
    image: UploadFile = File(...),
    category: str = Form(...),
) -> Scan:
    settings = get_settings()
    content = await image.read()
    if not content:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")
    if len(content) > settings.max_upload_bytes:
        raise HTTPException(status_code=413, detail="Image exceeds the 10 MB upload limit.")

    try:
        scan = pipeline.run(content, category)
    except pipeline.PipelineError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    return await _store(scan)


@router.post("/scans/demo", response_model=Scan, status_code=201)
async def create_demo_scan(sample: str = Query(...)) -> Scan:
    try:
        image_bytes, category = samples.render(sample)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=f"Unknown sample '{sample}'.") from exc

    try:
        scan = pipeline.run(image_bytes, category)
    except pipeline.PipelineError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    scan.demo = True
    return await _store(scan)


@router.get("/scans", response_model=ScanListResponse)
async def list_scans(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    verdict: Optional[Literal["verified", "issues_found"]] = None,
    category: Optional[str] = None,
) -> ScanListResponse:
    documents, total = await get_repository().list(page, page_size, verdict, category)
    return ScanListResponse(
        items=[_summarise(document) for document in documents],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/scans/{scan_id}", response_model=Scan)
async def get_scan(scan_id: str) -> Scan:
    document = await get_repository().get(scan_id)
    if not document:
        raise HTTPException(status_code=404, detail="Scan not found.")
    return Scan(**document)


@router.delete("/scans/{scan_id}", status_code=204)
async def delete_scan(scan_id: str) -> None:
    if not await get_repository().delete(scan_id):
        raise HTTPException(status_code=404, detail="Scan not found.")
