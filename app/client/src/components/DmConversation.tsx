import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { fetchDmHistory } from "../api/messenger";
import { connectStomp, subscribeToDm, sendDmMessage } from "../api/stomp";
// import { useFriendStore } from "../store/friendStore"; // (예시) 실제 팀의 store 경로에 맞게 수정

// 1. peerId를 prop으로 받기 위한 인터페이스 정의
interface DmConversationProps {
    peerId: number;
}

export function DmConversation({ peerId }: DmConversationProps) {
    const { user: myInfo, accessToken } = useAuthStore();

    // 5. peerId로 friendStore에서 친구 정보 조회 (상태 하드코딩 제거)
    // const friend = useFriendStore((state) => state.friends.find(f => f.id === peerId));
    const friend = { name: "임시이름", color: "bg-gray-400" }; // 실제 연결 시 위 코드로 교체

    // 2. 인스턴스마다 독립적인 로컬 상태 관리
    const [messages, setMessages] = useState<any[]>([]); // 추후 DmOutboundMessage 타입 지정 권장
    const [inputText, setInputText] = useState("");

    // 3. 자체 구독 생성 및 정리
    useEffect(() => {
        if (!accessToken) return;

        let unsub: (() => void) | undefined;

        // 마운트 시: 히스토리 로드
        fetchDmHistory(peerId, accessToken)
            .then((history) => {
                setMessages(history);
            })
            .catch(console.error);

        // 마운트 시: 실시간 STOMP 구독
        connectStomp(accessToken)
            .then(() => {
                unsub = subscribeToDm(peerId, (newMsg) => {
                    // 기존 메시지 배열에 새로운 메시지 추가
                    setMessages((prev) => [...prev, newMsg]);
                });
            })
            .catch(console.error);

        // 언마운트 시: 내 구독만 깔끔하게 해제
        return () => {
            if (unsub) unsub();
        };
    }, [peerId, accessToken]);

    const handleSend = () => {
        if (inputText.trim()) {
            sendDmMessage(peerId, inputText);
            setInputText("");
        }
    };

    // 4. 부모(팝업) 크기에 맞추기 위해 h-full, w-full 사용 및 외부 여백 제거
    return (
        <div className="flex flex-col h-full w-full bg-white">

            {/* 메시지 영역 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => {
                    // ✅ TS 에러 해결: DirectMessagesPage와 동일하게 필드명 매칭
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
                    {/* 시간 포맷팅 필요 */}
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