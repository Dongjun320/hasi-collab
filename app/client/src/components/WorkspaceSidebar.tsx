import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Hash, Plus, X,
  PanelLeftClose, PanelLeftOpen, Settings, UserPlus,
  ChevronRight, ChevronDown,
} from "lucide-react";
import { useUiStore } from "../store/uiStore";
import { useWorkspaceStore } from "../store/workspaceStore";
import Modal from "@/components/Modal.tsx";
import { api } from '../api/client';
import { Tooltip } from "./Tooltip";
import { UserSearchBox, type SearchedUser } from "./UserSearchBox";


interface WorkspaceSidebarProps {
  channels: { id: number; name: string; parentId?: number | null }[];
  activeChannelId: number | null;
  onSelectChannel: (id: number) => void;
  onAddChannel: (name: string, parentId?: number | null) => void;
  onDeleteChannel: (channelId: number) => void;
  onRenameChannel: (channelId: number, newName: string) => void;
  onDeleteWorkspace: (workspaceId: number) => void;
  getDefaultChannelId: (workspaceId: number) => number | null;
}

export function WorkspaceSidebar({
  channels, activeChannelId, onSelectChannel, onAddChannel, onRenameChannel, onDeleteChannel, onDeleteWorkspace, getDefaultChannelId,
}: WorkspaceSidebarProps) {
  const navigate = useNavigate();
  const {isSidebarOpen, toggleSidebar} = useUiStore();
  const {
    currentWorkspace,
    setWorkspace,
    workspaces,
    updateWorkspace,
    fetchWorkspaces,
    fetchChannels,
    wsLoading,
    wsError,
  } = useWorkspaceStore();
  const [showNewInput, setShowNewInput] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [showNewWorkspaceInput, setShowNewWorkspaceInput] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [channelMenuOpenId, setChannelMenuOpenId] = useState<number | null>(null);
  const [renamingChannelId, setRenamingChannelId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [showWorkspaceSettings, setShowWorkspaceSettings] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [invitedList, setInvitedList] = useState<SearchedUser[]>([]);
  const railRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({dragging: false, startY: 0, startScroll: 0});
  const [collapsedIds, setCollapsedIds] = useState<number[]>([]);
  const [addingChildOf, setAddingChildOf] = useState<number | null>(null);
  const [childName, setChildName] = useState("");


  const handleRailMouseDown = (e: React.MouseEvent) => {
    dragState.current = {dragging: true, startY: e.pageY, startScroll: railRef.current?.scrollTop ?? 0};
  };
  const handleRailMouseMove = (e: React.MouseEvent) => {
    if (!dragState.current.dragging || !railRef.current) return;
    railRef.current.scrollTop = dragState.current.startScroll - (e.pageY - dragState.current.startY);
  };
  const handleInvite = async (user: SearchedUser) => {
    if (!currentWorkspace) return;
    setInviteError("");

    try {
      const {data, error} = await api.POST(
          '/api/workspaces/{workspaceId}/members',
          {
            params: {path: {workspaceId: currentWorkspace.id}},
            body: {nickname: user.nickname, role: "MEMBER"},   // 스펙상 role이 required로 바뀌어 명시
          }
      );

      if (error || !data?.success) {
        // 서버가 한국어 메시지를 내려줌 (MBR_001 없는 닉네임 / MBR_002 이미 멤버 등)
        const msg = (error as any)?.error?.message;
        setInviteError(msg ?? "초대에 실패했습니다.");
        return;
      }

      setInvitedList((prev) => [...prev, user]);
    } catch (e) {
      console.error("초대 요청 실패:", e);
      setInviteError("서버에 연결할 수 없습니다.");
    }
  }

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

  const handleAddWorkspace = async () => {
    const name = newWorkspaceName.trim();
    if (!name) return;
      try {
          const { data, error } = await api.POST('/api/workspaces', {
              body: { name, isPrivate: false },
          });
          if (error || !data?.data?.id) {
              console.error('워크스페이스 생성 실패:', error);
              return;
          }
          // 목록을 서버 기준으로 다시 받아 색상 배정까지 일관되게 맞춤
          await fetchWorkspaces();

          const created = useWorkspaceStore.getState().workspaces.find((w) => w.id === data.data!.id);
          if (created) {
              setWorkspace(created);
              // 백엔드가 기본 채널(공지사항 등)을 만들어주므로 첫 채널로 진입
              const firstCh = await fetchChannels(created.id);
              navigate(firstCh ? `/workspace/channels/${firstCh}` : "/workspace");
          }
          setNewWorkspaceName("");
          setShowNewWorkspaceInput(false);
      } catch (e) {
          console.error('워크스페이스 생성 실패:', e);
      }
  };

  const rootChannels = channels.filter((c) => !c.parentId);
  const childrenOf = (parentId: number) => channels.filter((c) => c.parentId === parentId);

  const toggleCollapse = (id: number) =>
      setCollapsedIds((prev) =>
          prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );

  const handleAddChild = (parentId: number) => {
    const name = childName.trim();
    if (!name) return;
    onAddChannel(name, parentId);
    setChildName("");
    setAddingChildOf(null);
  };

  useEffect(() => {
    (async () => {
      await fetchWorkspaces();

      const {workspaces: list, currentWorkspace: cur} = useWorkspaceStore.getState();
      if (!cur && list[0]) {
        setWorkspace(list[0]);
        const ch = getDefaultChannelId(list[0].id);
        navigate(ch ? `/workspace/channels/${ch}` : "/workspace");
      }
    })();
  }, []);

  const renderChannelRow = (ch: { id: number; name: string, parentId?: number | null }, hasKids: boolean, collapsed: boolean) => {
    const active = ch.id === activeChannelId;
    const isRenaming = renamingChannelId === ch.id;

    if (isRenaming) {
      return (
          <div className="flex items-center gap-1.5 px-2 py-1.5">
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

    const isRoot = !ch.parentId;

    return (
        <div className="relative group/channel">
          <button
              onClick={() => onSelectChannel(ch.id)}
              className={`w-full flex items-center gap-1.5 px-2 py-1.5 ${isRoot ? "pr-14" : "pr-7"} rounded-lg text-sm font-medium transition-all text-left
            ${active
                  ? "bg-[#5CC87A] text-white shadow-md"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
          >
            {/* 하위 채널이 있으면 접기 화살표 — 채널 이동과 분리 */}
            {hasKids ? (
                <span
                    role="button"
                    onClick={(e) => { e.stopPropagation(); toggleCollapse(ch.id); }}
                    className="flex-shrink-0 -ml-0.5 hover:bg-white/20 rounded"
                >
              {collapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
            </span>
            ) : (
                <Hash size={14} className="flex-shrink-0" />
            )}
            <span className="truncate">{ch.name}</span>
          </button>
            {/* 최상위 채널에만 하위 채널 추가 버튼 (깊이 2단 제한) */}
            {isRoot && (
                <button
                    onClick={() => {
                        setAddingChildOf(ch.id);
                        setChildName("");
                        setCollapsedIds((prev) => prev.filter((x) => x !== ch.id));
                        setChannelMenuOpenId(null);
                    }}
                    title="하위 채널 추가"
                    className="absolute right-7 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover/channel:opacity-100 hover:bg-white/20"
                >
                    <Plus size={12} className="text-white/70" />
                </button>
            )}

            <button
                onClick={() => setChannelMenuOpenId(channelMenuOpenId === ch.id ? null : ch.id)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover/channel:opacity-100 hover:bg-white/20"
            >
                <Settings size={12} className="text-white/70" />
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
  };

  return (
    <div className="app-chrome flex h-full flex-shrink-0">
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
          <UserSearchBox
              placeholder="초대할 사용자의 닉네임"
              actionLabel="초대"
              doneLabel="대기 중"
              doneIds={invitedList.map((u) => u.uid)}
              onSelect={handleInvite}
          />

          {inviteError && (
              <p className="text-xs text-red-500">{inviteError}</p>
          )}

          {/* 이번에 보낸 초대 */}
          {invitedList.length > 0 && (
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-400 mb-2">초대를 보냈습니다</p>
                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                  {invitedList.map((u) => (
                      <div key={u.uid} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[#f8fdf9]">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#A8E6B8] to-[#5CC87A] flex items-center justify-center text-white text-xs font-bold">
                          {u.nickname.charAt(0)}
                        </div>
                        <span className="text-sm text-[#2C3E50]">{u.nickname}</span>
                        <span className="ml-auto text-xs text-gray-400">대기 중</span>
                      </div>
                  ))}
                </div>
              </div>
          )}
        </div>
      </Modal>

      {/* ── 서버 레일 ── */}
      <div className="w-[72px] h-full bg-[#1e3a28] flex flex-col items-center py-3 gap-2 flex-shrink-0">
        <div
          ref={railRef}
          onMouseDown={handleRailMouseDown}
          onMouseMove={handleRailMouseMove}
          onMouseUp={stopRailDrag}
          onMouseLeave={stopRailDrag}
          className="flex-1 w-full flex flex-col items-center gap-2 overflow-y-auto overflow-x-hidden no-scrollbar cursor-grab active:cursor-grabbing"
        >
          {wsLoading && (
              <div className="w-11 h-11 rounded-[22px] bg-white/10 animate-pulse flex-shrink-0" />
          )}

          {!wsLoading && wsError && (
              <Tooltip label={wsError} side="right">
                <div className="w-11 h-11 rounded-[22px] bg-red-500/20 border border-red-400/40 flex items-center justify-center flex-shrink-0 cursor-help">
                  <span className="text-red-300 text-lg font-bold">!</span>
                </div>
              </Tooltip>
          )}
          {workspaces.map((ws) => {
            const active = ws.id === currentWorkspace?.id;
            return (
              <Tooltip key={ws.id} label={ws.name} side="right">
                <button
                  onClick={() => {
                    setWorkspace(ws);
                    navigate(`/workspace/channels/${getDefaultChannelId(ws.id)}`);
                  }}
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
                </button>
              </Tooltip>
            );
          })}
          <Tooltip label="새 워크스페이스" side="right">
            <button
              onClick={()=>setShowNewWorkspaceInput(true)}
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-[#5CC87A] flex items-center justify-center transition-all duration-200 group flex-shrink-0"
            >
              <Plus size={20} className="text-[#5CC87A] group-hover:text-white transition-colors" />
            </button>
          </Tooltip>
        </div>

        <Tooltip label={isSidebarOpen ? "채널 목록 접기" : "채널 목록 펼치기"} side="right">
          <button
            onClick={toggleSidebar}
            className="w-11 h-11 rounded-2xl hover:bg-white/10 flex items-center justify-center transition-all flex-shrink-0"
          >
            {isSidebarOpen
              ? <PanelLeftClose size={19} className="text-white/60" />
              : <PanelLeftOpen size={19} className="text-white/60" />}
          </button>
        </Tooltip>
      </div>

      {/* ── 채널 목록 패널 ── */}
      <div
        className={`h-full bg-[#173322] flex flex-col overflow-hidden transition-all duration-200 ease-out
          ${isSidebarOpen ? "w-56" : "w-0"}`}
      >
        <div className="w-56 flex flex-col h-full">
          <div className="h-14 px-4 flex items-center justify-between border-b border-white/10 flex-shrink-0">
            <h2 className="text-white font-bold text-sm truncate">
              {currentWorkspace?.name ?? (wsLoading ? "불러오는 중..." : "워크스페이스 없음")}
            </h2>
            {currentWorkspace && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Tooltip label="인원 추가" side="bottom">
                  <button
                    onClick={() => {
                      setInviteError("");
                      setInvitedList([]);
                      setShowInviteModal(true);
                    }}
                    className="p-1 hover:bg-white/10 rounded-md"
                  >
                    <UserPlus size={14} className="text-white/50" />
                  </button>
                </Tooltip>
                <Tooltip label="서버 설정" side="bottom" align="end">
                  <button
                    onClick={() => {
                      setEditName(currentWorkspace.name);
                      setShowWorkspaceSettings(true);
                    }}
                    className="p-1 hover:bg-white/10 rounded-md"
                  >
                    <Settings size={14} className="text-white/50" />
                  </button>
                </Tooltip>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <div className="flex items-center justify-between px-1 mb-1.5">
              <span className="text-white/40 text-xs font-semibold uppercase tracking-wide">채널</span>
              <Tooltip label="새 채널" side="bottom" align="end">
                <button
                  onClick={() => setShowNewInput(!showNewInput)}
                  className="p-1 hover:bg-white/10 rounded-md transition-all"
                >
                  <Plus size={14} className="text-white/50" />
                </button>
              </Tooltip>
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
              {rootChannels.map((ch) => {
                const kids = childrenOf(ch.id);
                const collapsed = collapsedIds.includes(ch.id);

                return (
                    <div key={ch.id}>
                      {/* 상위 채널 */}
                      {renderChannelRow(ch, kids.length > 0, collapsed)}

                      {/* 하위 채널들 */}
                      {!collapsed && kids.map((kid) => (
                          <div key={kid.id} className="ml-4 border-l border-white/10 pl-1">
                            {renderChannelRow(kid, false, false)}
                          </div>
                      ))}

                      {/* 하위 채널 추가 입력 */}
                      {!collapsed && addingChildOf === ch.id && (
                          <div className="ml-4 border-l border-white/10 pl-1">
                            <div className="flex items-center gap-1.5 px-2 py-1.5">
                              <Hash size={13} className="text-[#5CC87A] flex-shrink-0" />
                              <input
                                  type="text"
                                  value={childName}
                                  onChange={(e) => setChildName(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleAddChild(ch.id);
                                    if (e.key === "Escape") { setAddingChildOf(null); setChildName(""); }
                                  }}
                                  placeholder="하위 채널 이름"
                                  autoFocus
                                  className="flex-1 bg-white/10 text-white text-sm px-2 py-1 rounded-md outline-none focus:bg-white/15 min-w-0"
                              />
                            </div>
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
