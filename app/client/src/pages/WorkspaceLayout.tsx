import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Settings, Calendar, LayoutGrid,
  Plus, Bell, User, Grid3x3, Search,
  Phone, MessageSquare, LogOut, Users, Home,
  AlertCircle, X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { WorkspaceSidebar } from "../components/WorkspaceSidebar";
import { useWorkspaceStore } from "../store/workspaceStore";
import { useFriendStore } from "../store/friendStore";
import { useUiStore } from "../store/uiStore";
import { FriendSidebar } from "../components/FriendSidebar";
import { NotificationSidebar } from "../components/NotificationSidebar";
import { useNotificationStore } from "../store/notificationStore";
import { Tooltip } from "../components/Tooltip";
import { api } from "../api/client";


const TOOLS = [
  { path: "/workspace/kanban",   icon: LayoutGrid,    label: "칸반" },
  { path: "/workspace/calendar", icon: Calendar,      label: "캘린더" },
  { path: "/workspace/threads",  icon: MessageSquare, label: "스레드" },
];

// 서버는 실패 시 { success:false, error:{ code, message } }를 내려줌 (한국어 메시지 포함).
// openapi-fetch의 error는 타입이 넓어 any 경유가 불가피 — 메시지 추출을 한 곳으로 모음.
const errorMessageOf = (error: unknown, fallback: string) =>
  (error as any)?.error?.message ?? fallback;

