import { create } from "zustand";
import { api } from "../api/client";

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
    fetchFriends: () => Promise<void>;
    removeFriend: (id: number) => void;
    setMemo: (id: number, memo: string) => void;
    clear: () => void;
}

export const useFriendStore = create<FriendState>((set) => ({
    friends: [],
    setFriends: (list) => set({ friends: list }),
    // 서버에서 친구 목록을 받아 store에 반영. 홈 진입·친구 수락 등 여러 곳에서 공용으로 호출.
    // (친구 엔드포인트는 success 봉투 없이 배열을 직접 반환)
    fetchFriends: async () => {
        const { data, error } = await api.GET('/api/friends');
        if (error) return;
        const list = Array.isArray(data) ? data : data ? [data] : [];
        set((s) => {
            // 로컬 전용 메모는 refetch로 날아가지 않게 uid 기준으로 보존
            const memoByUid = new Map(s.friends.map((f) => [f.uid, f.memo]));
            return {
                friends: list.map((f: any) => ({
                    id: f.id,
                    uid: f.uid,
                    name: f.name ?? '',
                    statusMessage: f.statusMessage ?? undefined,
                    memo: memoByUid.get(f.uid),
                    unreadCount: 0,
                })),
            };
        });
    },
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