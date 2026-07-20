import { create } from "zustand";

export type NotificationType = 'message' | 'mention' | 'invite' | 'system';

export interface Notification {

    id: number;
    type: NotificationType;
    text: string;
    time: string;
    unread: boolean;
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
    markRead: (id :number) => void;
    markAllRead: () => void;
    clear: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [
        { id: 1, type: 'message', text: '개발팀에 새 메시지가 5개 있습니다',    time: '5분 전',   unread: true  },
        { id: 2, type: 'system',  text: '디자인 리뷰 미팅이 30분 후 시작됩니다', time: '방금',     unread: true  },
        { id: 3, type: 'message', text: '마케팅팀 파일이 업로드됐습니다',        time: '1시간 전', unread: true  },
        { id: 4, type: 'invite',  text: '김민준님이 기획팀에 초대했습니다',       time: '2시간 전', unread: false },
    ],
    setNotifications: (list) => set({ notifications: list }),
    markRead: (id) => set((s) => ({
        notifications: s.notifications.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    })),
    markAllRead: () => set((s) => ({
        notifications: s.notifications.map((n) => ({ ...n, unread: false })),
    })),
    clear: () => set({ notifications: [] }),
}));
