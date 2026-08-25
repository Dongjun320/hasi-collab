// 개인 캘린더 사이드바.
// 알림(NotificationSidebar)·친구(FriendSidebar)와 동일한 슬라이드 애니메이션
// (w-64 ↔ w-0 width transition)을 써서 열림/닫힘 동작을 통일한다.
// activeRightPanel === 'calendar' 일 때 펼쳐진다.

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useUiStore } from "../store/uiStore";

export function CalendarSidebar() {
  const { t } = useTranslation();
  const { activeRightPanel, closeRightPanel } = useUiStore();
  const open = activeRightPanel === "calendar";

  const [calendarDate, setCalendarDate] = useState(new Date());
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMon = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const dayNames = t("calendar.weekdays", { returnObjects: true }) as string[];

  // TODO: 일정 API 연동 전 임시 데이터
  const upcomingEvents = [
    { id: 1, title: "디자인 리뷰 미팅", date: "2026-05-25", time: "14:00", dot: "bg-green-500" },
    { id: 2, title: "스프린트 계획", date: "2026-05-28", time: "10:00", dot: "bg-amber-500" },
    { id: 3, title: "데모 발표", date: "2026-06-02", time: "15:00", dot: "bg-orange-500" },
  ];

  return (
    <div className={`h-full overflow-hidden transition-all duration-200 ease-out flex-shrink-0 ${open ? "w-64" : "w-0"}`}>
      <div className="app-chrome w-64 h-full bg-white border-l border-[#e8f8ed] flex flex-col">
        {/* 헤더 */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-[#e8f8ed] flex-shrink-0">
          <h2 className="font-bold text-[#2C3E50] text-sm">{t("calendar.title")}</h2>
          <button
            onClick={closeRightPanel}
            className="p-1 hover:bg-[#f0f9f4] rounded-md transition-all"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* 월 네비게이션 */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#2C3E50]">{t("calendar.yearMonthNum", { y: year, m: month + 1 })}</h2>
            <div className="flex gap-0.5">
              <button
                onClick={() => setCalendarDate(new Date(year, month - 1, 1))}
                className="p-1 hover:bg-[#f0f9f4] rounded-lg transition-all"
              >
                <ChevronLeft size={14} className="text-[#5CC87A]" />
              </button>
              <button
                onClick={() => setCalendarDate(new Date(year, month + 1, 1))}
                className="p-1 hover:bg-[#f0f9f4] rounded-lg transition-all"
              >
                <ChevronRight size={14} className="text-[#5CC87A]" />
              </button>
            </div>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 mb-1">
            {dayNames.map((d, i) => (
              <div
                key={d}
                className={`text-center text-[10px] font-semibold py-1 ${
                  i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e-${i}`} />
            ))}
            {Array.from({ length: daysInMon }).map((_, i) => {
              const day = i + 1;
              const col = (firstDay + i) % 7;
              const isToday =
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();
              let colorClass = "text-[#2C3E50]";
              if (!isToday && col === 0) colorClass = "text-red-400";
              if (!isToday && col === 6) colorClass = "text-blue-400";
              return (
                <button
                  key={day}
                  className={`aspect-square flex items-center justify-center text-[11px] rounded-full transition-all ${
                    isToday ? "bg-[#5CC87A] text-white font-bold" : `hover:bg-[#f0f9f4] ${colorClass}`
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* 다가오는 일정 */}
          <div className="mt-5">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-gray-400 text-xs">⏰</span>
              <h3 className="text-xs font-bold text-[#2C3E50]">{t("calendar.upcomingEvents")}</h3>
            </div>
            <div className="space-y-2">
              {upcomingEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-start gap-2.5 p-2.5 bg-[#f8fdf9] rounded-xl border border-[#e8f8ed] hover:border-[#5CC87A] transition-colors cursor-pointer"
                >
                  <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${ev.dot}`} />
                  <div>
                    <p className="text-xs font-semibold text-[#2C3E50]">{ev.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{ev.date} · {ev.time}</p>
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
