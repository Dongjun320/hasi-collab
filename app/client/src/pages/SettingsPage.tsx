import { useState } from "react";
import { User, Bell, Lock, Camera } from "lucide-react";

export function SettingsPage() {
  const [profile, setProfile] = useState({
    name: "내 프로필",
    email: "myprofile@hasi-collab.com",
    status: "온라인",
  });

  const [notifications, setNotifications] = useState({
    messages: true,
    mentions: true,
    replies: false,
  });

  return (
    <div className="flex flex-col h-full bg-[#f8fdf9]">
      {/* 헤더 */}
      <div className="h-14 border-b border-gray-100 px-6 flex items-center bg-white">
        <h1 className="text-xl font-bold text-[#2C3E50]">설정</h1>
      </div>

      {/* 설정 콘텐츠 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* 프로필 설정 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#5CC87A] flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <h2 className="text-lg font-bold text-[#2C3E50]">프로필</h2>
            </div>

            {/* 프로필 사진 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                프로필 사진
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#A8E6B8] to-[#5CC87A] flex items-center justify-center text-white text-2xl font-bold">
                  나
                </div>
                <button className="px-4 py-2 bg-[#f0f9f4] hover:bg-[#d4f4dd] border border-[#d4f4dd] text-[#2C3E50] rounded-lg transition-all flex items-center gap-2">
                  <Camera size={16} />
                  <span>사진 변경</span>
                </button>
              </div>
            </div>

            {/* 이름 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#5CC87A] focus:ring-2 focus:ring-[#A8E6B8]/20"
              />
            </div>

            {/* 이메일 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#5CC87A] focus:ring-2 focus:ring-[#A8E6B8]/20"
              />
            </div>

            {/* 상태 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상태
              </label>
              <select
                value={profile.status}
                onChange={(e) => setProfile({ ...profile, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#5CC87A] focus:ring-2 focus:ring-[#A8E6B8]/20"
              >
                <option value="온라인">🟢 온라인</option>
                <option value="자리비움">🟡 자리 비움</option>
                <option value="오프라인">⚫ 오프라인</option>
              </select>
            </div>
          </div>

          {/* 알림 설정 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#5CC87A] flex items-center justify-center">
                <Bell size={20} className="text-white" />
              </div>
              <h2 className="text-lg font-bold text-[#2C3E50]">알림</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#2C3E50]">모든 메시지</p>
                  <p className="text-sm text-gray-600">새 메시지를 받으면 알림</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.messages}
                    onChange={(e) =>
                      setNotifications({ ...notifications, messages: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#A8E6B8]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5CC87A]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#2C3E50]">멘션</p>
                  <p className="text-sm text-gray-600">나를 언급하면 알림</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.mentions}
                    onChange={(e) =>
                      setNotifications({ ...notifications, mentions: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#A8E6B8]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5CC87A]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#2C3E50]">답글</p>
                  <p className="text-sm text-gray-600">내 메시지에 답글이 달리면 알림</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.replies}
                    onChange={(e) =>
                      setNotifications({ ...notifications, replies: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#A8E6B8]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5CC87A]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* 보안 설정 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#5CC87A] flex items-center justify-center">
                <Lock size={20} className="text-white" />
              </div>
              <h2 className="text-lg font-bold text-[#2C3E50]">보안</h2>
            </div>

            <div className="space-y-3">
              <button className="w-full text-left p-4 bg-[#f0f9f4] hover:bg-[#d4f4dd] border border-[#d4f4dd] rounded-lg transition-all">
                <p className="font-medium text-[#2C3E50]">비밀번호 변경</p>
                <p className="text-sm text-gray-600 mt-1">계정 비밀번호를 변경합니다</p>
              </button>

              <button className="w-full text-left p-4 bg-[#f0f9f4] hover:bg-[#d4f4dd] border border-[#d4f4dd] rounded-lg transition-all">
                <p className="font-medium text-[#2C3E50]">2단계 인증</p>
                <p className="text-sm text-gray-600 mt-1">추가 보안을 위한 2단계 인증 설정</p>
              </button>
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-end gap-3">
            <button className="px-6 py-2 border border-gray-200 hover:bg-gray-50 rounded-lg transition-all">
              취소
            </button>
            <button className="px-6 py-2 bg-[#5CC87A] hover:bg-[#2E8B4F] text-white rounded-lg transition-all">
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
