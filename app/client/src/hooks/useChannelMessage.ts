// PM 담당 — 채널 채팅창에서 사용
// const { messages, sendMessage } = useChannelMessage(channelId)
//
// 흐름: messenger.ts(히스토리) + stomp.ts(실시간) → channelStore → 컴포넌트

import { useEffect } from 'react'
import { useChannelStore } from '../store/channelStore'
import { useAuthStore } from '../store/authStore'
import { useWorkspaceStore } from '../store/workspaceStore'
import { connectStomp, subscribeToChannel, sendChannelMessage } from '../api/stomp'
import { fetchChannelHistory } from '../api/messenger'
import { api } from '../api/client'

export const useChannelMessage = (channelId: number) => {
  const { messages, setMessages, addMessage, clearMessages } = useChannelStore()

  useEffect(() => {
    const token = useAuthStore.getState().accessToken
    const workspaceId = useWorkspaceStore.getState().currentWorkspace?.id
    if (!token || !workspaceId) return

    let unsub: (() => void) | undefined

    // 0. 채널 참가(self-join) 먼저 — 안 하면 messenger가 멤버가 아니라고 히스토리를 거부함
    //    이미 참가한 멤버면 CH_005로 실패하는데, 이건 정상 상황이라 무시하고 진행
    api.POST('/api/workspaces/{workspaceId}/channels/{channelId}/members', {
      params: { path: { workspaceId, channelId } },
    }).finally(() => {
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
    })

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
