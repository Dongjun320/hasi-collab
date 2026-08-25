import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Hash, Plus, X,
  PanelLeftClose, PanelLeftOpen, Settings, UserPlus,
  ChevronRight, ChevronDown, LayoutGrid, Calendar, Megaphone,
} from "lucide-react";
import { useUiStore } from "../store/uiStore";
import { useWorkspaceStore } from "../store/workspaceStore";
import Modal from "@/components/Modal.tsx";
import { api } from '../api/client';
import { Tooltip } from "./Tooltip";
import { UserSearchBox, type SearchedUser } from "./UserSearchBox";
import { useChannelStore } from "../store/channelStore";
import { WorkspacePermissionsModal } from "./WorkspacePermissionsModal";
import { toast } from "../store/toastStore";
import { useAuthStore } from "../store/authStore";

// 아바타와 동일 패턴: 개발은 vite 프록시(/api→service), 배포는 VITE_API_BASE_URL
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";


interface WorkspaceSidebarProps {
  channels: { id: number; name: string; parentId?: number | null }[];
  activeChannelId: number | null;
  onSelectChannel: (id: number) => void;
  onAddChannel: (name: string, parentId?: number | null) => void;
  onDeleteChannel: (channelId: number) => void;
  onRenameChannel: (channelId: number, newName: string) => void;
  onDeleteWorkspace: (workspaceId: number) => void;
  onLeaveWorkspace: (workspaceId: number) => void;
  getDefaultChannelId: (workspaceId: number) => number | null;
}

