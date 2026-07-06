from datetime import datetime
from sqlalchemy import String, Integer, Float, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base, new_uuid, utcnow


class KnowledgePoint(Base):
    __tablename__ = "knowledge_points"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    mastery_level: Mapped[int] = mapped_column(Integer, default=1)  # 1-5
    source_question_ids: Mapped[list | None] = mapped_column(String, nullable=True)  # JSON array of question IDs
    created_at: Mapped[datetime] = mapped_column(default=utcnow)


class KnowledgeRelation(Base):
    __tablename__ = "knowledge_relations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    source_id: Mapped[str] = mapped_column(String(36), ForeignKey("knowledge_points.id"), nullable=False)
    target_id: Mapped[str] = mapped_column(String(36), ForeignKey("knowledge_points.id"), nullable=False)
    relation_type: Mapped[str] = mapped_column(String(50), default="related")  # prerequisite, related, extends
    weight: Mapped[float] = mapped_column(Float, default=1.0)
    created_at: Mapped[datetime] = mapped_column(default=utcnow)
