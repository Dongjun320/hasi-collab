// PM 담당 — 사용법: const { messages, addMessage } = useChannelStore()
// 기준: api/stomp.ts 의 ChannelOutboundMessage (openapi 아님)

import { create } from 'zustand'

interface Message {
  id: number
  channelId: number
  sender: string              // 보낸 사람 (uid 문자열)
  content: string | null      // 삭제 시 null 가능
  createdAt: string
  isDeleted: boolean          // soft delete 표시
}

interface ChannelState {
  messages: Message[]
  unreadCount: number
  addMessage: (msg: Message) => void
  setMessages: (msgs: Message[]) => void
  updateMessage: (id: number, content: string) => void
  deleteMessage: (id: number) => void
  setUnreadCount: (count: number) => void
  resetUnread: () => void
  clearMessages: () => void
}

export const useChannelStore = create<ChannelState>((set) => ({
  messages: [],
  unreadCount: 0,
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
  setUnreadCount: (count) => set({ unreadCount: count }),
  resetUnread: () => set({ unreadCount: 0 }),
  clearMessages: () => set({ messages: [], unreadCount: 0 }),
}))
