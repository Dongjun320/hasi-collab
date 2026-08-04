// messenger(8081)의 REST 히스토리 엔드포인트 호출.
// service(8080)용 openapi-fetch 클라이언트(client.ts)와는 별개 — messenger는 아직 OpenAPI 스펙이 없어 plain fetch 사용.
// Vite 프록시는 이미 /api -> service로 매핑되어 있으므로, 충돌을 피하기 위해 messenger는 절대 URL로 직접 호출합니다.

import type {
  ChannelOutboundMessage,
  ChannelReadState,
  DmOutboundMessage,
  MessengerNotification,
} from './stomp';

const MESSENGER_API_BASE =
  import.meta.env.VITE_MESSENGER_API_BASE_URL ??
  'http://localhost:8081/messenger-api';

export class MessengerApiError extends Error {
  constructor(readonly status: number, readonly path: string) {
    super(`messenger-api request failed: ${status} ${path}`);
    this.name = 'MessengerApiError';
  }
}

async function getJson<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`${MESSENGER_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new MessengerApiError(response.status, path);
  }
  return response.json() as Promise<T>;
}

async function patchNoContent(path: string, token: string): Promise<void> {
  const response = await fetch(`${MESSENGER_API_BASE}${path}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new MessengerApiError(response.status, path);
  }
}

export function fetchChannelHistory(
  channelId: number | string,
  token: string
): Promise<ChannelOutboundMessage[]> {
  return getJson<ChannelOutboundMessage[]>(`/channels/${channelId}/messages`, token);
}

export function fetchChannelReadStates(
  channelId: number | string,
  token: string
): Promise<ChannelReadState[]> {
  return getJson<ChannelReadState[]>(`/channels/${channelId}/read-states`, token);
}

// 현재 온라인 상태 가져옴
export function fetchOnlineUsers(
  userIds: (number | string)[],
  token: string
): Promise<{ onlineUserIds: string[] }> {
  if (userIds.length === 0) {
    return Promise.resolve({ onlineUserIds: [] });
  }
  return getJson<{ onlineUserIds: string[] }>(`/presence?userIds=${userIds.join(',')}`, token);
}

export function fetchDmHistory(
  peerId: number | string,
  token: string
): Promise<DmOutboundMessage[]> {
  return getJson<DmOutboundMessage[]>(`/dm/${peerId}/messages`, token);
}

export type NotificationQuery = {
  unreadOnly?: boolean;
  includeResolved?: boolean;
  limit?: number;
};

// Notification 가져오기
export function fetchNotifications(
  token: string,
  query: NotificationQuery = {}
): Promise<MessengerNotification[]> {
  const params = new URLSearchParams();
  if (query.unreadOnly !== undefined) params.set('unreadOnly', String(query.unreadOnly));
  if (query.includeResolved !== undefined) {
    params.set('includeResolved', String(query.includeResolved));
  }
  if (query.limit !== undefined) params.set('limit', String(query.limit));

  const search = params.toString();
  return getJson<MessengerNotification[]>(
    search ? `/notifications?${search}` : '/notifications',
    token
  );
}

export function fetchUnreadNotificationCount(token: string): Promise<{ unreadCount: number }> {
  return getJson<{ unreadCount: number }>('/notifications/unread-count', token);
}

export function markNotificationRead(id: number, token: string): Promise<void> {
  return patchNoContent(`/notifications/${id}/read`, token);
}

export function markAllNotificationsRead(token: string): Promise<void> {
  return patchNoContent('/notifications/read-all', token);
}
