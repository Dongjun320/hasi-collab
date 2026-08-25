// PM 담당 — 채널 채팅창에서 사용
// const { messages, isMember, sendMessage } = useChannelMessage(channelId)
//
// 흐름: messenger.ts(히스토리) + stomp.ts(실시간) → channelStore → 컴포넌트
//
// 채널 접근 모델:
//   공용 채널(공지사항)은 워크스페이스 초대 수락 시 자동으로 멤버가 되고,
//   그 외 채널은 채널 초대를 수락해야 멤버가 됩니다.
//   과거에는 진입할 때 프론트가 self-join을 호출해서 누구나 들어갔는데, 그 호출을 제거했습니다.

import { useEffect, useRef, useState } from 'react'
import { useChannelStore } from '../store/channelStore'
import { useAuthStore } from '../store/authStore'
import {
  connectStomp,
  subscribeToChannel,
  subscribeToChannelRead,
  sendChannelMessage,
  sendChannelRead,
} from '../api/stomp'
import { fetchChannelHistory, fetchChannelReadStates, MessengerApiError } from '../api/messenger'

export const useChannelMessage = (channelId: number) => {
    const {
        messages, setMessages, addMessage, clearMessages,
        unreadByChannel, setUnread, resetUnread,
    } = useChannelStore()

  // null = 확인 중, true = 참여중, false = 미참여(게이트 표시)
  // false로 시작하면 로딩 동안 게이트가 잠깐 보였다 사라져서 깜빡입니다.
  const [isMember, setIsMember] = useState<boolean | null>(null)

  // 구독 콜백 클로저 안에서 최신 마지막 메시지 id를 들고 있기 위한 ref
  const lastMessageIdRef = useRef<number | null>(null)

  useEffect(() => {
    const token = useAuthStore.getState().accessToken
    const myUid = useAuthStore.getState().user?.uid
    if (!token || myUid == null) return

    // 채널을 옮길 때 이전 채널의 판정이 남아있지 않도록 초기화
    setIsMember(null)
    lastMessageIdRef.current = null

    let unsubMessages: (() => void) | undefined
    let unsubRead: (() => void) | undefined
    let cancelled = false

    // 1. 히스토리 + 읽음 커서 로드.
    //    미참여 채널이면 messenger가 둘 다 403으로 막기 때문에, Promise.all이 통째로 reject되어
    //    아래 catch 한 곳에서 미참여 판정을 합니다.
    Promise.all([
      fetchChannelHistory(channelId, token),
      fetchChannelReadStates(channelId, token),
    ])
        .then(([history, readStates]) => {
          if (cancelled) return

          setMessages(history)

          const lastMessage = history[history.length - 1]
          lastMessageIdRef.current = lastMessage ? lastMessage.id : null

          const myReadState = readStates.find((s) => s.userId === String(myUid))
          const myLastReadId = myReadState?.lastReadMessageId ?? 0
          setUnread(channelId, history.filter((m) => m.id > myLastReadId).length)

          setIsMember(true)

          // 채널을 열람했으니 커서를 최신 메시지까지 올림 (다른 탭/기기 동기화용)
          if (lastMessageIdRef.current != null) {
            sendChannelRead(channelId, lastMessageIdRef.current)
          }

          // 2. 멤버로 확인된 뒤에만 구독합니다.
          //    미참여 상태로 구독하면 어차피 messenger가 SUBSCRIBE를 거부합니다.
          return connectStomp(token).then(() => {
            if (cancelled) return

            unsubMessages = subscribeToChannel(channelId, (msg) => {
              addMessage(msg)
              lastMessageIdRef.current = msg.id
              // 채널이 열려있는 동안 수신한 메시지는 바로 읽은 것으로 처리
              sendChannelRead(channelId, msg.id)
            })

            unsubRead = subscribeToChannelRead(channelId, (state) => {
              // 다른 탭/기기에서 내가 먼저 읽은 경우 뱃지 동기화
              if (state.userId === String(myUid)) {
                resetUnread(channelId)
              }
            })
          })
        })
        .catch((err) => {
          if (cancelled) return

          // 403 = 이 채널의 멤버가 아님 → 게이트 UI로 전환
          if (err instanceof MessengerApiError && err.status === 403) {
            setIsMember(false)
            return
          }
          console.error(err)
        })

    // 채널 나갈 때 구독 해제 + 비우기
    return () => {
      cancelled = true
      unsubMessages?.()
      unsubRead?.()
      clearMessages()
    }
  }, [channelId])

    return {
        messages,
        isMember,
        unreadCount: unreadByChannel[channelId] ?? 0,
        markAsRead: () => {
            if (lastMessageIdRef.current != null) {
                sendChannelRead(channelId, lastMessageIdRef.current)
            }
            resetUnread(channelId)
        },
        sendMessage: (content: string) => sendChannelMessage(channelId, content),
    }
}
