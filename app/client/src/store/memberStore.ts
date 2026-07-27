// PM 담당 — 사용법: const { members, setMembers } = useMemberStore()
// 기준: 박종서 openapi WorkspaceMemberData
//   API: GET /api/workspaces/{workspaceId}/members
// 용도: 멤버 목록 화면, 채팅 sender(uid) → nickname 매핑, 사이드바 등에서 공용

import { create } from 'zustand'

export interface WorkspaceMember {
  userId: number
  nickname: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  // 온라인 여부는 이 store가 아니라 presenceStore(usePresenceStore.isOnline)로 관리
}

interface MemberState {
  members: WorkspaceMember[]
  setMembers: (list: WorkspaceMember[]) => void
  clear: () => void
}

export const useMemberStore = create<MemberState>((set) => ({
  members: [],
  setMembers: (list) => set({ members: list }),
  clear: () => set({ members: [] }),
}))
