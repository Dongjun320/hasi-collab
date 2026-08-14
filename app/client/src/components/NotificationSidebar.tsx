import { X, Check, XCircle } from "lucide-react";
import { useUiStore } from "../store/uiStore";
import { Tooltip } from "./Tooltip";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useNotificationStore, NOTIFICATION_TYPE, type Notification } from "../store/notificationStore";
import { useWorkspaceStore } from "../store/workspaceStore";
import { useNotification } from "../hooks/useNotification";

export function NotificationSidebar() {
    const { activeRightPanel, closeRightPanel } = useUiStore();
    const { notifications, addNotifications, removeNotification } = useNotificationStore();
    const [busyId, setBusyId] = useState<string | null>(null);
    const fetchWorkspaces = useWorkspaceStore((s) => s.fetchWorkspaces);

    // messenger 알림 구독(실시간) + 초기 목록. 읽음 처리도 서버에 함께 반영됨
    const { readNotification, readAllNotifications } = useNotification();

    useEffect(() => {
        // 마운트 시에도 로드 → 패널 안 열어도 종 뱃지에 반영
        (async () => {
            try {
                const { data, error } = await api.GET('/api/invitations/received');
                if (error || !data?.success) return;

                const pending = (data.data ?? []).filter((v) => v.status === 'PENDING');
                addNotifications(pending.map((v) => ({
                    id: `invite-${v.invitationId}`,   // 소스별 네임스페이스 (친구요청과 id 충돌 방지)
                    type: 'invite' as const,
                    text: `${v.inviterNickname}님이 ${v.workspaceName}에 초대했습니다`,
                    time: v.createdAt ? new Date(v.createdAt).toLocaleDateString() : '',
                    unread: true,
                    invitationId: v.invitationId,
                })));
            } catch (e) {
                console.error('초대 조회 실패:', e);
            }

            // 받은 친구 요청도 알림으로 (통합 알림 API가 없어 직접 조회 — 임시)
            try {
                // 친구 엔드포인트는 초대와 달리 배열을 직접 반환 (success 봉투 없음)
                const { data: fr, error: frErr } = await api.GET('/api/friends/requests/received');
                if (!frErr && fr) {
                    addNotifications(fr
                        .filter((r) => r.id != null)
                        .map((r) => ({
                            id: `friend-${r.id}`,
                            type: 'friend' as const,
                            text: `${r.name}님이 친구 요청을 보냈습니다`,
                            time: '',
                            unread: true,
                            requestId: r.id!,   // 요청(관계) id — 수락/거절에 사용
                        })));
                }
            } catch (e) {
                console.error('친구 요청 조회 실패:', e);
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
            // 수락하면 워크스페이스 멤버가 되므로 목록을 다시 불러옴
            if (action === 'ACCEPTED') await fetchWorkspaces();
        } catch (e) {
            console.error('초대 응답 실패:', e);
        } finally {
            setBusyId(null);
        }
    };

    const respondFriend = async (n: Notification, accept: boolean) => {
        if (!n.requestId) return;
        setBusyId(n.id);
        try {
            const { error } = accept
                ? await api.POST('/api/friends/requests/{requestId}/accept', {
                    params: { path: { requestId: n.requestId } },
                })
                : await api.POST('/api/friends/requests/{requestId}/reject', {
                    params: { path: { requestId: n.requestId } },
                });
            if (error) return;
            removeNotification(n.id);
        } catch (e) {
            console.error('친구 요청 응답 실패:', e);
        } finally {
            setBusyId(null);
        }
    };

    const open = activeRightPanel === 'notification';

    const unreadCount = notifications.filter((n) => n.unread).length;

    return (
        <div className={`h-full overflow-hidden transition-all duration-200 ease-out flex-shrink-0 ${open ? "w-64" : "w-0"}`}>
        <div className="app-chrome w-64 h-full bg-white border-l border-[#e8f8ed] flex flex-col">
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
                            onClick={() => readNotification(n.id)}
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

                        {/* 초대·친구요청 알림에 수락/거절 */}
                        {((n.type === 'invite' && n.invitationId) || (n.type === 'friend' && n.requestId)) && (
                            <div className="flex gap-1.5 px-2 pb-2">
                                <button
                                    onClick={() => n.type === 'invite' ? respondInvite(n, 'ACCEPTED') : respondFriend(n, true)}
                                    disabled={busyId === n.id}
                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] font-semibold bg-[#5CC87A] hover:bg-[#2E8B4F] disabled:bg-gray-200 text-white rounded-md transition-all"
                                >
                                    <Check size={12} /> 수락
                                </button>
                                <button
                                    onClick={() => n.type === 'invite' ? respondInvite(n, 'DECLINED') : respondFriend(n, false)}
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
                        onClick={readAllNotifications}
                        className="text-xs text-[#5CC87A] font-medium hover:underline"
                    >
                        모두 읽음 처리
                    </button>
                </div>
            )}
        </div>
        </div>
    );
}