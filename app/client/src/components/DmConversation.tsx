import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useDmMessage } from "../hooks/useDmMessage";
import { useFriendStore } from "../store/friendStore"; // ✅ 주석 해제

interface DmConversationProps {
    peerId: number;
}

export function DmConversation({ peerId }: DmConversationProps) {
    const { user: myInfo } = useAuthStore();

    // ✅ 1. friendStore에서 friends 배열 가져오기
    const { friends } = useFriendStore();

    // ✅ 2. peerId(채팅 상대)와 일치하는 친구 정보 찾기
    // 주의: 관계용 id가 아니라 유저 식별자인 uid와 비교해야 합니다.
    const targetFriend = friends.find((f) => f.uid === peerId);

    // ✅ 3. 친구 정보가 존재하면 그 이름을, 못 찾으면 '알 수 없음(또는 임시이름)' 적용
    // store에 avatar가 있다면 color 대신 활용하도록 추후 확장할 수도 있습니다.
    const friend = {
        name: targetFriend?.name || "임시이름",
        color: "bg-gray-400" // 아바타 이미지가 없을 때 기본 배경색
    };

    const { dmMessages, sendMessage } = useDmMessage(peerId);
    const [inputText, setInputText] = useState("");

    const handleSend = () => {
        if (inputText.trim()) {
            sendMessage(inputText);
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
                                <div className={`w-8 h-8 rounded-full ${friend.color} flex items-center justify-center text-white font-bold flex-shrink-0 text-sm`}>
                                    {friend.name.charAt(0) || '?'}
                                </div>
                            )}
                            <div className={`max-w-[75%] ${isMe ? "text-right" : ""}`}>
                                <div className="flex items-baseline gap-2 mb-1">
                                    {!isMe && (
                                        <span className="font-bold text-[#2C3E50] text-sm">{friend.name}</span>
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