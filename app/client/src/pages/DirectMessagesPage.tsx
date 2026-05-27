import { useParams } from "react-router";
import { useState } from "react";
import { Phone, Video } from "lucide-react";

export function DirectMessagesPage() {
  const { userId } = useParams();
  const [message, setMessage] = useState("");

  const users: Record<string, { name: string; status: string; color: string }> = {
    "1": { name: "김동준", status: "온라인", color: "bg-green-400" },
    "2": { name: "박규태", status: "자리 비움", color: "bg-yellow-400" },
    "3": { name: "정진우", status: "오프라인", color: "bg-orange-400" },
  };

  const currentUser = userId ? users[userId] : null;

  const messages = userId
    ? [
        {
          id: 1,
          from: "me",
          time: "오후 2:20",
          content: "안녕하세요! 진행 상황 공유 부탁드립니다.",
        },
        {
          id: 2,
          from: "them",
          time: "오후 2:23",
          content: "네, 지금 작업 중입니다. 오후에 공유드릴게요!",
        },
        {
          id: 3,
          from: "me",
          time: "오후 2:25",
          content: "감사합니다!",
        },
      ]
    : [];

  const handleSend = () => {
    if (message.trim()) {
      console.log("전송:", message);
      setMessage("");
    }
  };

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-[#f0f9f4] flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💬</span>
          </div>
          <h2 className="text-xl font-bold text-[#2C3E50] mb-2">
            다이렉트 메시지
          </h2>
          <p className="text-gray-600">
            왼쪽에서 대화 상대를 선택해주세요
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* DM 헤더 */}
      <div className="h-14 border-b border-gray-100 px-6 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${currentUser?.color} flex items-center justify-center text-white font-bold`}>
            {currentUser?.name.charAt(0)}
          </div>
          <div>
            <h2 className="font-bold text-[#2C3E50]">{currentUser?.name}</h2>
            <p className="text-xs text-gray-500">{currentUser?.status}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-all">
            <Phone size={18} className="text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-all">
            <Video size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.from === "me" ? "flex-row-reverse" : ""}`}
          >
            {msg.from === "them" && (
              <div className={`w-10 h-10 rounded-full ${currentUser?.color} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                {currentUser?.name.charAt(0)}
              </div>
            )}
            <div className={`max-w-md ${msg.from === "me" ? "text-right" : ""}`}>
              <div className="flex items-baseline gap-2 mb-1">
                {msg.from === "them" && (
                  <span className="font-bold text-[#2C3E50]">{currentUser?.name}</span>
                )}
                <span className="text-xs text-gray-400">{msg.time}</span>
              </div>
              <div
                className={`inline-block px-4 py-2 rounded-lg ${
                  msg.from === "me"
                    ? "bg-[#5CC87A] text-white"
                    : "bg-[#f0f9f4] text-[#2C3E50]"
                }`}
              >
                {msg.content}
              </div>
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
            placeholder={`${currentUser?.name}님에게 메시지 보내기...`}
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
    </div>
  );
}
