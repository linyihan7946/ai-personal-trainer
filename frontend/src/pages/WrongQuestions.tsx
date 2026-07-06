import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { wrongQApi } from '../api/client'
import { ArrowLeft, BookOpen, Flame, ChevronRight, RefreshCw } from 'lucide-react'

interface WrongQuestion {
  id: string
  question_text: string
  question_type: string
  redo_count: number
  last_redo_at: string | null
}

export default function WrongQuestions() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState<WrongQuestion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await wrongQApi.list()
        setQuestions(res.data.questions || [])
      } catch {
        // Demo data
        setQuestions([
          {
            id: '1',
            question_text: '下列哪项是正确的英语表达？',
            question_type: 'choice',
            redo_count: 1,
            last_redo_at: new Date().toISOString(),
          },
          {
            id: '2',
            question_text: '计算：∫(2x + 3)dx',
            question_type: 'blank',
            redo_count: 0,
            last_redo_at: null,
          },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="study-page study-dashboard">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-2xl bg-bg flex items-center justify-center flex-shrink-0">
            <ArrowLeft size={22} className="text-text" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-text">错题本</h1>
            <p className="text-xs text-text-secondary mt-0.5">重做错题，连续 3 次正确后移入知识库</p>
          </div>
        </div>
        <span className="text-xs text-danger bg-danger/10 px-3 py-1.5 rounded-full font-medium whitespace-nowrap">
          {questions.length} 道
        </span>
      </div>

      {/* How it works */}
      <section className="study-panel bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <div className="flex items-center gap-2 mb-2">
          <Flame size={18} className="text-orange-500" />
          <span className="text-sm font-medium text-orange-700">攻克规则</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-orange-600">
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-red-200 flex items-center justify-center text-red-700 font-bold">0</span>
            未重做
          </span>
          <span>→</span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-yellow-200 flex items-center justify-center text-yellow-700 font-bold">1</span>
            正确1次
          </span>
          <span>→</span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-bold">3</span>
            移入知识库！
          </span>
        </div>
        <p className="text-xs text-orange-500 mt-2">连续做对 3 次即可从错题本毕业，答错则重置进度</p>
      </section>

      {/* Question list */}
      {loading ? (
        <div className="study-panel text-center py-14 text-text-secondary text-sm">加载中...</div>
      ) : questions.length === 0 ? (
        <div className="study-empty-state text-center">
          <div className="w-16 h-16 rounded-2xl bg-bg border border-border flex items-center justify-center mx-auto mb-4">
            <BookOpen size={34} className="text-text-secondary opacity-40" />
          </div>
          <p className="text-text-secondary text-sm">错题本空空如也 🎉</p>
          <p className="text-xs text-text-secondary mt-1">继续保持！</p>
        </div>
      ) : (
        <section className="space-y-3">
          {questions.map((q) => {
            const dots = []
            for (let i = 0; i < 3; i++) {
              dots.push(
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full ${
                    i < q.redo_count ? 'bg-success' : 'bg-border'
                  }`}
                />
              )
            }

            return (
              <button
                key={q.id}
                onClick={() => navigate(`/redo/${q.id}`)}
                className="w-full flex items-center gap-3 p-4 rounded-2xl border border-border hover:border-primary/30 hover:shadow-sm transition-all text-left"
              >
                <div className="w-11 h-11 rounded-xl bg-danger/10 flex items-center justify-center flex-shrink-0">
                  <RefreshCw size={20} className="text-danger" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{q.question_text}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs text-text-secondary bg-bg px-1.5 py-0.5 rounded">
                      {q.question_type === 'choice' ? '选择题' : '填空题'}
                    </span>
                    <div className="flex gap-1">{dots}</div>
                    <span className="text-xs text-text-secondary">{q.redo_count}/3</span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-text-secondary flex-shrink-0" />
              </button>
            )
          })}
        </section>
      )}
    </div>
  )
}
