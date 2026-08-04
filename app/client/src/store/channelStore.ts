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
  messages: Message[]                          // 열린 채널 메시지
  unreadByChannel: Record<number, number>      // ★ 채널별 안읽음 개수
  addMessage: (msg: Message) => void
  setMessages: (msgs: Message[]) => void
  updateMessage: (id: number, content: string) => void
  deleteMessage: (id: number) => void
  // ── unread (채널별) ──
  setUnread: (channelId: number, count: number) => void
  incrementUnread: (channelId: number) => void
  resetUnread: (channelId: number) => void
  setUnreadBatch: (map: Record<number, number>) => void
  clearMessages: () => void
}

export const useChannelStore = create<ChannelState>((set) => ({
  messages: [],
  unreadByChannel: {},
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

  // 특정 채널 안읽음 수 지정 (진입 시 계산값)
  setUnread: (channelId, count) => set((s) => ({
    unreadByChannel: { ...s.unreadByChannel, [channelId]: count },
  })),
  // 안 열린 채널에 새 메시지 → +1
  incrementUnread: (channelId) => set((s) => ({
    unreadByChannel: {
      ...s.unreadByChannel,
      [channelId]: (s.unreadByChannel[channelId] ?? 0) + 1,
    },
  })),
  // 채널 읽음 → 0
  resetUnread: (channelId) => set((s) => ({
    unreadByChannel: { ...s.unreadByChannel, [channelId]: 0 },
  })),
  // 진입 시 여러 채널 한 번에 세팅
  setUnreadBatch: (map) => set((s) => ({
    unreadByChannel: { ...s.unreadByChannel, ...map },
  })),

  // 채널 나갈 때 messages만 비움 — unread는 채널별로 유지(읽음 처리는 resetUnread로)
  clearMessages: () => set({ messages: [] }),
}))