// PM 담당 — 사용법: const { user, setAuth, clear } = useAuthStore()

import { create } from 'zustand'
import {persist} from 'zustand/middleware'

interface User {
  uid: number
  nickname: string
  createdAt: string
  updatedAt: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  clear: () => void
}

// persist 미들웨어 적용
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
          user: null,
          accessToken: null,
          refreshToken: null,
          setAuth: (user, accessToken, refreshToken) =>
            set({ user, accessToken, refreshToken }),
          clear: () => set({ user: null, accessToken: null, refreshToken: null }),
        }),
        {
          name: 'hasi-auth', // client.ts와 동일한 LocalStorage 키 이름
        }
    )
)