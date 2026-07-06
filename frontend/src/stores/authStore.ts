import { create } from 'zustand'

interface User {
  id: string
  phone: string
  nickname: string
  avatar_url?: string
}

interface AuthState {
  user: User | null
  isLoggedIn: boolean
  setUser: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: !!localStorage.getItem('token'),
  setUser: (user) => set({ user, isLoggedIn: true }),
  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, isLoggedIn: false })
  },
}))
