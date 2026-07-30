// PM 담당 — 채널 채팅창에서 사용
// const { messages, sendMessage } = useChannelMessage(channelId)
//
// 흐름: messenger.ts(히스토리) + stomp.ts(실시간) → channelStore → 컴포넌트

import { useEffect, useRef } from 'react'
import { useChannelStore } from '../store/channelStore'
import { useAuthStore } from '../store/authStore'
import { useWorkspaceStore } from '../store/workspaceStore'
import {
  connectStomp,
  subscribeToChannel,
  subscribeToChannelRead,
  sendChannelMessage,
  sendChannelRead,
} from '../api/stomp'
import { fetchChannelHistory, fetchChannelReadStates } from '../api/messenger'
import { api } from '../api/client'

export const useChannelMessage = (channelId: number) => {
  const {
    messages, setMessages, addMessage, clearMessages,
    unreadCount, setUnreadCount, resetUnread,
  } = useChannelStore()

  // 구독 콜백 클로저 안에서 최신 마지막 메시지 id를 들고 있기 위한 ref
  const lastMessageIdRef = useRef<number | null>(null)

  useEffect(() => {
    const token = useAuthStore.getState().accessToken
    const myUid = useAuthStore.getState().user?.uid
    const workspaceId = useWorkspaceStore.getState().currentWorkspace?.id
    if (!token || !workspaceId || myUid == null) return

    let unsubMessages: (() => void) | undefined
    let unsubRead: (() => void) | undefined

    // 0. 채널 참가(self-join) 먼저 — 안 하면 messenger가 멤버가 아니라고 히스토리를 거부함
    //    이미 참가한 멤버면 CH_005로 실패하는데, 이건 정상 상황이라 무시하고 진행
    api.POST('/api/workspaces/{workspaceId}/channels/{channelId}/members', {
      params: { path: { workspaceId, channelId } },
    }).finally(() => {
      // 1. 히스토리 + 읽음 커서를 같이 로드해서 진입 시점 안읽음 개수를 계산
      Promise.all([
        fetchChannelHistory(channelId, token),
        fetchChannelReadStates(channelId, token),
      ])
          .then(([history, readStates]) => {
            setMessages(history)

            const lastMessage = history[history.length - 1]
            lastMessageIdRef.current = lastMessage ? lastMessage.id : null

            const myReadState = readStates.find((s) => s.userId === String(myUid))
            const myLastReadId = myReadState?.lastReadMessageId ?? 0
            setUnreadCount(history.filter((m) => m.id > myLastReadId).length)

            // 채널을 열람했으니 커서를 최신 메시지까지 올림 (다른 탭/기기 동기화용)
            if (lastMessageIdRef.current != null) {
              sendChannelRead(channelId, lastMessageIdRef.current)
            }
          })
          .catch(console.error)

      // 2. STOMP 연결 후 채널 메시지 + 읽음 커서 구독
      connectStomp(token)
          .then(() => {
            unsubMessages = subscribeToChannel(channelId, (msg) => {
              addMessage(msg)
              lastMessageIdRef.current = msg.id
              // 채널이 열려있는 동안 수신한 메시지는 바로 읽은 것으로 처리
              sendChannelRead(channelId, msg.id)
            })

            unsubRead = subscribeToChannelRead(channelId, (state) => {
              // 다른 탭/기기에서 내가 먼저 읽은 경우 뱃지 동기화
              if (state.userId === String(myUid)) {
                resetUnread()
              }
            })
          })
          .catch(console.error)
    })

    // 채널 나갈 때 구독 해제 + 비우기
    return () => {
      unsubMessages?.()
      unsubRead?.()
      clearMessages()
    }
  }, [channelId])

  return {
    messages,
    unreadCount,
    markAsRead: () => {
      if (lastMessageIdRef.current != null) {
        sendChannelRead(channelId, lastMessageIdRef.current)
      }
      resetUnread()
    },
    sendMessage: (content: string) => sendChannelMessage(channelId, content),
  }
}
