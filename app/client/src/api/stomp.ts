import { Client, IMessage, StompSubscription } from '@stomp/stompjs';

const MESSENGER_WS_URL = 'ws://localhost:8081/ws';

const DM_INBOX_DESTINATION = '/user/queue/dm';

const ERROR_DESTINATION = '/user/queue/errors';

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
      errorSubscription = null;
      dmInboxSubscription = null;

      ensureErrorSubscription();
      if (dmListeners.size > 0) {
        ensureDmInboxSubscription();
      }
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
  dmInboxSubscription = null;
  dmListeners.clear();
  errorSubscription = null;
  errorListeners.clear();
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

export type MessengerErrorCode = 'ACCESS_DENIED' | 'INVALID_REQUEST' | 'INTERNAL_ERROR';

export type MessengerError = {
  code: MessengerErrorCode;
  message: string;
  destination: string | null;
};

type ErrorListener = (error: MessengerError) => void;

let errorSubscription: StompSubscription | null = null;
const errorListeners = new Set<ErrorListener>();

function ensureErrorSubscription(): void {
  if (errorSubscription) {
    return;
  }
  errorSubscription = requireClient().subscribe(ERROR_DESTINATION, (message) => {
    const error = parseBody<MessengerError>(message);
    if (errorListeners.size === 0) {
      console.error('messenger 요청 거부됨:', error);
      return;
    }
    for (const listener of errorListeners) {
      listener(error);
    }
  });
}

export function subscribeToErrors(listener: ErrorListener): () => void {
  errorListeners.add(listener);
  return () => {
    errorListeners.delete(listener);
  };
}

export function subscribeToChannel(
  channelId: number | string,
  onMessage: (message: ChannelOutboundMessage) => void
): () => void {
  const subscription = requireClient().subscribe(`/topic/channel.${channelId}`, (message) => {
    onMessage(parseBody<ChannelOutboundMessage>(message));
  });
  return () => subscription.unsubscribe();
}

type DmListener = {
  peerId: string;
  onMessage: (message: DmOutboundMessage) => void;
};

let dmInboxSubscription: StompSubscription | null = null;
const dmListeners = new Set<DmListener>();

function ensureDmInboxSubscription(): void {
  if (dmInboxSubscription) {
    return;
  }
  dmInboxSubscription = requireClient().subscribe(DM_INBOX_DESTINATION, (message) => {
    const dm = parseBody<DmOutboundMessage>(message);
    for (const listener of dmListeners) {
      if (dm.sender === listener.peerId || dm.receiver === listener.peerId) {
        listener.onMessage(dm);
      }
    }
  });
}

// /user/queue/dm
export function subscribeToDm(
  peerId: number | string,
  onMessage: (message: DmOutboundMessage) => void
): () => void {
  const listener: DmListener = { peerId: String(peerId), onMessage };
  ensureDmInboxSubscription();
  dmListeners.add(listener);

  return () => {
    dmListeners.delete(listener);
    if (dmListeners.size === 0) {
      dmInboxSubscription?.unsubscribe();
      dmInboxSubscription = null;
    }
  };
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
