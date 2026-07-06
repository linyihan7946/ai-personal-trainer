import os
import json
import uuid
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.exam import Exam, Question
from ..models.wrong_question import WrongQuestion
from ..models.knowledge import KnowledgePoint, KnowledgeRelation
from .ai_service import grade_exam


async def process_exam_upload(
    db: AsyncSession,
    user_id: str,
    image_data: bytes,
    upload_dir: str,
) -> Exam:
    """Process an uploaded exam: save image, call AI grading, create records."""

    # Save uploaded image
    os.makedirs(upload_dir, exist_ok=True)
    filename = f"{uuid.uuid4()}.jpg"
    filepath = os.path.join(upload_dir, filename)
    with open(filepath, "wb") as f:
        f.write(image_data)
    image_url = f"/uploads/{filename}"

    # Call AI grading
    result = await grade_exam(image_data)

    # Create exam record
    exam = Exam(
        user_id=user_id,
        image_url=image_url,
        status="processing",
    )
    db.add(exam)
    await db.flush()  # Ensure exam.id is populated

    questions_data = result.get("questions", [])
    total_count = len(questions_data)
    correct_count = sum(1 for q in questions_data if q.get("is_correct"))
    wrong_count = total_count - correct_count

    # Collect knowledge points for later processing
    knowledge_points_map: dict[str, list[dict]] = {}

    for q_data in questions_data:
        question = Question(
            exam_id=exam.id,
            user_id=user_id,
            question_text=q_data.get("question_text", ""),
            question_type=q_data.get("question_type", "blank"),
            options=q_data.get("options"),
            correct_answer=str(q_data.get("correct_answer", "")),
            student_answer=str(q_data.get("student_answer", "")),
            is_correct=q_data.get("is_correct", False),
            explanation=q_data.get("explanation", ""),
        )
        db.add(question)
        await db.flush()

        # Track knowledge points
        kp_name = q_data.get("knowledge_point", "").strip()
        if kp_name:
            if kp_name not in knowledge_points_map:
                knowledge_points_map[kp_name] = []
            knowledge_points_map[kp_name].append(q_data)

        # If wrong, add to wrong questions
        if not question.is_correct:
            wrong_q = WrongQuestion(
                question_id=question.id,
                user_id=user_id,
                redo_count=0,
            )
            db.add(wrong_q)

    # Process knowledge points
    for kp_name, related_questions in knowledge_points_map.items():
        await _upsert_knowledge_point(
            db, user_id, kp_name, question_ids=[q.get("id", "") for q in related_questions]
        )

    # Update exam stats
    exam.total_questions = total_count
    exam.correct_count = correct_count
    exam.wrong_count = wrong_count
    exam.status = "done"

    await db.flush()
    return exam


async def _upsert_knowledge_point(
    db: AsyncSession,
    user_id: str,
    name: str,
    question_ids: list[str] | None = None,
):
    """Create or update a knowledge point."""
    # Check if already exists
    result = await db.execute(
        select(KnowledgePoint).where(
            KnowledgePoint.user_id == user_id,
            KnowledgePoint.name == name,
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        existing.mastery_level = min(5, existing.mastery_level + 1)
        if question_ids:
            try:
                existing_ids = json.loads(existing.source_question_ids or "[]")
            except (json.JSONDecodeError, TypeError):
                existing_ids = []
            existing_ids.extend(question_ids)
            existing.source_question_ids = json.dumps(list(set(existing_ids)))
    else:
        kp = KnowledgePoint(
            user_id=user_id,
            name=name,
            category=_guess_category(name),
            mastery_level=2,  # Starting level for new concept
            source_question_ids=json.dumps(question_ids or []),
        )
        db.add(kp)


def _guess_category(name: str) -> str:
    """Guess the category based on the knowledge point name."""
    math_keywords = ["方程", "函数", "几何", "数", "三角", "概率", "统计", "因式分解", "平方", "根", "积分", "微分"]
    english_keywords = ["时态", "动词", "名词", "语法", "英语", "单词", "短语", "句式", "现在", "过去", "将来"]
    physics_keywords = ["力", "电", "磁场", "光学", "运动", "能", "热", "波"]
    chemistry_keywords = ["化学", "元素", "反应", "分子", "原子", "酸碱"]

    for kw in math_keywords:
        if kw in name:
            return "数学"
    for kw in english_keywords:
        if kw in name:
            return "英语"
    for kw in physics_keywords:
        if kw in name:
            return "物理"
    for kw in chemistry_keywords:
        if kw in name:
            return "化学"
    return "通用"


async def get_user_exams(db: AsyncSession, user_id: str) -> list[Exam]:
    result = await db.execute(
        select(Exam)
        .where(Exam.user_id == user_id)
        .order_by(Exam.created_at.desc())
    )
    return list(result.scalars().all())


async def get_exam_detail(db: AsyncSession, exam_id: str, user_id: str) -> Exam | None:
    result = await db.execute(
        select(Exam).where(Exam.id == exam_id, Exam.user_id == user_id)
    )
    exam = result.scalar_one_or_none()
    if exam:
        # Eager load questions
        q_result = await db.execute(
            select(Question).where(Question.exam_id == exam_id).order_by(Question.created_at)
        )
        exam.questions = list(q_result.scalars().all())
    return exam
