import { create } from "zustand";

// presence 3단계로 통일 (팀 합의). BUSY/OUTSIDE/REMOTE 폐지
// ONLINE=STOMP 연결 / AWAY=활동 없음 / OFFLINE=미접속
export type FriendStatus = 'ONLINE' | 'AWAY' | 'OFFLINE';

export interface Friend {
    id: number;
    name: string;
    status: FriendStatus;
    statusMessage?: string;
    avatar?: string;
    memo?: string;          // 내가 이 친구에게 붙인 메모 (나만 보임)
    unreadCount: number;
}

// 상태 표시용 (점 색상 / 기본 라벨) — FriendSidebar, HOME 친구 카드 등에서 공용으로 사용
const FRIEND_STATUS_MAP: Record<FriendStatus, { dot: string; label: string }> = {
    ONLINE:  { dot: 'bg-green-400', label: '온라인' },
    AWAY:    { dot: 'bg-amber-400', label: '자리 비움' },
    OFFLINE: { dot: 'bg-gray-400',  label: '오프라인' },
};

// 서버가 모르는 값을 주더라도 화면이 죽지 않도록 폴백
export const friendStatusOf = (status?: string) =>
    FRIEND_STATUS_MAP[(status ?? '') as FriendStatus] ?? FRIEND_STATUS_MAP.OFFLINE;

export const FRIEND_STATUS = FRIEND_STATUS_MAP;

interface FriendState {
    friends: Friend[];
    setFriends: (list: Friend[]) => void;
    removeFriend: (id: number) => void;
    setMemo: (id: number, memo: string) => void;
    clear: () => void;
}

export const useFriendStore = create<FriendState>((set) => ({
    friends: [],
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