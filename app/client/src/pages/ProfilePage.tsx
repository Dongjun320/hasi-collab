import { User, Mail, Calendar, MessageSquare } from "lucide-react";

export function ProfilePage() {
  const profile = {
    name: "내 프로필",
    email: "myprofile@hasi-collab.com",
    joinDate: "2023년 4월",
    status: "온라인",
  };

  const stats = [
    { label: "보낸 메시지", value: "342", icon: MessageSquare },
    { label: "참여 채널", value: "3", icon: Hash },
    { label: "활동 일수", value: "89", icon: Calendar },
  ];

  const activities = [
    { text: "#일반 채널에 메시지 작성", time: "5분 전", color: "bg-green-400" },
    { text: "김동준님과 대화 시작", time: "1시간 전", color: "bg-yellow-400" },
    { text: "프로필 정보 업데이트", time: "어제", color: "bg-orange-400" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f8fdf9]">
      {/* 헤더 */}
      <div className="h-14 border-b border-gray-100 px-6 flex items-center bg-white">
        <h1 className="text-xl font-bold text-[#2C3E50]">프로필</h1>
      </div>

      {/* 프로필 콘텐츠 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* 프로필 카드 */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-[#A8E6B8] to-[#5CC87A]"></div>

            <div className="px-8 pb-8">
              <div className="flex items-start gap-6 -mt-16 mb-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#A8E6B8] to-[#5CC87A] flex items-center justify-center text-white text-5xl font-bold border-4 border-white">
                  나
                </div>
                <div className="mt-16 flex-1">
                  <h1 className="text-2xl font-bold text-[#2C3E50] mb-2">{profile.name}</h1>
                  <p className="text-gray-600 mb-3">{profile.email}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#f0f9f4] text-[#5CC87A] rounded-full text-sm font-medium">
                    🟢 {profile.status}
                  </div>
                </div>
              </div>

              {/* 통계 */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {stats.map((stat, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-[#f0f9f4] rounded-lg border border-[#d4f4dd] text-center"
                  >
                    <div className="text-2xl font-bold text-[#2C3E50] mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* 정보 */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-[#f8fdf9] rounded-lg">
                  <Mail size={20} className="text-[#5CC87A]" />
                  <div>
                    <p className="text-xs text-gray-500">이메일</p>
                    <p className="font-medium text-[#2C3E50]">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-[#f8fdf9] rounded-lg">
                  <Calendar size={20} className="text-[#5CC87A]" />
                  <div>
                    <p className="text-xs text-gray-500">가입일</p>
                    <p className="font-medium text-[#2C3E50]">{profile.joinDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 최근 활동 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-bold text-[#2C3E50] mb-4">최근 활동</h3>
            <div className="space-y-3">
              {activities.map((activity, idx) => (
                <div key={idx} className="flex gap-3 p-3 bg-[#f8fdf9] rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${activity.color} mt-2 flex-shrink-0`}></div>
                  <div className="flex-1">
                    <p className="text-[#2C3E50] font-medium">{activity.text}</p>
                    <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hash({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  );
}
