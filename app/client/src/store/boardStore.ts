// PM 담당 — 사용법: const { boards, tasks, fetchBoards, fetchTasks } = useBoardStore()
// 기준: 백엔드 BoardApi (GET/POST/PATCH/DELETE .../boards, .../tasks)
//
// 보드 목록은 백엔드가 이미 접근권한 기준으로 필터링해서 내려줌
// (OWNER=전체, 부서장=자기 보드, MEMBER=속한 보드) — 프론트에서 따로 거를 필요 없음

import { create } from 'zustand'
import { api } from '../api/client'

export interface Board {
  id: number
  workspaceId: number
  name: string
  ownerId: number
  createdAt: string
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW'

export interface Task {
  id: number
  boardId: number
  title: string
  content?: string
  startDate?: string   // YYYY-MM-DD
  dueDate?: string     // YYYY-MM-DD (종료일)
  status: TaskStatus
  assigneeId?: number
  priority?: TaskPriority
  createdAt: string
  updatedAt: string
}

export interface TaskInput {
  title?: string
  content?: string
  startDate?: string
  dueDate?: string
  status?: TaskStatus
  assigneeId?: number
  priority?: TaskPriority
}

export interface BoardMember {
  userId: number
  nickname: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
}

interface BoardState {
  boards: Board[]
  currentBoardId: number | null
  tasks: Task[]              // 현재 선택된 보드의 태스크만 보관
  boardMembers: BoardMember[] // 현재 선택된 보드의 부서원만 보관 (담당자 지정 후보)
  loading: boolean
  error: string

  setCurrentBoard: (id: number | null) => void
  fetchBoards: (workspaceId: number) => Promise<void>
  fetchTasks: (workspaceId: number, boardId: number) => Promise<void>
  fetchBoardMembers: (workspaceId: number, boardId: number) => Promise<void>
  createBoard: (workspaceId: number, body: { name: string; ownerId?: number }) => Promise<boolean>
  updateBoard: (workspaceId: number, boardId: number, body: { name?: string; ownerId?: number }) => Promise<boolean>
  addBoardMember: (workspaceId: number, boardId: number, userId: number) => Promise<boolean>
  removeBoardMember: (workspaceId: number, boardId: number, userId: number) => Promise<boolean>
  createTask: (workspaceId: number, boardId: number, body: TaskInput & { title: string; status: TaskStatus }) => Promise<boolean>
  updateTask: (workspaceId: number, boardId: number, taskId: number, body: TaskInput) => Promise<boolean>
  deleteTask: (workspaceId: number, boardId: number, taskId: number) => Promise<boolean>
  clear: () => void
}

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: [],
  currentBoardId: null,
  tasks: [],
  boardMembers: [],
  loading: false,
  error: '',

  setCurrentBoard: (id) => set({ currentBoardId: id, tasks: [], boardMembers: [] }),

  fetchBoards: async (workspaceId) => {
    set({ loading: true, error: '' })
    try {
      const { data, error } = await api.GET('/api/workspaces/{workspaceId}/boards', {
        params: { path: { workspaceId } },
      })
      if (error || !data?.success) {
        set({ error: '보드 목록을 불러오지 못했습니다' })
        return
      }
      const boards = (data.data ?? []) as Board[]
      set((s) => ({
        boards,
        // 기존 선택이 새 목록에 없으면(권한 상실 등) 첫 보드로, 없으면 null
        currentBoardId: boards.some((b) => b.id === s.currentBoardId)
            ? s.currentBoardId
            : boards[0]?.id ?? null,
      }))
    } catch (e) {
      console.error('보드 목록 조회 실패:', e)
      set({ error: '서버에 연결할 수 없습니다' })
    } finally {
      set({ loading: false })
    }
  },

  fetchTasks: async (workspaceId, boardId) => {
    set({ loading: true, error: '' })
    try {
      const { data, error } = await api.GET('/api/workspaces/{workspaceId}/boards/{boardId}/tasks', {
        params: { path: { workspaceId, boardId } },
      })
      if (error || !data?.success) {
        set({ error: '태스크를 불러오지 못했습니다' })
        return
      }
      set({ tasks: (data.data ?? []) as Task[] })
    } catch (e) {
      console.error('태스크 조회 실패:', e)
      set({ error: '서버에 연결할 수 없습니다' })
    } finally {
      set({ loading: false })
    }
  },

