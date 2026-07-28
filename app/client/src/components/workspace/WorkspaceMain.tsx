import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Hash,
  MessageSquare,
  MessageCircle,
  Settings,
  Plus,
  Search,
  Bell,
} from "lucide-react";

export function WorkspaceMain() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/workspace" && location.pathname === "/workspace")
      return true;
    if (path !== "/workspace" && location.pathname.startsWith(path))
      return true;
    return false;
  };

  const channels = [
    { id: "general", name: "일반", unread: 3 },
    { id: "random", name: "잡담", unread: 0 },
    { id: "tech", name: "기술", unread: 7 },
    { id: "design", name: "디자인", unread: 0 },
  ];

  const directMessages = [
    { id: "1", name: "김민준", status: "online", unread: 2 },
    { id: "2", name: "이서연", status: "away", unread: 0 },
    { id: "3", name: "박지훈", status: "offline", unread: 1 },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 사이드바 */}
      <div className="w-72 bg-gradient-to-b from-teal-600 to-teal-700 text-white flex flex-col shadow-2xl">
        {/* 워크스페이스 헤더 */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold">팀 워크스페이스</h1>
            <button className="hover:bg-white/20 rounded-lg p-2 transition-all">
              <Bell size={20} />
            </button>
          </div>
          {/* 검색바 */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-200"
            />
            <input
              type="text"
              placeholder="검색..."
              className="w-full bg-white/10 border border-white/20 rounded-lg pl-9 pr-3 py-2 text-sm placeholder:text-teal-200 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
            />
          </div>
        </div>

        {/* 네비게이션 */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          {/* 주요 메뉴 */}
          <div className="space-y-1 mb-6">
            <Link
              to="/workspace/threads"
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                isActive("/workspace/threads")
                  ? "bg-white/25 shadow-lg"
                  : "hover:bg-white/10"
              }`}
            >
              <MessageSquare size={20} />
              <span className="font-medium">스레드</span>
            </Link>

            <Link
              to="/workspace/dm"
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                isActive("/workspace/dm")
                  ? "bg-white/25 shadow-lg"
                  : "hover:bg-white/10"
              }`}
            >
              <MessageCircle size={20} />
              <span className="font-medium">다이렉트 메시지</span>
            </Link>
          </div>

          {/* 채널 리스트 */}
          <div className="mb-6">
            <div className="flex items-center justify-between px-4 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-100">
                채널
              </span>
              <button className="hover:bg-white/20 rounded-lg p-1.5 transition-all">
                <Plus size={16} />
              </button>
            </div>
            <div className="space-y-1">
              {channels.map((channel) => (
                <Link
                  key={channel.id}
                  to={`/workspace/channels/${channel.id}`}
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all group ${
                    isActive(`/workspace/channels/${channel.id}`)
                      ? "bg-white/25 shadow-lg"
                      : "hover:bg-white/10"
                  }`}
                >
                  <Hash
                    size={18}
                    className="text-teal-200 group-hover:text-white transition-colors"
                  />
                  <span className="flex-1 font-medium">{channel.name}</span>
                  {channel.unread > 0 && (
                    <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {channel.unread}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* DM 리스트 */}
          <div>
            <div className="flex items-center justify-between px-4 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-100">
                다이렉트 메시지
              </span>
              <button className="hover:bg-white/20 rounded-lg p-1.5 transition-all">
                <Plus size={16} />
              </button>
            </div>
            <div className="space-y-1">
              {directMessages.map((dm) => (
                <Link
                  key={dm.id}
                  to={`/workspace/dm/${dm.id}`}
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
                    isActive(`/workspace/dm/${dm.id}`)
                      ? "bg-white/25 shadow-lg"
                      : "hover:bg-white/10"
                  }`}
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-sm font-bold shadow-md">
                      {dm.name.charAt(0)}
                    </div>
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-teal-700 ${
                        dm.status === "online"
                          ? "bg-green-400"
                          : dm.status === "away"
                            ? "bg-amber-400"
                            : "bg-gray-400"
                      }`}
                    />
                  </div>
                  <span className="flex-1 font-medium truncate">{dm.name}</span>
                  {dm.unread > 0 && (
                    <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {dm.unread}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* 사용자 정보 */}
        <div className="p-4 border-t border-white/10 bg-teal-800/30">
          <div className="flex items-center gap-3">
            <Link
              to="/workspace/profile"
              className="flex items-center gap-3 flex-1 hover:bg-white/10 rounded-xl p-2 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center font-bold shadow-lg">
                강
              </div>
              <div className="flex-1">
                <div className="font-medium">강하은</div>
                <div className="text-xs text-teal-200">온라인</div>
              </div>
            </Link>
            <Link
              to="/workspace/settings"
              className="hover:bg-white/10 rounded-lg p-2 transition-all"
            >
              <Settings size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}
