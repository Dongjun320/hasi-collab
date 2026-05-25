import React from 'react'
import { Outlet, Link, useLocation } from "react-router";
import { Hash, MessageSquare, Settings, Calendar, LayoutGrid, ChevronLeft, ChevronRight, Grid3x3, User, Phone, Mail, Plus } from "lucide-react";
import { useState } from "react";
import logoImage from "../../imports/KakaoTalk_20260501_180120253.png";

export function WorkspaceLayout() {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/workspace" && location.pathname === "/workspace") return true;
    if (path !== "/workspace" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const channels = [
    { id: "general", name: "일반" },
    { id: "dev", name: "개발팀" },
    { id: "design", name: "디자인" },
  ];


  return (
    <>
      <style>{`
      @keyframes fade-in {
      from { opacity: 0; }
      to {opacity: 1; }
      }
      .animate-fade-in {
        animation: fade-in 0.3s ease-in-out forwards;
      }
    `}</style>
    <div className="flex h-screen bg-[#f8fdf9] animate-fade-in">
      {/* 사이드바 */}
      <div className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-[#f0f9f4] border-r border-[#d4f4dd] flex flex-col transition-all duration-300`}>
        {/* 워크스페이스 헤더 */}
        <div className="p-4 border-b border-[#d4f4dd]">
          <div className="flex items-center justify-between gap-2">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <img src={logoImage} alt="Logo" className="w-full h-full object-cover" />
              </div>
              {!isSidebarCollapsed && (
                <h1 className="font-bold text-[#2C3E50]">hasi-collab</h1>
              )}
            </Link>

            {!isSidebarCollapsed && (
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="p-1 hover:bg-[#d4f4dd] rounded transition-all"
              >
                <ChevronLeft size={18} className="text-[#5CC87A]" />
              </button>
            )}
          </div>

          {isSidebarCollapsed && (
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              className="w-full mt-2 p-1 hover:bg-[#d4f4dd] rounded transition-all flex justify-center"
            >
              <ChevronRight size={18} className="text-[#5CC87A]" />
            </button>
          )}
        </div>

        {/* 네비게이션 */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* 채널 섹션 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2 px-2">
              {!isSidebarCollapsed && (
                <h3 className="text-xs font-semibold text-[#5CC87A]">채널</h3>
              )}
              <button
                className={`hover:bg-[#d4f4dd] rounded p-1 transition-all ${isSidebarCollapsed ? 'w-full flex justify-center' : ''}`}
                title="채널 추가"
              >
                <Plus size={14} className="text-[#5CC87A]" />
              </button>
            </div>
            <div className="space-y-1">
              {channels.map((channel) => (
                <Link
                  key={channel.id}
                  to={`/workspace/channels/${channel.id}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    isActive(`/workspace/channels/${channel.id}`)
                      ? "bg-[#A8E6B8]/30 text-[#2C3E50] font-medium"
                      : "text-[#5CC87A] hover:bg-[#d4f4dd]"
                  } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                  title={isSidebarCollapsed ? channel.name : ''}
                >
                  <Hash size={16} />
                  {!isSidebarCollapsed && <span className="text-sm">{channel.name}</span>}
                </Link>
              ))}
            </div>
          </div>

          {/* 기능 메뉴 */}
          <div className="mb-6">
            {!isSidebarCollapsed && (
              <h3 className="text-xs font-semibold text-[#5CC87A] mb-2 px-2">도구</h3>
            )}
            <div className="space-y-1">
              <Link
                to="/workspace/kanban"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  isActive("/workspace/kanban")
                    ? "bg-[#A8E6B8]/30 text-[#2C3E50] font-medium"
                    : "text-[#5CC87A] hover:bg-[#d4f4dd]"
                } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                title={isSidebarCollapsed ? '칸반보드' : ''}
              >
                <LayoutGrid size={16} />
                {!isSidebarCollapsed && <span className="text-sm">칸반보드</span>}
              </Link>
              <Link
                to="/workspace/calendar"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  isActive("/workspace/calendar")
                    ? "bg-[#A8E6B8]/30 text-[#2C3E50] font-medium"
                    : "text-[#5CC87A] hover:bg-[#d4f4dd]"
                } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                title={isSidebarCollapsed ? '캘린더' : ''}
              >
                <Calendar size={16} />
                {!isSidebarCollapsed && <span className="text-sm">캘린더</span>}
              </Link>
              <Link
                to="/workspace/threads"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  isActive("/workspace/threads")
                    ? "bg-[#A8E6B8]/30 text-[#2C3E50] font-medium"
                    : "text-[#5CC87A] hover:bg-[#d4f4dd]"
                } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                title={isSidebarCollapsed ? '스레드' : ''}
              >
                <MessageSquare size={16} />
                {!isSidebarCollapsed && <span className="text-sm">스레드</span>}
              </Link>
            </div>
          </div>
        </div>

        {/* 하단 사용자 정보 */}
        <div className="p-3 border-t border-[#d4f4dd]">
          <div className={`flex items-center gap-2 ${isSidebarCollapsed ? 'justify-center flex-col' : ''}`}>
            <Link
              to="/workspace/settings"
              className={`flex items-center gap-3 p-2 rounded-lg hover:bg-[#d4f4dd] transition-all ${isSidebarCollapsed ? 'w-full justify-center' : 'flex-1'}`}
              title={isSidebarCollapsed ? '내 프로필' : ''}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A8E6B8] to-[#5CC87A] flex items-center justify-center text-white text-sm font-bold">
                나
              </div>
              {!isSidebarCollapsed && (
                <>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[#2C3E50]">내 프로필</div>
                    <div className="text-xs text-[#5CC87A]">설정</div>
                  </div>
                  <Settings size={16} className="text-[#5CC87A]" />
                </>
              )}
            </Link>

            {/* 퀵 메뉴 버튼 */}
            <button
              onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
              className={`p-2 rounded-lg hover:bg-[#d4f4dd] transition-all relative ${isSidebarCollapsed ? 'w-full' : ''}`}
              title="빠른 메뉴"
            >
              <Grid3x3 size={18} className="text-[#5CC87A]" />
            </button>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col bg-white relative">
        <Outlet />

        {/* 퀵 메뉴 - 왼쪽 하단에 표시 */}
        {isQuickMenuOpen && (
          <div className={`fixed ${isSidebarCollapsed ? 'left-20' : 'left-72'} bottom-20 bg-white rounded-2xl shadow-2xl border border-[#d4f4dd] p-4 z-40 transition-all`}>
            <div className="flex items-center gap-3">
              {/* 메뉴 아이템들 */}
              {[
                { icon: MessageSquare, label: '메시지', to: '/workspace/channels/general' },
                { icon: Calendar, label: '달력', to: '/workspace/calendar' },
                { icon: User, label: '내정보', to: '/workspace/profile' },
                { icon: Phone, label: '전화', to: '#' },
                { icon: Mail, label: '메일', to: '#' },
              ].map((item, idx) => (
                <Link
                  key={idx}
                  to={item.to}
                  className="flex flex-col items-center gap-2 p-3 hover:bg-[#f0f9f4] rounded-xl transition-all group"
                  onClick={() => item.to !== '#' && setIsQuickMenuOpen(false)}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-[#A8E6B8] to-[#5CC87A] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <item.icon size={24} className="text-white" />
                  </div>
                  <span className="text-xs text-[#2C3E50] font-medium">{item.label}</span>
                </Link>
              ))}

              {/* 구분선 */}
              <div className="w-px h-16 bg-[#d4f4dd]" />

              {/* 편집 버튼 */}
              <button
                className="flex flex-col items-center gap-2 p-3 hover:bg-[#f0f9f4] rounded-xl transition-all group"
                title="메뉴 편집"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#d4f4dd] to-[#A8E6B8] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform border-2 border-dashed border-[#5CC87A]">
                  <Plus size={24} className="text-[#5CC87A]" />
                </div>
                <span className="text-xs text-[#2C3E50] font-medium">편집</span>
              </button>
            </div>
          </div>
        )}

        {/* 백드롭 */}
        {isQuickMenuOpen && (
          <div
            onClick={() => setIsQuickMenuOpen(false)}
            className="fixed inset-0 bg-black/20 z-30"
          />
        )}
      </div>
    </div>
    </>
  );
}
