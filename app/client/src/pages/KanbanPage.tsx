import { useEffect, useState } from "react";
import { Plus, ChevronDown, Calendar as CalendarIcon, X } from "lucide-react";
import { useWorkspaceStore } from "../store/workspaceStore";
import { useAuthStore } from "../store/authStore";
import { useMemberStore } from "../store/memberStore";
import { useBoardStore, boardBadgeOf, type Task, type TaskStatus, type TaskPriority } from "../store/boardStore";
import Modal from "../components/Modal";

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: "TODO", title: "할 일" },
  { id: "IN_PROGRESS", title: "진행 중" },
  { id: "REVIEW", title: "검토 중" },
  { id: "DONE", title: "완료" },
];

const PRIORITY_STYLE: Record<TaskPriority, string> = {
  HIGH: "border-l-4 border-red-400",
  MEDIUM: "border-l-4 border-yellow-400",
  LOW: "border-l-4 border-blue-400",
};

const AVATAR_COLORS = [
  "bg-green-400", "bg-purple-400", "bg-yellow-400", "bg-pink-400",
  "bg-indigo-400", "bg-orange-400", "bg-red-400", "bg-teal-400",
];
const colorOf = (uid: number) => AVATAR_COLORS[uid % AVATAR_COLORS.length];

export function KanbanPage() {
  const { currentWorkspace } = useWorkspaceStore();
  const myUid = useAuthStore((s) => s.user?.uid);
  const { members, fetchMembers } = useMemberStore();
  const {
    boards, currentBoardId, tasks, boardMembers, error,
    setCurrentBoard, fetchBoards, fetchTasks, fetchBoardMembers,
    createTask, updateTask, deleteTask,
  } = useBoardStore();

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);   // null=닫힘, {id:0,...}=신규
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const currentBoard = boards.find((b) => b.id === currentBoardId) ?? null;
  const myRole = members.find((m) => m.userId === myUid)?.role;
  const isManager = !!currentBoard && (myRole === "OWNER" || currentBoard.ownerId === myUid);

  useEffect(() => {
    if (!currentWorkspace) return;
    fetchBoards(currentWorkspace.id);
    fetchMembers(currentWorkspace.id);
  }, [currentWorkspace?.id]);

  useEffect(() => {
    if (!currentWorkspace || !currentBoardId) return;
    fetchTasks(currentWorkspace.id, currentBoardId);
    fetchBoardMembers(currentWorkspace.id, currentBoardId);
  }, [currentWorkspace?.id, currentBoardId]);

  const nicknameOf = (uid?: number) =>
      boardMembers.find((m) => m.userId === uid)?.nickname
      ?? members.find((m) => m.userId === uid)?.nickname
      ?? "";

  const canEditTask = (task: Task) => isManager || task.assigneeId === myUid;

  const handleStatusChange = (task: Task, status: TaskStatus) => {
    if (!currentWorkspace || !currentBoardId) return;
    updateTask(currentWorkspace.id, currentBoardId, task.id, { status });
  };

  const handleDelete = (taskId: number) => {
    if (!currentWorkspace || !currentBoardId) return;
    deleteTask(currentWorkspace.id, currentBoardId, taskId);
  };

  if (!currentWorkspace) {
    return <div className="flex items-center justify-center h-full text-gray-400 text-sm">워크스페이스를 먼저 선택해주세요</div>;
  }

  return (
    <div className="flex flex-col h-full bg-[#f8fdf9]">
      {/* 헤더 */}
      <div className="h-14 border-b border-gray-100 px-6 flex items-center justify-between bg-white flex-shrink-0">
        <div className="relative">
          <button
            onClick={() => setIsPickerOpen((v) => !v)}
            className="flex items-center gap-2 text-xl font-bold text-[#2C3E50] hover:text-[#5CC87A] transition-colors"
          >
            {currentBoard?.name ?? (boards.length === 0 ? "보드 없음" : "보드 선택")}
            <ChevronDown size={18} className={`transition-transform ${isPickerOpen ? "rotate-180" : ""}`} />
          </button>
          {currentBoard && (
            <span className="ml-2 text-xs text-gray-400">
              {myRole === "OWNER" ? `전체 ${boards.length}개 보드 조회 중` : `소속: ${currentBoard.name}`}
            </span>
          )}

          {isPickerOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsPickerOpen(false)} />
              <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                {boards.length === 0 && (
                  <p className="px-4 py-3 text-xs text-gray-400">접근 가능한 보드가 없습니다</p>
                )}
                {boards.map((b) => {
                  const badge = boardBadgeOf(b, myUid, myRole);
                  return (
                    <button
                      key={b.id}
                      onClick={() => { setCurrentBoard(b.id); setIsPickerOpen(false); }}
                      className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-[#f0f9f4] transition-colors ${b.id === currentBoardId ? "text-[#5CC87A] font-semibold" : "text-[#2C3E50]"}`}
                    >
                      <span className="truncate">{b.name}</span>
                      {badge && (
                        <span className="flex-shrink-0 ml-2 px-1.5 py-0.5 rounded-full bg-[#f0f9f4] text-[#5CC87A] text-[10px] font-medium">
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {currentBoard && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 bg-[#5CC87A] hover:bg-[#2E8B4F] text-white rounded-lg transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            <span>새 작업</span>
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-500 text-center mt-2">{error}</p>}

      {/* 칸반보드 */}
      {currentBoard ? (
        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex gap-6 h-full min-w-max">
            {COLUMNS.map((column) => {
              const columnTasks = tasks.filter((t) => t.status === column.id);
              return (
                <div key={column.id} className="w-80 flex flex-col">
                  <div className="mb-4 flex items-center gap-2">
                    <h2 className="font-bold text-[#2C3E50]">{column.title}</h2>
                    <span className="px-2 py-0.5 bg-[#f0f9f4] text-[#5CC87A] text-xs font-medium rounded-full">
                      {columnTasks.length}
                    </span>
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto">
                    {columnTasks.map((task) => {
                      const editable = canEditTask(task);
                      return (
                        <div
                          key={task.id}
                          className={`bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all ${task.priority ? PRIORITY_STYLE[task.priority] : ""}`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3
                              className={`font-medium text-[#2C3E50] ${isManager ? "cursor-pointer hover:text-[#5CC87A]" : ""}`}
                              onClick={() => isManager && setEditing(task)}
                            >
                              {task.title}
                            </h3>
                            {isManager && (
                              <button onClick={() => handleDelete(task.id)} className="text-gray-300 hover:text-red-400 flex-shrink-0">
                                <X size={14} />
                              </button>
                            )}
                          </div>

                          {task.content && (
                            <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.content}</p>
                          )}

                          {(task.startDate || task.dueDate) && (
                            <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                              <CalendarIcon size={12} />
                              <span>
                                {task.startDate && task.dueDate
                                  ? `${task.startDate} ~ ${task.dueDate}`
                                  : task.startDate ?? task.dueDate}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {task.assigneeId && (
                                <>
                                  <div className={`w-6 h-6 rounded-full ${colorOf(task.assigneeId)} flex items-center justify-center text-white text-xs font-bold`}>
                                    {nicknameOf(task.assigneeId).charAt(0)}
                                  </div>
                                  <span className="text-xs text-gray-600">{nicknameOf(task.assigneeId)}</span>
                                </>
                              )}
                            </div>

                            {editable ? (
                              <select
                                value={task.status}
                                onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                                className="text-xs border border-gray-200 rounded-md px-1.5 py-0.5 text-gray-600 focus:outline-none focus:border-[#5CC87A]"
                              >
                                {COLUMNS.map((c) => (
                                  <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                              </select>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}

                    <button
                      onClick={() => setIsCreateOpen(true)}
                      className="w-full p-3 border-2 border-dashed border-gray-200 hover:border-[#5CC87A] hover:bg-[#f0f9f4] rounded-lg transition-all text-gray-400 hover:text-[#5CC87A] flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      <span className="text-sm">작업 추가</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          {boards.length === 0 ? "접근 가능한 보드가 없습니다" : "보드를 선택해주세요"}
        </div>
      )}

      <TaskFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        boardMembers={boardMembers}
        lockAssigneeTo={isManager ? undefined : myUid}
        onSubmit={async (body) => {
          if (!currentWorkspace || !currentBoardId) return;
          const ok = await createTask(currentWorkspace.id, currentBoardId, { status: "TODO", ...body });
          if (ok) setIsCreateOpen(false);
        }}
      />

      <TaskFormModal
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        initial={editing ?? undefined}
        boardMembers={boardMembers}
        onSubmit={async (body) => {
          if (!currentWorkspace || !currentBoardId || !editing) return;
          const ok = await updateTask(currentWorkspace.id, currentBoardId, editing.id, body);
          if (ok) setEditing(null);
        }}
      />
    </div>
  );
}

// 생성/수정 겸용 모달
// lockAssigneeTo: 매니저가 아닌 부서원이 생성할 때 — 담당자를 본인으로 고정, 선택 UI 자체를 숨김
function TaskFormModal({
  isOpen, onClose, initial, boardMembers, lockAssigneeTo, onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  initial?: Task;
  boardMembers: { userId: number; nickname: string }[];
  lockAssigneeTo?: number;
  onSubmit: (body: { title: string; content?: string; startDate?: string; dueDate?: string; assigneeId?: number; priority?: TaskPriority }) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [startDate, setStartDate] = useState(initial?.startDate ?? "");
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? "");
  const [assigneeId, setAssigneeId] = useState<number | "">(initial?.assigneeId ?? lockAssigneeTo ?? "");
  const [priority, setPriority] = useState<TaskPriority | "">(initial?.priority ?? "");

  useEffect(() => {
    if (!isOpen) return;
    setTitle(initial?.title ?? "");
    setContent(initial?.content ?? "");
    setStartDate(initial?.startDate ?? "");
    setDueDate(initial?.dueDate ?? "");
    setAssigneeId(initial?.assigneeId ?? lockAssigneeTo ?? "");
    setPriority(initial?.priority ?? "");
  }, [isOpen, initial, lockAssigneeTo]);

  // 종료일이 시작일보다 빠르면 안 되니 자동 보정
  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    if (dueDate && value && dueDate < value) setDueDate(value);
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      content: content.trim() || undefined,
      startDate: startDate || undefined,
      dueDate: dueDate || undefined,
      assigneeId: assigneeId === "" ? undefined : assigneeId,
      priority: priority === "" ? undefined : priority,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? "작업 수정" : "새 작업"}>
      <div className="flex flex-col gap-3">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="작업 제목"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5CC87A]"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="상세 내용 (선택)"
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-[#5CC87A]"
        />
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5CC87A]"
          />
          <span className="text-gray-400 text-sm flex-shrink-0">~</span>
          <input
            type="date"
            value={dueDate}
            min={startDate || undefined}
            onChange={(e) => setDueDate(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5CC87A]"
          />
        </div>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority | "")}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5CC87A]"
        >
          <option value="">우선순위 없음</option>
          <option value="HIGH">높음</option>
          <option value="MEDIUM">보통</option>
          <option value="LOW">낮음</option>
        </select>
        {lockAssigneeTo == null ? (
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value ? Number(e.target.value) : "")}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5CC87A]"
          >
            <option value="">담당자 없음</option>
            {boardMembers.map((m) => (
              <option key={m.userId} value={m.userId}>{m.nickname}</option>
            ))}
          </select>
        ) : (
          <p className="text-xs text-gray-400">담당자: 본인 (내 작업으로 등록됩니다)</p>
        )}

        <div className="flex gap-2 justify-end mt-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
            취소
          </button>
          <button onClick={handleSubmit} className="px-3 py-1.5 text-sm bg-[#5CC87A] text-white rounded-lg hover:bg-[#4ab869] transition-colors">
            {initial ? "저장" : "생성"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
