import json
from datetime import datetime, timezone
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.wrong_question import WrongQuestion
from ..models.exam import Question
from ..models.knowledge import KnowledgePoint


async def get_wrong_questions(db: AsyncSession, user_id: str) -> list[dict]:
    """Get all non-mastered wrong questions with question details."""
    result = await db.execute(
        select(WrongQuestion)
        .where(
            WrongQuestion.user_id == user_id,
            WrongQuestion.is_mastered == False,
        )
        .order_by(WrongQuestion.created_at.desc())
    )
    wrong_qs = list(result.scalars().all())

    questions = []
    for wq in wrong_qs:
        q_result = await db.execute(select(Question).where(Question.id == wq.question_id))
        question = q_result.scalar_one_or_none()
        if question:
            questions.append({
                "id": wq.id,
                "question_id": question.id,
                "question_text": question.question_text,
                "question_type": question.question_type,
                "options": question.options,
                "redo_count": wq.redo_count,
                "last_redo_at": wq.last_redo_at,
            })

    return questions


async def get_wrong_question_detail(db: AsyncSession, wq_id: str, user_id: str) -> dict | None:
    """Get a single wrong question with full details."""
    result = await db.execute(
        select(WrongQuestion).where(
            WrongQuestion.id == wq_id,
            WrongQuestion.user_id == user_id,
        )
    )
    wq = result.scalar_one_or_none()
    if not wq:
        return None

    q_result = await db.execute(select(Question).where(Question.id == wq.question_id))
    question = q_result.scalar_one_or_none()
    if not question:
        return None

    return {
        "id": wq.id,
        "question_id": question.id,
        "question_text": question.question_text,
        "question_type": question.question_type,
        "options": question.options,
        "correct_answer": question.correct_answer,
        "explanation": question.explanation,
        "redo_count": wq.redo_count,
        "last_redo_at": wq.last_redo_at,
    }


async def redo_wrong_question(
    db: AsyncSession, wq_id: str, user_id: str, answer: str
) -> dict:
    """Submit a redo answer for a wrong question."""
    result = await db.execute(
        select(WrongQuestion).where(
            WrongQuestion.id == wq_id,
            WrongQuestion.user_id == user_id,
        )
    )
    wq = result.scalar_one_or_none()
    if not wq:
        raise ValueError("Wrong question not found")

    q_result = await db.execute(select(Question).where(Question.id == wq.question_id))
    question = q_result.scalar_one_or_none()
    if not question:
        raise ValueError("Question not found")

    is_correct = answer.strip().upper() == question.correct_answer.strip().upper()

    if is_correct:
        wq.redo_count += 1
        wq.last_redo_at = datetime.now(timezone.utc)

        # Check if mastered (3 consecutive correct)
        if wq.redo_count >= 3:
            wq.is_mastered = True
            wq.moved_to_kb_at = datetime.now(timezone.utc)

            # Add to knowledge base via AI-extracted knowledge points
            if question.knowledge_point_ids:
                for kp_id in question.knowledge_point_ids:
                    kp_result = await db.execute(
                        select(KnowledgePoint).where(KnowledgePoint.id == kp_id)
                    )
                    kp = kp_result.scalar_one_or_none()
                    if kp:
                        kp.mastery_level = min(5, kp.mastery_level + 1)
    else:
        wq.redo_count = 0
        wq.last_redo_at = datetime.now(timezone.utc)

    await db.flush()

    return {
        "is_correct": is_correct,
        "explanation": question.explanation if not is_correct else None,
        "correct_answer": question.correct_answer if not is_correct else "",
        "new_redo_count": wq.redo_count,
    }


async def get_wrong_q_stats(db: AsyncSession, user_id: str) -> dict:
    """Get wrong question and knowledge base statistics."""
    # Count non-mastered wrong questions
    wq_result = await db.execute(
        select(WrongQuestion).where(
            WrongQuestion.user_id == user_id,
            WrongQuestion.is_mastered == False,
        )
    )
    total_wrong = len(list(wq_result.scalars().all()))

    # Count knowledge points
    kp_result = await db.execute(
        select(KnowledgePoint).where(KnowledgePoint.user_id == user_id)
    )
    total_knowledge = len(list(kp_result.scalars().all()))

    return {
        "total_wrong": total_wrong,
        "total_knowledge": total_knowledge,
    }
