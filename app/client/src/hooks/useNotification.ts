// PM 담당 — 알림 사이드바에서 사용
// useNotification()  ← 인자 없음. 로그인한 본인 알림을 구독합니다.
//
// 흐름: messenger.ts(초기 목록) + stomp.ts(실시간 수신) → notificationStore → NotificationSidebar
//
// 초대 알림은 REST(/api/invitations/received)로도 들어옵니다.
// MessengerNotifier가 전송 실패를 로그만 남기고 넘어가기 때문에(알림 유실 가능),
// REST 조회를 없애지 않고 둘 다 유지합니다. 같은 초대는 id 규칙이 같아서 자동으로 합쳐집니다.

import { useEffect } from 'react'
import { useNotificationStore, fromMessengerNotification } from '../store/notificationStore'
import { useAuthStore } from '../store/authStore'
import { connectStomp, subscribeToNotifications } from '../api/stomp'
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../api/messenger'

export const useNotification = () => {
  const { notifications, addNotifications, markRead, markAllRead } = useNotificationStore()

  useEffect(() => {
    const token = useAuthStore.getState().accessToken
    if (!token) return

    let unsub: (() => void) | undefined

    // 1. 초기 목록 (REST) — 접속 전에 쌓인 알림
    //    resolved(수락·거절이 끝난 초대)는 목록에서 제외
    fetchNotifications(token, { limit: 50 })
      .then((list) => {
        const items = list
          .filter((n) => !n.resolved)
          .map(fromMessengerNotification)
        if (items.length > 0) addNotifications(items)
      })
      .catch(console.error)

    // 2. STOMP 연결 후 실시간 구독
    connectStomp(token)
      .then(() => {
        unsub = subscribeToNotifications((n) => {
          if (n.resolved) return
          addNotifications([fromMessengerNotification(n)])
        })
      })
      .catch(console.error)

    return () => {
      unsub?.()
    }
  }, [])

  // 읽음 처리 — 로컬 상태를 먼저 바꾸고(즉시 반응), 서버에도 반영.
  // messengerId가 없는 알림(REST로만 들어온 친구 요청 등)은 로컬 처리만 합니다.
  const readNotification = (id: string) => {
    markRead(id)

    const target = notifications.find((n) => n.id === id)
    const token = useAuthStore.getState().accessToken
    if (target?.messengerId != null && token) {
      markNotificationRead(target.messengerId, token).catch(console.error)
    }
  }

  // 모두 읽음 — 서버에도 반영해야 새로고침 후에도 읽은 상태가 유지됩니다
  const readAllNotifications = () => {
    markAllRead()

    const token = useAuthStore.getState().accessToken
    if (token) {
      markAllNotificationsRead(token).catch(console.error)
    }
  }

  return { readNotification, readAllNotifications }
}
