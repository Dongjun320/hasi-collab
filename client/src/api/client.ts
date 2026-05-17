// 🔴 PM 담당 파일 — 수정 시 김동준에게 문의
// 모든 API 요청은 이 client를 통해 보냅니다

import axios from 'axios'

const client = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// 요청 인터셉터: 모든 요청에 JWT 자동 첨부
client.interceptors.request.use((config) => {
  // authStore에서 토큰 가져오기 (순환 참조 방지로 직접 import 안 함)
  const raw = localStorage.getItem('hasi-auth')
  const token = raw ? JSON.parse(raw)?.state?.accessToken : null
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 응답 인터셉터: 401이면 로그인 페이지로 이동
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default client