export function WorkspaceSidebar({
  channels, activeChannelId, onSelectChannel, onAddChannel, onRenameChannel, onDeleteChannel, onDeleteWorkspace, onLeaveWorkspace, getDefaultChannelId,
}: WorkspaceSidebarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {isSidebarOpen, toggleSidebar} = useUiStore();
  const {
    currentWorkspace,
    setWorkspace,
    workspaces,
    channelsByWorkspace,
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
  const [showPermissions, setShowPermissions] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [invitedList, setInvitedList] = useState<SearchedUser[]>([]);
  const [sentInviteUids, setSentInviteUids] = useState<number[]>([]);  // 내가 보낸 워크스페이스 초대(PENDING) 대상 uid
  const railRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({dragging: false, startY: 0, startScroll: 0});
  const [collapsedIds, setCollapsedIds] = useState<number[]>([]);
  const [addingChildOf, setAddingChildOf] = useState<number | null>(null);
  // 채널 초대 모달 (워크스페이스 멤버를 채널에 초대)
  const [channelInviteFor, setChannelInviteFor] = useState<number | null>(null);
  const [wsMembers, setWsMembers] = useState<{ userId: number; nickname: string }[]>([]);
  const [channelMemberIds, setChannelMemberIds] = useState<Set<number>>(new Set());
  const [channelInvitedIds, setChannelInvitedIds] = useState<Set<number>>(new Set());
  const [channelInviteBusy, setChannelInviteBusy] = useState<number | null>(null);
  const [channelInviteSearch, setChannelInviteSearch] = useState("");
  // 소유권 이전 / 나가기
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferMembers, setTransferMembers] = useState<{ userId: number; nickname: string }[]>([]);
  const [transferBusy, setTransferBusy] = useState<number | null>(null);
  const [leaveConfirm, setLeaveConfirm] = useState(false);
  const [childName, setChildName] = useState("");
  const [defaultChannelId, setDefaultChannelId] = useState<number | null>(null);
  const unreadByChannel = useChannelStore((s) => s.unreadByChannel);


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
            body: {nicknames: [user.nickname], role: "MEMBER"},   // 스펙상 nicknames(배열) + role required
          }
      );

      if (error || !data?.success) {
        // 서버가 한국어 메시지를 내려줌 (MBR_001 없는 닉네임 / MBR_002 이미 멤버 등)
        const msg = (error as any)?.error?.message;
        setInviteError(msg ?? t("workspace.errInviteFailed"));
        return;
      }

      setInvitedList((prev) => [...prev, user]);
    } catch (e) {
      console.error("초대 요청 실패:", e);
      setInviteError(t("workspace.errCannotConnect"));
    }
  }

  // 채널 초대 모달 열릴 때: 워크스페이스 멤버 + 이미 채널에 있는 멤버 로드
  useEffect(() => {
    if (channelInviteFor == null || !currentWorkspace) return;
    const wsId = currentWorkspace.id;
    const channelId = channelInviteFor;
    setChannelInvitedIds(new Set());
    setChannelInviteSearch("");
    (async () => {
      try {
        const [mRes, cRes] = await Promise.all([
          api.GET('/api/workspaces/{workspaceId}/members', { params: { path: { workspaceId: wsId } } }),
          api.GET('/api/workspaces/{workspaceId}/channels/{channelId}/members', { params: { path: { workspaceId: wsId, channelId } } }),
        ]);
        setWsMembers(((mRes.data?.data ?? []) as any[]).map((m) => ({ userId: m.userId, nickname: m.nickname ?? '' })));
        setChannelMemberIds(new Set(((cRes.data?.data ?? []) as any[]).map((m) => m.userId)));
      } catch (e) {
        console.error('채널 초대 멤버 로드 실패:', e);
      }
    })();
  }, [channelInviteFor, currentWorkspace?.id]);

  // 소유권 이전 모달 열릴 때: 워크스페이스 멤버(오너=나 제외) 로드
  useEffect(() => {
    if (!transferOpen || !currentWorkspace) return;
    const wsId = currentWorkspace.id;
    (async () => {
      try {
        const { data } = await api.GET('/api/workspaces/{workspaceId}/members', { params: { path: { workspaceId: wsId } } });
        setTransferMembers(((data?.data ?? []) as any[])
            .filter((m) => m.role !== 'OWNER')   // 현재 오너(나) 제외
            .map((m) => ({ userId: m.userId, nickname: m.nickname ?? '' })));
      } catch (e) {
        console.error('멤버 로드 실패:', e);
      }
    })();
  }, [transferOpen, currentWorkspace?.id]);

  const handleTransferOwnership = async (userId: number) => {
    if (!currentWorkspace) return;
    setTransferBusy(userId);
    try {
      const { error } = await api.POST('/api/workspaces/{workspaceId}/transfer-ownership', {
        params: { path: { workspaceId: currentWorkspace.id } },
        body: { newOwnerUserId: userId },
      });
      if (error) { toast.error((error as any)?.error?.message ?? t('workspace.toastTransferFailed')); return; }
      toast.success(t('workspace.toastTransferred'));
      setTransferOpen(false);
      setShowWorkspaceSettings(false);
      await fetchWorkspaces();   // 내 역할(OWNER→일반) 갱신
    } catch (e) {
      toast.error(t('ui.serverError'));
    } finally {
      setTransferBusy(null);
    }
  };

  const handleChannelInvite = async (userId: number) => {
    if (channelInviteFor == null || !currentWorkspace) return;
    setChannelInviteBusy(userId);
    try {
      const { error } = await api.POST('/api/workspaces/{workspaceId}/channels/{channelId}/invitations', {
        params: { path: { workspaceId: currentWorkspace.id, channelId: channelInviteFor } },
        body: { inviteeIds: [userId] },
      });
      if (error) { toast.error((error as any)?.error?.message ?? t('workspace.toastInviteFailed')); return; }
      setChannelInvitedIds((prev) => new Set(prev).add(userId));
      toast.success(t('workspace.toastInviteSent'));
    } catch (e) {
      toast.error(t('ui.serverError'));
    } finally {
      setChannelInviteBusy(null);
    }
  };

  const stopRailDrag = () => {
    dragState.current.dragging = false;
  };
  const [editName, setEditName] = useState("");

  // ── 서버(워크스페이스) 이미지 업로드/삭제 — 프로필 아바타와 동일 패턴 ──
  const [iconBusy, setIconBusy] = useState(false);

  const handleIconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";   // 같은 파일 재선택 가능하도록
    if (!file || !currentWorkspace) return;
    if (!file.type.startsWith("image/")) { toast.error(t("profile.toastImageOnly")); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error(t("profile.toastMaxSize")); return; }
    setIconBusy(true);
    try {
      const token = useAuthStore.getState().accessToken;
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_BASE}/api/workspaces/${currentWorkspace.id}/icon`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form,
      });
      if (!res.ok) throw new Error(String(res.status));
      const url = (await res.text()).trim();
      updateWorkspace({ ...currentWorkspace, iconUrl: url });
      toast.success(t("workspace.toastIconChanged"));
    } catch (err) {
      console.error("서버 이미지 업로드 실패:", err);
      toast.error(t("workspace.toastIconChangeFailed"));
    } finally {
      setIconBusy(false);
    }
  };

  const handleIconDelete = async () => {
    if (!currentWorkspace) return;
    setIconBusy(true);
    try {
      const token = useAuthStore.getState().accessToken;
      const res = await fetch(`${API_BASE}/api/workspaces/${currentWorkspace.id}/icon/delete`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error(String(res.status));
      updateWorkspace({ ...currentWorkspace, iconUrl: null });
      toast.success(t("workspace.toastIconRemoved"));
    } catch (err) {
      console.error("서버 이미지 삭제 실패:", err);
      toast.error(t("workspace.toastIconRemoveFailed"));
    } finally {
      setIconBusy(false);
    }
  };

  const handleAddChannel = () => {
    const name = newChannelName.trim();
    if (!name) return;
    // 같은 레벨(최상위) 채널 이름 중복 차단 (대소문자·공백 무시)
    const dup = channels.some((c) => !c.parentId && c.name.trim().toLowerCase() === name.toLowerCase());
    if (dup) { toast.error(t("workspace.toastDupChannel")); return; }
    onAddChannel(name);
    setNewChannelName("");
    setShowNewInput(false);
  }

    useEffect(() => {
        if (!currentWorkspace) { setDefaultChannelId(null); return; }
        api.GET('/api/workspaces/{workspaceId}', {
            params: { path: { workspaceId: currentWorkspace.id } },
        })
            .then(({ data }) => setDefaultChannelId(data?.data?.defaultChannelId ?? null))
            .catch(() => setDefaultChannelId(null));
    }, [currentWorkspace?.id]);

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

  // 내가 보낸 워크스페이스 초대(PENDING) 로드 — 새로고침해도 "대기 중" 유지
  useEffect(() => {
    if (!showInviteModal || !currentWorkspace) return;
    const wsId = currentWorkspace.id;
    (async () => {
      try {
        const { data } = await api.GET('/api/invitations/sent');
        const uids = ((data?.data ?? []) as any[])
            .filter((v) => v.channelId == null && v.status === 'PENDING' && v.workspaceId === wsId)
            .map((v) => v.inviteeId)
            .filter((x) => x != null);
        setSentInviteUids(uids);
      } catch { /* 무시 */ }
    })();
  }, [showInviteModal, currentWorkspace?.id]);

  const rootChannels = channels.filter((c) => !c.parentId);
  const childrenOf = (parentId: number) => channels.filter((c) => c.parentId === parentId);

  const toggleCollapse = (id: number) =>
      setCollapsedIds((prev) =>
          prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );

  const handleAddChild = (parentId: number) => {
    const name = childName.trim();
    if (!name) return;
    // 같은 부모 아래 하위 채널 이름 중복 차단 (대소문자·공백 무시)
    const dup = childrenOf(parentId).some((c) => c.name.trim().toLowerCase() === name.toLowerCase());
    if (dup) { toast.error(t("workspace.toastDupChildChannel")); return; }
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
    const isDefault = ch.id === defaultChannelId;
    const unread = unreadByChannel[ch.id] ?? 0;

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
            ) : isDefault ? (
                <Megaphone size={14} className="flex-shrink-0" />
            ) : (
                <Hash size={14} className="flex-shrink-0" />
            )}
            <span className="truncate">{ch.name}</span>
          </button>
            {/* 최상위 채널에만 하위 채널 추가 버튼 (깊이 2단 제한) */}
            {isRoot && (
                <button
                    onClick={() => {
                        // 다시 누르면 취소 (상위 채널 + 버튼과 동일한 토글)
                        if (addingChildOf === ch.id) {
                            setAddingChildOf(null);
                            setChildName("");
                            return;
                        }
                        setAddingChildOf(ch.id);
                        setChildName("");
                        setCollapsedIds((prev) => prev.filter((x) => x !== ch.id));
                        setChannelMenuOpenId(null);
                    }}
                    title={addingChildOf === ch.id ? t("workspace.cancelAddChild") : t("workspace.addChild")}
                    className={`absolute ${isDefault ? "right-7" : "right-[3.25rem]"} top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover/channel:opacity-100 hover:bg-white/20`}
                >
                    <Plus size={12} className="text-white/70" />
                </button>
            )}

          {/* 초대는 루트 + 공지사항(기본) 아닌 채널에만.
              - 공지사항: 워크스페이스 전원 고정 채널이라 초대/입퇴장 개념 없음
              - 하위 채널: 진입 시 self-join 되므로 별도 초대 불필요 */}
          {isRoot && !isDefault && (
              <button
                  onClick={() => setChannelInviteFor(ch.id)}
                  title={t("workspace.memberInvite")}
                  className="absolute right-7 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover/channel:opacity-100 hover:bg-white/20"
              >
                <UserPlus size={12} className="text-white/70" />
              </button>
          )}

          <button
              onClick={() => setChannelMenuOpenId(channelMenuOpenId === ch.id ? null : ch.id)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover/channel:opacity-100 hover:bg-white/20"
          >
            <Settings size={12} className="text-white/70" />
          </button>
            {/* 안읽음 뱃지 — 비활성 채널에만, 호버 시 톱니/＋버튼에 자리 양보 */}
            {!active && unread > 0 && (
                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center pointer-events-none group-hover/channel:opacity-0 transition-opacity">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
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
                  {t("workspace.rename")}
                </button>
                {/* 백엔드가 CH_004로 거부하는 케이스 — 누르기 전에 이유를 보여줌 */}
                  <button
                      disabled={hasKids || isDefault}
                      title={isDefault ? t("workspace.defaultNoDelete")
                          : hasKids ? t("workspace.deleteChildFirst") : undefined}
                      onClick={() => { onDeleteChannel(ch.id); setChannelMenuOpenId(null); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 disabled:text-white/25 disabled:cursor-not-allowed"
                  >
                      {t("common.delete")}
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
        title={t("workspace.new")}
      >
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddWorkspace()}
            placeholder={t("workspace.namePlaceholder")}
            autoFocus
            className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#5CC87A]"
          />
          <button
            onClick={handleAddWorkspace}
            disabled={!newWorkspaceName.trim()}
            className="px-4 py-2 bg-[#5CC87A] hover:bg-[#2E8B4F] disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all"
          >
          {t("workspace.createBtn")}
          </button>
       </div>
      </Modal>

      {/* ── 서버 설정 모달 ── */}
      <Modal
          isOpen={showWorkspaceSettings}
          onClose={() => setShowWorkspaceSettings(false)}
          title={t("workspace.serverSettings")}
      >
        <div className="flex flex-col gap-4">
          {/* 서버 이미지 (오너만) */}
          {currentWorkspace?.role === "OWNER" && (
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">{t("workspace.serverIcon")}</label>
              <div className="flex items-center gap-3">
                <div
                    className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                    style={currentWorkspace?.iconUrl ? undefined : { background: `linear-gradient(to bottom right, ${currentWorkspace?.colors?.[0] ?? "#A8E6B8"}, ${currentWorkspace?.colors?.[1] ?? "#5CC87A"})` }}
                >
                  {currentWorkspace?.iconUrl
                      ? <img src={currentWorkspace.iconUrl} alt="" className="w-full h-full object-cover" />
                      : (currentWorkspace?.avatar ?? "?")}
                </div>
                <div className="flex gap-2">
                  <label className={`px-3 py-1.5 text-sm rounded-lg cursor-pointer transition-all ${iconBusy ? "bg-gray-100 text-gray-400 cursor-default" : "bg-[#5CC87A] hover:bg-[#2E8B4F] text-white"}`}>
                    {iconBusy ? t("workspace.iconProcessing") : t("workspace.iconChange")}
                    <input type="file" accept="image/*" className="hidden" disabled={iconBusy} onChange={handleIconChange} />
                  </label>
                  {currentWorkspace?.iconUrl && (
                      <button onClick={handleIconDelete} disabled={iconBusy}
                              className="px-3 py-1.5 text-sm border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50 rounded-lg transition-all">
                        {t("workspace.iconRemove")}
                      </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-gray-500 font-medium">{t("workspace.serverName")}</label>
            <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#5CC87A]"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">{t("workspace.serverColor")}</label>
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
            {currentWorkspace?.role === "OWNER"
                ? <button
                    onClick={() => setShowPermissions(true)}
                    className="w-full px-4 py-2 border border-gray-200 hover:bg-gray-50 text-[#2C3E50] font-medium rounded-lg transition-all text-sm"
                  >
                    {t("permission.title")}
                  </button>
                : <p className="text-xs text-gray-400">{t("workspace.permOwnerOnly")}</p>}
          </div>

          {/* 소유권 이전(오너) / 나가기(그 외) */}
          <div className="border-t border-gray-100 pt-3">
            {currentWorkspace?.role === "OWNER" ? (
                <button onClick={() => setTransferOpen(true)} className="text-sm text-[#2E8B4F] hover:underline">
                  {t("workspace.transferOwnership")}
                </button>
            ) : (
                <button onClick={() => setLeaveConfirm(true)} className="text-sm text-red-500 hover:underline">
                  {t("workspace.leave")}
                </button>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
                onClick={async () => {
                  if (!currentWorkspace) return;
                  const name = editName.trim();
                  // 이름 변경이 없으면 그냥 닫기 (색상은 로컬 전용이라 백엔드 저장 불필요)
                  if (!name || name === currentWorkspace.name) { setShowWorkspaceSettings(false); return; }
                  // 실제 백엔드에 반영 (기존에는 로컬 상태만 바꿔 새로고침 시 원복됐음)
                  const { error } = await api.PATCH('/api/workspaces/{workspaceId}', {
                    params: { path: { workspaceId: currentWorkspace.id } },
                    body: { name },
                  });
                  if (error) { toast.error((error as any)?.error?.message ?? t('workspace.serverSaveFailed')); return; }
                  updateWorkspace({ ...currentWorkspace, name, avatar: name.charAt(0) });
                  toast.success(t('workspace.serverSaved'));
                  setShowWorkspaceSettings(false);
                }}
                className="flex-1 px-4 py-2 bg-[#5CC87A] hover:bg-[#2E8B4F] text-white font-medium rounded-lg transition-all"
            >
              {t("common.save")}
            </button>
            <button
                onClick={() => {
                  if (!currentWorkspace) return;
                  onDeleteWorkspace(currentWorkspace.id);
                  setShowWorkspaceSettings(false);
                }}
                disabled={currentWorkspace?.role !== "OWNER"}
                title={currentWorkspace?.role !== "OWNER" ? t("workspace.deleteOwnerOnly") : undefined}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-50"
            >
              {t("workspace.deleteServer")}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── 권한 설정 모달 ── */}
      {currentWorkspace && (
          <WorkspacePermissionsModal
              isOpen={showPermissions}
              onClose={() => setShowPermissions(false)}
              workspaceId={currentWorkspace.id}
          />
      )}

      {/* ── 소유권 이전 모달 ── */}
      <Modal isOpen={transferOpen} onClose={() => setTransferOpen(false)} title={t("workspace.transferOwnership")}>
        <p className="text-xs text-gray-500 mb-3">{t("workspace.transferDesc")}</p>
        <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
          {transferMembers.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">{t("workspace.noTransferTarget")}</p>
          )}
          {transferMembers.map((m) => (
              <div key={m.userId} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#f8fdf9]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A8E6B8] to-[#5CC87A] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {m.nickname.charAt(0)}
                </div>
                <span className="flex-1 text-sm text-[#2C3E50] truncate">{m.nickname}</span>
                <button
                    onClick={() => handleTransferOwnership(m.userId)}
                    disabled={transferBusy === m.userId}
                    className="px-3 py-1 text-xs bg-[#5CC87A] hover:bg-[#2E8B4F] disabled:opacity-50 text-white rounded-lg flex-shrink-0"
                >
                  {t("workspace.transferBtn")}
                </button>
              </div>
          ))}
        </div>
      </Modal>

      {/* ── 워크스페이스 나가기 확인 ── */}
      {leaveConfirm && currentWorkspace && (
          <div className="fixed inset-0 z-[110] bg-black/40 flex items-center justify-center p-4" onClick={() => setLeaveConfirm(false)}>
            <div className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h4 className="font-bold text-[#2C3E50] mb-2">{t("workspace.leave")}</h4>
              <p className="text-sm text-gray-500 mb-5">{t("workspace.leaveConfirm")}</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setLeaveConfirm(false)} className="px-4 py-2 text-sm border border-gray-200 hover:bg-gray-50 rounded-lg transition-all">{t("common.cancel")}</button>
                <button
                    onClick={() => {
                      const id = currentWorkspace.id;
                      setLeaveConfirm(false);
                      setShowWorkspaceSettings(false);
                      onLeaveWorkspace(id);
                    }}
                    className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                >
                  {t("workspace.leaveBtn")}
                </button>
              </div>
            </div>
          </div>
      )}

      {/* ── 채널 멤버 초대 모달 ── */}
      <Modal
          isOpen={channelInviteFor != null}
          onClose={() => setChannelInviteFor(null)}
          title={t("workspace.channelInviteTitle")}
      >
        <div className="flex flex-col gap-2">
          <input
              type="text"
              value={channelInviteSearch}
              onChange={(e) => setChannelInviteSearch(e.target.value)}
              placeholder={t("workspace.memberSearch")}
              autoFocus
              className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#5CC87A] text-sm"
          />
          <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
          {wsMembers.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">{t("workspace.noInviteMember")}</p>
          )}
          {wsMembers.length > 0
            && wsMembers.filter((m) => m.nickname.toLowerCase().includes(channelInviteSearch.trim().toLowerCase())).length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">{t("workspace.noSearchResult")}</p>
          )}
          {wsMembers
            .filter((m) => m.nickname.toLowerCase().includes(channelInviteSearch.trim().toLowerCase()))
            .map((m) => {
            const inChannel = channelMemberIds.has(m.userId);
            const invited = channelInvitedIds.has(m.userId);
            return (
                <div key={m.userId} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#f8fdf9]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A8E6B8] to-[#5CC87A] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {m.nickname.charAt(0)}
                  </div>
                  <span className="flex-1 text-sm text-[#2C3E50] truncate">{m.nickname}</span>
                  {inChannel ? (
                      <span className="text-xs text-gray-400 flex-shrink-0">{t("workspace.inChannel")}</span>
                  ) : invited ? (
                      <span className="text-xs text-[#5CC87A] flex-shrink-0">{t("workspace.invited")}</span>
                  ) : (
                      <button
                          onClick={() => handleChannelInvite(m.userId)}
                          disabled={channelInviteBusy === m.userId}
                          className="px-3 py-1 text-xs bg-[#5CC87A] hover:bg-[#2E8B4F] disabled:opacity-50 text-white rounded-lg flex-shrink-0"
                      >
                        {t("workspace.inviteBtn")}
                      </button>
                  )}
                </div>
            );
          })}
          </div>
        </div>
      </Modal>

      {/* ── 인원 추가 모달 ── */}
      <Modal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          title={t("workspace.addPeople")}
      >
        <div className="flex flex-col gap-3">
          <UserSearchBox
              placeholder={t("workspace.invitePlaceholder")}
              actionLabel={t("workspace.inviteBtn")}
              doneLabel={t("workspace.pending")}
              doneIds={[...invitedList.map((u) => u.uid), ...sentInviteUids]}
              onSelect={handleInvite}
          />

          {inviteError && (
              <p className="text-xs text-red-500">{inviteError}</p>
          )}

          {/* 이번에 보낸 초대 */}
          {invitedList.length > 0 && (
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-400 mb-2">{t("workspace.toastInviteSent")}</p>
                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                  {invitedList.map((u) => (
                      <div key={u.uid} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[#f8fdf9]">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#A8E6B8] to-[#5CC87A] flex items-center justify-center text-white text-xs font-bold">
                          {u.nickname.charAt(0)}
                        </div>
                        <span className="text-sm text-[#2C3E50]">{u.nickname}</span>
                        <span className="ml-auto text-xs text-gray-400">{t("workspace.pending")}</span>
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
                    // 채널이 아직 로드 안 됐으면 null → /workspace/channels/null(=NaN) 진입 방지
                    const ch = getDefaultChannelId(ws.id);
                    navigate(ch ? `/workspace/channels/${ch}` : "/workspace");
                  }}
                  className="relative group flex-shrink-0"
                >
                  <div
                    className={`w-11 h-11 flex items-center justify-center text-white font-bold text-base shadow-md overflow-hidden transition-all duration-200
                      ${active ? "rounded-xl" : "rounded-[22px] group-hover:rounded-xl"}`}
                    style={ws.iconUrl ? undefined : { background: `linear-gradient(to bottom right, ${ws.colors[0]}, ${ws.colors[1]})` }}
                  >
                    {ws.iconUrl
                      ? <img src={ws.iconUrl} alt="" className="w-full h-full object-cover" />
                      : ws.avatar}
                  </div>
                  {active && (
                    <div className="absolute -left-[14px] top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                  )}
                    {!active && (() => {
                        const chs = channelsByWorkspace[ws.id] ?? [];
                        const total = chs.reduce((sum, c) => sum + (unreadByChannel[c.id] ?? 0), 0);
                        return total > 0 ? (
                            <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border border-[#1e3a28]">
                                {total > 99 ? "99+" : total}
                            </span>
                        ) : null;
                    })()}
                </button>
              </Tooltip>
            );
          })}
          <Tooltip label={t("workspace.new")} side="right">
            <button
              onClick={()=>setShowNewWorkspaceInput(true)}
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-[#5CC87A] flex items-center justify-center transition-all duration-200 group flex-shrink-0"
            >
              <Plus size={20} className="text-[#5CC87A] group-hover:text-white transition-colors" />
            </button>
          </Tooltip>
        </div>

        <Tooltip label={isSidebarOpen ? t("workspace.collapseChannels") : t("workspace.expandChannels")} side="right">
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
              {currentWorkspace?.name ?? (wsLoading ? t("ui.loading") : t("workspace.noWorkspace"))}
            </h2>
            {currentWorkspace && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Tooltip label={t("workspace.addPeople")} side="bottom">
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
                <Tooltip label={t("workspace.serverSettings")} side="bottom" align="end">
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
              {/* ── 기능 (고정: 삭제 불가, 이름변경은 추후) ── */}
              <div className="px-1 mb-1.5">
                  <span className="text-white/40 text-xs font-semibold uppercase tracking-wide">{t("workspace.features")}</span>
              </div>
              <div className="space-y-0.5 mb-3">
                  <button
                      onClick={() => navigate('/workspace/kanban')}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-white/70 hover:bg-white/10 hover:text-white transition-all text-sm"
                  >
                      <LayoutGrid size={14} className="text-[#5CC87A] flex-shrink-0" />
                      <span className="truncate">{t("workspace.kanban")}</span>
                  </button>
                  <button
                      onClick={() => navigate('/workspace/calendar')}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-white/70 hover:bg-white/10 hover:text-white transition-all text-sm"
                  >
                      <Calendar size={14} className="text-[#5CC87A] flex-shrink-0" />
                      <span className="truncate">{t("calendar.title")}</span>
                  </button>
              </div>
            <div className="flex items-center justify-between px-1 mb-1.5">
              <span className="text-white/40 text-xs font-semibold uppercase tracking-wide">{t("permission.groupChannel")}</span>
              <Tooltip label={t("workspace.newChannel")} side="bottom" align="end">
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
                  placeholder={t("workspace.channelNamePlaceholder")}
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
                                  placeholder={t("workspace.childChannelNamePlaceholder")}
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
