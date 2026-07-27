// PM 담당 — 전역 토스트
// 컴포넌트 안:  const { toasts } = useToastStore()  (보통 <Toaster/>만 씀)
// 어디서든:     import { toast } from '../store/toastStore'
//               toast.success('삭제되었습니다')
//
// 각 화면이 각자 들고 있던 toast state + triggerToast + <Toast/> 를
// 이 store 하나로 대체합니다. #27(알림 토스트 전면 도입)의 선행 작업.

import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: number
  message: string
  type: ToastType
}

interface ToastState {
  toasts: ToastItem[]
  show: (message: string, type?: ToastType) => void
  remove: (id: number) => void
}

let nextId = 1

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (message, type = 'info') =>
    set((s) => ({ toasts: [...s.toasts, { id: nextId++, message, type }] })),
  remove: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

// 컴포넌트 밖(핸들러·hook 등)에서도 호출할 수 있는 편의 함수
export const toast = {
  success: (message: string) => useToastStore.getState().show(message, 'success'),
  error:   (message: string) => useToastStore.getState().show(message, 'error'),
  info:    (message: string) => useToastStore.getState().show(message, 'info'),
  warning: (message: string) => useToastStore.getState().show(message, 'warning'),
}
