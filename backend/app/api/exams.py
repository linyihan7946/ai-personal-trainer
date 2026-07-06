import aiofiles
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.database import get_db
from ..core.config import get_settings, Settings
from ..core.security import get_current_user
from ..services.exam_service import process_exam_upload, get_user_exams, get_exam_detail
from ..schemas.exam import ExamResponse, ExamListResponse

router = APIRouter(prefix="/exams", tags=["exams"])


@router.post("/upload", response_model=ExamResponse)
async def upload_exam(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    """Upload an exam image and trigger AI grading."""
    # Validate file
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="请上传图片文件")

    image_data = await file.read()
    if len(image_data) > settings.max_upload_size_mb * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"图片大小不能超过{settings.max_upload_size_mb}MB")

    # Process
    exam = await process_exam_upload(db, user_id, image_data, settings.upload_dir)
    await db.commit()

    # Reload with questions
    exam = await get_exam_detail(db, exam.id, user_id)
    return exam


@router.get("", response_model=ExamListResponse)
async def list_exams(
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all exams for current user."""
    exams = await get_user_exams(db, user_id)
    return ExamListResponse(
        exams=[
            ExamResponse(
                id=e.id,
                image_url=e.image_url,
                total_questions=e.total_questions,
                correct_count=e.correct_count,
                wrong_count=e.wrong_count,
                status=e.status,
                questions=[],
                created_at=e.created_at,
            )
            for e in exams
        ]
    )


@router.get("/{exam_id}", response_model=ExamResponse)
async def get_exam(
    exam_id: str,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get exam detail with all questions."""
    exam = await get_exam_detail(db, exam_id, user_id)
    if not exam:
        raise HTTPException(status_code=404, detail="试卷不存在")
    return exam
