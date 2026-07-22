import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Hash, Home, Plus, X,
  PanelLeftClose, PanelLeftOpen, Settings, UserPlus,
} from "lucide-react";
import { useUiStore } from "../store/uiStore";
import { useWorkspaceStore } from "../store/workspaceStore";
import Modal from "@/components/Modal.tsx";
import { api } from '../api/client';

// 목데이터 — 나중에 "닉네임 사용자 검색 API"로 교체 예정 (현재 백엔드에 없음)
const MOCK_USERS = [
  { id: 1, nickname: "김민준" },
  { id: 2, nickname: "이서연" },
  { id: 3, nickname: "박지훈" },
  { id: 4, nickname: "강하은" },
  { id: 5, nickname: "최수진" },
  { id: 6, nickname: "정민호" },
  { id: 7, nickname: "홍길동" },
  { id: 8, nickname: "김철수" },
];


interface WorkspaceSidebarProps {
  channels: { id: string; name: string }[];
  activeChannelId: string | null;
  onSelectChannel: (id: string) => void;
  onAddChannel: (name: string) => void;
  onDeleteChannel: (channelId: string) => void;
  onRenameChannel: (channelId: string, newName: string) => void;
  onDeleteWorkspace: (workspaceId: number) => void;
  getDefaultChannelId: (workspaceId: number) => string;
}

