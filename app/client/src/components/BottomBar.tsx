import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Users, Grid3x3, Settings, LogOut, Calendar, User } from "lucide-react";
import { WeatherWidget } from "./WeatherWidget";
import { Tooltip } from "./Tooltip";
import { useUiStore } from "../store/uiStore";
import { useNotificationStore } from "../store/notificationStore";
import { useFriendStore } from "../store/friendStore";
import { useAuthStore } from "../store/authStore";
import { api } from "../api/client";
import { disconnectStomp } from "../api/stomp";

interface BottomBarProps {
    children?: ReactNode;      // 좌측(페이지별): 로고 / 홈버튼
}

const badge = "absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border border-white";
const btn = "relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all";

export function BottomBar({ children }: BottomBarProps) {
    const navigate = useNavigate();
    const { activeRightPanel, toggleRightPanel, openModal } = useUiStore();
    const notifications = useNotificationStore((s) => s.notifications);
    const friends = useFriendStore((s) => s.friends);
    const { refreshToken, clear } = useAuthStore();
    const [quickOpen, setQuickOpen] = useState(false);
    const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

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
                <Tooltip label="메뉴" side="top">
                    <button onClick={() => setQuickOpen(!quickOpen)}
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${quickOpen ? "bg-[#5CC87A]" : "hover:bg-white/10"}`}>
                        <Grid3x3 size={19} className="text-white/70" />
                    </button>
                </Tooltip>

                <Tooltip label="캘린더" side="top">
                    <button onClick={() => toggleRightPanel("calendar")}
                            className={`${btn} ${activeRightPanel === "calendar" ? "bg-[#5CC87A]" : "hover:bg-white/10"}`}>
                        <Calendar size={19} className="text-white/70" />
                    </button>
                </Tooltip>

                <Tooltip label="친구 목록" side="top">
                    <button onClick={() => toggleRightPanel("friend")}
                            className={`${btn} ${activeRightPanel === "friend" ? "bg-[#5CC87A]" : "hover:bg-white/10"}`}>
                        <Users size={19} className="text-white/70" />
                        {activeRightPanel !== "friend" && totalUnread > 0 && (
                            <span className={badge}>{totalUnread > 99 ? "99+" : totalUnread}</span>
                        )}
                    </button>
                </Tooltip>

                <Tooltip label="알림" side="top">
                    <button onClick={() => toggleRightPanel("notification")}
                            className={`${btn} ${activeRightPanel === "notification" ? "bg-[#5CC87A]" : "hover:bg-white/10"}`}>
                        <Bell size={19} className="text-white/70" />
                        {activeRightPanel !== "notification" && unreadNotifications > 0 && (
                            <span className={badge}>{unreadNotifications > 99 ? "99+" : unreadNotifications}</span>
                        )}
                    </button>
                </Tooltip>

                <Tooltip label="내 프로필" side="top" align="end">
                    <button onClick={() => openModal('profile')}
                            className="w-9 h-9 rounded-full bg-gradient-to-br from-[#A8E6B8] to-[#5CC87A] flex items-center justify-center text-white text-sm font-bold hover:ring-2 hover:ring-[#5CC87A] hover:ring-offset-2 hover:ring-offset-[#1e3a28] transition-all ml-1">
                        나
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
                                <span className="text-xs text-[#2C3E50] font-medium">설정</span>
                            </button>
                            <button onClick={() => { openModal('profile'); setQuickOpen(false); }} className="flex flex-col items-center gap-2 p-3 hover:bg-[#f0f9f4] rounded-xl transition-all group">
                                <div className="w-11 h-11 bg-gradient-to-br from-[#A8E6B8] to-[#5CC87A] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <User size={20} className="text-white" />
                                </div>
                                <span className="text-xs text-[#2C3E50] font-medium">프로필</span>
                            </button>
                            <button onClick={() => { setLogoutConfirmOpen(true); setQuickOpen(false); }}
                                    className="flex flex-col items-center gap-2 p-3 hover:bg-red-50 rounded-xl transition-all group">
                                <div className="w-11 h-11 bg-gradient-to-br from-[#A8E6B8] to-[#5CC87A] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <LogOut size={20} className="text-white" />
                                </div>
                                <span className="text-xs text-[#2C3E50] font-medium">로그아웃</span>
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
                        <h4 className="font-bold text-[#2C3E50] mb-2">로그아웃</h4>
                        <p className="text-sm text-gray-500 mb-5">로그아웃 하시겠습니까?</p>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setLogoutConfirmOpen(false)}
                                    className="px-4 py-2 text-sm border border-gray-200 hover:bg-gray-50 rounded-lg transition-all">
                                취소
                            </button>
                            <button onClick={handleLogout}
                                    className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all">
                                로그아웃
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}