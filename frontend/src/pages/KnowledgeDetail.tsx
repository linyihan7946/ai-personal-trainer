import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { knowledgeApi } from '../api/client'
import type { KnowledgePointDetail as KPDetail } from '../stores/knowledgeStore'
import { ArrowLeft, CheckCircle, XCircle, ChevronRight, BookOpen } from 'lucide-react'

export default function KnowledgeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [point, setPoint] = useState<KPDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const fetchDetail = async () => {
      try {
        const res = await knowledgeApi.pointDetail(id)
        setPoint(res.data)
      } catch {
        setPoint({
          id: id,
          name: '一般现在时',
          description: '一般现在时用于表示经常性、习惯性的动作或现在的状态。基本结构：主语 + 动词原形（第三人称单数加 -s/-es）。',
          category: '英语',
          mastery_level: 3,
          related_questions: [
            { id: '1', question_text: 'He ___ to school every day. (go/goes)', question_type: 'blank', is_correct: false },
            { id: '2', question_text: 'She ___ English very well. (speak/speaks)', question_type: 'blank', is_correct: true },
          ],
          related_points: [
            { id: '2', name: '第三人称单数', category: '英语', mastery_level: 2 },
            { id: '4', name: '现在进行时', category: '英语', mastery_level: 1 },
          ],
        })
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="text-text-secondary text-sm">加载中...</div>
      </div>
    )
  }

  if (!point) {
    return (
      <div className="flex flex-col items-center py-20 px-6">
        <p className="text-text-secondary text-sm">知识点不存在</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={22} className="text-text" />
        </button>
        <h1 className="text-lg font-semibold">{point.name}</h1>
      </div>

      {/* Mastery */}
      <div className="bg-white rounded-xl border border-border p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary">掌握程度</span>
          <span className="text-sm font-medium">{point.mastery_level}/5</span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((lvl) => (
            <div
              key={lvl}
              className={`flex-1 h-2 rounded-full ${
                lvl <= point.mastery_level ? 'bg-primary' : 'bg-border'
              }`}
            />
          ))}
        </div>
        <div className="text-xs text-text-secondary mt-2">
          <span className="bg-bg px-1.5 py-0.5 rounded">{point.category}</span>
        </div>
      </div>

      {/* Description */}
      {point.description && (
        <div className="bg-blue-50 rounded-xl p-4 mb-4">
          <h3 className="text-sm font-medium text-blue-700 mb-1">知识点说明</h3>
          <p className="text-sm text-blue-600 leading-relaxed">{point.description}</p>
        </div>
      )}

      {/* Related Questions */}
      {point.related_questions.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-text mb-2 flex items-center gap-2">
            <BookOpen size={16} />
            关联题目 ({point.related_questions.length})
          </h3>
          <div className="space-y-2">
            {point.related_questions.map((q) => (
              <div
                key={q.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-white text-left"
              >
                {q.is_correct ? (
                  <CheckCircle size={16} className="text-success flex-shrink-0" />
                ) : (
                  <XCircle size={16} className="text-danger flex-shrink-0" />
                )}
                <span className="text-sm flex-1 truncate">{q.question_text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Knowledge Points (Graph neighbors) */}
      {point.related_points.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-text mb-2">关联知识点</h3>
          <div className="space-y-2">
            {point.related_points.map((rp) => (
              <button
                key={rp.id}
                onClick={() => navigate(`/knowledge/${rp.id}`)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 transition-colors text-left"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: rp.category === '英语' ? '#22c55e' : '#6366f1' }}
                />
                <div className="flex-1">
                  <span className="text-sm font-medium">{rp.name}</span>
                  <span className="text-xs text-text-secondary ml-2">{rp.category}</span>
                </div>
                <ChevronRight size={16} className="text-text-secondary" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
