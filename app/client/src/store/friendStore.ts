import { create } from "zustand";

export interface Friend {
    id: number;
    name: string;
    status: 'online' | 'away' | 'busy' | 'offline';
    statusMessage?: string;
    avatar?: string;
    memo?: string;          // 내가 이 친구에게 붙인 메모 (나만 보임)
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
    removeFriend: (id: number) => void;
    setMemo: (id: number, memo: string) => void;
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
    removeFriend: (id) => set((s) => ({
        friends: s.friends.filter((f) => f.id !== id),
    })),
    setMemo: (id, memo) => set((s) => ({
        // 빈 문자열이면 메모 자체를 지움
        friends: s.friends.map((f) =>
            f.id === id ? { ...f, memo: memo.trim() || undefined } : f
        ),
    })),
    clear: () => set ({ friends: []}),
}))