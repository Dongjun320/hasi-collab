// PM 담당 — 사용법: const { dmMessages, addDmMessage } = useDmStore()
// 기준: api/stomp.ts 의 DmOutboundMessage (openapi 아님)

import { create } from 'zustand'

interface DmMessage {
  id: number
  sender: string              // ← senderName 에서 변경
  receiver: string            // ← 추가 (DM은 상대 UID 필요)
  content: string | null      // ← 삭제 시 null 가능
  createdAt: string
  isDeleted: boolean          // ← 추가 (isRead 는 제거)
}

interface DmState {
  dmMessages: DmMessage[]
  addDmMessage: (msg: DmMessage) => void
  setDmMessages: (msgs: DmMessage[]) => void
  updateDmMessage: (id: number, content: string) => void   // ← 추가
  deleteDmMessage: (id: number) => void                     // ← 추가
  clearDmMessages: () => void
}

export const useDmStore = create<DmState>((set) => ({
  dmMessages: [],
  addDmMessage: (msg) => set((s) => ({ dmMessages: [...s.dmMessages, msg] })),
  setDmMessages: (msgs) => set({ dmMessages: msgs }),
  updateDmMessage: (id, content) => set((s) => ({
    dmMessages: s.dmMessages.map((m) => (m.id === id ? { ...m, content } : m)),
  })),
  deleteDmMessage: (id) => set((s) => ({
    dmMessages: s.dmMessages.map((m) =>
        m.id === id ? { ...m, isDeleted: true, content: null } : m
    ),
  })),
  clearDmMessages: () => set({ dmMessages: [] }),
}))
