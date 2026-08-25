import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LayoutGrid, Home, Search, AlertCircle, X,} from "lucide-react";
import { useState, useEffect } from "react";
import { WorkspaceSidebar } from "../components/WorkspaceSidebar";
import { useWorkspaceStore } from "../store/workspaceStore";
import { FriendSidebar } from "../components/FriendSidebar";
import { NotificationSidebar } from "../components/NotificationSidebar";
import { CalendarSidebar } from "../components/CalendarSidebar";
import { BottomBar } from "../components/BottomBar";
import { Tooltip } from "../components/Tooltip";
import { api } from "../api/client";
import { fetchChannelHistory, fetchChannelReadStates } from "../api/messenger";
import { useChannelStore } from "../store/channelStore";
import { useAuthStore } from "../store/authStore";
import { useWorkspaceUnread } from "../hooks/useWorkspaceUnread";

// 서버는 실패 시 { success:false, error:{ code, message } }를 내려줌 (한국어 메시지 포함).
// openapi-fetch의 error는 타입이 넓어 any 경유가 불가피 — 메시지 추출을 한 곳으로 모음.
const errorMessageOf = (error: unknown, fallback: string) =>
  (error as any)?.error?.message ?? fallback;

// 워크스페이스 진입 시 채널별 안읽음 계산 (프론트 계산: 채널마다 history+read-states)
// 벌크 엔드포인트 생기면 이 함수만 1줄로 교체하면 됨.
async function loadWorkspaceUnread(channelIds: number[]) {
    const token = useAuthStore.getState().accessToken;
    const myUid = useAuthStore.getState().user?.uid;
    if (!token || myUid == null || channelIds.length === 0) return;

    const entries = await Promise.all(
        channelIds.map(async (id) => {
            try {
                const [history, readStates] = await Promise.all([
                    fetchChannelHistory(id, token),
                    fetchChannelReadStates(id, token),
                ]);
                const mine = readStates.find((s) => s.userId === String(myUid));
                const lastRead = mine?.lastReadMessageId ?? 0;
                return [id, history.filter((m) => m.id > lastRead).length] as const;
            } catch {
                // 아직 참여 안 한 채널은 messenger가 403 → 0으로 둠
                return [id, 0] as const;
            }
        })
    );

    useChannelStore.getState().setUnreadBatch(Object.fromEntries(entries));
}

export function WorkspaceLayout() {
  const { t } = useTranslation();
  const {currentWorkspace, channelsByWorkspace, setWorkspaceChannels, addChannel, updateChannel, removeChannel,
      deleteWorkspace,
  } = useWorkspaceStore();
  const location = useLocation();
  const navigate = useNavigate();
  const channels = currentWorkspace ? channelsByWorkspace[currentWorkspace.id] ?? [] : [];

  const isInChannel = location.pathname.startsWith("/workspace/channels");

  const activeChannelId = isInChannel
      ? Number(location.pathname.split("/workspace/channels/")[1]) || null
      : null;
    useWorkspaceUnread(channels, activeChannelId);

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
          // ▼▼ 추가: 진입 시 채널별 안읽음 계산
          loadWorkspaceUnread((data.data ?? []).map((c) => c.id!));
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
        setChannelError(errorMessageOf(error, t('workspace.channelCreateFailed')));
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
      setChannelError(t('ui.serverError'));
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
        setChannelError(errorMessageOf(error, t('workspace.channelDeleteFailed')));
        return;
      }
      removeChannel(wsId, channelId);
      if (activeChannelId === channelId) navigate("/workspace");
    } catch (e) {
      console.error('채널 삭제 실패:', e);
      setChannelError(t('ui.serverError'));
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
        setChannelError(errorMessageOf(error, t('workspace.channelRenameFailed')));
        return;
      }
      updateChannel(wsId, channelId, newName);
    } catch (e) {
      console.error('채널 이름 변경 실패:', e);
      setChannelError(t('ui.serverError'));
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

  // 워크스페이스 나가기 (삭제와 동일하게 내 목록/캐시에서 제거 후 이동)
  const handleLeaveWorkspace = async (workspaceId: number) => {
      try {
          const { error } = await api.DELETE('/api/workspaces/{workspaceId}/members/me', {
              params: { path: { workspaceId } },
          });
          if (error) { console.error('워크스페이스 나가기 실패:', error); return; }
      } catch (e) {
          console.error('워크스페이스 나가기 실패:', e);
          return;
      }
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
        onLeaveWorkspace={handleLeaveWorkspace}
        getDefaultChannelId={getDefaultChannelId}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative">

        {/* ── 상단 헤더 ── */}
        <div className="app-chrome h-14 bg-white border-b border-[#e8f8ed] flex items-center px-5 gap-3 flex-shrink-0">
          {currentWorkspace && (
              <div className="flex items-center gap-2.5">
                <div
                    className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center text-white text-sm font-bold shadow-sm"
                    style={currentWorkspace.iconUrl ? undefined : {
                      background: `linear-gradient(to bottom right, ${currentWorkspace.colors[0]}, ${currentWorkspace.colors[1]})`,
                    }}
                >
                  {currentWorkspace.iconUrl
                    ? <img src={currentWorkspace.iconUrl} alt="" className="w-full h-full object-cover" />
                    : currentWorkspace.avatar}
                </div>
                <h1 className="font-bold text-[#2C3E50] text-base">{currentWorkspace.name}</h1>
              </div>
          )}
          <div className="flex-1" />
          <Tooltip label={t("ui.search")} side="bottom">
            <button className="p-2 hover:bg-[#f0f9f4] rounded-xl transition-all">
              <Search size={18} className="text-[#5CC87A]" />
            </button>
          </Tooltip>

        </div>

        {/* ── 채널 작업 실패 안내 ── */}
        {channelError && (
          <div className="app-chrome flex items-center gap-2 px-5 py-2 bg-red-50 border-b border-red-100 flex-shrink-0">
            <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-600 flex-1">{channelError}</p>
            <button
              onClick={() => setChannelError("")}
              title={t("ui.close")}
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
                  {t("workspace.none")}
                </p>
                <p className="text-xs text-gray-400">
                  {t("workspace.createHintPrefix")}<span className="font-semibold text-[#5CC87A]">+</span>{t("workspace.createHintSuffix")}
                </p>
              </div>
          )}
        </div>
        </div>
        <FriendSidebar />
        <NotificationSidebar />
        <CalendarSidebar />
      </div>

      {/* ── 하단 작업표시줄 ── */}
      <BottomBar>
        {/* 좌측: 홈버튼 + 구분선 */}
        <Tooltip label={t("workspace.home")} side="top" align="start">
          <button onClick={() => navigate("/WorkspaceHome")}
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all flex-shrink-0 text-white/60 hover:bg-white/10 hover:text-white">
            <Home size={19} />
          </button>
        </Tooltip>
        <div className="h-8 w-[2px] bg-white/20 rounded-full mx-2 flex-shrink-0" />
      </BottomBar>

    </div>
  );
}
