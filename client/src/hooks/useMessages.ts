// 🔴 PM 담당 파일 — 역할③ 장윤찬이 채팅 화면에서 사용
// ✅ 사용법: const { messages, sendMessage } = useMessages(channelId)

import { useEffect } from 'react'
import { useChatStore } from '../store/chatStore'

export const useMessages = (channelId: number) => {
  const { messages, clearMessages } = useChatStore()

  useEffect(() => {
    // TODO: STOMP 채널 구독 연결
    // socketClient.subscribe(`/topic/channel.${channelId}`, (msg) => {
    //   addMessage(msg)
    // })
    return () => {
      clearMessages()
    }
  }, [channelId])

  const sendMessage = (content: string) => {
    // TODO: STOMP 메시지 전송
    // socketClient.send('/app/chat.send', { channelId, content })
    console.log('sendMessage:', content)
  }

  return { messages, sendMessage }
}
