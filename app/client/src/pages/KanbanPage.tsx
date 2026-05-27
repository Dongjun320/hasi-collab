import { useState } from "react";
import { Plus, MoreVertical } from "lucide-react";

interface Task {
  id: string;
  title: string;
  assignee: string;
  color: string;
  priority?: "high" | "medium" | "low";
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

export function KanbanPage() {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: "todo",
      title: "할 일",
      tasks: [
        { id: "1", title: "디자인 시스템 구축", assignee: "김동준", color: "bg-green-400" },
        { id: "2", title: "API 문서 작성", assignee: "박규태", color: "bg-yellow-400", priority: "high" },
      ],
    },
    {
      id: "inprogress",
      title: "진행 중",
      tasks: [
        { id: "3", title: "로그인 페이지 개발", assignee: "정진우", color: "bg-orange-400" },
        { id: "4", title: "칸반보드 기능 구현", assignee: "김동준", color: "bg-green-400", priority: "high" },
      ],
    },
    {
      id: "review",
      title: "검토 중",
      tasks: [
        { id: "5", title: "워크스페이스 디자인", assignee: "박규태", color: "bg-yellow-400" },
      ],
    },
    {
      id: "done",
      title: "완료",
      tasks: [
        { id: "6", title: "프로젝트 초기 설정", assignee: "김동준", color: "bg-green-400" },
        { id: "7", title: "색상 팔레트 정의", assignee: "정진우", color: "bg-orange-400" },
      ],
    },
  ]);

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "border-l-4 border-red-400";
      case "medium":
        return "border-l-4 border-yellow-400";
      case "low":
        return "border-l-4 border-blue-400";
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fdf9]">
      {/* 헤더 */}
      <div className="h-14 border-b border-gray-100 px-6 flex items-center justify-between bg-white">
        <h1 className="text-xl font-bold text-[#2C3E50]">칸반보드</h1>
        <button className="px-4 py-2 bg-[#5CC87A] hover:bg-[#2E8B4F] text-white rounded-lg transition-all flex items-center gap-2">
          <Plus size={18} />
          <span>새 작업</span>
        </button>
      </div>

      {/* 칸반보드 */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-6 h-full min-w-max">
          {columns.map((column) => (
            <div key={column.id} className="w-80 flex flex-col">
              {/* 컬럼 헤더 */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-[#2C3E50]">{column.title}</h2>
                  <span className="px-2 py-0.5 bg-[#f0f9f4] text-[#5CC87A] text-xs font-medium rounded-full">
                    {column.tasks.length}
                  </span>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical size={16} className="text-gray-400" />
                </button>
              </div>

              {/* 작업 카드 */}
              <div className="flex-1 space-y-3 overflow-y-auto">
                {column.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all cursor-move ${getPriorityColor(task.priority)}`}
                  >
                    <h3 className="font-medium text-[#2C3E50] mb-3">{task.title}</h3>
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full ${task.color} flex items-center justify-center text-white text-xs font-bold`}>
                        {task.assignee.charAt(0)}
                      </div>
                      <span className="text-sm text-gray-600">{task.assignee}</span>
                    </div>
                  </div>
                ))}

                {/* 작업 추가 버튼 */}
                <button className="w-full p-3 border-2 border-dashed border-gray-200 hover:border-[#5CC87A] hover:bg-[#f0f9f4] rounded-lg transition-all text-gray-400 hover:text-[#5CC87A] flex items-center justify-center gap-2">
                  <Plus size={16} />
                  <span className="text-sm">작업 추가</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
