// PM 담당 파일
// 사용법: const { isSidebarOpen, toggleSidebar } = useUiStore()

import { create } from 'zustand'

// 오른쪽 rail에 띄울 패널 종류 (null = 접힘)
export type RightPanel = 'friend' | 'calendar' | 'notification' |  null

interface UiState {
  isSidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void

  // 오른쪽 rail: 지금 열려있는 패널 하나만 담음 (null = 접힘)
  activeRightPanel: RightPanel
  toggleRightPanel: (panel: Exclude<RightPanel, null>) => void
  closeRightPanel: () => void

  // ✅ PM 피드백 반영: 다이렉트 메시지(DM) 팝업 상대 ID 관리 (단일 창)
  activeDmPeerId: number | null
  setActiveDmPeerId: (id: number | null) => void
}

export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () =>
      set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  activeRightPanel: null, // 기본값: 접힘
  toggleRightPanel: (panel) =>
      set((state) => ({
        // 이미 그 패널이 열려있으면 접고(null), 아니면 그 패널로 전환
        activeRightPanel: state.activeRightPanel === panel ? null : panel,
      })),
  closeRightPanel: () => set({ activeRightPanel: null }),

  // ✅ DM 팝업 상태 초기값 및 업데이트 함수 추가
  activeDmPeerId: null,
  setActiveDmPeerId: (id) => set({ activeDmPeerId: id }),
}))