import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { wrongQApi } from '../api/client'
import { ArrowLeft, CheckCircle, XCircle, Flame, Trophy } from 'lucide-react'

interface WrongQDetail {
  id: string
  question_text: string
  question_type: string
  options?: string[]
  correct_answer: string
  explanation: string
  redo_count: number
}

export default function RedoQuestion() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [question, setQuestion] = useState<WrongQDetail | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<{ is_correct: boolean; explanation: string } | null>(null)
  const [mastered, setMastered] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const fetchData = async () => {
      try {
        const res = await wrongQApi.detail(id)
        setQuestion(res.data)
      } catch {
        setQuestion({
          id: id,
          question_text: '下列哪项是正确的英语表达？',
          question_type: 'choice',
          options: ['He go to school', 'He goes to school', 'He going to school', 'He gone to school'],
          correct_answer: 'B',
          explanation: '第三人称单数需要加 -s/-es，go 的第三人称单数是 goes。',
          redo_count: 1,
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleSubmit = async () => {
    if (!selectedAnswer || !id) return

    try {
      const res = await wrongQApi.redo(id, selectedAnswer)
      const data = res.data
      setResult({ is_correct: data.is_correct, explanation: data.explanation })
      setSubmitted(true)

      if (data.is_correct && data.new_redo_count >= 3) {
        setMastered(true)
      }
    } catch {
      const isCorrect = selectedAnswer === question?.correct_answer
      const newCount = isCorrect ? (question?.redo_count || 0) + 1 : 0
      setResult({
        is_correct: isCorrect,
        explanation: question?.explanation || '',
      })
      setSubmitted(true)
      if (isCorrect && newCount >= 3) {
        setMastered(true)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="text-text-secondary text-sm">加载中...</div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="flex flex-col items-center py-20 px-6">
        <p className="text-text-secondary text-sm">题目不存在</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={22} className="text-text" />
        </button>
        <h1 className="text-lg font-semibold">重做错题</h1>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-4">
        <Flame size={18} className={question.redo_count >= 2 ? 'text-orange-500' : 'text-text-secondary'} />
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < question.redo_count ? 'bg-success' : 'bg-border'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-text-secondary">{question.redo_count}/3</span>
      </div>

      {/* Mastered notification */}
      {mastered && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 flex items-center gap-3">
          <Trophy size={24} className="text-yellow-500" />
          <div>
            <div className="text-sm font-medium text-green-700">恭喜！已连续做对 3 次 🎉</div>
            <div className="text-xs text-green-600 mt-0.5">该题目已从错题本移除，知识点已加入你的知识库</div>
          </div>
        </div>
      )}

      {/* Question */}
      <div className="bg-white rounded-xl border border-border p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-text-secondary bg-bg px-2 py-0.5 rounded-full">
            {question.question_type === 'choice' ? '选择题' : question.question_type === 'blank' ? '填空题' : '问答题'}
          </span>
        </div>
        <p className="text-sm font-medium mb-4 leading-relaxed">{question.question_text}</p>

        {question.question_type === 'choice' && question.options ? (
          <div className="space-y-2">
            {question.options.map((opt, i) => {
              const letter = String.fromCharCode(65 + i)
              const isSelected = selectedAnswer === letter
              const isCorrect = letter === question.correct_answer

              let bg = isSelected ? 'bg-primary/10 border-primary' : 'bg-bg border-border'
              if (submitted) {
                if (isCorrect) bg = 'bg-green-50 border-success'
                else if (isSelected && !result?.is_correct) bg = 'bg-red-50 border-danger'
              }

              return (
                <button
                  key={i}
                  disabled={submitted}
                  onClick={() => setSelectedAnswer(letter)}
                  className={`w-full text-sm px-4 py-3 rounded-lg border ${bg} flex items-center gap-2 text-left transition-colors disabled:cursor-default`}
                >
                  <span className="font-medium w-5">{letter}.</span>
                  <span className="flex-1">{opt}</span>
                  {submitted && isCorrect && <CheckCircle size={16} className="text-success" />}
                  {submitted && isSelected && !result?.is_correct && <XCircle size={16} className="text-danger" />}
                </button>
              )
            })}
          </div>
        ) : (
          <input
            type="text"
            value={selectedAnswer}
            onChange={(e) => setSelectedAnswer(e.target.value)}
            disabled={submitted}
            placeholder="请输入你的答案"
            className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:border-primary transition-all disabled:bg-gray-50"
          />
        )}
      </div>

      {/* Result */}
      {submitted && result && (
        <div
          className={`rounded-xl p-4 mb-4 ${
            result.is_correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            {result.is_correct ? (
              <>
                <CheckCircle size={18} className="text-success" />
                <span className="text-sm font-medium text-green-700">回答正确！</span>
              </>
            ) : (
              <>
                <XCircle size={18} className="text-danger" />
                <span className="text-sm font-medium text-red-700">
                  回答错误，正确率已重置为 0
                </span>
              </>
            )}
          </div>
          {result.explanation && (
            <p className="text-xs text-text-secondary mt-2 leading-relaxed">
              <span className="font-medium">解析：</span>
              {result.explanation}
            </p>
          )}
        </div>
      )}

      {/* Submit button */}
      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={!selectedAnswer}
          className="w-full py-3 rounded-xl bg-primary text-white font-medium text-sm disabled:opacity-50 hover:bg-primary-dark transition-colors"
        >
          提交答案
        </button>
      ) : (
        <button
          onClick={() => (mastered ? navigate('/wrong-questions') : navigate(-1))}
          className="w-full py-3 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-dark transition-colors"
        >
          {mastered ? '返回错题本' : '返回'}
        </button>
      )}
    </div>
  )
}
