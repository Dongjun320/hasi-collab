import { create } from "zustand";

export type NotificationType = 'message' | 'mention' | 'invite' | 'system';

export interface Notification {

    id: number;
    type: NotificationType;
    text: string;
    time: string;
    unread: boolean;
    invitationId?: number;
}

export const NOTIFICATION_TYPE = {
    message: { dot: 'bg-[#5CC87A]', label: '메시지' },
    mention: { dot: 'bg-amber-400', label: '멘션'   },
    invite:  { dot: 'bg-blue-400',  label: '초대'   },
    system:  { dot: 'bg-gray-400',  label: '시스템' },
} as const;

interface NotificationState {
    notifications: Notification[];
    setNotifications: (list: Notification[]) => void;
    addNotifications: (list: Notification[]) => void;
    removeNotification: (id: number) => void;
    markRead: (id: number) => void;
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