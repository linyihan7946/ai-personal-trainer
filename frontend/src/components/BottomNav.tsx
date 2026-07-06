import { NavLink, useLocation } from 'react-router-dom'
import { Home, Upload, BookOpen, Brain } from 'lucide-react'

const tabs = [
  { to: '/', icon: Home, label: '首页' },
  { to: '/upload', icon: Upload, label: '上传' },
  { to: '/wrong-questions', icon: BookOpen, label: '错题本' },
  { to: '/knowledge', icon: Brain, label: '知识库' },
]

export default function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-border z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {tabs.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                active ? 'text-primary' : 'text-text-secondary'
              }`}
            >
              <Icon size={22} />
              <span className="text-xs">{label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
