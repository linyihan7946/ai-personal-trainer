import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { examApi } from '../api/client'
import { useExamStore } from '../stores/examStore'
import QuestionCard from '../components/QuestionCard'
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function ExamResult() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentExam, setCurrentExam } = useExamStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    // Check if we already have it in store
    const fetchExam = async () => {
      try {
        const res = await examApi.detail(id)
        setCurrentExam(res.data)
      } catch {
        // Use existing data from store if available
      } finally {
        setLoading(false)
      }
    }
    fetchExam()
  }, [id, setCurrentExam])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={32} className="text-primary animate-spin" />
      </div>
    )
  }

  if (!currentExam) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6">
        <p className="text-text-secondary text-sm">试卷不存在或已删除</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-primary text-sm font-medium"
        >
          返回首页
        </button>
      </div>
    )
  }

  const { image_url, total_questions, correct_count, wrong_count, questions, created_at } = currentExam

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={22} className="text-text" />
        </button>
        <div>
          <h1 className="text-lg font-semibold">批改结果</h1>
          <p className="text-xs text-text-secondary">
            {new Date(created_at).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-xl p-4 text-white mb-4">
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-3xl font-bold">{total_questions}</div>
            <div className="text-xs opacity-80 mt-1">总题数</div>
          </div>
          <div className="w-px h-12 bg-white/20" />
          <div className="text-center">
            <div className="text-3xl font-bold text-green-300">{correct_count}</div>
            <div className="text-xs opacity-80 mt-1 flex items-center gap-1">
              <CheckCircle size={12} /> 正确
            </div>
          </div>
          <div className="w-px h-12 bg-white/20" />
          <div className="text-center">
            <div className="text-3xl font-bold text-red-300">{wrong_count}</div>
            <div className="text-xs opacity-80 mt-1 flex items-center gap-1">
              <XCircle size={12} /> 错误
            </div>
          </div>
          <div className="w-px h-12 bg-white/20" />
          <div className="text-center">
            <div className="text-2xl font-bold">
              {total_questions > 0 ? Math.round((correct_count / total_questions) * 100) : 0}%
            </div>
            <div className="text-xs opacity-80 mt-1">正确率</div>
          </div>
        </div>
      </div>

      {/* Original Image */}
      {image_url && (
        <div className="mb-4">
          <img
            src={image_url}
            alt="试卷原图"
            className="w-full rounded-xl border border-border max-h-48 object-cover"
          />
        </div>
      )}

      {/* Questions */}
      <div>
        <h2 className="text-sm font-semibold text-text mb-3">题目详情</h2>
        {questions?.map((q: any, i: number) => (
          <QuestionCard key={q.id || i} {...q} index={i} />
        ))}
      </div>
    </div>
  )
}
