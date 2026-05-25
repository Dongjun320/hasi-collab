// 모든 API 요청은 이 api 인스턴스를 통해 보냅니다
// openapi-fetch: openapi.yaml 기반으로 자동 타입 적용
//
// 사용법:
//   import { api } from '../api/client'
//   const { data, error } = await api.POST('/api/auth/login', { body: { ... } })

import createClient from 'openapi-fetch'
import type { paths } from '../types/openapi'

export const api = createClient<paths>({
  baseUrl: '',
})

// 요청 미들웨어: 모든 요청에 JWT 자동 첨부
api.use({
  onRequest({ request }) {
    const raw = localStorage.getItem('hasi-auth')
    const token = raw ? JSON.parse(raw)?.state?.accessToken : null
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`)
    }
    return request
  },

  // 응답 미들웨어: 401이면 로그인 페이지로 이동
  onResponse({ response }) {
    if (response.status === 401) {
      window.location.href = '/login'
    }
    return response
  },
})
