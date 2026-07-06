import { create } from 'zustand'
import { authApi } from '../api/client'

interface User {
  id: string
  phone: string
  nickname: string
  avatar_url?: string
  is_admin: boolean
}

interface AuthState {
  user: User | null
  isLoggedIn: boolean
  setUser: (user: User) => void
  logout: () => void
  fetchMe: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: !!localStorage.getItem('token'),
  setUser: (user) => set({ user, isLoggedIn: true }),
  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, isLoggedIn: false })
  },
  fetchMe: async () => {
    try {
      const res = await authApi.me()
      set({ user: res.data, isLoggedIn: true })
    } catch {
      set({ user: null, isLoggedIn: false })
      localStorage.removeItem('token')
    }
  },
}))
