// messenger(8081)의 REST 히스토리 엔드포인트 호출.
// service(8080)용 openapi-fetch 클라이언트(client.ts)와는 별개 — messenger는 아직 OpenAPI 스펙이 없어 plain fetch 사용.
// Vite 프록시는 이미 /api -> service로 매핑되어 있으므로, 충돌을 피하기 위해 messenger는 절대 URL로 직접 호출합니다.

import type { ChannelOutboundMessage, DmOutboundMessage } from './stomp';

const MESSENGER_API_BASE = 'http://localhost:8081/messenger-api';

async function getJson<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`${MESSENGER_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`messenger-api request failed: ${response.status} ${path}`);
  }
  return response.json() as Promise<T>;
}

export function fetchChannelHistory(
  channelId: number | string,
  token: string
): Promise<ChannelOutboundMessage[]> {
  return getJson<ChannelOutboundMessage[]>(`/channels/${channelId}/messages`, token);
}

export function fetchDmHistory(
  peerId: number | string,
  token: string
): Promise<DmOutboundMessage[]> {
  return getJson<DmOutboundMessage[]>(`/dm/${peerId}/messages`, token);
}
