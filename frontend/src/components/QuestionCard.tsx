import { CheckCircle, XCircle } from 'lucide-react'

interface QuestionCardProps {
  question_text: string
  question_type: string
  options?: string[]
  correct_answer: string
  student_answer: string
  is_correct: boolean
  explanation: string
  index?: number
  showAnswer?: boolean
}

export default function QuestionCard({
  question_text,
  question_type,
  options,
  correct_answer,
  student_answer,
  is_correct,
  explanation,
  index,
  showAnswer = true,
}: QuestionCardProps) {
  return (
    <div className="bg-white rounded-xl border border-border p-4 mb-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {index !== undefined && (
            <span className="text-xs text-text-secondary bg-bg px-2 py-0.5 rounded-full">
              第{index + 1}题
            </span>
          )}
          <span className="text-xs text-text-secondary bg-bg px-2 py-0.5 rounded-full">
            {question_type === 'choice' ? '选择题' : question_type === 'blank' ? '填空题' : '问答题'}
          </span>
        </div>
        {is_correct ? (
          <CheckCircle size={20} className="text-success" />
        ) : (
          <XCircle size={20} className="text-danger" />
        )}
      </div>

      {/* Question */}
      <p className="text-sm font-medium mb-3 leading-relaxed">{question_text}</p>

      {/* Options */}
      {options && options.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {options.map((opt, i) => {
            const letter = String.fromCharCode(65 + i)
            const isStudentChoice = student_answer === letter
            const isCorrectChoice = correct_answer === letter
            let bg = 'bg-bg'
            if (showAnswer) {
              if (isCorrectChoice) bg = 'bg-green-50 border-success text-success'
              else if (isStudentChoice && !is_correct) bg = 'bg-red-50 border-danger text-danger'
            }
            return (
              <div
                key={i}
                className={`text-sm px-3 py-2 rounded-lg border border-border ${bg} flex items-center gap-2`}
              >
                <span className="font-medium">{letter}.</span>
                <span>{opt}</span>
                {showAnswer && isCorrectChoice && <CheckCircle size={14} className="ml-auto text-success" />}
                {showAnswer && isStudentChoice && !is_correct && <XCircle size={14} className="ml-auto text-danger" />}
              </div>
            )
          })}
        </div>
      )}

      {/* Answer info */}
      {showAnswer && (
        <div className="space-y-1.5 text-xs">
          {question_type !== 'choice' && (
            <>
              <div className="flex gap-2">
                <span className="text-text-secondary">你的答案：</span>
                <span className={is_correct ? 'text-success' : 'text-danger'}>{student_answer || '未作答'}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-text-secondary">正确答案：</span>
                <span className="text-success font-medium">{correct_answer}</span>
              </div>
            </>
          )}
          {explanation && (
            <div className="mt-2 p-2.5 bg-blue-50 rounded-lg text-text-secondary leading-relaxed">
              <span className="font-medium text-primary">解析：</span>
              {explanation}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
