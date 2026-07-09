import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Hash, Home, Plus, X,
  PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { useUiStore } from "../store/uiStore";

const WORKSPACES = [
  { id: 1, name: "디자인팀", unread: true,  avatar: "디", colors: ["#A8E6B8", "#5CC87A"] },
  { id: 2, name: "개발팀",   unread: true,  avatar: "개", colors: ["#5CC87A", "#2E8B4F"] },
  { id: 3, name: "마케팅팀", unread: false, avatar: "마", colors: ["#A8E6B8", "#FFE66D"] },
  { id: 4, name: "영업팀",   unread: true,  avatar: "영", colors: ["#5CC87A", "#FFD93D"] },
  { id: 5, name: "기획팀",   unread: false, avatar: "기", colors: ["#2E8B4F", "#5CC87A"] },
];

interface WorkspaceSidebarProps {
  channels: { id: string; name: string }[];
  activeChannelId: string | null;
  onSelectChannel: (id: string) => void;
  onAddChannel: (name: string) => void;
}

export function WorkspaceSidebar({
  channels, activeChannelId, onSelectChannel, onAddChannel,
}: WorkspaceSidebarProps) {
  const navigate = useNavigate();
  const { isSidebarOpen, toggleSidebar } = useUiStore();

  const [activeWorkspaceId, setActiveWorkspaceId] = useState(2);
  const [showNewInput, setShowNewInput] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");

  const activeWorkspace = WORKSPACES.find((w) => w.id === activeWorkspaceId);

  const handleAddChannel = () => {
    const name = newChannelName.trim();
    if (!name) return;
    onAddChannel(name);
    setNewChannelName("");
    setShowNewInput(false);
  };

  return (
    <div className="flex h-full flex-shrink-0">

      {/* ── 서버 레일 ── */}
      <div className="w-[72px] h-full bg-[#1e3a28] flex flex-col items-center py-3 gap-2 flex-shrink-0">
        <button
          onClick={() => navigate("/WorkspaceHome")}
          title="홈"
          className="w-11 h-11 rounded-2xl bg-[#5CC87A] hover:bg-[#4ab869] flex items-center justify-center shadow-lg transition-colors flex-shrink-0"
        >
          <Home size={20} className="text-white" />
        </button>

        <div className="w-8 h-[2px] bg-white/20 rounded-full my-1 flex-shrink-0" />

        <div className="flex-1 w-full flex flex-col items-center gap-2 overflow-y-auto overflow-x-hidden">
          {WORKSPACES.map((ws) => {
            const active = ws.id === activeWorkspaceId;
            return (
              <button
                key={ws.id}
                onClick={() => setActiveWorkspaceId(ws.id)}
                title={ws.name}
                className="relative group flex-shrink-0"
              >
                <div
                  className={`w-11 h-11 flex items-center justify-center text-white font-bold text-base shadow-md transition-all duration-200
                    ${active ? "rounded-xl" : "rounded-[22px] group-hover:rounded-xl"}`}
                  style={{ background: `linear-gradient(to bottom right, ${ws.colors[0]}, ${ws.colors[1]})` }}
                >
                  {ws.avatar}
                </div>
                {active && (
                  <div className="absolute -left-[14px] top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                )}
                {ws.unread && !active && (
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-[#1e3a28]" />
                )}
                <div className="absolute left-[60px] top-1/2 -translate-y-1/2 bg-[#1e3a28] text-white text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                  {ws.name}
                </div>
              </button>
            );
          })}
          <button
            className="w-11 h-11 rounded-full bg-white/10 hover:bg-[#5CC87A] flex items-center justify-center transition-all duration-200 group flex-shrink-0"
            title="새 워크스페이스"
          >
            <Plus size={20} className="text-[#5CC87A] group-hover:text-white transition-colors" />
          </button>
        </div>

        <button
          onClick={toggleSidebar}
          title={isSidebarOpen ? "채널 목록 접기" : "채널 목록 펼치기"}
          className="w-11 h-11 rounded-2xl hover:bg-white/10 flex items-center justify-center transition-all flex-shrink-0"
        >
          {isSidebarOpen
            ? <PanelLeftClose size={19} className="text-white/60" />
            : <PanelLeftOpen size={19} className="text-white/60" />}
        </button>
      </div>

      {/* ── 채널 목록 패널 ── */}
      <div
        className={`h-full bg-[#173322] flex flex-col overflow-hidden transition-all duration-200 ease-out
          ${isSidebarOpen ? "w-56" : "w-0"}`}
      >
        <div className="w-56 flex flex-col h-full">
          <div className="h-14 px-4 flex items-center border-b border-white/10 flex-shrink-0">
            <h2 className="text-white font-bold text-sm truncate">{activeWorkspace?.name}</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <div className="flex items-center justify-between px-1 mb-1.5">
              <span className="text-white/40 text-xs font-semibold uppercase tracking-wide">채널</span>
              <button
                onClick={() => setShowNewInput(!showNewInput)}
                title="새 채널"
                className="p-1 hover:bg-white/10 rounded-md transition-all"
              >
                <Plus size={14} className="text-white/50" />
              </button>
            </div>

            {showNewInput && (
              <div className="flex items-center gap-1.5 mb-2 px-1">
                <Hash size={13} className="text-[#5CC87A] flex-shrink-0" />
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddChannel();
                    if (e.key === "Escape") setShowNewInput(false);
                  }}
                  placeholder="채널 이름"
                  autoFocus
                  className="flex-1 bg-white/10 text-white placeholder-white/30 text-xs px-2 py-1 rounded-md outline-none focus:bg-white/15 transition-all min-w-0"
                />
                <button
                  onClick={() => setShowNewInput(false)}
                  className="p-0.5 hover:bg-white/10 rounded transition-all flex-shrink-0"
                >
                  <X size={12} className="text-white/40" />
                </button>
              </div>
            )}

            <div className="space-y-0.5">
              {channels.map((ch) => {
                const active = ch.id === activeChannelId;
                return (
                  <button
                    key={ch.id}
                    onClick={() => onSelectChannel(ch.id)}
                    className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-medium transition-all text-left
                      ${active
                        ? "bg-[#5CC87A] text-white shadow-md"
                        : "text-white/60 hover:bg-white/10 hover:text-white"
                      }`}
                  >
                    <Hash size={14} className="flex-shrink-0" />
                    <span className="truncate">{ch.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
