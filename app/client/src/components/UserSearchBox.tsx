import { useState, useRef } from 'react';
import { api } from "../api/client";

export interface SearchedUser {
    uid: number;
    nickname: string;
}

interface UserSearchBoxProps {
    placeholder?: string;
    /** 결과에서 사용자를 골랐을 때 */
    onSelect: (user: SearchedUser) => void;
    /** 각 결과 행 오른쪽에 표시할 버튼 라벨 (예: "초대", "추가") */
    actionLabel: string;
    /** 이미 처리한 uid 목록 — 버튼이 비활성화됨 */
    doneIds?: number[];
    /** 처리 완료 시 버튼에 표시할 라벨 (예: "대기 중", "추가됨") */
    doneLabel?: string;
}

export function UserSearchBox({
    placeholder = "닉네임으로 검색",
    onSelect,
    actionLabel,
    doneIds = [],
    doneLabel = "완료",
}: UserSearchBoxProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchedUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searched, setSearched] = useState(false);
    // 늦게 도착한 이전 요청이 최신 결과를 덮어쓰지 않게 하는 순번
    const seqRef = useRef(0);

    const handleSearch = async () => {
        const q = query.trim();
        if (!q) return;

        const seq = ++seqRef.current;
        setLoading(true);
        setError("");

        try {
            const { data, error: err } = await api.GET('/api/users/search', {
                params: { query: { nickname: q } },
            });
            if (seq !== seqRef.current) return;   // 더 최신 검색이 있으면 버림

            if (err) {
                const msg = (err as any)?.error?.message;
                setError(msg ?? "검색에 실패했습니다");
                setResults([]);
                return;
            }
            // 서버가 단일 객체 또는 배열을 줄 수 있어 양쪽 모두 처리
            const list = Array.isArray(data) ? data : data ? [data] : [];
            setResults(list.map((u: any) => ({ uid: u.uid, nickname: u.nickname })));
        } catch (e) {
            if (seq !== seqRef.current) return;
            console.error("사용자 검색 실패:", e);
            setError("서버에 연결할 수 없습니다");
            setResults([]);
        } finally {
            if (seq === seqRef.current) {
                setLoading(false);
                setSearched(true);
            }
        }
    };

return (
    <div className="flex flex-col gap-3">
    <div className="flex gap-2">
    <input
        type="text"
value={query}
onChange={(e) => { setQuery(e.target.value); setError(""); }}
onKeyDown={(e) => e.key === "Enter" && !loading && handleSearch()}
placeholder={placeholder}
autoFocus
maxLength={50}
className="flex-1 px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#5CC87A]"
/>
<button
    onClick={handleSearch}
disabled={!query.trim() || loading}
className="px-4 py-2 bg-[#5CC87A] hover:bg-[#2E8B4F] disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all"
    >
    {loading ? "검색 중" : "검색"}
    </button>
    </div>

{error && <p className="text-xs text-red-500">{error}</p>}

    {searched && !loading && results.length === 0 && !error && (
        <p className="text-xs text-gray-400 text-center py-4">검색 결과가 없습니다</p>
    )}

    <div className="max-h-60 overflow-y-auto flex flex-col gap-1">
        {results.map((u) => {
                const done = doneIds.includes(u.uid);
                return (
                    <div key={u.uid} className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A8E6B8] to-[#5CC87A] flex items-center justify-center text-white text-sm font-bold">
                    {u.nickname.charAt(0)}
                    </div>
                    <span className="text-sm text-[#2C3E50]">{u.nickname}</span>
                    </div>
                    <button
                onClick={() => onSelect(u)}
                disabled={done}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all
                                    ${done
                    ? "bg-gray-100 text-gray-400 cursor-default"
                    : "bg-[#5CC87A] hover:bg-[#2E8B4F] text-white"}`}
            >
                {done ? doneLabel : actionLabel}
                </button>
                </div>
            );
            })}
        </div>
    </div>
)};
