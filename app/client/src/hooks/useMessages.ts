// PM 담당 — 역할3번 채팅창에서 사용
// const { messages, sendMessage } = useMessages(channelId)

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
