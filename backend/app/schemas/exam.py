from datetime import datetime
from pydantic import BaseModel


class QuestionResponse(BaseModel):
    id: str
    question_text: str
    question_type: str
    options: list[str] | None = None
    correct_answer: str
    student_answer: str
    is_correct: bool
    explanation: str | None = None

    class Config:
        from_attributes = True


class ExamResponse(BaseModel):
    id: str
    image_url: str
    total_questions: int
    correct_count: int
    wrong_count: int
    status: str
    questions: list[QuestionResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True


class ExamListResponse(BaseModel):
    exams: list[ExamResponse]
