export interface Message {
  id: number
  channelId: number
  senderId: number
  senderName: string
  content: string
  createdAt: string
}

export interface DmMessage {
  id: number
  dmRoomId: number
  senderId: number
  senderName: string
  content: string
  isRead: boolean
  createdAt: string
}
