import { useState, useEffect } from "react";
import { X, MoreHorizontal, Trash2, UserPlus, StickyNote } from "lucide-react";
import { useUiStore } from "../store/uiStore";
import { useFriendStore } from "../store/friendStore";
import { usePresenceStore, presenceDotColor, presenceLabel } from "../store/presenceStore";
import { useFriendPresence } from "../hooks/usePresence";
import Modal from "./Modal";
import { Tooltip } from "./Tooltip";
import { UserSearchBox, type SearchedUser } from "./UserSearchBox";
import { api } from "../api/client";
import { DmConversation } from "./DmConversation";

export function FriendSidebar() {
    // ✅ uiStore에서 activeDmPeerId 상태와 변경 함수를 가져옵니다.
    const { activeRightPanel, closeRightPanel, activeDmPeerId, setActiveDmPeerId } = useUiStore();

    const { friends, setFriends, removeFriend, setMemo } = useFriendStore();
    const isOnline = usePresenceStore((s) => s.isOnline);
    useFriendPresence(friends.map((f) => f.uid));

    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [memoTarget, setMemoTarget] = useState<number | null>(null);
    const [memoText, setMemoText] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [addedIds, setAddedIds] = useState<number[]>([]);
    const [loadError, setLoadError] = useState("");
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

    useEffect(() => {
        if (activeRightPanel !== 'friend') return;
        (async () => {
            try {
                const { data, error } = await api.GET('/api/friends');
                if (error) {
                    setLoadError('친구 목록을 불러오지 못했습니다');
                    return;
                }
                setLoadError('');
                const list = Array.isArray(data) ? data : data ? [data] : [];
                setFriends(list.map((f: any) => ({
                    id: f.id,
                    uid: f.uid,
                    name: f.name ?? '',
                    statusMessage: f.statusMessage ?? undefined,
                    unreadCount: 0,
                })));
            } catch (e) {
                console.error('친구 목록 조회 실패:', e);
                setLoadError('서버에 연결할 수 없습니다');
            }
        })();
    }, [activeRightPanel]);

    const open = activeRightPanel === 'friend';
    const onlineCount = friends.filter((f) => isOnline(f.uid)).length;
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

    const handleAddFriend = async (u: SearchedUser) => {
        try {
            const { error } = await api.POST('/api/friends/requests/{receiverId}', {
                params: { path: { receiverId: u.uid } },
            });
            if (error) return;
            setAddedIds((prev) => [...prev, u.uid]);
        } catch (e) { console.error('친구 추가 실패:', e); }
    };

    const askDelete = (id: number, name: string) => {
        setDeleteTarget({ id, name });
        setOpenMenuId(null);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const { id } = deleteTarget;
        setDeleteTarget(null);
        try {
            const { error } = await api.DELETE('/api/friends/{friendId}', {
                params: { path: { friendId: id } },
            });
            if (error) return;
            removeFriend(id);
        } catch (e) { console.error('친구 삭제 실패:', e); }
    };

    // ✅ 열려있는 단일 DM 상대의 정보를 찾습니다.
    const activeFriendData = activeDmPeerId ? friends.find(f => Number(f.uid) === activeDmPeerId) : null;

    return (
        <>
            <div className={`h-full overflow-hidden transition-all duration-200 ease-out flex-shrink-0 ${open ? "w-64" : "w-0"}`}>
                <div className="app-chrome w-64 h-full bg-white border-l border-[#e8f8ed] flex flex-col">
                    {/* 헤더 */}
                    <div className="h-14 px-4 flex items-center justify-between border-b border-[#e8f8ed] flex-shrink-0">
                        <h2 className="font-bold text-[#2C3E50] text-sm">
                            친구 <span className="text-[#5CC87A]">· {onlineCount}명 온라인</span>
                        </h2>
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <Tooltip label="친구 추가" side="bottom">
                                <button
                                    onClick={() => { setAddedIds([]); setShowAddModal(true); }}
                                    className="p-1 hover:bg-[#f0f9f4] rounded-md transition-all"
                                >
                                    <UserPlus size={16} className="text-[#5CC87A]" />
                                </button>
                            </Tooltip>
                            <Tooltip label="친구 목록 닫기" side="bottom" align="end">
                                <button
                                    onClick={closeRightPanel}
                                    className="p-1 hover:bg-[#f0f9f4] rounded-md transition-all"
                                >
                                    <X size={16} className="text-gray-400" />
                                </button>
                            </Tooltip>
                        </div>
                    </div>

                    {/* 친구 목록 */}
                    <div className="flex-1 overflow-y-auto p-2">
                        {loadError && <p className="text-xs text-red-500 text-center mt-6">{loadError}</p>}
                        {!loadError && friends.length === 0 && <p className="text-xs text-gray-400 text-center mt-6">친구가 없습니다</p>}

                        {friends.map((f) => (
                            <div key={f.id} className="relative group flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#f0f9f4] transition-all">
                                {/* 아바타 */}
                                <div className="relative flex-shrink-0">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#A8E6B8] to-[#5CC87A] flex items-center justify-center text-white text-sm font-bold">
                                        {f.avatar ?? f.name.charAt(0)}
                                    </div>
                                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${presenceDotColor(isOnline(f.uid))}`} />
                                </div>

                                {/* 이름 (DM 열기) */}
                                <button
                                    // ✅ uiStore의 setActiveDmPeerId를 호출하여 단일 팝업을 띄웁니다.
                                    onClick={() => setActiveDmPeerId(Number(f.uid))}
                                    className="flex-1 min-w-0 text-left"
                                >
                                    <p className="text-sm font-semibold text-[#2C3E50] truncate">{f.name}</p>
                                    <p className="text-[11px] text-gray-400 truncate">
                                        {f.memo ?? f.statusMessage ?? presenceLabel(isOnline(f.uid))}
                                    </p>
                                </button>

                                {/* unread 뱃지 */}
                                {f.unreadCount > 0 && (
                                    <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center group-hover:hidden">
                                        {f.unreadCount}
                                    </span>
                                )}

                                {/* 더보기 버튼 */}
                                <button
                                    onClick={() => setOpenMenuId(openMenuId === f.id ? null : f.id)}
                                    className={`flex-shrink-0 p-1 rounded-md hover:bg-[#d4f4dd] transition-all ${openMenuId === f.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                                >
                                    <MoreHorizontal size={16} className="text-gray-400" />
                                </button>

                                {/* 드롭다운 */}
                                {openMenuId === f.id && (
                                    <>
                                        <div className="absolute right-2 top-full mt-0.5 w-32 bg-white rounded-xl shadow-xl border border-[#d4f4dd] py-1 z-50">
                                            <button onClick={() => openMemoModal(f.id, f.memo)} className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-[#f0f9f4]">
                                                <StickyNote size={13} /> 메모
                                            </button>
                                            <button onClick={() => askDelete(f.id, f.name)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50">
                                                <Trash2 size={13} /> 친구 삭제
                                            </button>
                                        </div>
                                        <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* 친구 추가 모달 */}
                    <Modal
                        isOpen={showAddModal}
                        onClose={() => setShowAddModal(false)}
                        title="친구 추가"
                    >
                        <UserSearchBox
                            actionLabel="친구 요청"
                            doneLabel="요청됨"
                            doneIds={[...friends.map((f) => f.uid), ...addedIds]}
                            onSelect={handleAddFriend}
                        />
                    </Modal>

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

                    {/* 친구 삭제 확인 모달 */}
                    <Modal
                        isOpen={deleteTarget !== null}
                        onClose={() => setDeleteTarget(null)}
                        title="친구 삭제"
                    >
                        <p className="text-sm text-[#2C3E50]">
                            <span className="font-semibold">{deleteTarget?.name}</span>님을 친구 목록에서 삭제할까요?
                        </p>
                        <p className="text-[11px] text-gray-400 mt-2">
                            상대방의 친구 목록에서도 삭제됩니다.
                        </p>
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                삭제
                            </button>
                        </div>
                    </Modal>
                </div>
            </div>

            {/* ✅ 페이스북 스타일: 단일 DM 팝업 렌더링 영역 */}
            {/* activeDmPeerId가 존재할 때만 딱 1개의 창을 렌더링합니다. */}
            {activeDmPeerId !== null && (
                <div className="fixed bottom-16 right-6 flex items-end gap-4 z-50 pointer-events-none">
                    <div className="w-[320px] h-[450px] bg-white rounded-t-xl shadow-[0_0_20px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden pointer-events-auto border border-gray-200 animate-fade-in">
                        {/* 팝업 헤더 (창 틀) */}
                        <div className="bg-[#5CC87A] px-3 py-2.5 flex justify-between items-center text-white shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                                    {activeFriendData?.avatar ?? activeFriendData?.name?.charAt(0) ?? '?'}
                                </div>
                                <span className="font-bold text-sm">
                                    {activeFriendData?.name || `유저 ${activeDmPeerId}`}
                                </span>
                            </div>
                            {/* 닫기 버튼: id를 null로 만들어 팝업을 닫습니다. */}
                            <button
                                onClick={() => setActiveDmPeerId(null)}
                                className="hover:bg-white/20 p-1 rounded-md transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* 팝업 내부 */}
                        <div className="flex-1 overflow-hidden relative">
                            <DmConversation peerId={activeDmPeerId} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}