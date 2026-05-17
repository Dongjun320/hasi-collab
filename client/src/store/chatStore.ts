// 🔴 PM 담당 — 사용법: const { messages, addMessage } = useChatStore()

import { create } from 'zustand'

interface Message {
  id: number
  channelId: number
  senderName: string
  content: string
  createdAt: string
}

interface ChatState {
  messages: Message[]
  addMessage: (msg: Message) => void
  setMessages: (msgs: Message[]) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setMessages: (msgs) => set({ messages: msgs }),
  clearMessages: () => set({ messages: [] }),
}))
