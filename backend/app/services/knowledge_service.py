import json
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.knowledge import KnowledgePoint, KnowledgeRelation
from ..models.exam import Question


async def get_knowledge_graph(db: AsyncSession, user_id: str) -> dict:
    """Get the full knowledge graph (nodes + edges) for a user."""
    # Get all knowledge points
    kp_result = await db.execute(
        select(KnowledgePoint).where(KnowledgePoint.user_id == user_id)
    )
    points = list(kp_result.scalars().all())

    nodes = [
        {
            "id": p.id,
            "name": p.name,
            "category": p.category,
            "mastery_level": p.mastery_level,
        }
        for p in points
    ]

    # Get all relations
    edges = []
    if points:
        point_ids = [p.id for p in points]
        rel_result = await db.execute(
            select(KnowledgeRelation).where(
                KnowledgeRelation.user_id == user_id,
                KnowledgeRelation.source_id.in_(point_ids),
                KnowledgeRelation.target_id.in_(point_ids),
            )
        )
        relations = list(rel_result.scalars().all())
        edges = [
            {
                "source_id": r.source_id,
                "target_id": r.target_id,
                "relation_type": r.relation_type,
                "weight": r.weight,
            }
            for r in relations
        ]

    return {"nodes": nodes, "edges": edges}


async def get_knowledge_point_detail(db: AsyncSession, kp_id: str, user_id: str) -> dict | None:
    """Get detailed info about a knowledge point including related questions."""
    result = await db.execute(
        select(KnowledgePoint).where(
            KnowledgePoint.id == kp_id,
            KnowledgePoint.user_id == user_id,
        )
    )
    point = result.scalar_one_or_none()
    if not point:
        return None

    # Get related questions
    related_questions = []
    try:
        question_ids = json.loads(point.source_question_ids or "[]")
    except (json.JSONDecodeError, TypeError):
        question_ids = []

    if question_ids:
        q_result = await db.execute(
            select(Question).where(Question.id.in_(question_ids))
        )
        questions = list(q_result.scalars().all())
        related_questions = [
            {
                "id": q.id,
                "question_text": q.question_text,
                "question_type": q.question_type,
                "is_correct": q.is_correct,
            }
            for q in questions
        ]

    # Get related knowledge points (neighbors in graph)
    rel_result = await db.execute(
        select(KnowledgeRelation).where(
            KnowledgeRelation.user_id == user_id,
            or_(
                KnowledgeRelation.source_id == kp_id,
                KnowledgeRelation.target_id == kp_id,
            ),
        )
    )
    relations = list(rel_result.scalars().all())

    neighbor_ids = set()
    for r in relations:
        neighbor_ids.add(r.source_id)
        neighbor_ids.add(r.target_id)
    neighbor_ids.discard(kp_id)

    related_points = []
    if neighbor_ids:
        p_result = await db.execute(
            select(KnowledgePoint).where(KnowledgePoint.id.in_(list(neighbor_ids)))
        )
        related_points = [
            {
                "id": p.id,
                "name": p.name,
                "category": p.category,
                "mastery_level": p.mastery_level,
            }
            for p in p_result.scalars().all()
        ]

    return {
        "id": point.id,
        "name": point.name,
        "description": point.description,
        "category": point.category,
        "mastery_level": point.mastery_level,
        "related_questions": related_questions,
        "related_points": related_points,
    }


async def search_knowledge_points(db: AsyncSession, user_id: str, keyword: str) -> list[dict]:
    """Search knowledge points by keyword."""
    result = await db.execute(
        select(KnowledgePoint).where(
            KnowledgePoint.user_id == user_id,
            KnowledgePoint.name.ilike(f"%{keyword}%"),
        )
    )
    points = list(result.scalars().all())

    return [
        {
            "id": p.id,
            "name": p.name,
            "category": p.category,
            "mastery_level": p.mastery_level,
        }
        for p in points
    ]
