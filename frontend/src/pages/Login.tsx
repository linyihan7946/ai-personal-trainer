import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/client'
import { useAuthStore } from '../stores/authStore'
import { Brain, ArrowRight } from 'lucide-react'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)

  const sendCode = async () => {
    if (!/^1\d{10}$/.test(phone)) {
      setError('请输入正确的手机号')
      return
    }
    setError('')
    setLoading(true)
    try {
      await authApi.sendCode(phone)
      setCodeSent(true)
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timer)
            return 0
          }
          return c - 1
        })
      }, 1000)
    } catch {
      setError('发送验证码失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const login = async () => {
    if (!code) {
      setError('请输入验证码')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await authApi.login(phone, code)
      const { token, user } = res.data
      localStorage.setItem('token', token)
      setUser(user)
      navigate('/', { replace: true })
    } catch {
      setError('验证码错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5">
      <div className="w-full" style={{ maxWidth: 400 }}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
            <Brain size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text">AI 私教</h1>
          <p className="text-sm text-text-secondary mt-1">你的个人学习助手</p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          <div>
            <label className="text-base font-medium text-text mb-2 block">手机号</label>
            <input
              type="tel"
              maxLength={11}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入手机号"
              className="w-full px-5 py-5 rounded-2xl border border-border bg-surface text-base focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {codeSent && (
            <div className="flex gap-3">
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="验证码"
                className="flex-1 px-5 py-5 rounded-2xl border border-border bg-surface text-base focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                onClick={sendCode}
                disabled={countdown > 0 || loading}
                className="px-4 py-5 text-sm text-primary border border-primary/30 rounded-2xl whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/5 transition-colors font-medium"
              >
                {countdown > 0 ? `${countdown}s` : '重新发送'}
              </button>
            </div>
          )}

          {error && (
            <div className="text-sm text-danger bg-red-50 px-5 py-3 rounded-2xl">{error}</div>
          )}

          {!codeSent ? (
            <button
              onClick={sendCode}
              disabled={loading}
              className="w-full py-5 rounded-2xl bg-primary text-white font-semibold text-base flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-50 shadow-lg shadow-primary/25"
            >
              {loading ? '发送中...' : '获取验证码'}
              <ArrowRight size={22} />
            </button>
          ) : (
            <button
              onClick={login}
              disabled={loading}
              className="w-full py-5 rounded-2xl bg-primary text-white font-semibold text-base flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-50 shadow-lg shadow-primary/25"
            >
              {loading ? '登录中...' : '登录'}
              <ArrowRight size={22} />
            </button>
          )}
        </div>

        <p className="text-xs text-text-secondary text-center mt-8">
          登录即表示同意服务条款和隐私政策
        </p>
      </div>
    </div>
  )
}
