import { X, Check, XCircle } from "lucide-react";
import { useUiStore } from "../store/uiStore";
import { Tooltip } from "./Tooltip";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useNotificationStore, NOTIFICATION_TYPE, type Notification } from "../store/notificationStore";

export function NotificationSidebar() {
    const { activeRightPanel, closeRightPanel } = useUiStore();
    const { notifications, markRead, markAllRead, addNotifications, removeNotification } = useNotificationStore();
    const [busyId, setBusyId] = useState<number | null>(null);

    useEffect(() => {
        if (activeRightPanel !== 'notification') return;
        (async () => {
            try {
                const { data, error } = await api.GET('/api/invitations/received');
                if (error || !data?.success) return;

                const pending = (data.data ?? []).filter((v) => v.status === 'PENDING');
                addNotifications(pending.map((v) => ({
                    id: v.invitationId ?? 0,   // 목데이터 id와 충돌 방지
                    type: 'invite' as const,
                    text: `${v.inviterNickname}님이 ${v.workspaceName}에 초대했습니다`,
                    time: v.createdAt ? new Date(v.createdAt).toLocaleDateString() : '',
                    unread: true,
                    invitationId: v.invitationId,
                })));
            } catch (e) {
                console.error('초대 조회 실패:', e);
            }
        })();
    }, [activeRightPanel]);

    const respondInvite = async (n: Notification, action: 'ACCEPTED' | 'DECLINED') => {
        if (!n.invitationId) return;
        setBusyId(n.id);
        try {
            const { error } = await api.PATCH('/api/invitations/{invitationId}', {
                params: { path: { invitationId: n.invitationId } },
                body: { action },
            });
            if (error) return;
            removeNotification(n.id);
            // TODO: 수락 시 워크스페이스 목록 새로고침 필요
        } catch (e) {
            console.error('초대 응답 실패:', e);
        } finally {
            setBusyId(null);
        }
    };

    if (activeRightPanel !== 'notification') return null;

    const unreadCount = notifications.filter((n) => n.unread).length;

    return (
        <div className="w-64 h-full bg-white border-l border-[#e8f8ed] flex flex-col flex-shrink-0">
            {/* 헤더 */}
            <div className="h-14 px-4 flex items-center justify-between border-b border-[#e8f8ed] flex-shrink-0">
                <h2 className="font-bold text-[#2C3E50] text-sm">
                    알림 {unreadCount > 0 && <span className="text-[#5CC87A]">· {unreadCount}</span>}
                </h2>
                <Tooltip label="알림 닫기" side="bottom" align="end">
                    <button
                        onClick={closeRightPanel}
                        className="p-1 hover:bg-[#f0f9f4] rounded-md transition-all"
                    >
                        <X size={16} className="text-gray-400" />
                    </button>
                </Tooltip>
            </div>

            {/* 알림 목록 */}
            {/* 알림 목록 */}
            <div className="flex-1 overflow-y-auto p-2">
                {notifications.length === 0 && (
                    <p className="text-xs text-gray-400 text-center mt-6">알림이 없습니다</p>
                )}
                {notifications.map((n) => (
                    <div key={n.id} className={`rounded-lg transition-all ${n.unread ? "bg-[#f0f9f4]" : ""}`}>
                        <button
                            onClick={() => markRead(n.id)}
                            className="w-full flex items-start gap-2.5 px-2 py-2.5 text-left hover:bg-[#e8f8ed] rounded-lg transition-all"
                        >
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${NOTIFICATION_TYPE[n.type].dot}`} />
                            <div className="flex-1 min-w-0">
                                <p className={`text-xs leading-snug ${n.unread ? "text-[#2C3E50] font-medium" : "text-gray-400"}`}>
                                    {n.text}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
                            </div>
                        </button>

                        {/* 초대 알림에만 수락/거절 */}
                        {n.type === 'invite' && n.invitationId && (
                            <div className="flex gap-1.5 px-2 pb-2">
                                <button
                                    onClick={() => respondInvite(n, 'ACCEPTED')}
                                    disabled={busyId === n.id}
                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] font-semibold bg-[#5CC87A] hover:bg-[#2E8B4F] disabled:bg-gray-200 text-white rounded-md transition-all"
                                >
                                    <Check size={12} /> 수락
                                </button>
                                <button
                                    onClick={() => respondInvite(n, 'DECLINED')}
                                    disabled={busyId === n.id}
                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] font-semibold bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-600 rounded-md transition-all"
                                >
                                    <XCircle size={12} /> 거절
                                </button>
                            </div>
                        )}
                    </div>
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