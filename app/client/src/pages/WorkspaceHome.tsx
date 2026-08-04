import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from '../store/authStore';
import {
  Users, Globe, MessageCircle, LayoutGrid,
} from "lucide-react";
import { useFriendStore } from "../store/friendStore";
import { usePresenceStore, presenceDotColor, presenceLabel } from "../store/presenceStore";
import { useFriendPresence } from "../hooks/usePresence";
import { FriendSidebar } from "../components/FriendSidebar";
import { useWorkspaceStore } from "../store/workspaceStore";
import { NotificationSidebar } from "../components/NotificationSidebar";
import { CalendarSidebar } from "../components/CalendarSidebar";
import { BottomBar } from "../components/BottomBar";
import Toast from "../components/Toast";
import hasiClean from "./HasiClean.png";


export function WorkspaceHome() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user } = useAuthStore();

  const { friends } = useFriendStore();
  const onlineUserIds = usePresenceStore((s) => s.onlineUserIds);
  const isOnline = (id: number | string) => onlineUserIds.has(String(id));
  useFriendPresence(friends.map((f) => f.uid));
  const { workspaces, setWorkspace, fetchWorkspaces, wsLoading } = useWorkspaceStore();

  const [toast, setToast] = useState<{ open: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({
    open: false, message: '', type: 'info',
  });
  const closeToast = useCallback(
      () => setToast((prev) => ({ ...prev, open: false })), []);


  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // HOME 진입 시에도 워크스페이스 조회
  // (기존에는 WorkspaceSidebar에서만 호출해서, /workspace를 한 번 다녀와야 목록이 채워졌음)
  useEffect(() => {
    fetchWorkspaces();
  }, []);

  // friendStore에서 가져옴 (오프라인 제외 = 온라인 친구)
  const onlineFriends = friends.filter((f) => isOnline(f.uid));

  const recentActivities = [
    { ws: "개", name: "개발팀",   text: "새 메시지 5개",   time: "5분 전",  color: "from-[#5CC87A] to-[#2E8B4F]" },
    { ws: "디", name: "디자인팀", text: "파일이 업로드됨", time: "1시간 전", color: "from-[#A8E6B8] to-[#5CC87A]" },
    { ws: "마", name: "마케팅팀", text: "미팅이 시작됨",   time: "2시간 전", color: "from-[#A8E6B8] to-[#FFE66D]" },
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

  const today     = new Date();
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
              <h1 className="text-lg font-bold text-[#2C3E50]">
                안녕하세요, {user?.nickname ?? "게스트"}님 👋
              </h1>
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
                <h2 className="text-sm font-bold text-[#2C3E50]">
                  워크스페이스 · {wsLoading ? "불러오는 중" : `${workspaces.length}개`}
                </h2>
                {!wsLoading && workspaces.length === 0 && (
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
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${presenceDotColor(isOnline(f.uid))}`} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#2C3E50]">{f.name}</p>
                      <p className="text-[10px] text-gray-400">{f.statusMessage ?? presenceLabel(isOnline(f.uid))}</p>
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
        <FriendSidebar />
        <NotificationSidebar />
        <CalendarSidebar />
      </div>

      {/* 하단 내비게이션 바 (Windows 작업표시줄 스타일) */}
      <BottomBar>
        {/* 좌측: 로고 + 구분선 */}
        <div>
          <img src={hasiClean} alt="HASI" className="no-drag w-11 h-11 rounded-2xl object-contain" />
        </div>
        <div className="h-8 w-[2px] bg-white/20 rounded-full mx-2 flex-shrink-0" />
      </BottomBar>

      {toast.open && (
        <Toast
          isOpen={toast.open}
          type={toast.type}
          message={toast.message}
          onClose={closeToast}
        />
      )}
    </div>
  );
}
