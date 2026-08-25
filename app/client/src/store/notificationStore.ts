import { create } from "zustand";
import type { MessengerNotification } from "../api/stomp";
import i18n from "../i18n";

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

    // 닉네임 키가 알림 종류마다 다릅니다 (초대=inviterNickname, 친구요청=senderNickname)
    const actor = text('inviterNickname')
        ?? text('senderNickname')
        ?? text('actorNickname')
        ?? i18n.t('notification.unknownUser');
    const workspaceName = text('workspaceName');
    const channelName = text('channelName');
    const workspace = workspaceName ?? i18n.t('notification.workspaceFallback');

    let message: string;
    switch (n.type) {
        case 'invite':
            message = channelName
                ? i18n.t('notification.inviteChannel', { actor, workspace, channel: channelName })
                : i18n.t('notification.inviteWorkspace', { actor, workspace });
            break;
        case 'friend':
            message = i18n.t('notification.friendRequest', { actor });
            break;
        case 'mention':
            message = i18n.t('notification.mention', { actor });
            break;
        case 'message':
            message = text('preview') ?? i18n.t('notification.message', { actor });
            break;
        default:
            message = text('message') ?? i18n.t('notification.generic');
    }

    // subjectId는 알림 종류에 따라 초대 id 또는 친구관계 id입니다.
    // (백엔드가 dedupKey를 "INVITE:{초대id}" / "FRIEND:{관계id}"로 잡는 것과 같은 값)
    //
    // REST 조회로 만든 알림과 id 규칙을 맞춰야 같은 건이 두 개로 보이지 않고,
    // 수락·거절 버튼이 쓰는 invitationId/requestId도 여기서 채워줘야 합니다.
    const subjectId = n.subjectId ?? undefined;

    return {
        id: subjectId != null && (n.type === 'invite' || n.type === 'friend')
            ? `${n.type}-${subjectId}`
            : `msg-${n.id}`,
        type: n.type,
        text: message,
        time: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : '',
        unread: n.unread,
        invitationId: n.type === 'invite' ? subjectId : undefined,
        requestId: n.type === 'friend' ? subjectId : undefined,
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