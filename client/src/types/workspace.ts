export interface Workspace {
  id: number
  name: string
  description: string | null
  imageUrl: string | null
}

export interface Channel {
  id: number
  name: string
  workspaceId: number
  isPrivate: boolean
}
