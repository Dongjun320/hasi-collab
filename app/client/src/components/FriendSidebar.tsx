import { X } from "lucide-react";
import { useUiStore } from "../store/uiStore";
import { useFriendStore, FRIEND_STATUS } from "../store/friendStore";

export function FriendSidebar() {
    const { activeRightPanel, closeRightPanel } = useUiStore();
    const { friends } = useFriendStore();

    if (activeRightPanel !== 'friend') return null;

    const onlineCount = friends.filter((f) => f.status !== "offline").length;

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
                {friends.map((f) => (
                    <button
                        key={f.id}
                        className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#f0f9f4] transition-all text-left"
                    >
                        {/* 아바타 + 상태 점 */}
                        <div className="relative flex-shrink-0">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#A8E6B8] to-[#5CC87A] flex items-center justify-center text-white text-sm font-bold">
                                {f.avatar ?? f.name.charAt(0)}
                            </div>
                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${FRIEND_STATUS[f.status].dot}`} />
                        </div>

                        {/* 이름 + 상태 */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#2C3E50] truncate">{f.name}</p>
                            <p className="text-[11px] text-gray-400 truncate">
                                {f.statusMessage ?? FRIEND_STATUS[f.status].label}
                            </p>
                        </div>

                        {/* unread 뱃지 */}
                        {f.unreadCount > 0 && (
                            <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {f.unreadCount}
              </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}



