from datetime import datetime
from pydantic import BaseModel


class WrongQuestionResponse(BaseModel):
    id: str
    question_id: str
    question_text: str
    question_type: str
    options: list[str] | None = None
    correct_answer: str = ""
    explanation: str | None = None
    redo_count: int
    last_redo_at: datetime | None = None

    class Config:
        from_attributes = True


class WrongQListResponse(BaseModel):
    questions: list[WrongQuestionResponse]


class RedoRequest(BaseModel):
    answer: str


class RedoResponse(BaseModel):
    is_correct: bool
    explanation: str | None = None
    correct_answer: str = ""
    new_redo_count: int


class WrongQStatsResponse(BaseModel):
    total_wrong: int
    total_knowledge: int
