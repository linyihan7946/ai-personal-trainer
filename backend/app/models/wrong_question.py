from datetime import datetime
from sqlalchemy import String, Integer, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base, new_uuid, utcnow


class WrongQuestion(Base):
    __tablename__ = "wrong_questions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    question_id: Mapped[str] = mapped_column(String(36), ForeignKey("questions.id"), nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    redo_count: Mapped[int] = mapped_column(Integer, default=0)  # 连续正确次数 (0-3)
    last_redo_at: Mapped[datetime | None] = mapped_column(nullable=True)
    is_mastered: Mapped[bool] = mapped_column(Boolean, default=False)  # 达到3次
    moved_to_kb_at: Mapped[datetime | None] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=utcnow)
