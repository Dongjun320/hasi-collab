import { useState } from 'react';
import { useTranslation } from "react-i18next";
import { useUserSearch, type SearchedUser } from "../hooks/useUserSearch";
import { useAuthStore } from "../store/authStore";

export type { SearchedUser };

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
    placeholder,
    onSelect,
    actionLabel,
    doneIds = [],
    doneLabel,
}: UserSearchBoxProps) {
    const { t } = useTranslation();
    const myUid = useAuthStore((s) => s.user?.uid);
    const [query, setQuery] = useState("");
    const { result, loading, notFound, search } = useUserSearch();
    const done = result ? doneIds.includes(result.uid) : false;

    return (
        <div className="flex flex-col gap-3">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !loading && search(query)}
                    placeholder={placeholder ?? t("userSearch.placeholder")}
                    autoFocus
                    maxLength={50}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#5CC87A]"
                />
                <button
                    onClick={() => search(query)}
                    disabled={!query.trim() || loading}
                    className="px-4 py-2 bg-[#5CC87A] hover:bg-[#2E8B4F] disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all"
                >
                    {loading ? t("userSearch.searching") : t("userSearch.search")}
                </button>
            </div>

            {notFound && (
                <p className="text-xs text-gray-400 text-center py-4">
                    {t("userSearch.notFound")}
                </p>
            )}

            {result && ( result.uid === myUid && (
                <p className="text-xs text-grey-400 text-center py-4">
                    {t("userSearch.cannotSelectSelf")}
                </p>
                ))}
            {result && ( result.uid !== myUid && (
                <div className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A8E6B8] to-[#5CC87A] flex items-center justify-center text-white text-sm font-bold">
                            {result.nickname.charAt(0)}
                        </div>
                        <span className="text-sm text-[#2C3E50]">{result.nickname}</span>
                    </div>
                    <button
                        onClick={() => onSelect(result)}
                        disabled={done}
                        className={`px-3 py-1 text-xs font-medium rounded-lg transition-all
                            ${done
                            ? "bg-gray-100 text-gray-400 cursor-default"
                            : "bg-[#5CC87A] hover:bg-[#2E8B4F] text-white"}`}
                    >
                        {done ? (doneLabel ?? t("userSearch.done")) : actionLabel}
                    </button>
                </div>
            ))}
        </div>
    );
}
