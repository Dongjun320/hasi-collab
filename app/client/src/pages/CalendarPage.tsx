import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useWorkspaceStore } from "../store/workspaceStore";
import { api } from "../api/client";
import type { Board, Task } from "../store/boardStore";

// 보드별 고정 색상 (보드 id % 팔레트 길이)
const BOARD_COLORS = [
  "bg-green-400", "bg-yellow-400", "bg-orange-400", "bg-purple-400",
  "bg-pink-400", "bg-indigo-400", "bg-teal-400", "bg-red-400",
];
const colorOf = (boardId: number) => BOARD_COLORS[boardId % BOARD_COLORS.length];

interface DueTask extends Task {
  boardName: string;
}

// 시작일/종료일 중 하나만 있어도 그 날 하루짜리 일정으로 취급
const rangeOf = (t: Task) => ({
  start: t.startDate ?? t.dueDate!,
  end: t.dueDate ?? t.startDate!,
});
const isInRange = (dateStr: string, t: Task) => {
  const { start, end } = rangeOf(t);
  return dateStr >= start && dateStr <= end;
};

export function CalendarPage() {
  const { t } = useTranslation();
  const { currentWorkspace } = useWorkspaceStore();
  const [currentDate, setCurrentDate] = useState(new Date());   // 오늘 기준으로 시작
  const [boards, setBoards] = useState<Board[]>([]);
  const [dueTasks, setDueTasks] = useState<DueTask[]>([]);
  const [loading, setLoading] = useState(false);

  // 접근 가능한 보드 전체 + 각 보드의 태스크(마감일 있는 것만) 모아서 캘린더에 표시
  useEffect(() => {
    if (!currentWorkspace) return;
    const workspaceId = currentWorkspace.id;
    setLoading(true);
    (async () => {
      try {
        const { data, error } = await api.GET('/api/workspaces/{workspaceId}/boards', {
          params: { path: { workspaceId } },
        });
        if (error || !data?.success) return;
        const boardList = (data.data ?? []) as Board[];
        setBoards(boardList);

        const perBoard = await Promise.all(
          boardList.map((b) =>
            api.GET('/api/workspaces/{workspaceId}/boards/{boardId}/tasks', {
              params: { path: { workspaceId, boardId: b.id } },
            }).then((r) => ((r.data?.success ? r.data.data : []) ?? []).map((t: any) => ({ ...t, boardName: b.name })))
          )
        );
        setDueTasks(perBoard.flat().filter((t) => t.startDate || t.dueDate) as DueTask[]);
      } catch (e) {
        console.error('캘린더 일정 조회 실패:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [currentWorkspace?.id]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthNames = t("calendar.months", { returnObjects: true }) as string[];
  const dayNames = t("calendar.weekdays", { returnObjects: true }) as string[];

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const dateStrOf = (day: number) =>
    `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getTasksForDay = (day: number) => dueTasks.filter((t) => isInRange(dateStrOf(day), t));

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const todayStr = useMemo(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  }, []);

  const upcoming = [...dueTasks]
    .filter((t) => rangeOf(t).end >= todayStr)
    .sort((a, b) => rangeOf(a).end.localeCompare(rangeOf(b).end))
    .slice(0, 10);

  if (!currentWorkspace) {
    return <div className="flex items-center justify-center h-full text-gray-400 text-sm">{t("ui.selectWorkspaceFirst")}</div>;
  }

  return (
    <div className="flex h-full bg-[#f8fdf9]">
      {/* 캘린더 */}
      <div className="flex-1 flex flex-col">
        {/* 헤더 */}
        <div className="h-14 border-b border-gray-100 px-6 flex items-center justify-between bg-white flex-shrink-0">
          <h1 className="text-xl font-bold text-[#2C3E50]">{t("calendar.title")}</h1>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft size={18} />
            </button>
            <span className="font-medium text-[#2C3E50] min-w-[120px] text-center">
              {t("calendar.yearMonth", { y: currentDate.getFullYear(), m: monthNames[currentDate.getMonth()] })}
            </span>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronRight size={18} />
            </button>
            <button
              onClick={goToday}
              className="ml-2 px-3 py-1.5 text-xs font-medium text-[#5CC87A] border border-[#5CC87A] rounded-lg hover:bg-[#f0f9f4] transition-colors"
            >
              {t("calendar.today")}
            </button>
          </div>
        </div>

        {/* 보드 색상 범례 */}
        {boards.length > 0 && (
          <div className="px-6 py-2 flex flex-wrap gap-3 bg-white border-b border-gray-100 flex-shrink-0">
            {boards.map((b) => (
              <div key={b.id} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className={`w-2.5 h-2.5 rounded-full ${colorOf(b.id)}`} />
                {b.name}
              </div>
            ))}
          </div>
        )}

        {/* 달력 그리드 */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-7 border-b border-gray-200">
              {dayNames.map((day, idx) => (
                <div
                  key={idx}
                  className={`p-3 text-center font-medium text-sm ${idx === 0 ? "text-red-500" : idx === 6 ? "text-blue-500" : "text-gray-600"}`}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {days.map((day, idx) => {
                const dayTasks = day ? getTasksForDay(day) : [];
                const isToday = day && dateStrOf(day) === todayStr;
                return (
                  <div
                    key={idx}
                    className={`min-h-[92px] border-r border-b border-gray-100 p-2 ${day ? "hover:bg-[#f0f9f4]" : "bg-gray-50"}`}
                  >
                    {day && (
                      <>
                        <div className={`text-sm mb-1 inline-flex items-center justify-center ${
                          isToday ? "w-6 h-6 rounded-full bg-[#5CC87A] text-white font-bold"
                            : idx % 7 === 0 ? "text-red-500" : idx % 7 === 6 ? "text-blue-500" : "text-gray-700"
                        }`}>
                          {day}
                        </div>
                        <div className="space-y-1">
                          {dayTasks.slice(0, 3).map((t) => (
                            <div key={t.id} className={`text-[11px] px-1.5 py-0.5 rounded ${colorOf(t.boardId)} text-white truncate`} title={t.title}>
                              {t.title}
                            </div>
                          ))}
                          {dayTasks.length > 3 && (
                            <div className="text-[10px] text-gray-400 px-1">{t("calendar.moreCount", { count: dayTasks.length - 3 })}</div>
                          )}
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

      {/* 오른쪽 사이드바 - 다가오는 마감일 */}
      <div className="w-80 border-l border-gray-200 bg-white p-6 overflow-y-auto">
        <h2 className="font-bold text-[#2C3E50] mb-4 flex items-center gap-2">
          <Clock size={18} className="text-[#5CC87A]" />
          {t("calendar.upcomingDeadlines")}
        </h2>
        {loading && <p className="text-xs text-gray-400">{t("ui.loading")}</p>}
        {!loading && upcoming.length === 0 && (
          <p className="text-xs text-gray-400">{t("calendar.noDeadlines")}</p>
        )}
        <div className="space-y-3">
          {upcoming.map((t) => (
            <div key={t.id} className="p-4 bg-[#f8fdf9] rounded-lg border border-gray-100">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={`w-2 h-2 rounded-full ${colorOf(t.boardId)}`} />
                <span className="text-[11px] text-gray-400">{t.boardName}</span>
              </div>
              <h3 className="font-medium text-[#2C3E50] mb-1">{t.title}</h3>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock size={12} />
                <span>{t.startDate && t.dueDate && t.startDate !== t.dueDate ? `${t.startDate} ~ ${t.dueDate}` : rangeOf(t).end}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
