import { useParams } from "react-router";
import { useState } from "react";
import { Hash, Users, X } from "lucide-react";

interface Member {
  id: string;
  name: string;
  department: string;
  status: "online" | "offline";
  color: string;
}

export function ChannelsPage() {
  const { channelId = "general" } = useParams();
  const [message, setMessage] = useState("");
  const [isMemberListOpen, setIsMemberListOpen] = useState(false);
  const [memberSortType, setMemberSortType] = useState<"all" | "department" | "online">("all");

  const allMembers: Member[] = [
    { id: "1", name: "김동준", department: "개발팀", status: "online", color: "bg-green-400" },
    { id: "2", name: "김상현", department: "개발팀", status: "online", color: "bg-blue-400" },
    { id: "3", name: "김지환", department: "개발팀", status: "online", color: "bg-purple-400" },
    { id: "4", name: "박규태", department: "총무팀", status: "offline", color: "bg-yellow-400" },
    { id: "5", name: "박종서", department: "총무팀", status: "online", color: "bg-pink-400" },
    { id: "6", name: "장윤찬", department: "총무팀", status: "online", color: "bg-indigo-400" },
    { id: "7", name: "정진우", department: "디자인팀", status: "online", color: "bg-orange-400" },
    { id: "8", name: "大谷翔平", department: "개발팀", status: "offline", color: "bg-red-400" },
    { id: "9", name: "山本由伸", department: "디자인팀", status: "online", color: "bg-teal-400" },
    { id: "10", name: "佐々木朗希", department: "디자인팀", status: "offline", color: "bg-cyan-400" },
  ];

  const getSortedMembers = () => {
    let filtered = [...allMembers];

    if (memberSortType === "online") {
      filtered = filtered.filter(m => m.status === "online");
    }

    if (memberSortType === "department") {
      filtered.sort((a, b) => {
        if (a.department !== b.department) {
          return a.department.localeCompare(b.department, 'ko');
        }
        return a.name.localeCompare(b.name, 'ko');
      });
    } else {
      filtered.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    }

    return filtered;
  };

  const groupedMembers = memberSortType === "department"
    ? getSortedMembers().reduce((acc, member) => {
        if (!acc[member.department]) {
          acc[member.department] = [];
        }
        acc[member.department].push(member);
        return acc;
      }, {} as Record<string, Member[]>)
    : null;

  const onlineCount = allMembers.filter(m => m.status === "online").length;
  const totalCount = allMembers.length;

  const channelNames: Record<string, string> = {
    general: "일반",
    dev: "개발팀",
    design: "디자인",
  };

  const messages = [
    {
      id: 1,
      user: "김동준",
      time: "오후 2:30",
      content: "컬러 팔레트 확인해봤어요",
      avatar: "김",
      color: "bg-green-400",
    },
    {
      id: 2,
      user: "박규태",
      time: "오후 2:31",
      content: "초록 계열 느낌 좋네요!",
      avatar: "박",
      color: "bg-yellow-400",
    },
    {
      id: 3,
      user: "정진우",
      time: "오후 2:33",
      content: "디스코드랑 다른 느낌이라서 좋습니다",
      avatar: "정",
      color: "bg-orange-400",
    },
  ];

  const handleSend = () => {
    if (message.trim()) {
      console.log("전송:", message);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* 채널 헤더 */}
      <div className="h-14 border-b border-gray-100 px-6 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <Hash size={20} className="text-[#5CC87A]" />
          <h2 className="font-bold text-[#2C3E50]">{channelNames[channelId]}</h2>
        </div>
        <button
          onClick={() => setIsMemberListOpen(!isMemberListOpen)}
          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-all text-sm text-gray-600"
        >
          <Users size={16} />
          <span>멤버 {totalCount}명</span>
          <span className="text-green-500">• {onlineCount}명 온라인</span>
        </button>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-3">
            <div className={`w-10 h-10 rounded-full ${msg.color} flex items-center justify-center text-white font-bold flex-shrink-0`}>
              {msg.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-bold text-[#2C3E50]">{msg.user}</span>
                <span className="text-xs text-gray-400">{msg.time}</span>
              </div>
              <p className="text-[#2C3E50]">{msg.content}</p>
            </div>
          </div>
        ))}
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
            placeholder={`# ${channelNames[channelId]}에 메시지 보내기...`}
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
                  onClick={() => setMemberSortType("department")}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    memberSortType === "department"
                      ? "bg-[#5CC87A] text-white"
                      : "bg-[#f0f9f4] text-[#5CC87A] hover:bg-[#d4f4dd]"
                  }`}
                >
                  부서별
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
              {memberSortType === "department" ? (
                // 부서별 보기
                <div className="space-y-4">
                  {Object.entries(groupedMembers!).map(([dept, members]) => (
                    <div key={dept}>
                      <h4 className="text-xs font-semibold text-[#5CC87A] mb-2">{dept}</h4>
                      <div className="space-y-2">
                        {members.map((member) => (
                          <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-[#f0f9f4] rounded-lg transition-all cursor-pointer">
                            <div className="relative">
                              <div className={`w-10 h-10 rounded-full ${member.color} flex items-center justify-center text-white font-bold text-sm`}>
                                {member.name.charAt(0)}
                              </div>
                              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                                member.status === "online" ? "bg-green-500" : "bg-gray-400"
                              }`} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-[#2C3E50]">{member.name}</p>
                              <p className="text-xs text-gray-500">{member.status === "online" ? "온라인" : "오프라인"}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // 전체/온라인 보기
                <div className="space-y-2">
                  {getSortedMembers().map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-[#f0f9f4] rounded-lg transition-all cursor-pointer">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full ${member.color} flex items-center justify-center text-white font-bold text-sm`}>
                          {member.name.charAt(0)}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                          member.status === "online" ? "bg-green-500" : "bg-gray-400"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#2C3E50]">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.department} • {member.status === "online" ? "온라인" : "오프라인"}</p>
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
