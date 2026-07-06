import { create } from 'zustand'

export interface Question {
  id: string
  question_text: string
  question_type: 'choice' | 'blank' | 'essay'
  options?: string[]
  correct_answer: string
  student_answer: string
  is_correct: boolean
  explanation: string
}

export interface Exam {
  id: string
  image_url: string
  total_questions: number
  correct_count: number
  wrong_count: number
  status: 'processing' | 'done'
  questions: Question[]
  created_at: string
}

interface ExamState {
  exams: Exam[]
  currentExam: Exam | null
  setExams: (exams: Exam[]) => void
  setCurrentExam: (exam: Exam | null) => void
  addExam: (exam: Exam) => void
}

export const useExamStore = create<ExamState>((set) => ({
  exams: [],
  currentExam: null,
  setExams: (exams) => set({ exams }),
  setCurrentExam: (exam) => set({ currentExam: exam }),
  addExam: (exam) => set((s) => ({ exams: [exam, ...s.exams] })),
}))
