import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { examApi, wrongQApi, adminApi } from '../api/client'
import {
  ArrowLeft,
  User,
  Phone,
  LogOut,
  FileText,
  BookOpen,
  Brain,
  ChevronRight,
  Shield,
  Users,
  TrendingUp,
} from 'lucide-react'

function maskPhone(phone: string): string {
  if (phone.length < 7) return phone
  return phone.slice(0, 3) + '****' + phone.slice(-4)
}

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [stats, setStats] = useState({ totalExams: 0, totalWrong: 0, totalKnowledge: 0 })
  const [adminStats, setAdminStats] = useState({
    total_users: 0,
    today_active_users: 0,
    total_exams: 0,
    total_wrong_questions: 0,
    total_knowledge_points: 0,
  })
  const [loading, setLoading] = useState(true)
  const [showLogout, setShowLogout] = useState(false)
  const isAdmin = user?.is_admin || false

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examRes, statsRes] = await Promise.all([
          examApi.list(),
          wrongQApi.stats(),
        ])
        setStats({
          totalExams: examRes.data.exams?.length || 0,
          totalWrong: statsRes.data.total_wrong || 0,
          totalKnowledge: statsRes.data.total_knowledge || 0,
        })
      } catch {
        setStats({ totalExams: 0, totalWrong: 0, totalKnowledge: 0 })
      }

      if (isAdmin) {
        try {
          const res = await adminApi.stats()
          setAdminStats(res.data)
        } catch {
          // Not admin or error
        }
      }

      setLoading(false)
    }
    fetchData()
  }, [isAdmin])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const statItems = [
    { label: '试卷', value: stats.totalExams, icon: FileText },
    { label: '错题', value: stats.totalWrong, icon: BookOpen },
    { label: '知识点', value: stats.totalKnowledge, icon: Brain },
  ]

  const adminItems = [
    { label: '总用户数', value: adminStats.total_users, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: '今日活跃', value: adminStats.today_active_users, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
    { label: '总试卷数', value: adminStats.total_exams, icon: FileText, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: '总错题数', value: adminStats.total_wrong_questions, icon: BookOpen, color: 'text-red-500', bg: 'bg-red-50' },
    { label: '总知识点', value: adminStats.total_knowledge_points, icon: Brain, color: 'text-amber-500', bg: 'bg-amber-50' },
  ]

  return (
    <div className="px-5 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={22} className="text-text" />
        </button>
        <h1 className="text-lg font-semibold">个人中心</h1>
        {isAdmin && (
          <span className="ml-auto flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
            <Shield size={14} />
            管理员
          </span>
        )}
      </div>

      {/* User info card */}
      <div className="flex items-center gap-4 p-5 rounded-2xl bg-primary/5 border border-primary/10 mb-6">
        <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
          <User size={28} className="text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold text-text">{user?.nickname || '同学'}</div>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-text-secondary">
            <Phone size={14} />
            <span>{user?.phone ? maskPhone(user.phone) : '-'}</span>
          </div>
        </div>
      </div>

      {/* Personal Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {statItems.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex flex-col items-center p-4 rounded-2xl bg-bg border border-border"
          >
            <Icon size={20} className="text-text-secondary mb-1.5" />
            <span className="text-xl font-bold text-text">{loading ? '-' : value}</span>
            <span className="text-xs text-text-secondary mt-0.5">{label}</span>
          </div>
        ))}
      </div>

      {/* Admin Stats — only for admin */}
      {isAdmin && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
            <Shield size={16} className="text-amber-500" />
            数据统计
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {adminItems.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={`${bg} rounded-2xl p-4`}>
                <div className="flex items-center gap-2">
                  <Icon size={18} className={color} />
                  <span className="text-xs text-text-secondary">{label}</span>
                </div>
                <div className="text-2xl font-bold mt-2 text-text">{loading ? '-' : value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Menu */}
      <div className="space-y-3 mb-8">
        <button
          onClick={() => navigate('/knowledge')}
          className="w-full flex items-center justify-between p-4 rounded-2xl border border-border hover:border-primary/30 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Brain size={20} className="text-purple-500" />
            </div>
            <div>
              <div className="text-sm font-medium text-text">知识库</div>
              <div className="text-xs text-text-secondary">网状知识图谱</div>
            </div>
          </div>
          <ChevronRight size={18} className="text-text-secondary" />
        </button>

        <button
          onClick={() => navigate('/search')}
          className="w-full flex items-center justify-between p-4 rounded-2xl border border-border hover:border-primary/30 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <Brain size={20} className="text-green-500" />
            </div>
            <div>
              <div className="text-sm font-medium text-text">搜索</div>
              <div className="text-xs text-text-secondary">搜索知识点</div>
            </div>
          </div>
          <ChevronRight size={18} className="text-text-secondary" />
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={() => setShowLogout(true)}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-danger/30 text-danger text-sm font-medium hover:bg-danger/5 transition-colors"
      >
        <LogOut size={18} />
        退出登录
      </button>

      {/* Logout confirmation */}
      {showLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-6 w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-3">
                <LogOut size={28} className="text-danger" />
              </div>
              <div className="text-base font-semibold text-text">确认退出登录？</div>
              <div className="text-sm text-text-secondary mt-1">退出后需要重新登录</div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogout(false)}
                className="flex-1 py-3 rounded-xl border border-border text-sm font-medium hover:bg-bg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 rounded-xl bg-danger text-white text-sm font-medium hover:bg-danger/90 transition-colors"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
