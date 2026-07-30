import { useParams } from "react-router";
import { useState, useEffect, useRef } from "react";
import { Hash, Users, X } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { useChannelMessage } from "../hooks/useChannelMessage";
import { useAuthStore } from "../store/authStore";
import { useWorkspaceStore } from "../store/workspaceStore";
import { api } from "../api/client"
import { useMemberStore, type WorkspaceMember } from "../store/memberStore";
import { usePresenceStore } from "../store/presenceStore";
import { useWorkspacePresence } from "../hooks/usePresence";

// uid로 색을 고정 배정 (서버에 색 개념이 없어 화면용으로만 사용)
const AVATAR_COLORS = [
  "bg-green-400", "bg-purple-400", "bg-yellow-400", "bg-pink-400",
  "bg-indigo-400", "bg-orange-400", "bg-red-400", "bg-teal-400", "bg-cyan-400",
];

const colorOf = (uid: number) => AVATAR_COLORS[uid % AVATAR_COLORS.length];

export function ChannelsPage() {
  const { channelId: channelIdParam } = useParams();
  const channelId = Number(channelIdParam);
  const [isMemberListOpen, setIsMemberListOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [memberSortType, setMemberSortType] = useState<"all" | "role" | "online">("all");
  const { channels } = useOutletContext<{ channels: { id: number; name: string }[] }>() ?? { channels: [] };
  const channelName = channels.find((c) => c.id === channelId)?.name ?? "";
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const myUid = useAuthStore((s) => s.user?.uid);
  const { currentWorkspace } = useWorkspaceStore();
  const { members, setMembers } = useMemberStore();
  const onlineUserIds = usePresenceStore((s) => s.onlineUserIds);
  const isOnline = (id: number | string) => onlineUserIds.has(String(id));
  useWorkspacePresence(currentWorkspace?.id ?? null, members.map((m) => m.userId));

  // 실시간 메시지 (히스토리 + STOMP)
  const { messages, sendMessage } = useChannelMessage(channelId);


  const loadMembers = async () => {
    if (!currentWorkspace) return;
    try {
      const { data, error } = await api.GET('/api/workspaces/{workspaceId}/members', {
        params: { path: { workspaceId: currentWorkspace.id } },
      });
      if (error || !data?.success) return;
      setMembers((data.data ?? []).map((m) => ({
        userId: m.userId!,
        nickname: m.nickname ?? '',
        role: m.role ?? 'MEMBER',
      })));
    } catch (e) {
      console.error('멤버 조회 실패:', e);
    }
  };

  useEffect(() => { loadMembers(); }, [currentWorkspace?.id]);

  const nicknameOf = (uid: number) =>
      members.find((m) => m.userId === uid)?.nickname ?? `사용자 ${uid}`;


  const getSortedMembers = () => {
    let filtered = [...members];

    if (memberSortType === "online") {
      filtered = filtered.filter((m) => isOnline(m.userId));
    }
    return filtered.sort((a, b) => a.nickname.localeCompare(b.nickname));
  };

  // 역할별 보기용 그룹 (owner → admin → member 순)
  const ROLE_LABEL: Record<string, string> = {
    OWNER: "소유자", ADMIN: "관리자", MEMBER: "멤버",
  };
  const ROLE_ORDER = ["OWNER", "ADMIN", "MEMBER"];

  const groupedMembers = memberSortType === "role"
      ? ROLE_ORDER.reduce((acc, role) => {
        const list = getSortedMembers().filter((m) => m.role === role);
        if (list.length) acc[role] = list;
        return acc;
      }, {} as Record<string, WorkspaceMember[]>)
      : null;

  const onlineCount = members.filter((m) => isOnline(m.userId)).length;
  const totalCount = members.length;

  const handleSend = () => {
    const content = message.trim();
    if (!content) return;
    sendMessage(content);   // STOMP 전송 — 서버 브로드캐스트로 돌아옴
    setMessage("");
  };

  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    setIsAtBottom(atBottom);
    if (atBottom) setUnreadCount(0);
  };

  const scrollToBottom = (smooth = true) =>        // ← 기본값 smooth
      messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });

  useEffect(() => {
    if (messages.length === 0) return;
    const last = messages[messages.length - 1];
    const isMine = Number(last.sender) === myUid; // 기존 isMine 판별과 동일한 기준

    if (isMine || isAtBottom) scrollToBottom();     // isAtBottom 기본 true → smooth 스크롤
  }, [messages]);

  return (
    <div className="flex flex-col h-full relative">
      {/* 채널 헤더 */}
      <div className="h-14 border-b border-gray-100 px-6 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <Hash size={20} className="text-[#5CC87A]" />
          <h2 className="font-bold text-[#2C3E50]">{channelName}</h2>
        </div>
        <button
          onClick={() => { const next = !isMemberListOpen; setIsMemberListOpen(next); if (next) loadMembers(); }}
          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-all text-sm text-gray-600"
        >
          <Users size={16} />
          <span>멤버 {totalCount}명</span>
          <span className="text-green-500">• {onlineCount}명 온라인</span>
        </button>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 relative" ref={messagesContainerRef} onScroll={handleScroll}>
        {messages.map((msg) => {
          const senderUid = Number(msg.sender);
          const isMine = senderUid === myUid;
          const name = nicknameOf(senderUid);
          const time = new Date(msg.createdAt).toLocaleTimeString("ko-KR", {
            hour: "numeric", minute: "2-digit",
          });
          return (
              <div key={msg.id} className={`flex gap-3 ${isMine ? "flex-row-reverse" : ""}`}>
                <div className={`w-10 h-10 rounded-full ${colorOf(senderUid)} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                  {name.charAt(0)}
                </div>
                <div className={`flex-1 flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                  <div className={`flex items-baseline gap-2 mb-1 ${isMine ? "flex-row-reverse" : ""}`}>
                    <span className="font-bold text-[#2C3E50]">{name}</span>
                    <span className="text-xs text-gray-400">{time}</span>
                  </div>
                  {msg.isDeleted
                      ? <p className="text-gray-400 italic text-sm">삭제된 메시지입니다</p>
                      : <p className="text-[#2C3E50]">{msg.content}</p>}
                </div>
              </div>
          );
        })}
        <div ref={messagesEndRef} />
        {unreadCount > 0 && (
            <button
                onClick={() => { scrollToBottom(); setUnreadCount(0); }}
                className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-[#5CC87A] text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg z-20"
            >
              확인하지 못한 메시지 {unreadCount}건
            </button>
        )}
      </div>

      {/* 메시지 입력 영역 */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`# ${channelName}에 메시지 보내기...`}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-[#5CC87A] focus:ring-2 focus:ring-[#A8E6B8]/20 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="px-6 py-3 bg-[#5CC87A] hover:bg-[#2E8B4F] disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all"
          >
            전송
          </button>
        </div>
      </div>

      {/* 멤버 리스트 모달 */}
      {isMemberListOpen && (
        <>
          {/* 백드롭 */}
          <div
            onClick={() => setIsMemberListOpen(false)}
            className="fixed inset-0 bg-black/20 z-30"
          />

          {/* 멤버 리스트 */}
          <div className="fixed right-6 top-20 w-80 bg-white rounded-2xl shadow-2xl border border-[#d4f4dd] z-40 max-h-[calc(100vh-120px)] flex flex-col">
            {/* 헤더 */}
            <div className="p-4 border-b border-[#d4f4dd]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-[#2C3E50]">멤버</h3>
                <button
                  onClick={() => setIsMemberListOpen(false)}
                  className="p-1 hover:bg-[#f0f9f4] rounded transition-all"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              {/* 정렬 버튼 */}
              <div className="flex gap-2">
                <button
                  onClick={() => setMemberSortType("all")}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    memberSortType === "all"
                      ? "bg-[#5CC87A] text-white"
                      : "bg-[#f0f9f4] text-[#5CC87A] hover:bg-[#d4f4dd]"
                  }`}
                >
                  전체
                </button>
                <button
                  onClick={() => setMemberSortType("role")}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    memberSortType === "role"
                      ? "bg-[#5CC87A] text-white"
                      : "bg-[#f0f9f4] text-[#5CC87A] hover:bg-[#d4f4dd]"
                  }`}
                >
                  역할별
                </button>
                <button
                  onClick={() => setMemberSortType("online")}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    memberSortType === "online"
                      ? "bg-[#5CC87A] text-white"
                      : "bg-[#f0f9f4] text-[#5CC87A] hover:bg-[#d4f4dd]"
                  }`}
                >
                  온라인
                </button>
              </div>
            </div>

            {/* 멤버 리스트 */}
            <div className="flex-1 overflow-y-auto p-4">
              {members.length === 0 && (
                  <p className="text-xs text-gray-400 text-center mt-6">멤버가 없습니다</p>
              )}

              {memberSortType === "role" && groupedMembers ? (
                  /* 역할별 보기 */
                  <div className="space-y-4">
                    {Object.entries(groupedMembers).map(([role, members]) => (
                        <div key={role}>
                          <h4 className="text-xs font-semibold text-[#5CC87A] mb-2">
                            {ROLE_LABEL[role] ?? role}
                          </h4>
                          <div className="space-y-2">
                            {members.map((member) => (
                                <div key={member.userId} className="flex items-center gap-3 p-2 hover:bg-[#f0f9f4] rounded-lg transition-all cursor-pointer">
                                  <div className="relative">
                                    <div className={`w-10 h-10 rounded-full ${colorOf(member.userId)} flex items-center justify-center text-white font-bold text-sm`}>
                                      {member.nickname.charAt(0)}
                                    </div>
                                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                                        isOnline(member.userId) ? "bg-green-500" : "bg-gray-400"
                                    }`} />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-[#2C3E50]">{member.nickname}</p>
                                    <p className="text-xs text-gray-500">
                                      {isOnline(member.userId) ? "온라인" : "오프라인"}
                                    </p>
                                  </div>
                                </div>
                            ))}
                          </div>
                        </div>
                    ))}
                  </div>
              ) : (
                  /* 전체 / 온라인 보기 */
                  <div className="space-y-2">
                    {getSortedMembers().map((member) => (
                        <div key={member.userId} className="flex items-center gap-3 p-2 hover:bg-[#f0f9f4] rounded-lg transition-all cursor-pointer">
                          <div className="relative">
                            <div className={`w-10 h-10 rounded-full ${colorOf(member.userId)} flex items-center justify-center text-white font-bold text-sm`}>
                              {member.nickname.charAt(0)}
                            </div>
                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                                isOnline(member.userId) ? "bg-green-500" : "bg-gray-400"
                            }`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[#2C3E50]">{member.nickname}</p>
                            <p className="text-xs text-gray-500">
                              {ROLE_LABEL[member.role] ?? member.role} • {isOnline(member.userId) ? "온라인" : "오프라인"}
                            </p>
                          </div>
                        </div>
                    ))}
                  </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
