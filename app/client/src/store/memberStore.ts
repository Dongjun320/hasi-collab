// PM 담당 — 사용법: const { members, setMembers } = useMemberStore()
// 기준: 박종서 openapi WorkspaceMemberData
//   API: GET /api/workspaces/{workspaceId}/members
// 용도: 멤버 목록 화면, 채팅 sender(uid) → nickname 매핑, 사이드바 등에서 공용

import { create } from 'zustand'
import { api } from '../api/client'

export interface WorkspaceMember {
  userId: number
  nickname: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  // 온라인 여부는 이 store가 아니라 presenceStore(usePresenceStore.isOnline)로 관리
}

interface MemberState {
  members: WorkspaceMember[]
  setMembers: (list: WorkspaceMember[]) => void
  fetchMembers: (workspaceId: number) => Promise<void>
  clear: () => void
}

export const useMemberStore = create<MemberState>((set) => ({
  members: [],
  setMembers: (list) => set({ members: list }),

  fetchMembers: async (workspaceId) => {
    try {
      const { data, error } = await api.GET('/api/workspaces/{workspaceId}/members', {
        params: { path: { workspaceId } },
      })
      if (error || !data?.success) return
      set({
        members: (data.data ?? []).map((m) => ({
          userId: m.userId!,
          nickname: m.nickname ?? '',
          role: m.role ?? 'MEMBER',
        })),
      })
    } catch (e) {
      console.error('멤버 조회 실패:', e)
    }
  },

  clear: () => set({ members: [] }),
}))
