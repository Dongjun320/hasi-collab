// PM 담당 — 사용법: const { currentWorkspace, channels } = useWorkspaceStore()

import { create } from 'zustand'

<<<<<<< HEAD
interface Workspace { id: number; name: string; avatar: string; colors: string[]; unread: boolean; role?: string;  }
=======
// 백엔드 필드(role, iconUrl) = API 응답(GET /workspaces/me)에서 옴
// 장식 필드(avatar, colors, unread) = 화면 표시용. API 연결 시 매핑에서 채움
interface Workspace {
  id: number
  name: string
  avatar: string
  colors: string[]
  unread: boolean
  role?: string           // 백엔드: OWNER | ADMIN | MEMBER
  iconUrl?: string | null // 백엔드
}
>>>>>>> dev
interface Channel { id: string; name: string }

interface WorkspaceState {
  currentWorkspace: Workspace | null
  channels: Channel[]
  workspaces: Workspace[]
  setWorkspace: (w: Workspace) => void
<<<<<<< HEAD
  setWorkspaces: (list: Workspace[]) => void
=======
  setWorkspaces: (list: Workspace[]) => void   // API 목록 응답을 통째로 세팅 (김상현 연결용)
>>>>>>> dev
  setChannels: (c: Channel[]) => void
  addWorkspace: (w: Workspace) => void
  clear: () => void
  updateWorkspace: (w: Workspace) => void
  deleteWorkspace: (id: number) => void
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  currentWorkspace: null,
  channels: [],
  workspaces: [
    { id: 1, name: "디자인팀", avatar: "디", colors: ["#A8E6B8", "#5CC87A"], unread: true },
    { id: 2, name: "개발팀",   avatar: "개", colors: ["#5CC87A", "#2E8B4F"], unread: true },
    { id: 3, name: "마케팅팀", avatar: "마", colors: ["#A8E6B8", "#FFE66D"], unread: false },
    { id: 4, name: "영업팀",   avatar: "영", colors: ["#5CC87A", "#FFD93D"], unread: true },
    { id: 5, name: "기획팀",   avatar: "기", colors: ["#2E8B4F", "#5CC87A"], unread: false },
  ],
  setWorkspace: (w) => set({ currentWorkspace: w }),
  setWorkspaces: (list) => set({ workspaces: list }),
  setChannels: (c) => set({ channels: c }),
  addWorkspace: (w) => set((s) =>({ workspaces: [...s.workspaces, w] })),
  clear: () => set({ currentWorkspace: null, channels: [] }),
  updateWorkspace: (w) => set((s) => ({
    workspaces: s.workspaces.map((ws) => (ws.id === w.id ? w : ws)),
    currentWorkspace: s.currentWorkspace?.id === w.id ? w : s.currentWorkspace,
  })),
  deleteWorkspace: (id) => set((s) => {
    const remaining = s.workspaces.filter((w) => w.id !== id);
    const wasCurrent = s.currentWorkspace?.id === id;
    return {
      workspaces: remaining,
      currentWorkspace: wasCurrent ? (remaining[0] ?? null) : s.currentWorkspace,
    };
  })

}))