export function WorkspaceLayout() {
  const {currentWorkspace, channelsByWorkspace, setWorkspaceChannels, addChannel, updateChannel, removeChannel,
      deleteWorkspace,
  } = useWorkspaceStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { friends } = useFriendStore();
  const { activeRightPanel, toggleRightPanel } = useUiStore();
  const channels = currentWorkspace ? channelsByWorkspace[currentWorkspace.id] ?? [] : [];
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);

  const isActive = (path: string) =>
    path !== "/workspace"
      ? location.pathname.startsWith(path)
      : location.pathname === "/workspace";

  const isInChannel = location.pathname.startsWith("/workspace/channels");

  const activeChannelId = isInChannel
      ? Number(location.pathname.split("/workspace/channels/")[1]) || null
      : null;

  const [lastChannelByWorkspace, setLastChannelByWorkspace] = useState<Record<number, number>>({});

  // 채널 생성·삭제·이름변경 실패 사유 — 예전엔 console.error만 찍어 화면이 무반응이었음
  const [channelError, setChannelError] = useState("");

  // 워크스페이스가 바뀔 때마다 채널 목록 조회
  useEffect(() => {
    if (!currentWorkspace) return;
    const wsId = currentWorkspace.id;
    setChannelError("");
    (async () => {
      try {
        const { data, error } = await api.GET('/api/workspaces/{workspaceId}/channels', {
          params: { path: { workspaceId: wsId } },
        });
        if (error || !data?.success) {
          console.error('채널 목록 조회 실패:', error);
          return;
        }
        setWorkspaceChannels(wsId, (data.data ?? []).map((c) => ({
          id: c.id!,
          name: c.name ?? '',
          parentId: c.parentId ?? null,
          workspaceId: c.workspaceId,
          isPrivate: c.isPrivate,
        })));
      } catch (e) {
        console.error('채널 목록 조회 실패:', e);
      }
    })();
  }, [currentWorkspace?.id]);

  const handleAddChannel = async (name: string, parentId?: number | null) => {
    if (!currentWorkspace) return;
    const wsId = currentWorkspace.id;
    setChannelError("");
    try {
      const { data, error } = await api.POST('/api/workspaces/{workspaceId}/channels', {
        params: { path: { workspaceId: wsId } },
        body: { name, isPrivate: false, parentId: parentId ?? null },   // parentId 생략 = 최상위 채널
      });
      if (error || !data?.data?.id) {
        // CH_001 동일 이름 / CH_003 입력값 오류
        setChannelError(errorMessageOf(error, '채널을 만들지 못했습니다'));
        return;
      }
      const created = data.data;
      addChannel(wsId, {
        id: created.id!,
        name: created.name ?? name,
        parentId: created.parentId ?? null,
        workspaceId: created.workspaceId,
        isPrivate: created.isPrivate,
      });
      navigate(`/workspace/channels/${created.id}`);
    } catch (e) {
      console.error('채널 생성 실패:', e);
      setChannelError('서버에 연결할 수 없습니다');
    }
  };

  const handleDeleteChannel = async (channelId: number) => {
    if (!currentWorkspace) return;
    const wsId = currentWorkspace.id;
    setChannelError("");
    try {
      const { error } = await api.DELETE('/api/workspaces/{workspaceId}/channels/{channelId}', {
        params: { path: { workspaceId: wsId, channelId } },
      });
      if (error) {
        // CH_004 "하위 채널이 있어 삭제할 수 없습니다" — 사이드바에서 미리 막지만 서버 판단이 최종
        setChannelError(errorMessageOf(error, '채널을 삭제하지 못했습니다'));
        return;
      }
      removeChannel(wsId, channelId);
      if (activeChannelId === channelId) navigate("/workspace");
    } catch (e) {
      console.error('채널 삭제 실패:', e);
      setChannelError('서버에 연결할 수 없습니다');
    }
  };

  const handleRenameChannel = async (channelId: number, newName: string) => {
    if (!currentWorkspace) return;
    const wsId = currentWorkspace.id;
    setChannelError("");
    try {
      const { error } = await api.PATCH('/api/workspaces/{workspaceId}/channels/{channelId}', {
        params: { path: { workspaceId: wsId, channelId } },
        body: { name: newName },
      });
      if (error) {
        setChannelError(errorMessageOf(error, '채널 이름을 변경하지 못했습니다'));
        return;
      }
      updateChannel(wsId, channelId, newName);
    } catch (e) {
      console.error('채널 이름 변경 실패:', e);
      setChannelError('서버에 연결할 수 없습니다');
    }
  };

  const handleDeleteWorkspace = async (workspaceId: number) => {
      try {
          const {error} = await api.DELETE('/api/workspaces/{workspaceId}', {
              params: {path: {workspaceId}},
          });
          if (error) {
              console.error('워크스페이스 삭제 실패:', error);
              return;
          }
      } catch (e) {
          console.error('워크스페이스 삭제 실패:', e);
          return;
      }
      // store의 deleteWorkspace가 채널 캐시(channelsByWorkspace)까지 함께 정리함
      deleteWorkspace(workspaceId);

      const newCurrent = useWorkspaceStore.getState().currentWorkspace;
      if (newCurrent) {
          const ch = getDefaultChannelId(newCurrent.id);
          navigate(ch ? `/workspace/channels/${ch}` : "/workspace");
      } else {
          navigate("/workspace");
      }
  }


      const getDefaultChannelId = (workspaceId: number): number | null =>
      lastChannelByWorkspace[workspaceId] ?? channelsByWorkspace[workspaceId]?.[0]?.id ?? null;


  const QUICK_ITEMS = [
    {
      icon: MessageSquare,
      label: "메시지",
      to: currentWorkspace ? `/workspace/channels/${getDefaultChannelId(currentWorkspace.id)}` : "/workspace",
    },
    { icon: Calendar, label: "달력",   to: "/workspace/calendar" },
    { icon: User,     label: "내정보", to: "/workspace/profile" },
    { icon: Phone,    label: "전화",   to: "#" },
    { icon: LogOut,   label: "로그아웃", to: "/" },
  ];

  const totalUnread = friends.reduce((sum, f) => sum + f.unreadCount, 0)
  const { notifications } = useNotificationStore();
  const unreadNotifications = notifications.filter((n) => n.unread).length;

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">

      {/* ── 상단 영역: 사이드바 + 콘텐츠 (하단바 제외) ── */}
      <div className="flex flex-1 overflow-hidden">

      {/* ── 사이드바 (서버 레일 + 채널 목록) ── */}
      <WorkspaceSidebar
        channels={channels}
        activeChannelId={activeChannelId}
        onSelectChannel={(id) => {
          if (currentWorkspace) {
            setLastChannelByWorkspace((prev) => ({ ...prev, [currentWorkspace.id]: id }));
          }
          navigate(`/workspace/channels/${id}`);
        }}
        onAddChannel={handleAddChannel}
        onDeleteChannel={handleDeleteChannel}
        onRenameChannel={handleRenameChannel}
        onDeleteWorkspace={handleDeleteWorkspace}
        getDefaultChannelId={getDefaultChannelId}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative">

        {/* ── 상단 헤더 ── */}
        <div className="app-chrome h-14 bg-white border-b border-[#e8f8ed] flex items-center px-5 gap-3 flex-shrink-0">
          {currentWorkspace && (
              <div className="flex items-center gap-2.5">
                <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm"
                    style={{
                      background: `linear-gradient(to bottom right, ${currentWorkspace.colors[0]}, ${currentWorkspace.colors[1]})`,
                    }}
                >
                  {currentWorkspace.avatar}
                </div>
                <h1 className="font-bold text-[#2C3E50] text-base">{currentWorkspace.name}</h1>
              </div>
          )}
          <div className="flex-1" />
          <Tooltip label="검색" side="bottom">
            <button className="p-2 hover:bg-[#f0f9f4] rounded-xl transition-all">
              <Search size={18} className="text-[#5CC87A]" />
            </button>
          </Tooltip>

          <Tooltip label="설정" side="bottom">
            <Link to="/workspace/settings" className="p-2 hover:bg-[#f0f9f4] rounded-xl transition-all">
              <Settings size={18} className="text-[#5CC87A]" />
            </Link>
          </Tooltip>
          <Tooltip label="내 프로필" side="bottom" align="end">
            <Link to="/workspace/profile">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A8E6B8] to-[#5CC87A] flex items-center justify-center text-white text-sm font-bold hover:ring-2 hover:ring-[#5CC87A] hover:ring-offset-1 transition-all">
                나
              </div>
            </Link>
          </Tooltip>
        </div>

        {/* ── 채널 작업 실패 안내 ── */}
        {channelError && (
          <div className="app-chrome flex items-center gap-2 px-5 py-2 bg-red-50 border-b border-red-100 flex-shrink-0">
            <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-600 flex-1">{channelError}</p>
            <button
              onClick={() => setChannelError("")}
              title="닫기"
              className="p-1 hover:bg-red-100 rounded-md transition-all flex-shrink-0"
            >
              <X size={13} className="text-red-400" />
            </button>
          </div>
        )}

        {/* ── 메인 콘텐츠 ── */}
        <div className="flex-1 overflow-hidden relative">
          {currentWorkspace ? (
              <Outlet context={{ channels }} />
          ) : (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-6">
                <div className="w-16 h-16 rounded-2xl bg-[#f0f9f4] flex items-center justify-center">
                  <LayoutGrid size={28} className="text-[#5CC87A]" />
                </div>
                <p className="text-sm font-semibold text-[#2C3E50]">
                  참여 중인 워크스페이스가 없습니다
                </p>
                <p className="text-xs text-gray-400">
                  왼쪽의 <span className="font-semibold text-[#5CC87A]">+</span> 버튼으로 워크스페이스를 만들어보세요
                </p>
              </div>
          )}
        </div>

        {/* 퀵 메뉴 팝업 */}
        {isQuickMenuOpen && (
          <>
            <div className="fixed bottom-20 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-[#d4f4dd] p-4">
              <div className="flex items-center gap-2">
                {QUICK_ITEMS.map((item, idx) => (
                  <Link
                    key={idx}
                    to={item.to}
                    onClick={() => item.to !== "#" && setIsQuickMenuOpen(false)}
                    className="flex flex-col items-center gap-2 p-3 hover:bg-[#f0f9f4] rounded-xl transition-all group"
                  >
                    <div className="w-11 h-11 bg-gradient-to-br from-[#A8E6B8] to-[#5CC87A] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <item.icon size={20} className="text-white" />
                    </div>
                    <span className="text-xs text-[#2C3E50] font-medium">{item.label}</span>
                  </Link>
                ))}
                <div className="w-px h-14 bg-[#d4f4dd] mx-1" />
                <button className="flex flex-col items-center gap-2 p-3 hover:bg-[#f0f9f4] rounded-xl transition-all group">
                  <div className="w-11 h-11 bg-gradient-to-br from-[#d4f4dd] to-[#A8E6B8] rounded-full flex items-center justify-center border-2 border-dashed border-[#5CC87A] group-hover:scale-110 transition-transform">
                    <Plus size={20} className="text-[#5CC87A]" />
                  </div>
                  <span className="text-xs text-[#2C3E50] font-medium">편집</span>
                </button>
              </div>
            </div>
            <div className="fixed inset-0 z-40" onClick={() => setIsQuickMenuOpen(false)} />
          </>
        )}
        </div>
        <FriendSidebar />
        <NotificationSidebar />
      </div>

      {/* ── 하단 작업표시줄 (윈도우 작업표시줄처럼 전체폭 고정) ── */}
      <div className="app-chrome h-16 bg-[#1e3a28] flex items-center px-4 gap-1 flex-shrink-0 z-30">

        {/* 홈버튼 */}
        <Tooltip label="홈" side="top" align="start">
          <button
              onClick={() => navigate("/WorkspaceHome")}
              className="w-11 h-11 rounded-xl flex items-center justify-center transition-all flex-shrink-0
              text-white/60 hover:bg-white/10 hover:text-white"
          >
            <Home size={19} />
          </button>
        </Tooltip>

        <div className="h-8 w-[2px] bg-white/20 rounded-full mx-2 flex-shrink-0" />

          {/* 도구들 */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              const active = isActive(tool.path);
              return (
                <Link
                  key={tool.path}
                  to={tool.path}
                  title={tool.label}
                  className={`flex items-center gap-1.5 px-3 h-10 rounded-xl text-sm font-medium transition-all flex-shrink-0
                    ${active
                      ? "bg-[#5CC87A] text-white shadow-md"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                >
                  <Icon size={15} />
                  <span>{tool.label}</span>
                </Link>
              );
            })}
          </div>

          {/* 스페이서 */}
          <div className="flex-1" />

          <div className="h-8 w-[2px] bg-white/20 rounded-full mx-2 flex-shrink-0" />

          {/* 개인 메뉴 */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Tooltip label="빠른 메뉴" side="top">
              <button
                onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all
                  ${isQuickMenuOpen ? "bg-[#5CC87A]" : "hover:bg-white/10"}`}
              >
                <Grid3x3 size={19} className="text-white" />
              </button>
            </Tooltip>
            <Tooltip label="알림" side="top">
              <button
                  onClick={() => toggleRightPanel('notification')}
                  className={`relative p-2 rounded-xl transition-all
                ${activeRightPanel === 'notification' ? "bg-[#5CC87A]" : "hover:bg-white/10"}`}
              >
                <Bell size={18} className="text-white" />
                {activeRightPanel !== 'notification' && unreadNotifications > 0 && (
                    <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                )}
              </button>
            </Tooltip>
            <Tooltip label="친구 목록" side="top">
              <button
                onClick={() => toggleRightPanel('friend')}
                className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all
                  ${activeRightPanel === 'friend' ? "bg-[#5CC87A]" : "hover:bg-white/10"}`}
              >
                <Users size={19} className="text-white" />
                {activeRightPanel !== 'friend' && totalUnread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {totalUnread}
                  </span>
                )}
              </button>
            </Tooltip>

            <Tooltip label="내 프로필" side="top" align="end">
              <Link
                to="/workspace/profile"
                className="w-9 h-9 rounded-full bg-gradient-to-br from-[#A8E6B8] to-[#5CC87A] flex items-center justify-center text-white text-sm font-bold hover:ring-2 hover:ring-[#5CC87A] hover:ring-offset-2 hover:ring-offset-[#1e3a28] transition-all ml-1"
              >
                나
              </Link>
            </Tooltip>
          </div>

        </div>
    </div>
  );
}
