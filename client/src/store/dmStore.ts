// 🔴 PM 담당 — 사용법: const { dmMessages, addDmMessage } = useDmStore()

import { create } from 'zustand'

interface DmMessage {
  id: number
  senderName: string
  content: string
  isRead: boolean
  createdAt: string
}

interface DmState {
  dmMessages: DmMessage[]
  addDmMessage: (msg: DmMessage) => void
  setDmMessages: (msgs: DmMessage[]) => void
  clearDmMessages: () => void
}

export const useDmStore = create<DmState>((set) => ({
  dmMessages: [],
  addDmMessage: (msg) => set((s) => ({ dmMessages: [...s.dmMessages, msg] })),
  setDmMessages: (msgs) => set({ dmMessages: msgs }),
  clearDmMessages: () => set({ dmMessages: [] }),
}))
