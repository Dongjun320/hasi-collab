// PM 담당 — 닉네임으로 유저 찾기 (친구 추가 / 워크스페이스 초대 / DM 시작 등)
// const { result, loading, notFound, search, reset } = useUserSearch()
//
// API: GET /api/users/search?nickname={nickname}
// ※ 검색 결과는 그 화면(모달)에서만 쓰는 일시적 데이터라 store 없이 hook 내부 state로 관리합니다

import { useState, useCallback } from 'react'
import { api } from '../api/client'

export interface SearchedUser {
  uid: number
  nickname: string
}

export const useUserSearch = () => {
  const [result, setResult] = useState<SearchedUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const search = useCallback(async (nickname: string) => {
    const trimmed = nickname.trim()
    if (!trimmed) return

    setLoading(true)
    setNotFound(false)
    setResult(null)

    const { data, error } = await api.GET('/api/users/search', {
      params: { query: { nickname: trimmed } },
    })

    setLoading(false)

    if (error || !data?.uid) {
      setNotFound(true)   // 404 = 해당 닉네임 유저 없음
      return
    }

    setResult({ uid: data.uid, nickname: data.nickname ?? trimmed })
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setNotFound(false)
    setLoading(false)
  }, [])

  return { result, loading, notFound, search, reset }
}
