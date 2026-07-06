from pydantic import BaseModel


class KnowledgeNodeResponse(BaseModel):
    id: str
    name: str
    category: str | None = None
    mastery_level: int = 1


class KnowledgeEdgeResponse(BaseModel):
    source_id: str
    target_id: str
    relation_type: str = "related"
    weight: float = 1.0


class KnowledgeGraphResponse(BaseModel):
    nodes: list[KnowledgeNodeResponse]
    edges: list[KnowledgeEdgeResponse]


class RelatedQuestion(BaseModel):
    id: str
    question_text: str
    question_type: str
    is_correct: bool


class KnowledgePointDetail(BaseModel):
    id: str
    name: str
    description: str | None = None
    category: str | None = None
    mastery_level: int = 1
    related_questions: list[RelatedQuestion] = []
    related_points: list[KnowledgeNodeResponse] = []


class SearchResponse(BaseModel):
    points: list[KnowledgeNodeResponse]
