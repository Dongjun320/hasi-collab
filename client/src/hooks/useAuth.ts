// 🔴 PM 담당 파일
// ✅ 사용법: const { user, isLoggedIn } = useAuth()

import { useAuthStore } from '../store/authStore'

export const useAuth = () => {
  const { user, accessToken } = useAuthStore()
  return {
    user,
    isLoggedIn: !!accessToken,
  }
}
