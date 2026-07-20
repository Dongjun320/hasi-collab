// PM 담당 — 사용법: const { messages, addMessage } = useChatStore()
// 기준: api/stomp.ts 의 ChannelOutboundMessage (openapi 아님)

import { create } from 'zustand'

interface Message {
  id: number
  channelId: number
  sender: string              // ← senderName 에서 변경
  content: string | null      // ← 삭제 시 null 가능
  createdAt: string
  isDeleted: boolean          // ← 추가 (soft delete 표시)
}

interface ChatState {
  messages: Message[]
  addMessage: (msg: Message) => void
  setMessages: (msgs: Message[]) => void
  updateMessage: (id: number, content: string) => void   // ← 추가
  deleteMessage: (id: number) => void                     // ← 추가
  clearMessages: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setMessages: (msgs) => set({ messages: msgs }),
  updateMessage: (id, content) => set((s) => ({
    messages: s.messages.map((m) => (m.id === id ? { ...m, content } : m)),
  })),
  deleteMessage: (id) => set((s) => ({
    messages: s.messages.map((m) =>
        m.id === id ? { ...m, isDeleted: true, content: null } : m
    ),
  })),
  clearMessages: () => set({ messages: [] }),
}))