  fetchBoardMembers: async (workspaceId, boardId) => {
    try {
      const { data, error } = await api.GET('/api/workspaces/{workspaceId}/boards/{boardId}/members', {
        params: { path: { workspaceId, boardId } },
      })
      if (error || !data?.success) return
      set({ boardMembers: (data.data ?? []) as BoardMember[] })
    } catch (e) {
      console.error('부서원 조회 실패:', e)
    }
  },

  createBoard: async (workspaceId, body) => {
    try {
      const { data, error } = await api.POST('/api/workspaces/{workspaceId}/boards', {
        params: { path: { workspaceId } },
        body,
      })
      if (error || !data?.success || !data.data) return false
      const board = data.data as Board
      set((s) => ({ boards: [...s.boards, board], currentBoardId: board.id, tasks: [], boardMembers: [] }))
      return true
    } catch (e) {
      console.error('보드 생성 실패:', e)
      return false
    }
  },

  updateBoard: async (workspaceId, boardId, body) => {
    try {
      const { data, error } = await api.PATCH('/api/workspaces/{workspaceId}/boards/{boardId}', {
        params: { path: { workspaceId, boardId } },
        body,
      })
      if (error || !data?.success || !data.data) return false
      const updated = data.data as Board
      set((s) => ({ boards: s.boards.map((b) => (b.id === boardId ? updated : b)) }))
      return true
    } catch (e) {
      console.error('보드 수정 실패:', e)
      return false
    }
  },

  addBoardMember: async (workspaceId, boardId, userId) => {
    try {
      const { error } = await api.POST('/api/workspaces/{workspaceId}/boards/{boardId}/members', {
        params: { path: { workspaceId, boardId } },
        body: { userId },
      })
      if (error) return false
      await get().fetchBoardMembers(workspaceId, boardId)
      return true
    } catch (e) {
      console.error('부서원 추가 실패:', e)
      return false
    }
  },

  removeBoardMember: async (workspaceId, boardId, userId) => {
    try {
      const { error } = await api.DELETE('/api/workspaces/{workspaceId}/boards/{boardId}/members/{userId}', {
        params: { path: { workspaceId, boardId, userId } },
      })
      if (error) return false
      set((s) => ({ boardMembers: s.boardMembers.filter((m) => m.userId !== userId) }))
      return true
    } catch (e) {
      console.error('부서원 제외 실패:', e)
      return false
    }
  },

  createTask: async (workspaceId, boardId, body) => {
    try {
      const { data, error } = await api.POST('/api/workspaces/{workspaceId}/boards/{boardId}/tasks', {
        params: { path: { workspaceId, boardId } },
        body,
      })
      if (error || !data?.success || !data.data) return false
      set((s) => ({ tasks: [...s.tasks, data.data as Task] }))
      return true
    } catch (e) {
      console.error('태스크 생성 실패:', e)
      return false
    }
  },

  updateTask: async (workspaceId, boardId, taskId, body) => {
    try {
      const { data, error } = await api.PUT('/api/workspaces/{workspaceId}/boards/{boardId}/tasks/{taskId}', {
        params: { path: { workspaceId, boardId, taskId } },
        body,
      })
      if (error || !data?.success || !data.data) return false
      const updated = data.data as Task
      set((s) => ({ tasks: s.tasks.map((t) => (t.id === taskId ? updated : t)) }))
      return true
    } catch (e) {
      console.error('태스크 수정 실패:', e)
      return false
    }
  },

  deleteTask: async (workspaceId, boardId, taskId) => {
    try {
      const { error } = await api.DELETE('/api/workspaces/{workspaceId}/boards/{boardId}/tasks/{taskId}', {
        params: { path: { workspaceId, boardId, taskId } },
      })
      if (error) return false
      set((s) => ({ tasks: s.tasks.filter((t) => t.id !== taskId) }))
      return true
    } catch (e) {
      console.error('태스크 삭제 실패:', e)
      return false
    }
  },

  clear: () => set({ boards: [], currentBoardId: null, tasks: [], boardMembers: [], error: '' }),
}))

// 보드 선택 UI에서 배지 표시용 (부서장 / OWNER 권한 조회 / 일반 부서원)
export const boardBadgeOf = (
    board: Board,
    myUid: number | undefined,
    myWorkspaceRole: 'OWNER' | 'ADMIN' | 'MEMBER' | undefined
): string | null => {
  if (myUid != null && board.ownerId === myUid) return '부서장'
  if (myWorkspaceRole === 'OWNER' && board.ownerId !== myUid) return 'OWNER 권한'
  return null
}
