import { create } from "zustand";

// 온라인 여부는 이 store가 아니라 presenceStore(usePresenceStore.isOnline)로 관리
// (백엔드가 Redis+STOMP 기반 boolean online/offline만 제공, AWAY 없음)
export interface Friend {
    id: number;      // friends 테이블의 관계 id (삭제 API 등 관계 조작용)
    uid: number;     // 친구(상대방)의 실제 유저 id (presence, DM 라우팅 등 유저 식별용)
    name: string;
    statusMessage?: string;
    avatar?: string;
    memo?: string;          // 내가 이 친구에게 붙인 메모 (나만 보임)
    unreadCount: number;
}

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