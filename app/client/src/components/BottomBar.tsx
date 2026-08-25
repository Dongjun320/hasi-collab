import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bell, Users, Grid3x3, Settings, LogOut, Calendar, User, RefreshCw } from "lucide-react";
import { WeatherWidget } from "./WeatherWidget";
import { Tooltip } from "./Tooltip";
import { useUiStore } from "../store/uiStore";
import { useNotificationStore } from "../store/notificationStore";
import { useFriendStore } from "../store/friendStore";
import { useWorkspaceStore } from "../store/workspaceStore";
import { useMemberStore } from "../store/memberStore";
import { useAuthStore } from "../store/authStore";
import { toast } from "../store/toastStore";
import { api } from "../api/client";
import { disconnectStomp } from "../api/stomp";

interface BottomBarProps {
    children?: ReactNode;      // 좌측(페이지별): 로고 / 홈버튼
}

const badge = "absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border border-white";
const btn = "relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all";

export function BottomBar({ children }: BottomBarProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { activeRightPanel, toggleRightPanel, openModal } = useUiStore();
    const notifications = useNotificationStore((s) => s.notifications);
    const friends = useFriendStore((s) => s.friends);
    const { refreshToken, clear } = useAuthStore();
    const [quickOpen, setQuickOpen] = useState(false);
    const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // 실시간 대신 수동 새로고침 — 현재 컨텍스트의 목록을 다시 불러옴
    const handleRefresh = async () => {
        if (refreshing) return;
        setRefreshing(true);
        try {
            const { fetchWorkspaces, fetchChannels, currentWorkspace } = useWorkspaceStore.getState();
            const { fetchFriends } = useFriendStore.getState();
            await Promise.all([
                fetchWorkspaces(),
                fetchFriends(),
                currentWorkspace ? fetchChannels(currentWorkspace.id) : Promise.resolve(),
            ]);
            // 현재 워크스페이스 멤버 목록도 갱신
            if (currentWorkspace) {
                const { data } = await api.GET('/api/workspaces/{workspaceId}/members', {
                    params: { path: { workspaceId: currentWorkspace.id } },
                });
                if (data?.data) {
                    useMemberStore.getState().setMembers((data.data as any[]).map((m) => ({
                        userId: m.userId, nickname: m.nickname ?? '', role: m.role ?? 'MEMBER',
                    })));
                }
            }
            toast.success(t('bottomBar.refreshDone'));
        } catch (e) {
            console.error('새로고침 실패:', e);
            toast.error(t('bottomBar.refreshFailed'));
        } finally {
            setRefreshing(false);
        }
    };

    const unreadNotifications = notifications.filter((n) => n.unread).length;
    const totalUnread = friends.reduce((sum, f) => sum + f.unreadCount, 0);

    const handleLogout = async () => {
        setLogoutConfirmOpen(false);
        try {
            if (refreshToken) await api.POST("/api/auth/logout", { body: { refreshToken } });
        } catch (e) { console.error("로그아웃 실패:", e); }
        finally { disconnectStomp(); clear(); navigate("/"); }
    };

    return (
        <div className="app-chrome h-16 bg-[#1e3a28] flex items-center px-4 gap-1 flex-shrink-0 z-30">
            {children}

            <div className="flex-1" />
            <WeatherWidget />
            <div className="h-8 w-[2px] bg-white/20 rounded-full mx-2 flex-shrink-0" />

            <div className="flex items-center gap-1 flex-shrink-0">
                <Tooltip label={t('bottomBar.refresh')} side="top">
                    <button onClick={handleRefresh} disabled={refreshing}
                            className={`${btn} hover:bg-white/10 disabled:opacity-60`}>
                        <RefreshCw size={18} className={`text-white/70 ${refreshing ? "animate-spin" : ""}`} />
                    </button>
                </Tooltip>

                <Tooltip label={t('bottomBar.menu')} side="top">
                    <button onClick={() => setQuickOpen(!quickOpen)}
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${quickOpen ? "bg-[#5CC87A]" : "hover:bg-white/10"}`}>
                        <Grid3x3 size={19} className="text-white/70" />
                    </button>
                </Tooltip>

                <Tooltip label={t('bottomBar.calendar')} side="top">
                    <button onClick={() => toggleRightPanel("calendar")}
                            className={`${btn} ${activeRightPanel === "calendar" ? "bg-[#5CC87A]" : "hover:bg-white/10"}`}>
                        <Calendar size={19} className="text-white/70" />
                    </button>
                </Tooltip>

                <Tooltip label={t('bottomBar.friends')} side="top">
                    <button onClick={() => toggleRightPanel("friend")}
                            className={`${btn} ${activeRightPanel === "friend" ? "bg-[#5CC87A]" : "hover:bg-white/10"}`}>
                        <Users size={19} className="text-white/70" />
                        {activeRightPanel !== "friend" && totalUnread > 0 && (
                            <span className={badge}>{totalUnread > 99 ? "99+" : totalUnread}</span>
                        )}
                    </button>
                </Tooltip>

                <Tooltip label={t('bottomBar.notifications')} side="top">
                    <button onClick={() => toggleRightPanel("notification")}
                            className={`${btn} ${activeRightPanel === "notification" ? "bg-[#5CC87A]" : "hover:bg-white/10"}`}>
                        <Bell size={19} className="text-white/70" />
                        {activeRightPanel !== "notification" && unreadNotifications > 0 && (
                            <span className={badge}>{unreadNotifications > 99 ? "99+" : unreadNotifications}</span>
                        )}
                    </button>
                </Tooltip>

                <Tooltip label={t('bottomBar.myProfile')} side="top" align="end">
                    <button onClick={() => openModal('profile')}
                            className="w-9 h-9 rounded-full bg-gradient-to-br from-[#A8E6B8] to-[#5CC87A] flex items-center justify-center text-white text-sm font-bold hover:ring-2 hover:ring-[#5CC87A] hover:ring-offset-2 hover:ring-offset-[#1e3a28] transition-all ml-1">
                        {t('profile.meInitial')}
                    </button>
                </Tooltip>
            </div>

            {/* 메뉴 팝업 */}
            {quickOpen && (
                <>
                    <div className="fixed bottom-20 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-[#d4f4dd] p-4">
                        <div className="flex items-center gap-2">
                            <button onClick={() => { openModal('settings'); setQuickOpen(false); }}
                                    className="flex flex-col items-center gap-2 p-3 hover:bg-[#f0f9f4] rounded-xl transition-all group">
                                <div className="w-11 h-11 bg-gradient-to-br from-[#A8E6B8] to-[#5CC87A] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Settings size={20} className="text-white" />
                                </div>
                                <span className="text-xs text-[#2C3E50] font-medium">{t('bottomBar.settings')}</span>
                            </button>
                            <button onClick={() => { openModal('profile'); setQuickOpen(false); }} className="flex flex-col items-center gap-2 p-3 hover:bg-[#f0f9f4] rounded-xl transition-all group">
                                <div className="w-11 h-11 bg-gradient-to-br from-[#A8E6B8] to-[#5CC87A] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <User size={20} className="text-white" />
                                </div>
                                <span className="text-xs text-[#2C3E50] font-medium">{t('bottomBar.profile')}</span>
                            </button>
                            <button onClick={() => { setLogoutConfirmOpen(true); setQuickOpen(false); }}
                                    className="flex flex-col items-center gap-2 p-3 hover:bg-red-50 rounded-xl transition-all group">
                                <div className="w-11 h-11 bg-gradient-to-br from-[#A8E6B8] to-[#5CC87A] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <LogOut size={20} className="text-white" />
                                </div>
                                <span className="text-xs text-[#2C3E50] font-medium">{t('bottomBar.logout')}</span>
                            </button>
                        </div>
                    </div>
                    <div className="fixed inset-0 z-40" onClick={() => setQuickOpen(false)} />
                </>
            )}

            {/* 로그아웃 확인 모달 */}
            {logoutConfirmOpen && (
                <div className="fixed inset-0 z-[110] bg-black/40 flex items-center justify-center p-4"
                     onClick={() => setLogoutConfirmOpen(false)}>
                    <div className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-2xl"
                         onClick={(e) => e.stopPropagation()}>
                        <h4 className="font-bold text-[#2C3E50] mb-2">{t('bottomBar.logout')}</h4>
                        <p className="text-sm text-gray-500 mb-5">{t('bottomBar.logoutConfirm')}</p>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setLogoutConfirmOpen(false)}
                                    className="px-4 py-2 text-sm border border-gray-200 hover:bg-gray-50 rounded-lg transition-all">
                                {t('common.cancel')}
                            </button>
                            <button onClick={handleLogout}
                                    className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all">
                                {t('bottomBar.logout')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}