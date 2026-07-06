from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.database import get_db
from ..core.security import get_current_user
from ..services.knowledge_service import (
    get_knowledge_graph,
    get_knowledge_point_detail,
    search_knowledge_points,
)
from ..schemas.knowledge import KnowledgeGraphResponse, KnowledgePointDetail, SearchResponse

router = APIRouter(prefix="/knowledge", tags=["knowledge"])


@router.get("/graph", response_model=KnowledgeGraphResponse)
async def knowledge_graph(
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the user's knowledge graph data."""
    graph = await get_knowledge_graph(db, user_id)
    return KnowledgeGraphResponse(**graph)


@router.get("/points/{point_id}", response_model=KnowledgePointDetail)
async def knowledge_point_detail(
    point_id: str,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get detailed info about a knowledge point."""
    detail = await get_knowledge_point_detail(db, point_id, user_id)
    if not detail:
        raise HTTPException(status_code=404, detail="知识点不存在")
    return KnowledgePointDetail(**detail)


@router.get("/search", response_model=SearchResponse)
async def search_knowledge(
    q: str = Query(..., min_length=1, description="搜索关键词"),
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Search knowledge points by keyword."""
    results = await search_knowledge_points(db, user_id, q)
    return SearchResponse(points=results)
