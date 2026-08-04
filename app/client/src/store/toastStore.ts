// PM 담당 — 전역 토스트 (한 번에 1개 표시)
// 어디서든:  import { toast } from '../store/toastStore'
//            toast.success('삭제되었습니다')
//
// Toast.tsx가 이미 "화면에 1개 고정(fixed)"으로 뜨는 컴포넌트라,
// 여러 개 쌓는 Toaster 없이 store로 "지금 뜰 토스트 1개"만 관리합니다.
// App.tsx에서 <Toast/>를 store와 연결해 렌더합니다.

import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastState {
  current: { message: string; type: ToastType } | null
  show: (message: string, type?: ToastType) => void
  hide: () => void
}

export const useToastStore = create<ToastState>((set) => ({
  current: null,
  show: (message, type = 'info') => set({ current: { message, type } }),
  hide: () => set({ current: null }),
}))

// 컴포넌트 밖(핸들러·hook 등)에서도 호출할 수 있는 편의 함수
export const toast = {
  success: (message: string) => useToastStore.getState().show(message, 'success'),
  error:   (message: string) => useToastStore.getState().show(message, 'error'),
  info:    (message: string) => useToastStore.getState().show(message, 'info'),
  warning: (message: string) => useToastStore.getState().show(message, 'warning'),
}
