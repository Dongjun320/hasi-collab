import { Client, IMessage } from '@stomp/stompjs';

const MESSENGER_WS_URL = 'ws://localhost:8081/ws';

let client: Client | null = null;
let connectPromise: Promise<void> | null = null;

// 이미 연결된 client가 있으면 그대로 재사용합니다.
export function connectStomp(token: string): Promise<void> {
  if (client?.connected) {
    return Promise.resolve();
  }
  if (connectPromise) {
    return connectPromise;
  }

  const stompClient = new Client({
    brokerURL: MESSENGER_WS_URL,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  connectPromise = new Promise<void>((resolve, reject) => {
    stompClient.onConnect = () => {
      resolve();
    };
    stompClient.onStompError = (frame) => {
      console.error('STOMP 브로커 에러:', frame.headers['message'], frame.body);
      reject(new Error(frame.headers['message'] ?? 'STOMP connection error'));
    };
    stompClient.onWebSocketError = (event) => {
      console.error('STOMP 웹소켓 에러:', event);
    };
  });

  client = stompClient;
  stompClient.activate();
  return connectPromise;
}

export function disconnectStomp(): void {
  client?.deactivate();
  client = null;
  connectPromise = null;
}

function requireClient(): Client {
  if (!client) {
    throw new Error('STOMP client is not connected. Call connectStomp(token) first.');
  }
  return client;
}

function parseBody<T>(message: IMessage): T {
  return JSON.parse(message.body) as T;
}

export type ChannelOutboundMessage = {
  id: number;
  channelId: number;
  content: string | null;
  sender: string;
  createdAt: string;
  isDeleted: boolean;
};

export type DmOutboundMessage = {
  id: number;
  content: string | null;
  sender: string;
  receiver: string;
  createdAt: string;
  isDeleted: boolean;
};

// /topic/channel.{channelId} 구독. 반환된 함수로 구독 해제합니다.
export function subscribeToChannel(
  channelId: number | string,
  onMessage: (message: ChannelOutboundMessage) => void
): () => void {
  const subscription = requireClient().subscribe(`/topic/channel.${channelId}`, (message) => {
    onMessage(parseBody<ChannelOutboundMessage>(message));
  });
  return () => subscription.unsubscribe();
}

// /topic/dm.{min}.{max} 구독 (양쪽이 동일한 토픽명을 계산할 수 있도록 정렬된 uid 쌍 사용)
export function subscribeToDm(
  myUid: number,
  peerUid: number,
  onMessage: (message: DmOutboundMessage) => void
): () => void {
  const topic = `/topic/dm.${Math.min(myUid, peerUid)}.${Math.max(myUid, peerUid)}`;
  const subscription = requireClient().subscribe(topic, (message) => {
    onMessage(parseBody<DmOutboundMessage>(message));
  });
  return () => subscription.unsubscribe();
}

export function sendChannelMessage(channelId: number | string, content: string): void {
  requireClient().publish({
    destination: `/app/channel/${channelId}/send`,
    body: JSON.stringify({ content }),
  });
}

export function updateChannelMessage(channelId: number | string, id: number, content: string): void {
  requireClient().publish({
    destination: `/app/channel/${channelId}/update`,
    body: JSON.stringify({ id, content }),
  });
}

export function deleteChannelMessage(channelId: number | string, id: number): void {
  requireClient().publish({
    destination: `/app/channel/${channelId}/delete`,
    body: JSON.stringify(id),
  });
}

export function sendDmMessage(receiverId: number, content: string): void {
  requireClient().publish({
    destination: `/app/dm/send`,
    body: JSON.stringify({ receiverId, content }),
  });
}

export function updateDmMessage(id: number, content: string): void {
  requireClient().publish({
    destination: `/app/dm/${id}/update`,
    body: JSON.stringify({ id, content }),
  });
}

export function deleteDmMessage(id: number): void {
  requireClient().publish({
    destination: `/app/dm/${id}/delete`,
    body: JSON.stringify(id),
  });
}
