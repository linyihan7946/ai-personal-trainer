from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.database import get_db
from ..core.security import get_current_user
from ..services.wrong_q_service import (
    get_wrong_questions,
    get_wrong_question_detail,
    redo_wrong_question,
    get_wrong_q_stats,
)
from ..schemas.wrong_question import (
    WrongQuestionResponse,
    WrongQListResponse,
    RedoRequest,
    RedoResponse,
    WrongQStatsResponse,
)

router = APIRouter(prefix="/wrong-questions", tags=["wrong-questions"])


@router.get("", response_model=WrongQListResponse)
async def list_wrong_questions(
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all non-mastered wrong questions."""
    questions = await get_wrong_questions(db, user_id)
    return WrongQListResponse(
        questions=[WrongQuestionResponse(**q) for q in questions]
    )


@router.get("/stats", response_model=WrongQStatsResponse)
async def wrong_q_stats(
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get wrong questions and knowledge base statistics."""
    stats = await get_wrong_q_stats(db, user_id)
    return WrongQStatsResponse(**stats)


@router.get("/{wq_id}", response_model=WrongQuestionResponse)
async def get_wrong_question(
    wq_id: str,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single wrong question detail."""
    detail = await get_wrong_question_detail(db, wq_id, user_id)
    if not detail:
        raise HTTPException(status_code=404, detail="错题不存在")
    return WrongQuestionResponse(**detail)


@router.post("/{wq_id}/redo", response_model=RedoResponse)
async def redo_question(
    wq_id: str,
    req: RedoRequest,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit a redo answer for a wrong question."""
    try:
        result = await redo_wrong_question(db, wq_id, user_id, req.answer)
        await db.commit()
        return RedoResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
