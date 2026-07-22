// PM 담당 — DM(1:1 대화) 화면에서 사용
// const { dmMessages, sendMessage } = useDmMessage(peerId)
//
// 흐름: messenger.ts(히스토리) + stomp.ts(실시간) → dmStore → 컴포넌트
// ※ DM은 /user/queue/dm 큐 하나를 공유하고, stomp.ts가 peerId로 걸러 전달합니다

import { useEffect } from 'react'
import { useDmStore } from '../store/dmStore'
import { useAuthStore } from '../store/authStore'
import { connectStomp, subscribeToDm, sendDmMessage } from '../api/stomp'
import { fetchDmHistory } from '../api/messenger'

export const useDmMessage = (peerId: number) => {
  const { dmMessages, setDmMessages, addDmMessage, clearDmMessages } = useDmStore()

  useEffect(() => {
    const token = useAuthStore.getState().accessToken
    if (!token) return

    let unsub: (() => void) | undefined

    // 1. 히스토리 로드 (REST)
    fetchDmHistory(peerId, token)
        .then(setDmMessages)
        .catch(console.error)

    // 2. STOMP 연결 후 DM 구독 (peerId 기준으로 내 큐에서 걸러 받음)
    connectStomp(token)
        .then(() => {
          unsub = subscribeToDm(peerId, (msg) => addDmMessage(msg))
        })
        .catch(console.error)

    // 대화 상대가 바뀌거나 화면을 떠날 때 구독 해제 + 비우기
    return () => {
      unsub?.()
      clearDmMessages()
    }
  }, [peerId])

  return {
    dmMessages,
    sendMessage: (content: string) => sendDmMessage(peerId, content),
  }
}
