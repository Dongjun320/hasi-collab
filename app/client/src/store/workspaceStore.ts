// PM 담당 — 사용법: const { currentWorkspace, channels } = useWorkspaceStore()

import { create } from 'zustand'
import { api } from "../api/client"

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
// 백엔드 ChannelData 대응 (박종서)
// parentId: null이면 최상위 채널, 값이 있으면 해당 채널의 하위 채널 (트리 구조)
// ※ 백엔드 id는 number. API 연결 시 매핑에서 문자열로 변환하거나 타입 통일 필요
interface Channel {
  id: number
  name: string
  parentId?: number | null  // 백엔드: 상위 채널 ID
  workspaceId?: number      // 백엔드
  isPrivate?: boolean       // 백엔드
}

interface WorkspaceState {
  currentWorkspace: Workspace | null
  channels: Channel[]
  workspaces: Workspace[]
  setWorkspace: (w: Workspace) => void
  setWorkspaces: (list: Workspace[]) => void
  setChannels: (c: Channel[]) => void
  addWorkspace: (w: Workspace) => void
  clear: () => void
  updateWorkspace: (w: Workspace) => void
  deleteWorkspace: (id: number) => void
  channelsByWorkspace: Record<number, Channel[]>
  setWorkspaceChannels: (workspaceId: number, list: Channel[]) => void
  addChannel: (workspaceId: number, c: Channel) => void
  updateChannel: (workspaceId: number, id: number, name: string) => void
  removeChannel: (workspaceId: number, id: number) => void
  wsLoading: boolean;
  wsError: string;
  fetchWorkspaces: () => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  currentWorkspace: null,
  channels: [],
  workspaces: [],
  channelsByWorkspace: {},   // 목데이터 없음 — API로만 채움

  // ── 워크스페이스 ──
  setWorkspace: (w) => set({ currentWorkspace: w }),
  setWorkspaces: (list) => set({ workspaces: list }),
  addWorkspace: (w) => set((s) => ({ workspaces: [...s.workspaces, w] })),
  updateWorkspace: (w) => set((s) => ({
    workspaces: s.workspaces.map((ws) => (ws.id === w.id ? w : ws)),
    currentWorkspace: s.currentWorkspace?.id === w.id ? w : s.currentWorkspace,
  })),
  deleteWorkspace: (id) => set((s) => {
    const remaining = s.workspaces.filter((w) => w.id !== id);
    const wasCurrent = s.currentWorkspace?.id === id;
    const nextChannels = { ...s.channelsByWorkspace };
    delete nextChannels[id];
    return {
      workspaces: remaining,
      channelsByWorkspace: nextChannels,
      currentWorkspace: wasCurrent ? (remaining[0] ?? null) : s.currentWorkspace,
    };
  }),

  // 워크스페이스 목록 조회 — 로그인 직후, 초대 수락 후 등에서 호출
  fetchWorkspaces: async () => {
    // 화면 표시용 그라디언트 (서버에 색 개념 없음)
    const DEFAULT_COLORS = [
      ["#A8E6B8", "#5CC87A"], ["#5CC87A", "#2E8B4F"],
      ["#A8E6B8", "#FFE66D"], ["#5CC87A", "#FFD93D"], ["#2E8B4F", "#5CC87A"],
    ]
    try {
      const { data, error } = await api.GET('/api/workspaces/me')
      if (error || !data?.success) {
        const msg = (error as any)?.error?.message
        set({ wsError: msg ?? '워크스페이스를 불러오지 못했습니다' })
        return
      }
      const mapped = (data.data ?? []).map((w, i) => ({
        id: w.id!,
        name: w.name ?? '',
        avatar: (w.name ?? '?').charAt(0),
        colors: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
        unread: false,
        role: w.role,
      }))
      set({ workspaces: mapped, wsError: '' })
    } catch (e) {
      console.error('워크스페이스 조회 실패:', e)
      set({ wsError: '서버에 연결할 수 없습니다' })
    } finally {
      set({ wsLoading: false })
    }
  },

  // ── 채널 ──
  setChannels: (c) => set({ channels: c }),
  setWorkspaceChannels: (workspaceId, list) => set((s) => ({
    channelsByWorkspace: { ...s.channelsByWorkspace, [workspaceId]: list },
  })),
  addChannel: (workspaceId, c) => set((s) => ({
    channelsByWorkspace: {
      ...s.channelsByWorkspace,
      [workspaceId]: [...(s.channelsByWorkspace[workspaceId] ?? []), c],
    },
  })),
  updateChannel: (workspaceId, id, name) => set((s) => ({
    channelsByWorkspace: {
      ...s.channelsByWorkspace,
      [workspaceId]: (s.channelsByWorkspace[workspaceId] ?? []).map((c) =>
          c.id === id ? { ...c, name } : c
      ),
    },
  })),
  removeChannel: (workspaceId, id) => set((s) => ({
    channelsByWorkspace: {
      ...s.channelsByWorkspace,
      [workspaceId]: (s.channelsByWorkspace[workspaceId] ?? []).filter((c) => c.id !== id),
    },
  })),
  wsLoading: true,
  wsError: '',
  clear: () => set({ currentWorkspace: null, channels: [], channelsByWorkspace: {} }),
}))