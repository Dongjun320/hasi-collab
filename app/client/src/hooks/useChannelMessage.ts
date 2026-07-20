// PM 담당 — 채널 채팅창에서 사용
// const { messages, sendMessage } = useChannelMessage(channelId)
//
// 흐름: messenger.ts(히스토리) + stomp.ts(실시간) → channelStore → 컴포넌트

import { useEffect } from 'react'
import { useChannelStore } from '../store/channelStore'
import { useAuthStore } from '../store/authStore'
import { connectStomp, subscribeToChannel, sendChannelMessage } from '../api/stomp'
import { fetchChannelHistory } from '../api/messenger'

export const useChannelMessage = (channelId: number) => {
  const { messages, setMessages, addMessage, clearMessages } = useChannelStore()

  useEffect(() => {
    const token = useAuthStore.getState().accessToken
    if (!token) return

    let unsub: (() => void) | undefined

    // 1. 히스토리 로드 (REST)
    fetchChannelHistory(channelId, token)
      .then(setMessages)
      .catch(console.error)

    // 2. STOMP 연결 후 채널 구독 (구독 = 실시간 수신)
    connectStomp(token)
      .then(() => {
        unsub = subscribeToChannel(channelId, (msg) => addMessage(msg))
      })
      .catch(console.error)

    // 채널 나갈 때 구독 해제 + 비우기
    return () => {
      unsub?.()
      clearMessages()
    }
  }, [channelId])

  return {
    messages,
    sendMessage: (content: string) => sendChannelMessage(channelId, content),
  }
}
