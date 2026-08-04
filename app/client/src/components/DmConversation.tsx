import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useDmMessage } from "../hooks/useDmMessage"; // ✅ 기존 훅 재사용
// import { useFriendStore } from "../store/friendStore";

interface DmConversationProps {
    peerId: number;
}

export function DmConversation({ peerId }: DmConversationProps) {
    const { user: myInfo } = useAuthStore();
    const friend = { name: "임시이름", color: "bg-gray-400" }; // 추후 friendStore 연동

    // ✅ PM 피드백 반영: 로컬 상태와 자체 구독 로직을 걷어내고 훅 하나로 대체!
    const { dmMessages, sendMessage } = useDmMessage(peerId);

    const [inputText, setInputText] = useState("");

    const handleSend = () => {
        if (inputText.trim()) {
            sendMessage(inputText); // 훅에서 제공하는 sendMessage 사용
            setInputText("");
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-white">
            {/* 메시지 영역 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {dmMessages.map((msg, index) => {
                    const isMe = msg.sender === String(myInfo?.uid);

                    return (
                        <div
                            key={msg.id || index}
                            className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}
                        >
                            {!isMe && (
                                <div className={`w-8 h-8 rounded-full ${friend?.color} flex items-center justify-center text-white font-bold flex-shrink-0 text-sm`}>
                                    {friend?.name?.charAt(0) || '?'}
                                </div>
                            )}
                            <div className={`max-w-[75%] ${isMe ? "text-right" : ""}`}>
                                <div className="flex items-baseline gap-2 mb-1">
                                    {!isMe && (
                                        <span className="font-bold text-[#2C3E50] text-sm">{friend?.name}</span>
                                    )}
                                    <span className="text-xs text-gray-400">
                                        {msg.createdAt || '방금'}
                                    </span>
                                </div>
                                <div
                                    className={`inline-block px-3 py-2 rounded-lg text-sm text-left break-words ${
                                        isMe
                                            ? "bg-[#5CC87A] text-white"
                                            : "bg-[#f0f9f4] text-[#2C3E50]"
                                    }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 메시지 입력 영역 */}
            <div className="p-3 border-t border-gray-100 bg-white">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="메시지 보내기..."
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-[#5CC87A] focus:ring-1 focus:ring-[#5CC87A] transition-all"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputText.trim()}
                        className="px-4 py-2 bg-[#5CC87A] hover:bg-[#2E8B4F] disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-all"
                    >
                        전송
                    </button>
                </div>
            </div>
        </div>
    );
}