import { Client, IMessage, StompSubscription } from '@stomp/stompjs';

const MESSENGER_WS_URL = 'ws://localhost:8081/ws';

const DM_INBOX_DESTINATION = '/user/queue/dm';

const ERROR_DESTINATION = '/user/queue/errors';

let client: Client | null = null;
let connectPromise: Promise<void> | null = null;
let currentToken: string | null = null;

let rejectConnect: ((reason: Error) => void) | null = null;

// 이미 연결된 client가 있으면 그대로 재사용합니다.
export function connectStomp(token: string): Promise<void> {
  if (client && currentToken !== token) {
    teardownConnection();
  }
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

  let connectedOnce = false;

  connectPromise = new Promise<void>((resolve, reject) => {
    rejectConnect = reject;

    stompClient.onConnect = () => {
      if (client !== stompClient) {
        return;
      }
      connectedOnce = true;
      rejectConnect = null;

      errorSubscription = null;
      dmInboxSubscription = null;
      channelSubscriptions.clear();

      channelReadSubscriptions.clear();

      ensureErrorSubscription();
      if (dmListeners.size > 0 || dmInboxListeners.size > 0) {
        ensureDmInboxSubscription();
      }
      for (const channelId of channelListeners.keys()) {
        ensureChannelSubscription(channelId);
      }
      for (const channelId of channelReadListeners.keys()) {
        ensureChannelReadSubscription(channelId);
      }
      resolve();
    };
    stompClient.onStompError = (frame) => {
      console.error('STOMP 브로커 에러:', frame.headers['message'], frame.body);
      rejectConnect = null;

      if (client === stompClient && !connectedOnce) {
        teardownConnection();
      }
      reject(new Error(frame.headers['message'] ?? 'STOMP connection error'));
    };
    stompClient.onWebSocketError = (event) => {
      console.error('STOMP 웹소켓 에러:', event);
    };
  });

  client = stompClient;
  currentToken = token;
  stompClient.activate();
  return connectPromise;
}

function teardownConnection(): void {
  const stale = client;
  const pendingReject = rejectConnect;

  client = null;
  connectPromise = null;
  currentToken = null;
  rejectConnect = null;
  errorSubscription = null;
  dmInboxSubscription = null;
  channelSubscriptions.clear();
  channelReadSubscriptions.clear();

  void stale?.deactivate();
  pendingReject?.(new Error('STOMP connection was reset before it was established.'));
}

