import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from '../store/authStore';
import { api } from '../api/client';
import {
  Users, Bell, Settings, Globe,
  ChevronLeft, ChevronRight, MessageCircle, LogOut, Calendar,
    LayoutGrid,
} from "lucide-react";
import { useUiStore } from "../store/uiStore";
import { useFriendStore, FRIEND_STATUS } from "../store/friendStore";
import { FriendSidebar } from "../components/FriendSidebar";
import hasiClean from "./HasiClean.png"
import { useWorkspaceStore } from "../store/workspaceStore";
import { NotificationSidebar } from "../components/NotificationSidebar";
import { useNotificationStore } from "../store/notificationStore";
import { Tooltip } from "../components/Tooltip";


export function WorkspaceHome() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [calendarDate, setCalendarDate] = useState(new Date());
  const { refreshToken, clear } = useAuthStore();
  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await api.POST('/api/auth/logout', {body: {refreshToken}})
      }
    } catch (error) {
      console.error("로그아웃 실패:", error);
    } finally {
      clear();
      navigate("/");
    }
  };

  const { activeRightPanel, toggleRightPanel } = useUiStore();
  const { friends } = useFriendStore();
  const { workspaces, setWorkspace } = useWorkspaceStore();
  const { notifications } = useNotificationStore();
  const unreadNotifications = notifications.filter((n) => n.unread).length;
  const totalUnread = friends.reduce((sum, f) => sum + f.unreadCount, 0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // friendStore에서 가져옴 (오프라인 제외 = 온라인 친구)
  const onlineFriends = friends.filter((f) => f.status !== "offline");

  const recentActivities = [
    { ws: "개", name: "개발팀",   text: "새 메시지 5개",   time: "5분 전",  color: "from-[#5CC87A] to-[#2E8B4F]" },
    { ws: "디", name: "디자인팀", text: "파일이 업로드됨", time: "1시간 전", color: "from-[#A8E6B8] to-[#5CC87A]" },
    { ws: "마", name: "마케팅팀", text: "미팅이 시작됨",   time: "2시간 전", color: "from-[#A8E6B8] to-[#FFE66D]" },
  ];

  const upcomingEvents = [
    { id: 1, title: "디자인 리뷰 미팅", date: "2026-05-25", time: "14:00", dot: "bg-green-500" },
    { id: 2, title: "스프린트 계획",    date: "2026-05-28", time: "10:00", dot: "bg-amber-500" },
    { id: 3, title: "데모 발표",        date: "2026-06-02", time: "15:00", dot: "bg-orange-500" },
  ];

  // 세계 시계
  const getZoneTime = (offset: number) => {
    const utc = currentTime.getTime() + currentTime.getTimezoneOffset() * 60000;
    return new Date(utc + offset * 3600000);
  };
  const fmt  = (d: Date) => d.toTimeString().slice(0, 8);
  const fmtD = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일`;
  const clocks = [
    { label: "KR", city: "서울", offset: 9  },
    { label: "JP", city: "도쿄", offset: 9  },
    { label: "US", city: "뉴욕", offset: -4 },
  ];

  // 캘린더
  const year      = calendarDate.getFullYear();
  const month     = calendarDate.getMonth();
  const firstDay  = new Date(year, month, 1).getDay();
  const daysInMon = new Date(year, month + 1, 0).getDate();
  const today     = new Date();
  const dayNames  = ["일", "월", "화", "수", "목", "금", "토"];
  const weekDayKo = ["일", "월", "화", "수", "목", "금", "토"];


  return (
    <div className="flex flex-col h-screen bg-[#f8fdf9] overflow-hidden animate-fade-in">

      {/* 상단 콘텐츠 영역 */}
      <div className="flex flex-1 overflow-hidden">

        {/* 메인 콘텐츠 */}
        <div className="flex-1 flex flex-col overflow-hidden relative">

          {/* 헤더 */}
          <div className="px-6 pt-5 pb-3 flex items-center justify-between flex-shrink-0 border-b border-[#e8f8ed]">
            <div>
              <h1 className="text-lg font-bold text-[#2C3E50]">안녕하세요, 김동준님 👋</h1>
              <p className="text-xs text-gray-400">
                {today.getFullYear()}년 {today.getMonth() + 1}월 {today.getDate()}일 {weekDayKo[today.getDay()]}요일
              </p>
            </div>
          </div>

          {/* 스크롤 영역 */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e8f8ed]">
              <div className="flex items-center gap-2 mb-3">
                <LayoutGrid size={15} className="text-[#5CC87A]"/>
                <h2 className="text-sm font-bold text-[#2C3E50]">워크스페이스 · {workspaces.length}개</h2>
                {workspaces.length === 0 && (
                    <button
                        onClick={() => navigate("/workspace")}
                        className="ml-auto px-3 py-1 text-xs font-medium bg-[#5CC87A] hover:bg-[#2E8B4F] text-white rounded-lg transition-all"
                    >
                      워크스페이스 시작하기
                    </button>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {workspaces.map((ws) => (
                    <button
                    key={ws.id}
                    onClick={() => {setWorkspace(ws);
                    navigate("/workspace");
                    }}
                    title={ws.name}
                    className="relative group flex flex-col items-center gap-1.5 w-[68px]"
                    >
                      <div
                          className="w-12 h-12 rounded-[24px] group-hover:rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md transition-all duration-200"
                          style={{ background: `linear-gradient(to bottom right, ${ws.colors[0]}, ${ws.colors[1]})` }}
                      >
                        {ws.avatar}
                        </div>
                    </button>
                ))}
              </div>
            </div>

            {/* 세계 시계 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e8f8ed]">
              <div className="flex items-center gap-2 mb-3">
                <Globe size={15} className="text-[#5CC87A]" />
                <h2 className="text-sm font-bold text-[#2C3E50]">세계 시계</h2>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {clocks.map((tz) => {
                  const t = getZoneTime(tz.offset);
                  return (
                    <div key={tz.label} className="bg-[#f8fdf9] rounded-xl p-3 text-center border border-[#e8f8ed]">
                      <p className="text-xs font-bold text-[#5CC87A]">{tz.label}</p>
                      <p className="text-[10px] text-gray-400 mb-1">{tz.city}</p>
                      <p className="text-base font-bold text-[#2C3E50] font-mono tracking-tight">{fmt(t)}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{fmtD(t)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 온라인 친구 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e8f8ed]">
              <div className="flex items-center gap-2 mb-3">
                <Users size={15} className="text-[#5CC87A]" />
                <h2 className="text-sm font-bold text-[#2C3E50]">온라인 친구 · {onlineFriends.length}명</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {onlineFriends.map((f) => (
                  <div key={f.id} className="flex items-center gap-2 bg-[#f8fdf9] rounded-xl px-3 py-2 border border-[#e8f8ed]">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A8E6B8] to-[#5CC87A] flex items-center justify-center text-white text-xs font-bold">
                        {f.avatar ?? f.name.charAt(0)}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${FRIEND_STATUS[f.status].dot}`} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#2C3E50]">{f.name}</p>
                      <p className="text-[10px] text-gray-400">{f.statusMessage ?? FRIEND_STATUS[f.status].label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 최근 활동 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e8f8ed]">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle size={15} className="text-[#5CC87A]" />
                <h2 className="text-sm font-bold text-[#2C3E50]">최근 활동</h2>
              </div>
              <div className="space-y-2">
                {recentActivities.map((a, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate("/workspace")}
                    className="flex items-center gap-3 p-3 bg-[#f8fdf9] rounded-xl border border-[#e8f8ed] hover:border-[#5CC87A] transition-colors cursor-pointer"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ background: `linear-gradient(to bottom right, ${a.color.includes("A8E6B8") ? "#A8E6B8" : a.color.includes("2E8B4F") ? "#5CC87A" : "#A8E6B8"}, ${a.color.includes("2E8B4F") ? "#2E8B4F" : a.color.includes("FFE66D") ? "#FFE66D" : "#5CC87A"})` }}
                    >
                      {a.ws}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#2C3E50]">{a.name}</p>
                      <p className="text-xs text-gray-400">{a.text}</p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{a.time}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── 오른쪽 rail 슬롯: activeRightPanel에 따라 표시 (null이면 아무것도 안 뜸) ── */}
        {activeRightPanel === 'friend' && <FriendSidebar />}
        <NotificationSidebar />
        {activeRightPanel === 'calendar' && (
        <div className="w-64 bg-white border-l border-[#e8f8ed] p-4 overflow-y-auto flex-shrink-0">

          {/* 월 네비게이션 */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#2C3E50]">{year}년 {month + 1}월</h2>
            <div className="flex gap-0.5">
              <button
                onClick={() => setCalendarDate(new Date(year, month - 1, 1))}
                className="p-1 hover:bg-[#f0f9f4] rounded-lg transition-all"
              >
                <ChevronLeft size={14} className="text-[#5CC87A]" />
              </button>
              <button
                onClick={() => setCalendarDate(new Date(year, month + 1, 1))}
                className="p-1 hover:bg-[#f0f9f4] rounded-lg transition-all"
              >
                <ChevronRight size={14} className="text-[#5CC87A]" />
              </button>
            </div>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 mb-1">
            {dayNames.map((d, i) => (
              <div
                key={d}
                className={`text-center text-[10px] font-semibold py-1" ${
                  i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e-${i}`} />
            ))}
            {Array.from({ length: daysInMon }).map((_, i) => {
              const day = i + 1;
              const col = (firstDay + i) % 7;
              const isToday =
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();
              let colorClass = "text-[#2C3E50]";
              if (!isToday && col === 0) colorClass = "text-red-400";
              if (!isToday && col === 6) colorClass = "text-blue-400";
              return (
                <button
                  key={day}
                  className={`aspect-square flex items-center justify-center text-[11px] rounded-full transition-all ${
                    isToday
                      ? "bg-[#5CC87A] text-white font-bold"
                      : `hover:bg-[#f0f9f4] ${colorClass}`
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* 다가오는 일정 */}
          <div className="mt-5">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-gray-400 text-xs">⏰</span>
              <h3 className="text-xs font-bold text-[#2C3E50]">다가오는 일정</h3>
            </div>
            <div className="space-y-2">
              {upcomingEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-start gap-2.5 p-2.5 bg-[#f8fdf9] rounded-xl border border-[#e8f8ed] hover:border-[#5CC87A] transition-colors cursor-pointer"
                >
                  <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${ev.dot}`} />
                  <div>
                    <p className="text-xs font-semibold text-[#2C3E50]">{ev.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{ev.date} · {ev.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
        )}
      </div>

      {/* 하단 내비게이션 바 (Windows 작업표시줄 스타일) */}
      <div className="h-16 bg-[#1e3a28] flex items-center px-4 gap-1 flex-shrink-0">

        {/* 홈 버튼 */}
        <div>
          <img src={hasiClean} alt="HASI" className="w-11 h-11 rounded-2xl object-contain"/>
        </div>

        {/* 구분선 */}
        <div className="h-8 w-[2px] bg-white/20 rounded-full mx-2 flex-shrink-0" />

        {/* 스페이서 */}
        <div className="flex-1" />

        {/* 구분선 */}
        <div className="h-8 w-[2px] bg-white/20 rounded-full mx-2 flex-shrink-0" />

        {/* 개인 메뉴 */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Tooltip label="달력" side="top">
            <button
              onClick={() => toggleRightPanel('calendar')}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all
                ${activeRightPanel === 'calendar' ? "bg-[#5CC87A]" : "hover:bg-white/10"}`}
            >
              <Calendar size={19} className="text-white/60" />
            </button>
          </Tooltip>

          <Tooltip label="친구 목록" side="top">
            <button
              onClick={() => toggleRightPanel('friend')}
              className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all
                ${activeRightPanel === 'friend' ? "bg-[#5CC87A]" : "hover:bg-white/10"}`}
            >
              <Users size={19} className="text-white/60" />
              {activeRightPanel !== 'friend' && totalUnread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {totalUnread}
                </span>
              )}
            </button>
          </Tooltip>

          <Tooltip label="알림" side="top">
            <button
              onClick={() => toggleRightPanel('notification')}
              className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all
                ${activeRightPanel === 'notification' ? "bg-[#5CC87A]" : "hover:bg-white/10"}`}
            >
              <Bell size={19} className="text-white/60" />
              {activeRightPanel !== 'notification' && unreadNotifications > 0 && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          </Tooltip>

          <Tooltip label="설정" side="top">
            <button className="w-11 h-11 rounded-2xl hover:bg-white/10 flex items-center justify-center transition-all">
              <Settings size={19} className="text-white/60" />
            </button>
          </Tooltip>

          <Tooltip label="로그아웃" side="top">
            <button
              onClick={handleLogout}
              className="group w-11 h-11 rounded-2xl hover:bg-white/10 flex items-center justify-center transition-all"
            >
              <LogOut size={19} className="text-white/60 group-hover:text-red-400 transition-colors" />
            </button>
          </Tooltip>

          <Tooltip label="내 프로필" side="top" align="end">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#A8E6B8] to-[#5CC87A] flex items-center justify-center text-white text-sm font-bold cursor-pointer ml-1 hover:ring-2 hover:ring-[#5CC87A] hover:ring-offset-2 hover:ring-offset-[#1e3a28] transition-all">
              나
            </div>
          </Tooltip>
        </div>

      </div>
    </div>
  );
}
