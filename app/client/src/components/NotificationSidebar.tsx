import { X } from "lucide-react";
import { useUiStore } from "../store/uiStore";
import { useNotificationStore, NOTIFICATION_TYPE } from "../store/notificationStore";

export function NotificationSidebar() {
    const { activeRightPanel, closeRightPanel } = useUiStore();
    const { notifications, markRead, markAllRead } = useNotificationStore();

    if (activeRightPanel !== 'notification') return null;

    const unreadCount = notifications.filter((n) => n.unread).length;

    return (
        <div className="w-64 h-full bg-white border-l border-[#e8f8ed] flex flex-col flex-shrink-0">
            {/* 헤더 */}
            <div className="h-14 px-4 flex items-center justify-between border-b border-[#e8f8ed] flex-shrink-0">
                <h2 className="font-bold text-[#2C3E50] text-sm">
                    알림 {unreadCount > 0 && <span className="text-[#5CC87A]">· {unreadCount}</span>}
                </h2>
                <button
                    onClick={closeRightPanel}
                    title="알림 닫기"
                    className="p-1 hover:bg-[#f0f9f4] rounded-md transition-all"
                >
                    <X size={16} className="text-gray-400" />
                </button>
            </div>

            {/* 알림 목록 */}
            <div className="flex-1 overflow-y-auto p-2">
                {notifications.length === 0 && (
                    <p className="text-xs text-gray-400 text-center mt-6">알림이 없습니다</p>
                )}
                {notifications.map((n) => (
                    <button
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className={`w-full flex items-start gap-2.5 px-2 py-2.5 rounded-lg transition-all text-left
                            ${n.unread ? "bg-[#f0f9f4] hover:bg-[#e8f8ed]" : "hover:bg-[#f8fdf9]"}`}
                    >
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${NOTIFICATION_TYPE[n.type].dot}`} />
                        <div className="flex-1 min-w-0">
                            <p className={`text-xs leading-snug ${n.unread ? "text-[#2C3E50] font-medium" : "text-gray-400"}`}>
                                {n.text}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
                        </div>
                    </button>
                ))}
            </div>

            {/* 푸터 */}
            {unreadCount > 0 && (
                <div className="px-4 py-3 border-t border-[#e8f8ed] text-center flex-shrink-0">
                    <button
                        onClick={markAllRead}
                        className="text-xs text-[#5CC87A] font-medium hover:underline"
                    >
                        모두 읽음 처리
                    </button>
                </div>
            )}
        </div>
    );
}