export function disconnectStomp(): void {
  teardownConnection();
  channelListeners.clear();
  channelReadListeners.clear();
  dmListeners.clear();
  dmInboxListeners.clear();
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

export type ChannelReadState = {
  userId: string;
  lastReadMessageId: number;
  updatedAt: string;
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
  if (errorSubscription || !client?.connected) {
    return;
  }
  errorSubscription = client.subscribe(ERROR_DESTINATION, (message) => {
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

type ChannelListener = {
  onMessage: (message: ChannelOutboundMessage) => void;
};

const channelListeners = new Map<string, Set<ChannelListener>>();
const channelSubscriptions = new Map<string, StompSubscription>();

function ensureChannelSubscription(channelId: string): void {
  if (channelSubscriptions.has(channelId) || !client?.connected) {
    return;
  }
  const subscription = client.subscribe(`/topic/channel.${channelId}`, (message) => {
    const outbound = parseBody<ChannelOutboundMessage>(message);
    for (const listener of channelListeners.get(channelId) ?? []) {
      listener.onMessage(outbound);
    }
  });
  channelSubscriptions.set(channelId, subscription);
}

function unsubscribeChannel(channelId: string): void {
  const subscription = channelSubscriptions.get(channelId);
  if (!subscription) {
    return;
  }
  channelSubscriptions.delete(channelId);
  if (client?.connected) {
    subscription.unsubscribe();
  }
}

// /topic/channel.{channelId}
export function subscribeToChannel(
  channelId: number | string,
  onMessage: (message: ChannelOutboundMessage) => void
): () => void {
  const key = String(channelId);
  const listener: ChannelListener = { onMessage };

  let listeners = channelListeners.get(key);
  if (!listeners) {
    listeners = new Set<ChannelListener>();
    channelListeners.set(key, listeners);
  }
  listeners.add(listener);
  ensureChannelSubscription(key);

  return () => {
    const current = channelListeners.get(key);
    if (!current) {
      return;
    }
    current.delete(listener);
    if (current.size > 0) {
      return;
    }
    channelListeners.delete(key);
    unsubscribeChannel(key);
  };
}

type ChannelReadListener = (state: ChannelReadState) => void;

const channelReadListeners = new Map<string, Set<ChannelReadListener>>();
const channelReadSubscriptions = new Map<string, StompSubscription>();

function ensureChannelReadSubscription(channelId: string): void {
  if (channelReadSubscriptions.has(channelId) || !client?.connected) {
    return;
  }
  const subscription = client.subscribe(`/topic/channel.${channelId}.read`, (message) => {
    const state = parseBody<ChannelReadState>(message);
    for (const listener of channelReadListeners.get(channelId) ?? []) {
      listener(state);
    }
  });
  channelReadSubscriptions.set(channelId, subscription);
}

// /topic/channel.{channelId}.read — 누가 어디까지 읽었는지
export function subscribeToChannelRead(
  channelId: number | string,
  onRead: ChannelReadListener
): () => void {
  const key = String(channelId);

  let listeners = channelReadListeners.get(key);
  if (!listeners) {
    listeners = new Set<ChannelReadListener>();
    channelReadListeners.set(key, listeners);
  }
  listeners.add(onRead);
  ensureChannelReadSubscription(key);

  return () => {
    const current = channelReadListeners.get(key);
    if (!current) {
      return;
    }
    current.delete(onRead);
    if (current.size > 0) {
      return;
    }
    channelReadListeners.delete(key);

    const subscription = channelReadSubscriptions.get(key);
    if (!subscription) {
      return;
    }
    channelReadSubscriptions.delete(key);
    if (client?.connected) {
      subscription.unsubscribe();
    }
  };
}

type DmListener = {
  peerId: string;
  onMessage: (message: DmOutboundMessage) => void;
};

type DmInboxListener = (message: DmOutboundMessage) => void;

let dmInboxSubscription: StompSubscription | null = null;
const dmListeners = new Set<DmListener>();
const dmInboxListeners = new Set<DmInboxListener>();

function ensureDmInboxSubscription(): void {
  if (dmInboxSubscription || !client?.connected) {
    return;
  }
  dmInboxSubscription = client.subscribe(DM_INBOX_DESTINATION, (message) => {
    const dm = parseBody<DmOutboundMessage>(message);
    for (const listener of dmListeners) {
      if (dm.sender === listener.peerId || dm.receiver === listener.peerId) {
        listener.onMessage(dm);
      }
    }
    for (const listener of dmInboxListeners) {
      listener(dm);
    }
  });
}

function releaseDmInboxSubscription(): void {
  if (dmListeners.size > 0 || dmInboxListeners.size > 0) {
    return;
  }
  const subscription = dmInboxSubscription;
  dmInboxSubscription = null;
  if (subscription && client?.connected) {
    subscription.unsubscribe();
  }
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
    releaseDmInboxSubscription();
  };
}

export function subscribeToDmInbox(onMessage: DmInboxListener): () => void {
  ensureDmInboxSubscription();
  dmInboxListeners.add(onMessage);

  return () => {
    dmInboxListeners.delete(onMessage);
    releaseDmInboxSubscription();
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

export function sendChannelRead(channelId: number | string, lastReadMessageId: number): void {
  if (!client?.connected) {
    return;
  }
  client.publish({
    destination: `/app/channel/${channelId}/read`,
    body: JSON.stringify({ lastReadMessageId }),
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
