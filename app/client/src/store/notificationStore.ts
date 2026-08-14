import { create } from "zustand";
import type { MessengerNotification } from "../api/stomp";

export type NotificationType = 'message' | 'mention' | 'invite' | 'friend' | 'system';

export interface Notification {

    // 소스별로 네임스페이스한 문자열 id (예: "invite-1", "friend-1")
    // 초대·친구요청 id가 각자 1부터라 number면 충돌 → string으로 구분
    id: string;
    type: NotificationType;
    text: string;
    time: string;
    unread: boolean;
    invitationId?: number;
    requestId?: number;      // 친구 요청 수락/거절용 (관계 id)
    messengerId?: number;    // messenger 알림 PK — 서버에 읽음 처리를 보낼 때 사용
}

// messenger가 내려주는 알림을 화면용 Notification으로 변환.
//
// text가 서버에 없어서 payload로 문장을 조립합니다.
// id는 REST(/api/invitations/received)로 받은 것과 같은 규칙("invite-{초대id}")을 써서,
// 같은 초대가 STOMP와 REST 양쪽으로 들어와도 addNotifications에서 자동으로 합쳐지게 합니다.
export function fromMessengerNotification(n: MessengerNotification): Notification {
    const payload = n.payload ?? {};
    const text = (key: string): string | undefined => {
        const value = payload[key];
        return typeof value === 'string' ? value : undefined;
    };

    const actor = text('inviterNickname') ?? text('actorNickname') ?? '알 수 없는 사용자';
    const workspaceName = text('workspaceName');
    const channelName = text('channelName');

    let message: string;
    switch (n.type) {
        case 'invite':
            message = channelName
                ? `${actor}님이 ${workspaceName ?? '워크스페이스'}의 ${channelName} 채널에 초대했습니다`
                : `${actor}님이 ${workspaceName ?? '워크스페이스'}에 초대했습니다`;
            break;
        case 'friend':
            message = `${actor}님이 친구 요청을 보냈습니다`;
            break;
        case 'mention':
            message = `${actor}님이 회원님을 언급했습니다`;
            break;
        case 'message':
            message = text('preview') ?? `${actor}님이 메시지를 보냈습니다`;
            break;
        default:
            message = text('message') ?? '새 알림이 있습니다';
    }

    return {
        // 초대는 REST와 키를 맞추고, 그 외에는 messenger PK를 그대로 사용
        id: n.type === 'invite' && n.subjectId != null
            ? `invite-${n.subjectId}`
            : `msg-${n.id}`,
        type: n.type,
        text: message,
        time: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : '',
        unread: n.unread,
        invitationId: n.type === 'invite' && n.subjectId != null ? n.subjectId : undefined,
        messengerId: n.id,
    };
}

export const NOTIFICATION_TYPE = {
    message: { dot: 'bg-[#5CC87A]', label: '메시지' },
    mention: { dot: 'bg-amber-400', label: '멘션'   },
    invite:  { dot: 'bg-blue-400',  label: '초대'   },
    friend:  { dot: 'bg-pink-400',  label: '친구'   },
    system:  { dot: 'bg-gray-400',  label: '시스템' },
} as const;

interface NotificationState {
    notifications: Notification[];
    setNotifications: (list: Notification[]) => void;
    addNotifications: (list: Notification[]) => void;
    removeNotification: (id: string) => void;
    markRead: (id: string) => void;
    markAllRead: () => void;
    clear: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    setNotifications: (list) => set({ notifications: list }),
    addNotifications: (list) => set((s) => {
        const ids = new Set(list.map((n) => n.id));
        return { notifications: [...list, ...s.notifications.filter((n) => !ids.has(n.id))] };
    }),
    removeNotification: (id) => set((s) => ({
        notifications: s.notifications.filter((n) => n.id !== id),
    })),
    markRead: (id) => set((s) => ({
        notifications: s.notifications.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    })),
    markAllRead: () => set((s) => ({
        notifications: s.notifications.map((n) => ({ ...n, unread: false })),
    })),
    clear: () => set({ notifications: [] }),
    })
)