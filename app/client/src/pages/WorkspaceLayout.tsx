import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Hash, MessageSquare, Settings, Calendar, LayoutGrid,
  Plus, Home, Bell, User, Grid3x3, Search, X,
  Phone, Mail, ChevronUp,
} from "lucide-react";
import { useState } from "react";

const WORKSPACE = { name: "개발팀", avatar: "개", color: "from-[#5CC87A] to-[#2E8B4F]" };

const TOOLS = [
  { path: "/workspace/kanban",   icon: LayoutGrid,    label: "칸반" },
  { path: "/workspace/calendar", icon: Calendar,      label: "캘린더" },
  { path: "/workspace/threads",  icon: MessageSquare, label: "스레드" },
];

const QUICK_ITEMS = [
  { icon: MessageSquare, label: "메시지", to: "/workspace/channels/general" },
  { icon: Calendar,      label: "달력",   to: "/workspace/calendar" },
  { icon: User,          label: "내정보", to: "/workspace/profile" },
  { icon: Phone,         label: "전화",   to: "#" },
  { icon: Mail,          label: "메일",   to: "/workspace/mail" },
];

export function WorkspaceLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [channels, setChannels] = useState([
    { id: "general", name: "일반" },
    { id: "dev",     name: "개발" },
    { id: "design",  name: "디자인" },
  ]);
  const [showChannelPanel, setShowChannelPanel]   = useState(false);
  const [showNewInput,     setShowNewInput]       = useState(false);
  const [newChannelName,   setNewChannelName]     = useState("");
  const [isQuickMenuOpen,  setIsQuickMenuOpen]    = useState(false);

  const isActive = (path: string) =>
    path !== "/workspace"
      ? location.pathname.startsWith(path)
      : location.pathname === "/workspace";

  const isInChannel = location.pathname.startsWith("/workspace/channels");
  const activeChannelId = isInChannel
    ? location.pathname.split("/workspace/channels/")[1]
    : null;

  const handleAddChannel = () => {
    const name = newChannelName.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/\s+/g, "-");
    setChannels((prev) => [...prev, { id, name }]);
    setNewChannelName("");
    setShowNewInput(false);
    navigate(`/workspace/channels/${id}`);
    setShowChannelPanel(false);
  };

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">

      {/* ── 상단 헤더 ── */}
      <div className="h-14 bg-white border-b border-[#e8f8ed] flex items-center px-5 gap-3 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${WORKSPACE.color} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
            {WORKSPACE.avatar}
          </div>
          <h1 className="font-bold text-[#2C3E50] text-base">{WORKSPACE.name}</h1>
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
        <Outlet />
      </div>

      {/* ── 채널 슬라이드업 패널 ── */}
      <div
        className="fixed left-0 right-0 bottom-0 pb-16 z-40 transition-transform duration-300 ease-out"
        style={{ transform: showChannelPanel ? "translateY(0)" : "translateY(100%)" }}
      >
        <div className="mx-4 mb-2 bg-[#1e3a28] rounded-2xl shadow-2xl overflow-hidden border border-white/10">
          {/* 패널 헤더 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Hash size={16} className="text-[#5CC87A]" />
              <span className="text-white font-semibold text-sm">채널 목록</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNewInput(!showNewInput)}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#5CC87A]/20 hover:bg-[#5CC87A]/30 rounded-lg transition-all text-xs text-[#5CC87A] font-medium"
              >
                <Plus size={13} />
                새 채널
              </button>
              <button
                onClick={() => { setShowChannelPanel(false); setShowNewInput(false); }}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
              >
                <X size={16} className="text-white/60" />
              </button>
            </div>
          </div>

          {/* 새 채널 입력창 */}
          {showNewInput && (
            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
              <Hash size={14} className="text-[#5CC87A] flex-shrink-0" />
              <input
                type="text"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddChannel()}
                placeholder="채널 이름 입력..."
                autoFocus
                className="flex-1 bg-white/10 text-white placeholder-white/30 text-sm px-3 py-1.5 rounded-lg outline-none focus:bg-white/15 transition-all"
              />
              <button
                onClick={handleAddChannel}
                disabled={!newChannelName.trim()}
                className="px-3 py-1.5 bg-[#5CC87A] hover:bg-[#4ab869] disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-all"
              >
                생성
              </button>
            </div>
          )}

          {/* 채널 리스트 */}
          <div className="flex flex-wrap gap-2 p-4 max-h-48 overflow-y-auto">
            {channels.map((ch) => {
              const active = activeChannelId === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    navigate(`/workspace/channels/${ch.id}`);
                    setShowChannelPanel(false);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all
                    ${active
                      ? "bg-[#5CC87A] text-white shadow-md"
                      : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                    }`}
                >
                  <Hash size={13} />
                  {ch.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 채널 패널 백드롭 */}
      {showChannelPanel && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => { setShowChannelPanel(false); setShowNewInput(false); }}
        />
      )}

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

      {/* ── 하단 내비게이션 바 ── */}
      <div className="h-16 bg-[#1e3a28] flex items-center px-4 gap-1 flex-shrink-0 z-30">

        {/* 홈 */}
        <Link
          to="/WorkspaceHome"
          className="w-11 h-11 bg-[#5CC87A] rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 hover:bg-[#4ab869] transition-colors"
          title="홈"
        >
          <Home size={20} className="text-white" />
        </Link>

        <div className="h-8 w-[2px] bg-white/20 rounded-full mx-2 flex-shrink-0" />

        {/* 채팅 버튼 — 슬라이드업 패널 토글 */}
        <button
          onClick={() => { setShowChannelPanel(!showChannelPanel); setIsQuickMenuOpen(false); }}
          className={`flex items-center gap-2 px-3 h-11 rounded-xl text-sm font-medium transition-all flex-shrink-0 relative
            ${showChannelPanel || isInChannel
              ? "bg-[#5CC87A] text-white shadow-md"
              : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          title="채널"
        >
          <Hash size={16} />
          <span>채팅</span>
          {/* 활성 채널 이름 표시 */}
          {isInChannel && activeChannelId && !showChannelPanel && (
            <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-md">
              {channels.find(c => c.id === activeChannelId)?.name ?? activeChannelId}
            </span>
          )}
          <ChevronUp
            size={14}
            className={`transition-transform duration-200 ${showChannelPanel ? "rotate-180" : ""}`}
          />
        </button>

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
          <button
            onClick={() => { setIsQuickMenuOpen(!isQuickMenuOpen); setShowChannelPanel(false); }}
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
        </div>

      </div>
    </div>
  );
}
