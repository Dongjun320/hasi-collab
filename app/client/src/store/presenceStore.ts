// PM 담당 — Redis+STOMP 기반 접속 상태(온라인/오프라인) 전역 저장소
// 사용법: const isOnline = usePresenceStore((s) => s.isOnline(userId))
//
// 백엔드(messenger PresenceService)는 boolean online/offline만 관리함(AWAY 없음).
// memberStore/friendStore의 statusCode/status 필드는 백엔드가 더 이상 채워주지 않으므로
// 온라인 표시는 전부 이 store를 통해서 함.

import { create } from 'zustand'

interface PresenceState {
  onlineUserIds: Set<string>
  // queriedIds: 이번에 조회를 요청한 대상 전체 / onlineIds: 그중 온라인으로 확인된 대상
  // (전체를 덮어쓰면 워크스페이스/친구 두 훅이 서로의 결과를 지워버리므로, 조회한 범위만 반영)
  setOnline: (queriedIds: (number | string)[], onlineIds: (number | string)[]) => void
  updatePresence: (userId: number | string, online: boolean) => void
  isOnline: (userId: number | string) => boolean
  clear: () => void
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  onlineUserIds: new Set(),

  setOnline: (queriedIds, onlineIds) => set((s) => {
    const next = new Set(s.onlineUserIds)
    const online = new Set(onlineIds.map(String))
    for (const id of queriedIds.map(String)) {
      if (online.has(id)) next.add(id)
      else next.delete(id)
    }
    return { onlineUserIds: next }
  }),

  // STOMP presence 이벤트로 단건 갱신
  updatePresence: (userId, online) => set((s) => {
    const next = new Set(s.onlineUserIds)
    const id = String(userId)
    if (online) next.add(id)
    else next.delete(id)
    return { onlineUserIds: next }
  }),

  isOnline: (userId) => get().onlineUserIds.has(String(userId)),

  clear: () => set({ onlineUserIds: new Set() }),
}))

// 온라인 점 표시용 공용 헬퍼 (FriendSidebar, ChannelsPage 등에서 공용)
export const presenceDotColor = (online: boolean) => (online ? 'bg-green-400' : 'bg-gray-400')
export const presenceLabel = (online: boolean) => (online ? '온라인' : '오프라인')