export function WorkspaceSidebar({
  channels, activeChannelId, onSelectChannel, onAddChannel, onRenameChannel, onDeleteChannel, onDeleteWorkspace, getDefaultChannelId,
}: WorkspaceSidebarProps) {
  const navigate = useNavigate();
  const {isSidebarOpen, toggleSidebar} = useUiStore();
  const {currentWorkspace, setWorkspace, workspaces, addWorkspace, updateWorkspace, setWorkspaces} = useWorkspaceStore();
  const [showNewInput, setShowNewInput] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [showNewWorkspaceInput, setShowNewWorkspaceInput] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [channelMenuOpenId, setChannelMenuOpenId] = useState<string | null>(null);
  const [renamingChannelId, setRenamingChannelId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [showWorkspaceSettings, setShowWorkspaceSettings] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteQuery, setInviteQuery] = useState("");
  const [invitedIds, setInvitedIds] = useState<number[]>([]);
  const railRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ dragging: false, startY: 0, startScroll: 0 });

  const handleRailMouseDown = (e: React.MouseEvent) => {
    dragState.current = { dragging: true, startY: e.pageY, startScroll: railRef.current?.scrollTop ?? 0 };
  };
  const handleRailMouseMove = (e: React.MouseEvent) => {
    if (!dragState.current.dragging || !railRef.current) return;
    railRef.current.scrollTop = dragState.current.startScroll - (e.pageY - dragState.current.startY);
  };
  const stopRailDrag = () => {
    dragState.current.dragging = false;
  };
  const [editName, setEditName] = useState("");

  const handleAddChannel = () => {
    const name = newChannelName.trim();
    if (!name) return;
    onAddChannel(name);
    setNewChannelName("");
    setShowNewInput(false);
  }

  const handleAddWorkspace = () => {
    const name = newWorkspaceName.trim();
    if (!name) return;
    const newWorkspace = {
      id: Date.now(),
      name,
      avatar: name.charAt(0),
      colors: ["#5CC87A", "#2E8B4F"],
      unread: false,
    };
    addWorkspace(newWorkspace);
    setWorkspace(newWorkspace);
    navigate(`/workspace/channels/${getDefaultChannelId(newWorkspace.id)}`);
    setNewWorkspaceName("");
    setShowNewWorkspaceInput(false);
  };

  const DEFAULT_COLORS = [
    ["#A8E6B8", "#5CC87A"], ["#5CC87A", "#2E8B4F"],
    ["#A8E6B8", "#FFE66D"], ["#5CC87A", "#FFD93D"], ["#2E8B4F", "#5CC87A"],
  ]

  useEffect(() => {
    (async () => {
      const { data, error } = await api.GET('/api/workspaces/me')
      if (error || !data?.data) return
      const mapped = data.data.map((w, i) => ({
        id: w.id!,
        name: w.name ?? '',
        avatar: (w.name ?? '?').charAt(0),
        colors: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
        unread: false,
      }))
      setWorkspaces(mapped)
      if (!currentWorkspace && mapped[0]) {
        setWorkspace(mapped[0])
        navigate(`/workspace/channels/${getDefaultChannelId(mapped[0].id)}`)
      }
    })()
  }, [])



  return (
    <div className="flex h-full flex-shrink-0">
      {/* ── 새 워크스페이스 모달 ── */}
      <Modal
        isOpen={showNewWorkspaceInput}
        onClose={() => setShowNewWorkspaceInput(false)}
        title="새 워크스페이스"
      >
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddWorkspace()}
            placeholder="워크스페이스 이름"
            autoFocus
            className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#5CC87A]"
          />
          <button
            onClick={handleAddWorkspace}
            disabled={!newWorkspaceName.trim()}
            className="px-4 py-2 bg-[#5CC87A] hover:bg-[#2E8B4F] disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all"
          >
          만들기
          </button>
       </div>
      </Modal>

      {/* ── 서버 설정 모달 ── */}
      <Modal
          isOpen={showWorkspaceSettings}
          onClose={() => setShowWorkspaceSettings(false)}
          title="서버 설정"
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-gray-500 font-medium">서버 이름</label>
            <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#5CC87A]"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">서버 색상</label>
            <div className="flex gap-2">
              {[
                ["#A8E6B8", "#5CC87A"],
                ["#5CC87A", "#2E8B4F"],
                ["#A8E6B8", "#FFE66D"],
                ["#5CC87A", "#FFD93D"],
                ["#2E8B4F", "#5CC87A"],
              ].map((c, idx) => (
                  <button
                      key={idx}
                      onClick={() => {
                        if (!currentWorkspace) return;
                        updateWorkspace({ ...currentWorkspace, colors: c });
                      }}
                      className="w-8 h-8 rounded-full border-2 border-transparent hover:border-gray-300"
                      style={{ background: `linear-gradient(to bottom right, ${c[0]}, ${c[1]})` }}
                  />
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-400">서버원 권한 설정은 준비 중입니다.</p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
                onClick={() => {
                  if (!currentWorkspace) return;
                  const name = editName.trim();
                  if (name) updateWorkspace({ ...currentWorkspace, name, avatar: name.charAt(0) });
                  setShowWorkspaceSettings(false);
                }}
                className="flex-1 px-4 py-2 bg-[#5CC87A] hover:bg-[#2E8B4F] text-white font-medium rounded-lg transition-all"
            >
              저장
            </button>
            <button
                onClick={() => {
                  if (!currentWorkspace) return;
                  onDeleteWorkspace(currentWorkspace.id);
                  setShowWorkspaceSettings(false);
                }}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-all"
            >
              서버 삭제
            </button>
          </div>
        </div>
      </Modal>

      {/* ── 인원 추가 모달 ── */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="인원 추가"
      >
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={inviteQuery}
            onChange={(e) => setInviteQuery(e.target.value)}
            placeholder="닉네임으로 검색"
            autoFocus
            className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#5CC87A]"
          />

          <div className="max-h-60 overflow-y-auto flex flex-col gap-1">
            {inviteQuery.trim() &&
              MOCK_USERS.filter((u) => u.nickname.includes(inviteQuery.trim())).map((u) => {
                const invited = invitedIds.includes(u.id);
                return (
                  <div key={u.id} className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A8E6B8] to-[#5CC87A] flex items-center justify-center text-white text-sm font-bold">
                        {u.nickname.charAt(0)}
                      </div>
                      <span className="text-sm text-[#2C3E50]">{u.nickname}</span>
                    </div>
                    <button
                      onClick={() => {
                        // TODO: 실제 초대 API 연결 (POST /api/workspaces/{id}/members)
                        setInvitedIds((prev) => [...prev, u.id]);
                      }}
                      disabled={invited}
                      className={`px-3 py-1 text-xs font-medium rounded-lg transition-all
                        ${invited
                          ? "bg-gray-100 text-gray-400 cursor-default"
                          : "bg-[#5CC87A] hover:bg-[#2E8B4F] text-white"}`}
                    >
                      {invited ? "초대됨" : "초대"}
                    </button>
                  </div>
                );
              })}

            {inviteQuery.trim() &&
              MOCK_USERS.filter((u) => u.nickname.includes(inviteQuery.trim())).length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">검색 결과가 없습니다</p>
              )}
          </div>
        </div>
      </Modal>

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

        <div
          ref={railRef}
          onMouseDown={handleRailMouseDown}
          onMouseMove={handleRailMouseMove}
          onMouseUp={stopRailDrag}
          onMouseLeave={stopRailDrag}
          className="flex-1 w-full flex flex-col items-center gap-2 overflow-y-auto overflow-x-hidden no-scrollbar cursor-grab active:cursor-grabbing"
        >
          {workspaces.map((ws) => {
            const active = ws.id === currentWorkspace?.id;
            return (
              <button
                key={ws.id}
                onClick={() => {
                  setWorkspace(ws);
                  navigate(`/workspace/channels/${getDefaultChannelId(ws.id)}`);
                }}
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
            onClick={()=>setShowNewWorkspaceInput(true)}
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
          <div className="h-14 px-4 flex items-center justify-between border-b border-white/10 flex-shrink-0">
            <h2 className="text-white font-bold text-sm truncate">{currentWorkspace?.name}</h2>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => { setInviteQuery(""); setShowInviteModal(true); }}
                title="인원 추가"
                className="p-1 hover:bg-white/10 rounded-md"
              >
                <UserPlus size={14} className="text-white/50" />
              </button>
              <button
                onClick={() => {
                  setEditName(currentWorkspace?.name ?? "");
                  setShowWorkspaceSettings(true);
                }}
                title="서버 설정"
                className="p-1 hover:bg-white/10 rounded-md"
              >
                <Settings size={14} className="text-white/50" />
              </button>
            </div>
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
                const isRenaming = renamingChannelId === ch.id;

                if (isRenaming) {
                  return (
                    <div key={ch.id} className="flex items-center gap-1.5 px-2 py-1.5">
                      <Hash size={14} className="text-[#5CC87A] flex-shrink-0" />
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const name = renameValue.trim();
                            if (name) onRenameChannel(ch.id, name);
                            setRenamingChannelId(null);
                          }
                          if (e.key === "Escape") setRenamingChannelId(null);
                        }}
                        autoFocus
                        className="flex-1 bg-white/10 text-white text-sm px-2 py-1 rounded-md outline-none focus:bg-white/15 min-w-0"
                      />
                    </div>
                  );
                }

                return (
                  <div key={ch.id} className="relative group/channel">
                    <button
                      onClick={() => onSelectChannel(ch.id)}
                      className={`w-full flex items-center gap-1.5 px-2 py-1.5 pr-7 rounded-lg text-sm font-medium transition-all text-left
                        ${active
                          ? "bg-[#5CC87A] text-white shadow-md"
                          : "text-white/60 hover:bg-white/10 hover:text-white"
                        }`}
                    >
                      <Hash size={14} className="flex-shrink-0" />
                      <span className="truncate">{ch.name}</span>
                    </button>

                    <button
                      onClick={() => setChannelMenuOpenId(channelMenuOpenId === ch.id ? null : ch.id)}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover/channel:opacity-100 hover:bg-white/20"
                    >
                      <Settings size={12} className="text-white/70" />
                    </button>

                    {channelMenuOpenId === ch.id && (
                      <div className="absolute right-0 top-8 bg-[#1e3a28] rounded-lg shadow-xl z-50 py-1 w-32">
                        <button
                          onClick={() => {
                            setRenamingChannelId(ch.id);
                            setRenameValue(ch.name);
                            setChannelMenuOpenId(null);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
                        >
                          이름 변경
                        </button>
                        <button
                          onClick={() => {
                            onDeleteChannel(ch.id);
                            setChannelMenuOpenId(null);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-white/10"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
