// 🔴 PM 담당 — 사용법: const { user, setAuth, clear } = useAuthStore()

import { create } from 'zustand'

interface User {
  id: number
  email: string
  name: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  setAuth: (user: User, token: string) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  setAuth: (user, token) => set({ user, accessToken: token }),
  clear: () => set({ user: null, accessToken: null }),
}))
