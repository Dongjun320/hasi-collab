import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Settings, Calendar, LayoutGrid,
  Plus, Bell, User, Grid3x3, Search,
  Phone, Mail, MessageSquare, LogOut, Users
} from "lucide-react";
import { useState } from "react";
import { WorkspaceSidebar } from "../components/WorkspaceSidebar";
import { useWorkspaceStore } from "../store/workspaceStore";
import { useFriendStore } from "../store/friendStore";
import { useUiStore } from "../store/uiStore";
import { FriendSidebar } from "../components/FriendSidebar";

const TOOLS = [
  { path: "/workspace/kanban",   icon: LayoutGrid,    label: "칸반" },
  { path: "/workspace/calendar", icon: Calendar,      label: "캘린더" },
  { path: "/workspace/threads",  icon: MessageSquare, label: "스레드" },
];

export function WorkspaceLayout() {
  const { currentWorkspace, deleteWorkspace } = useWorkspaceStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { friends } = useFriendStore();
  const { activeRightPanel, toggleRightPanel } = useUiStore();

  const [channelsByWorkspace, setChannelsByWorkspace] = useState<Record<number, { id: string; name: string }[]>>({
    1: [{ id: "design-general", name: "일반" }],
    2: [{ id: "general", name: "일반" }, { id: "dev", name: "개발" }, { id: "design", name: "디자인" }],
    3: [{ id: "marketing-general", name: "일반" }],
    4: [{ id: "sales-general", name: "일반" }],
    5: [{ id: "plan-general", name: "일반" }],
  });
  const channels = currentWorkspace ? channelsByWorkspace[currentWorkspace.id] ?? [
    {id: "general", name: "일반"}
  ] : [];
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);


  const isActive = (path: string) =>
    path !== "/workspace"
      ? location.pathname.startsWith(path)
      : location.pathname === "/workspace";

  const isInChannel = location.pathname.startsWith("/workspace/channels");
  const activeChannelId = isInChannel
    ? location.pathname.split("/workspace/channels/")[1]
    : null;

  const [lastChannelByWorkspace, setLastChannelByWorkspace] = useState<Record<number, string>>({});

  const handleAddChannel = (name: string) => {
    if (!currentWorkspace) return;
    const id = name.toLowerCase().replace(/\s+/g, "-");
    setChannelsByWorkspace((prev) => ({
      ...prev,
      [currentWorkspace.id]: [...(prev[currentWorkspace.id] ?? []), { id, name }],
    }));
    navigate(`/workspace/channels/${id}`);
  };

  const handleDeleteChannel = (channelId: string) => {
    if (!currentWorkspace) return;
    setChannelsByWorkspace((prev) => ({
      ...prev,
      [currentWorkspace.id]: prev[currentWorkspace.id].filter((c) => c.id !== channelId),
    }));
    if (activeChannelId === channelId) navigate("/workspace");
  };

  const handleRenameChannel = (channelId: string, newName: string) => {
    if (!currentWorkspace) return;
    setChannelsByWorkspace((prev) => ({
      ...prev,
      [currentWorkspace.id]: prev[currentWorkspace.id].map((c) =>
        c.id === channelId ? { ...c, name: newName } : c
      ),
    }));
  };

  const handleDeleteWorkspace = (workspaceId: number) => {
    deleteWorkspace(workspaceId);
    setChannelsByWorkspace((prev) => {
      const next = { ...prev };
      delete next[workspaceId];
      return next;
    });

    const newCurrent = useWorkspaceStore.getState().currentWorkspace;
    if (newCurrent) {
      navigate(`/workspace/channels/${getDefaultChannelId(newCurrent.id)}`);
    }
  };

  const getDefaultChannelId = (workspaceId: number) =>
      lastChannelByWorkspace[workspaceId] ?? channelsByWorkspace[workspaceId]?.[0]?.id ?? "general";

  const QUICK_ITEMS = [
    {
      icon: MessageSquare,
      label: "메시지",
      to: currentWorkspace ? `/workspace/channels/${getDefaultChannelId(currentWorkspace.id)}` : "/workspace",
    },
    { icon: Calendar, label: "달력",   to: "/workspace/calendar" },
    { icon: User,     label: "내정보", to: "/workspace/profile" },
    { icon: Phone,    label: "전화",   to: "#" },
    { icon: Mail,     label: "메일",   to: "/workspace/mail" },
    { icon: LogOut,   label: "로그아웃", to: "/" },
  ];

  const totalUnread = friends.reduce((sum, f) => sum + f.unreadCount, 0)

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
        <div className="h-14 bg-white border-b border-[#e8f8ed] flex items-center px-5 gap-3 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm"
              style={{
                background: currentWorkspace
                ? `linear-gradient(to bottom right, ${currentWorkspace.colors[0]},
                ${currentWorkspace.colors[1]})`
                    : undefined,
            }}
            >
              {currentWorkspace?.avatar}
            </div>
            <h1 className="font-bold text-[#2C3E50] text-base">{currentWorkspace?.name}</h1>
          </div>
          <div className="flex-1" />
          <button className="p-2 hover:bg-[#f0f9f4] rounded-xl transition-all" title="검색">
            <Search size={18} className="text-[#5CC87A]" />
          </button>
          <button className="relative p-2 hover:bg-[#f0f9f4] rounded-xl transition-all" title="알림">
            <Bell size={18} className="text-[#5CC87A]" />
            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
          </button>
          <Link to="/workspace/settings" className="p-2 hover:bg-[#f0f9f4] rounded-xl transition-all" title="설정">
            <Settings size={18} className="text-[#5CC87A]" />
          </Link>
          <Link to="/workspace/profile">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A8E6B8] to-[#5CC87A] flex items-center justify-center text-white text-sm font-bold hover:ring-2 hover:ring-[#5CC87A] hover:ring-offset-1 transition-all">
              나
            </div>
          </Link>
        </div>

        {/* ── 메인 콘텐츠 ── */}
        <div className="flex-1 overflow-hidden relative">
          <Outlet context={{ channels }} />
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
      </div>

      {/* ── 하단 작업표시줄 (윈도우 작업표시줄처럼 전체폭 고정) ── */}
      <div className="h-16 bg-[#1e3a28] flex items-center px-4 gap-1 flex-shrink-0 z-30">

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
            <button
              onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all
                ${isQuickMenuOpen ? "bg-[#5CC87A]" : "hover:bg-white/10"}`}
              title="빠른 메뉴"
            >
              <Grid3x3 size={19} className="text-white" />
            </button>

            <Link
              to="/workspace/profile"
              className="w-9 h-9 rounded-full bg-gradient-to-br from-[#A8E6B8] to-[#5CC87A] flex items-center justify-center text-white text-sm font-bold hover:ring-2 hover:ring-[#5CC87A] hover:ring-offset-2 hover:ring-offset-[#1e3a28] transition-all ml-1"
              title="내 프로필"
            >
              나
            </Link>
            <button
                onClick={() => toggleRightPanel('friend')}
                className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all
                  ${activeRightPanel === 'friend' ? "bg-[#5CC87A]" : "hover:bg-white/10"}`}
                title="친구 목록"
            >
              <Users size={19} className="text-white" />
              {activeRightPanel !== 'friend' && totalUnread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
               {totalUnread}
                 </span>
              )}
            </button>
          </div>


        </div>
    </div>
  );
}
