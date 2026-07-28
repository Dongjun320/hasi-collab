import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/authStore";
import { useDmMessage } from "../hooks/useDmMessage"; // 기존 훅 재사용
import { Cloud } from "lucide-react"; // 구름 아이콘 사용을 위해 추가
// import { useFriendStore } from "../store/friendStore";

interface DmConversationProps {
    peerId: number;
}

export function DmConversation({ peerId }: DmConversationProps) {
    const { user: myInfo } = useAuthStore();
    const friend = { name: "임시이름", color: "bg-gray-400" }; // 추후 friendStore 연동

    const { dmMessages, sendMessage } = useDmMessage(peerId);
    const [inputText, setInputText] = useState("");

    // 스크롤 및 과거 메시지 로딩 상태 관리
    const scrollRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isLoadingOlder, setIsLoadingOlder] = useState(false);

    // 새 메시지가 오거나 처음 열렸을 때 맨 아래로 자동 스크롤
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [dmMessages]);

    // 스크롤이 맨 위로 닿았을 때 과거 메시지 20개 불러오기 (구름 로딩 UI)
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (e.currentTarget.scrollTop === 0 && !isLoadingOlder) {
            setIsLoadingOlder(true);

            // TODO: 실제 백엔드 페이징(과거 20개) API 호출 로직으로 교체
            setTimeout(() => {
                setIsLoadingOlder(false);
                // 데이터를 불러온 후에는 기존 스크롤 위치를 유지하는 로직이 추가로 필요할 수 있습니다.
            }, 1500);
        }
    };

    const handleSend = () => {
        if (inputText.trim()) {
            sendMessage(inputText);
            setInputText("");
        }
    };

    // YYYY년 MM월 DD일 포맷팅 (날짜 구분선용)
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}년 ${mm}월 ${dd}일`;
    };

    // HH:mm:ss 포맷팅 (24시간 60분 60초)
    const formatTime = (dateStr?: string) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        const ss = String(d.getSeconds()).padStart(2, "0");
        return `${hh}:${mm}:${ss}`;
    };

    return (
        <div className="flex flex-col h-full w-full bg-white">

            {/* 메시지 영역 */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 flex flex-col"
            >
                {/* 과거 메시지 로딩 구름 효과 */}
                {isLoadingOlder && (
                    <div className="flex flex-col items-center justify-center py-3 text-gray-400 animate-pulse transition-all">
                        <Cloud size={24} className="mb-1 text-blue-300" />
                        <span className="text-[10px] font-medium">이전 메시지 불러오는 중...</span>
                    </div>
                )}

                {dmMessages.map((msg, index) => {
                    const isMe = msg.sender === String(myInfo?.uid);

                    // 현재 메시지와 이전 메시지의 날짜 비교
                    const currentDate = formatDate(msg.createdAt);
                    const prevDate = index > 0 ? formatDate(dmMessages[index - 1].createdAt) : null;
                    const showDateDivider = currentDate !== prevDate; // 날짜가 달라지면 true

                    return (
                        <div key={msg.id || index} className="flex flex-col">

                            {/* 그 날의 첫 메시지 위에만 렌더링되는 날짜 구분선 */}
                            {showDateDivider && (
                                <div className="flex justify-center my-4">
                                    <div className="bg-[#f0f9f4] text-[#5CC87A] text-[10px] px-3 py-1 rounded-full font-bold">
                                        {currentDate}
                                    </div>
                                </div>
                            )}

                            {/* 개별 메시지 렌더링 */}
                            <div className={`flex gap-2 mb-4 ${isMe ? "flex-row-reverse" : ""}`}>
                                {!isMe && (
                                    <div className={`w-8 h-8 rounded-full ${friend?.color} flex items-center justify-center text-white font-bold flex-shrink-0 text-sm mt-1`}>
                                        {friend?.name?.charAt(0) || '?'}
                                    </div>
                                )}

                                <div className={`max-w-[75%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                    {!isMe && (
                                        <span className="font-bold text-[#2C3E50] text-xs mb-1 ml-1">{friend?.name}</span>
                                    )}

                                    <div className={`flex items-end gap-1.5 ${isMe ? "flex-row-reverse" : ""}`}>
                                        <div
                                            className={`inline-block px-3 py-2 rounded-xl text-sm text-left break-words shadow-sm ${
                                                isMe
                                                    ? "bg-[#5CC87A] text-white rounded-tr-sm"
                                                    : "bg-gray-100 text-[#2C3E50] rounded-tl-sm"
                                            }`}
                                        >
                                            {msg.content}
                                        </div>
                                        {/* 24시간 60분 60초 타임스탬프 */}
                                        <span className="text-[9px] text-gray-400 font-medium whitespace-nowrap mb-0.5">
                                            {formatTime(msg.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {/* 스크롤을 맨 아래로 내리기 위한 보이지 않는 요소 */}
                <div ref={messagesEndRef} className="h-1" />
            </div>

            {/* 메시지 입력 영역 */}
            <div className="p-3 border-t border-gray-100 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
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
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#5CC87A] focus:ring-1 focus:ring-[#5CC87A] transition-all bg-gray-50"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputText.trim()}
                        className="px-4 py-2 bg-[#5CC87A] hover:bg-[#2E8B4F] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-all"
                    >
                        전송
                    </button>
                </div>
            </div>
        </div>
    );
}