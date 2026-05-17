// 🔴 PM 담당 — 사용법: const { currentWorkspace, channels } = useWorkspaceStore()

import { create } from 'zustand'

interface Workspace { id: number; name: string }
interface Channel { id: number; name: string }

interface WorkspaceState {
  currentWorkspace: Workspace | null
  channels: Channel[]
  setWorkspace: (w: Workspace) => void
  setChannels: (c: Channel[]) => void
  clear: () => void
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  currentWorkspace: null,
  channels: [],
  setWorkspace: (w) => set({ currentWorkspace: w }),
  setChannels: (c) => set({ channels: c }),
  clear: () => set({ currentWorkspace: null, channels: [] }),
}))
