import { MessageSquare, Hash } from "lucide-react";

export function ThreadsPage() {
  const threads = [
    {
      id: 1,
      channel: "일반",
      user: "김동준",
      avatar: "김",
      color: "bg-green-400",
      content: "새로운 기능 제안드립니다",
      replies: 5,
      lastReply: "10분 전",
    },
    {
      id: 2,
      channel: "개발팀",
      user: "박규태",
      avatar: "박",
      color: "bg-yellow-400",
      content: "코드 리뷰 부탁드립니다",
      replies: 8,
      lastReply: "30분 전",
    },
    {
      id: 3,
      channel: "디자인",
      user: "정진우",
      avatar: "정",
      color: "bg-orange-400",
      content: "새 디자인 시안 공유합니다",
      replies: 3,
      lastReply: "1시간 전",
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f8fdf9]">
      {/* 헤더 */}
      <div className="h-14 border-b border-gray-100 px-6 flex items-center bg-white">
        <h1 className="text-xl font-bold text-[#2C3E50]">스레드</h1>
      </div>

      {/* 스레드 리스트 */}
      <div className="flex-1 overflow-y-auto p-6">
        {threads.length > 0 ? (
          <div className="max-w-4xl mx-auto space-y-4">
            {threads.map((thread) => (
              <div
                key={thread.id}
                className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md cursor-pointer transition-all"
              >
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-full ${thread.color} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                    {thread.avatar}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-[#2C3E50]">{thread.user}</span>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Hash size={14} />
                        <span>{thread.channel}</span>
                      </div>
                    </div>

                    <p className="text-[#2C3E50] mb-3">{thread.content}</p>

                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1 text-[#5CC87A]">
                        <MessageSquare size={16} />
                        <span className="font-medium">{thread.replies}개 답글</span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">
                        최근 답글: {thread.lastReply}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-[#2C3E50] mb-2">
                스레드가 없습니다
              </h3>
              <p className="text-gray-600">
                메시지에 답글을 달면 여기에 표시됩니다
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
