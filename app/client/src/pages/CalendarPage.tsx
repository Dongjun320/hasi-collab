import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  attendees: string[];
  color: string;
}

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)); // May 2026

  const events: Event[] = [
    {
      id: "1",
      title: "디자인 리뷰 미팅",
      date: "2026-05-15",
      time: "14:00",
      attendees: ["김동준", "박규태"],
      color: "bg-green-400",
    },
    {
      id: "2",
      title: "스프린트 계획",
      date: "2026-05-20",
      time: "10:00",
      attendees: ["김동준", "박규태", "정진우"],
      color: "bg-yellow-400",
    },
    {
      id: "3",
      title: "데모 발표",
      date: "2026-05-25",
      time: "15:00",
      attendees: ["정진우"],
      color: "bg-orange-400",
    },
  ];

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="flex h-full bg-[#f8fdf9]">
      {/* 캘린더 */}
      <div className="flex-1 flex flex-col">
        {/* 헤더 */}
        <div className="h-14 border-b border-gray-100 px-6 flex items-center justify-between bg-white">
          <h1 className="text-xl font-bold text-[#2C3E50]">캘린더</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronLeft size={18} />
              </button>
              <span className="font-medium text-[#2C3E50] min-w-[120px] text-center">
                {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
              </span>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronRight size={18} />
              </button>
            </div>
            <button className="px-4 py-2 bg-[#5CC87A] hover:bg-[#2E8B4F] text-white rounded-lg transition-all flex items-center gap-2">
              <Plus size={18} />
              <span>새 일정</span>
            </button>
          </div>
        </div>

        {/* 달력 그리드 */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full flex flex-col">
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 border-b border-gray-200">
              {dayNames.map((day, idx) => (
                <div
                  key={idx}
                  className={`p-3 text-center font-medium text-sm ${
                    idx === 0 ? "text-red-500" : idx === 6 ? "text-blue-500" : "text-gray-600"
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 flex-1">
              {days.map((day, idx) => {
                const dayEvents = day ? getEventsForDay(day) : [];
                return (
                  <div
                    key={idx}
                    className={`border-r border-b border-gray-100 p-2 ${
                      day ? "hover:bg-[#f0f9f4] cursor-pointer" : "bg-gray-50"
                    }`}
                  >
                    {day && (
                      <>
                        <div className={`text-sm mb-1 ${
                          idx % 7 === 0 ? "text-red-500" : idx % 7 === 6 ? "text-blue-500" : "text-gray-700"
                        }`}>
                          {day}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.map(event => (
                            <div
                              key={event.id}
                              className={`text-xs p-1 rounded ${event.color} text-white truncate`}
                            >
                              {event.time} {event.title}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 오른쪽 사이드바 - 다가오는 일정 */}
      <div className="w-80 border-l border-gray-200 bg-white p-6 overflow-y-auto">
        <h2 className="font-bold text-[#2C3E50] mb-4 flex items-center gap-2">
          <Clock size={18} className="text-[#5CC87A]" />
          다가오는 일정
        </h2>
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="p-4 bg-[#f0f9f4] rounded-lg border border-[#d4f4dd]">
              <h3 className="font-medium text-[#2C3E50] mb-2">{event.title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Clock size={14} />
                <span>{event.date} {event.time}</span>
              </div>
              <div className="flex items-center gap-1">
                {event.attendees.map((attendee, idx) => (
                  <div
                    key={idx}
                    className={`w-6 h-6 rounded-full ${event.color} flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {attendee.charAt(0)}
                  </div>
                ))}
                <span className="text-xs text-gray-500 ml-2">
                  {event.attendees.length}명 참석
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
