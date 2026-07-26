import { create } from "zustand";

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