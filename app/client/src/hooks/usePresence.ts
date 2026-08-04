// PM 담당 — presence(온라인/오프라인) 구독 훅
// 흐름: messenger.ts(fetchOnlineUsers, 초기 스냅샷) + stomp.ts(subscribeTo*Presence, 실시간) → presenceStore
//
// useWorkspacePresence: 같은 워크스페이스 멤버들의 온/오프라인 (/topic/workspace.{id}.presence)
// useFriendPresence:    친구들의 온/오프라인, 워크스페이스 공유 여부 무관 (/user/queue/presence)

import { useEffect, useRef } from 'react'
import { usePresenceStore } from '../store/presenceStore'
import { useAuthStore } from '../store/authStore'
import { connectStomp, subscribeToWorkspacePresence, subscribeToFriendPresence } from '../api/stomp'
import { fetchOnlineUsers } from '../api/messenger'

export function useWorkspacePresence(workspaceId: number | null, memberIds: (number | string)[]) {
  const { setOnline, updatePresence } = usePresenceStore()
  // effect 재실행 없이 최신 memberIds를 읽기 위함 (매 렌더마다 새 배열이 와도 재구독 안 함)
  const memberIdsRef = useRef(memberIds)
  memberIdsRef.current = memberIds

  useEffect(() => {
    const token = useAuthStore.getState().accessToken
    if (!token || !workspaceId) return

    let unsub: (() => void) | undefined

    fetchOnlineUsers(memberIdsRef.current, token)
        .then(({ onlineUserIds }) => setOnline(memberIdsRef.current, onlineUserIds))
        .catch(console.error)

    connectStomp(token)
        .then(() => {
          unsub = subscribeToWorkspacePresence(workspaceId, (event) => {
            updatePresence(event.userId, event.online)
          })
        })
        .catch(console.error)

    return () => {
      unsub?.()
    }
    // memberIds.length 변화(멤버 입장/퇴장) 시 스냅샷 재조회, 구독 자체는 workspaceId 기준 유지
  }, [workspaceId, memberIds.length])
}

export function useFriendPresence(friendIds: (number | string)[]) {
  const { setOnline, updatePresence } = usePresenceStore()
  const friendIdsRef = useRef(friendIds)
  friendIdsRef.current = friendIds

  useEffect(() => {
    const token = useAuthStore.getState().accessToken
    if (!token || friendIdsRef.current.length === 0) return

    let unsub: (() => void) | undefined

    fetchOnlineUsers(friendIdsRef.current, token)
        .then(({ onlineUserIds }) => setOnline(friendIdsRef.current, onlineUserIds))
        .catch(console.error)

    connectStomp(token)
        .then(() => {
          unsub = subscribeToFriendPresence((event) => {
            updatePresence(event.userId, event.online)
          })
        })
        .catch(console.error)

    return () => {
      unsub?.()
    }
    // friendIds 개수가 바뀔 때만 재구독 (매 렌더 재구독 방지)
  }, [friendIds.length])
}
