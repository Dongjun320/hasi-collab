import { create } from "zustand";

export interface Friend {
    id: number;
    name: string;
    status: 'online' | 'away' | 'busy' | 'offline';
    statusMessage?: string;
    avatar?: string;
    unreadCount: number;
}

// 상태 표시용 (점 색상 / 기본 라벨) — FriendSidebar, HOME 친구 카드 등에서 공용으로 사용
export const FRIEND_STATUS = {
    online:  { dot: 'bg-green-400', label: '온라인' },
    away:    { dot: 'bg-amber-400', label: '자리 비움' },
    busy:    { dot: 'bg-red-400',   label: '바쁨' },
    offline: { dot: 'bg-gray-400',  label: '오프라인' },
} as const;

interface FriendState {
    friends: Friend[];
    setFriends: (list: Friend[]) => void;
    clear: () => void;
}

export const useFriendStore = create<FriendState>((set) => ({
    friends: [
        { id: 1, name: '김민준', status: 'busy',    statusMessage: '회의 중',   unreadCount: 2 },
        { id: 2, name: '이서연', status: 'online',                              unreadCount: 0 },
        { id: 3, name: '박지훈', status: 'online',                              unreadCount: 5 },
        { id: 4, name: '강하은', status: 'away',    statusMessage: '자리 비움', unreadCount: 0 },
        { id: 5, name: '최수진', status: 'online',                              unreadCount: 0 },
        { id: 6, name: '정민호', status: 'offline',                             unreadCount: 1 },
    ],
    setFriends: (list) => set({ friends: list }),
    clear: () => set ({ friends: []}),
}))