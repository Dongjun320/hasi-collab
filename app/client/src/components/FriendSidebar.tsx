import { useState } from "react";
import { X, MoreHorizontal, Trash2, StickyNote } from "lucide-react";
import { useUiStore } from "../store/uiStore";
import { useFriendStore, FRIEND_STATUS } from "../store/friendStore";
import Modal from "./Modal";

export function FriendSidebar() {
    const { activeRightPanel, closeRightPanel } = useUiStore();
    const { friends, removeFriend, setMemo } = useFriendStore();

    // 지금 ⋯ 메뉴가 열려있는 친구 id
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    // 메모 모달 대상 + 입력값
    const [memoTarget, setMemoTarget] = useState<number | null>(null);
    const [memoText, setMemoText] = useState("");

    if (activeRightPanel !== 'friend') return null;

    const onlineCount = friends.filter((f) => f.status !== "offline").length;
    const memoFriend = friends.find((f) => f.id === memoTarget);

    const openMemoModal = (id: number, current?: string) => {
        setMemoTarget(id);
        setMemoText(current ?? "");
        setOpenMenuId(null);
    };

    const handleSaveMemo = () => {
        if (memoTarget !== null) setMemo(memoTarget, memoText);
        setMemoTarget(null);
    };

    // TODO: 친구 API 연결 시 DELETE /api/friends/{id} 호출로 교체
    const handleDelete = (id: number, name: string) => {
        if (!confirm(`${name}님을 친구 목록에서 삭제할까요?`)) return;
        removeFriend(id);
        setOpenMenuId(null);
    };

    return (
        <div className="w-64 h-full bg-white border-l border-[#e8f8ed] flex flex-col flex-shrink-0">
            {/* 헤더 */}
            <div className="h-14 px-4 flex items-center justify-between border-b border-[#e8f8ed] flex-shrink-0">
                <h2 className="font-bold text-[#2C3E50] text-sm">
                    친구 <span className="text-[#5CC87A]">· {onlineCount}명 온라인</span>
                </h2>
                <button
                    onClick={closeRightPanel}
                    title="친구 목록 닫기"
                    className="p-1 hover:bg-[#f0f9f4] rounded-md transition-all"
                >
                    <X size={16} className="text-gray-400" />
                </button>
            </div>

            {/* 친구 목록 */}
            <div className="flex-1 overflow-y-auto p-2">
                {friends.length === 0 && (
                    <p className="text-xs text-gray-400 text-center mt-6">친구가 없습니다</p>
                )}
                {friends.map((f) => (
                    <div
                        key={f.id}
                        className="relative group flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#f0f9f4] transition-all"
                    >
                        {/* 아바타 + 상태 점 */}
                        <div className="relative flex-shrink-0">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#A8E6B8] to-[#5CC87A] flex items-center justify-center text-white text-sm font-bold">
                                {f.avatar ?? f.name.charAt(0)}
                            </div>
                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${FRIEND_STATUS[f.status].dot}`} />
                        </div>

                        {/* 이름 + 상태 (여기가 DM 열기 영역) */}
                        <button className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-semibold text-[#2C3E50] truncate">{f.name}</p>
                            <p className="text-[11px] text-gray-400 truncate">
                                {f.memo ?? f.statusMessage ?? FRIEND_STATUS[f.status].label}
                            </p>
                        </button>

                        {/* unread 뱃지 — hover 시 ⋯ 버튼에 자리를 내줌 */}
                        {f.unreadCount > 0 && (
                            <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center group-hover:hidden">
                                {f.unreadCount}
                            </span>
                        )}

                        {/* ⋯ 버튼 — hover 시 또는 메뉴 열려있을 때만 */}
                        <button
                            onClick={() => setOpenMenuId(openMenuId === f.id ? null : f.id)}
                            title="더보기"
                            className={`flex-shrink-0 p-1 rounded-md hover:bg-[#d4f4dd] transition-all
                                ${openMenuId === f.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                        >
                            <MoreHorizontal size={16} className="text-gray-400" />
                        </button>

                        {/* 드롭다운 */}
                        {openMenuId === f.id && (
                            <>
                                <div className="absolute right-2 top-full mt-0.5 w-32 bg-white rounded-xl shadow-xl border border-[#d4f4dd] py-1 z-50">
                                    <button
                                        onClick={() => openMemoModal(f.id, f.memo)}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#2C3E50] hover:bg-[#f0f9f4] transition-colors text-left"
                                    >
                                        <StickyNote size={13} />
                                        메모
                                    </button>
                                    <button
                                        onClick={() => handleDelete(f.id, f.name)}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors text-left"
                                    >
                                        <Trash2 size={13} />
                                        친구 삭제
                                    </button>
                                </div>
                                {/* 바깥 클릭 시 닫힘 */}
                                <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* 메모 모달 */}
            <Modal
                isOpen={memoTarget !== null}
                onClose={() => setMemoTarget(null)}
                title={`${memoFriend?.name ?? ""}님 메모`}
            >
                <input
                    autoFocus
                    value={memoText}
                    onChange={(e) => setMemoText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveMemo()}
                    placeholder="예) 디자인팀 팀장"
                    className="w-full px-3 py-2 border border-[#d4f4dd] rounded-lg text-sm focus:outline-none focus:border-[#5CC87A]"
                />
                <p className="text-[11px] text-gray-400 mt-2">
                    메모는 나에게만 보이며, 상태 메시지 대신 표시됩니다.
                </p>
                <div className="flex justify-end gap-2 mt-4">
                    <button
                        onClick={() => setMemoTarget(null)}
                        className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSaveMemo}
                        className="px-3 py-1.5 text-sm bg-[#5CC87A] text-white rounded-lg hover:bg-[#4ab869] transition-colors"
                    >
                        저장
                    </button>
                </div>
            </Modal>
        </div>
    );
}
