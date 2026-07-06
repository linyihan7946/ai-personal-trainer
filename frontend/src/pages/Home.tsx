import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { examApi, wrongQApi } from '../api/client'
import { useExamStore, type Exam } from '../stores/examStore'
import { FileText, BookOpen, Brain, TrendingUp, Search, ChevronRight, Camera } from 'lucide-react'

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
    { label: '试卷', value: stats.totalExams, icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
    { label: '错题', value: stats.totalWrong, icon: BookOpen, color: 'text-danger', bg: 'bg-danger/10' },
    { label: '知识点', value: stats.totalKnowledge, icon: Brain, color: 'text-success', bg: 'bg-success/10' },
  ]

  const quickActions = [
    { label: '错题本', desc: `${stats.totalWrong} 道待攻克`, to: '/wrong-questions', icon: BookOpen, bg: 'bg-danger/10 text-danger' },
    { label: '知识库', desc: '网状知识图谱', to: '/knowledge', icon: Brain, bg: 'bg-primary/10 text-primary' },
    { label: '搜索', desc: '搜索知识点', to: '/search', icon: Search, bg: 'bg-success/10 text-success' },
  ]

  return (
    <div className="home-page home-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">AI 私教</h1>
          <p className="text-xs text-text-secondary mt-0.5">越用越懂你的学习助手</p>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
          <TrendingUp size={22} className="text-primary" />
        </div>
      </div>

      {/* Primary Action */}
      <button
        onClick={() => navigate('/upload')}
        className="home-primary-action w-full rounded-2xl bg-primary text-white text-left transition-all hover:bg-primary-dark"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Camera size={28} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-lg font-semibold">上传一份新试卷</div>
            <div className="text-sm text-white/80 mt-1">拍照或从相册选择，AI 自动批改并整理知识点</div>
          </div>
          <ChevronRight size={22} className="flex-shrink-0 opacity-80" />
        </div>
      </button>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-4`}>
            <div className="flex items-center gap-2 text-text-secondary">
              <Icon size={18} className={color} />
              <span className="text-xs">{label}</span>
            </div>
            <div className="text-2xl font-bold mt-2">{loading ? '-' : value}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-text mb-3">学习入口</h2>
        <div className="space-y-3">
          {quickActions.map(({ label, desc, to, icon: Icon, bg }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all text-left"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                <Icon size={21} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{label}</div>
                <div className="text-xs text-text-secondary mt-0.5 truncate">{desc}</div>
              </div>
              <ChevronRight size={18} className="text-text-secondary flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Recent Exams */}
      <div className="home-recent">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-text">最近试卷</h2>
        </div>
        {exams.length === 0 ? (
          <div className="home-empty-state text-center text-text-secondary">
            <div className="w-16 h-16 rounded-2xl bg-bg border border-border flex items-center justify-center mx-auto mb-4">
              <FileText size={34} className="opacity-40" />
            </div>
            <p className="text-sm">还没有上传过试卷</p>
            <button
              onClick={() => navigate('/upload')}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm mt-4 font-medium"
            >
              去上传第一份试卷
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {exams.slice(0, 5).map((exam: Exam) => (
              <button
                key={exam.id}
                onClick={() => navigate(`/exam/${exam.id}`)}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/30 transition-colors text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">
                    {new Date(exam.created_at).toLocaleDateString('zh-CN')} 的试卷
                    {exam.subject && exam.subject !== '通用' && (
                      <span className="ml-2 text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                        {exam.subject}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-text-secondary mt-1">
                    共 {exam.total_questions} 题 · 正确 {exam.correct_count} · 错误 {exam.wrong_count}
                  </div>
                </div>
                <ChevronRight size={18} className="text-text-secondary flex-shrink-0 ml-3" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
