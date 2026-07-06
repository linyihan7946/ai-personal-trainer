import { NavLink, useLocation } from 'react-router-dom'
import { Home, Upload, BookOpen, User } from 'lucide-react'

const tabs = [
  { to: '/', icon: Home, label: '首页' },
  { to: '/upload', icon: Upload, label: '上传' },
  { to: '/wrong-questions', icon: BookOpen, label: '错题本' },
  { to: '/profile', icon: User, label: '我的' },
]

export default function BottomNav() {
  const location = useLocation()

  return (
    <nav className="app-bottom-nav fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-border z-50">
      <div className="app-bottom-nav__inner flex justify-around items-center">
        {tabs.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to
          return (
            <NavLink
              key={to}
              to={to}
              className={`app-bottom-nav__item flex flex-col items-center gap-1 rounded-lg transition-colors ${
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
