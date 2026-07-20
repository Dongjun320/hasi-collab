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

// /user/queue/dm 구독. 서버가 세션별 큐로 변환해 전달하므로 상대방과 무관하게 내 DM 전체가 하나의 큐로 옵니다.
// 특정 상대방과의 대화만 필요하면 onMessage 콜백에서 message.sender/receiver로 걸러야 합니다.
export function subscribeToDm(
  onMessage: (message: DmOutboundMessage) => void
): () => void {
  const subscription = requireClient().subscribe('/user/queue/dm', (message) => {
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
