import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { examApi, wrongQApi } from '../api/client'
import { useExamStore, type Exam } from '../stores/examStore'
import { FileText, BookOpen, Brain, TrendingUp, Search, ChevronRight } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  const { exams, setExams } = useExamStore()
  const [stats, setStats] = useState({ totalWrong: 0, totalExams: 0, totalKnowledge: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examRes, statsRes] = await Promise.all([
          examApi.list(),
          wrongQApi.stats(),
        ])
        setExams(examRes.data.exams || [])
        setStats({
          totalExams: examRes.data.exams?.length || 0,
          totalWrong: statsRes.data.total_wrong || 0,
          totalKnowledge: statsRes.data.total_knowledge || 0,
        })
      } catch {
        // Use mock data for demo
        setStats({ totalExams: 0, totalWrong: 0, totalKnowledge: 0 })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [setExams])

  const statCards = [
    { label: '已上传试卷', value: stats.totalExams, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: '待攻克错题', value: stats.totalWrong, icon: BookOpen, color: 'text-red-500', bg: 'bg-red-50' },
    { label: '知识库节点', value: stats.totalKnowledge, icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50' },
  ]

  const quickActions = [
    { label: '上传试卷', desc: '拍照或相册上传', to: '/upload', icon: FileText, bg: 'bg-primary text-white' },
    { label: '错题本', desc: `${stats.totalWrong} 道待攻克`, to: '/wrong-questions', icon: BookOpen, bg: 'bg-red-500 text-white' },
    { label: '知识库', desc: '网状知识图谱', to: '/knowledge', icon: Brain, bg: 'bg-purple-500 text-white' },
    { label: '搜索', desc: '搜索知识点', to: '/search', icon: Search, bg: 'bg-green-500 text-white' },
  ]

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text">AI 私教</h1>
          <p className="text-xs text-text-secondary mt-0.5">越用越懂你的学习助手</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <TrendingUp size={20} className="text-primary" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-3 flex flex-col items-center`}>
            <Icon size={20} className={color} />
            <span className="text-lg font-bold mt-1">{loading ? '-' : value}</span>
            <span className="text-xs text-text-secondary">{label}</span>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-text mb-3">快捷操作</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map(({ label, desc, to, icon: Icon, bg }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 hover:shadow-sm transition-all text-left"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                <Icon size={20} />
              </div>
              <div>
                <div className="text-sm font-medium">{label}</div>
                <div className="text-xs text-text-secondary">{desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Exams */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-text">最近试卷</h2>
        </div>
        {exams.length === 0 ? (
          <div className="text-center py-10 text-text-secondary">
            <FileText size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">还没有上传过试卷</p>
            <button
              onClick={() => navigate('/upload')}
              className="text-primary text-sm mt-2 font-medium"
            >
              去上传第一份试卷 →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {exams.slice(0, 5).map((exam: Exam) => (
              <button
                key={exam.id}
                onClick={() => navigate(`/exam/${exam.id}`)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary/30 transition-colors text-left"
              >
                <div>
                  <div className="text-sm font-medium">
                    {new Date(exam.created_at).toLocaleDateString('zh-CN')} 的试卷
                  </div>
                  <div className="text-xs text-text-secondary mt-0.5">
                    共 {exam.total_questions} 题 · 正确 {exam.correct_count} · 错误 {exam.wrong_count}
                  </div>
                </div>
                <ChevronRight size={18} className="text-text-secondary flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
