import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { api, getAuthConfig } from "../lib/api";

interface Task {
  id: number;
  title: string;
  description: string;
  status: string | null;
  priority: string | null;
  progress: number | null;
  dueDate: string | null;
  projectId: number;
  assigneeId: number | null;
  assigneeName: string | null;
  assigneeEmail: string | null;
}

interface ProjectInfo {
  name: string;
  role: string;
}

interface ColumnData {
  name: string;
  items: Task[];
}

interface BoardData {
  [key: string]: ColumnData;
}

interface CommentItem {
  id: number;
  content: string;
  createdAt: string;
  userName: string;
  userEmail: string;
}

const initialBoard: BoardData = {
  TODO: { name: "Can lam", items: [] },
  IN_PROGRESS: { name: "Dang lam", items: [] },
  DONE: { name: "Da xong", items: [] },
};

export default function MyTasks() {
  const [columns, setColumns] = useState<BoardData>(initialBoard);
  const [isLoading, setIsLoading] = useState(true);
  const [projectsMap, setProjectsMap] = useState<Record<number, ProjectInfo>>({});
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentText, setCommentText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("TODO");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchData = async () => {
    try {
      const config = getAuthConfig();
      const projectsRes = await api.get("/api/project/my", config);
      const projects = projectsRes.data;

      const projMap: Record<number, ProjectInfo> = {};
      projects.forEach((project: any) => {
        projMap[project.id] = { name: project.name, role: project.role };
      });
      setProjectsMap(projMap);

      const taskResponses = await Promise.all(
        projects.map((project: any) => api.get(`/api/project/${project.id}/tasks/my`, config)),
      );
      const fetchedTasks: Task[] = taskResponses.flatMap((response) => response.data);

      const newBoard: BoardData = {
        TODO: { name: "Can lam", items: [] },
        IN_PROGRESS: { name: "Dang lam", items: [] },
        DONE: { name: "Da xong", items: [] },
      };

      fetchedTasks.forEach((task) => {
        const taskStatus = task.status || "TODO";
        if (newBoard[taskStatus]) {
          newBoard[taskStatus].items.push(task);
        }
      });

      setColumns(newBoard);
    } catch (error) {
      console.error("Loi tai du lieu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchComments = async (task: Task) => {
    try {
      const res = await api.get(
        `/api/project/${task.projectId}/tasks/${task.id}/comments`,
        getAuthConfig(),
      );
      setComments(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const updateTaskStatus = async (task: Task, status: string) => {
    await api.patch(
      `/api/project/${task.projectId}/tasks/${task.id}/status`,
      { status },
      getAuthConfig(),
    );
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const sourceItems = [...sourceColumn.items];
    const destItems = [...destColumn.items];
    const [removed] = sourceItems.splice(source.index, 1);

    if (source.droppableId !== destination.droppableId) {
      removed.status = destination.droppableId;
      destItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: { ...sourceColumn, items: sourceItems },
        [destination.droppableId]: { ...destColumn, items: destItems },
      });

      try {
        await updateTaskStatus(removed, destination.droppableId);
      } catch (error: any) {
        alert(error.response?.data?.error || "Khong the cap nhat trang thai");
        fetchData();
      }
    }
  };

  const handleOpenDetailModal = (task: Task) => {
    setEditingTask(task);
    setSelectedStatus(task.status || "TODO");
    setCommentText("");
    setIsDetailOpen(true);
    fetchComments(task);
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || !editingTask) return;

    try {
      await api.post(
        `/api/project/${editingTask.projectId}/tasks/${editingTask.id}/comments`,
        { content: commentText },
        getAuthConfig(),
      );
      setCommentText("");
      fetchComments(editingTask);
    } catch (error) {
      alert("Loi gui binh luan");
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;

    setIsUpdating(true);
    try {
      await updateTaskStatus(editingTask, selectedStatus);
      setIsDetailOpen(false);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || "Loi cap nhat task");
    } finally {
      setIsUpdating(false);
    }
  };

  const getPriorityStyle = (priority: string | null) => {
    switch (priority) {
      case "HIGH":
        return "bg-rose-100 text-rose-700 border-rose-200";
      case "URGENT":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center text-blue-600 font-bold animate-pulse">
        Dang tai du lieu...
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 bg-[#f4f7f9] overflow-hidden">
      <div className="mb-8 px-2">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Cong viec cua toi</h1>
        <p className="text-slate-500 font-medium mt-1">
          Du lieu duoc tong hop tu endpoint `/api/project/:id/tasks/my` cua tung du an.
        </p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 h-full overflow-x-auto pb-8 items-start px-2 custom-scrollbar">
          {Object.entries(columns).map(([columnId, column]) => (
            <div
              key={columnId}
              className="flex flex-col bg-white rounded-[2rem] min-w-[300px] w-[300px] max-h-[calc(100vh-200px)] border border-slate-200 shadow-md overflow-hidden"
            >
              <div className="p-5 font-black text-[11px] uppercase tracking-[0.2em] flex justify-between items-center bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-2.5 text-slate-700">{column.name}</div>
                <span className="bg-slate-200 px-2.5 py-0.5 rounded-full text-slate-600 font-bold">
                  {column.items.length}
                </span>
              </div>

              <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`p-4 min-h-[450px] overflow-y-auto custom-scrollbar transition-all ${snapshot.isDraggingOver ? "bg-blue-50/30" : "bg-transparent"}`}
                  >
                    {column.items.map((item, index) => (
                      <Draggable
                        key={item.id.toString()}
                        draggableId={item.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => handleOpenDetailModal(item)}
                            className={`p-5 mb-5 rounded-3xl bg-white border border-slate-200 transition-all duration-300 cursor-pointer group ${snapshot.isDragging ? "rotate-2 scale-105 shadow-2xl border-blue-400 z-50" : "shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-blue-300"}`}
                          >
                            <div className="flex justify-between items-start mb-4 gap-3">
                              <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg uppercase tracking-wider border border-blue-100">
                                {projectsMap[item.projectId]?.name || "Project"}
                              </span>
                              <span
                                className={`text-[9px] font-black px-2 py-0.5 rounded-lg border ${getPriorityStyle(item.priority)}`}
                              >
                                {item.priority || "MEDIUM"}
                              </span>
                            </div>
                            <h3 className="text-slate-800 font-bold text-sm mb-4 leading-relaxed group-hover:text-blue-600 transition-colors">
                              {item.title}
                            </h3>
                            <p className="text-xs text-slate-500 line-clamp-2 mb-5">
                              {item.description || "Khong co mo ta"}
                            </p>
                            <div className="flex justify-between items-center text-slate-400 border-t border-slate-50 pt-3">
                              <span className="text-[10px] font-bold">
                                {item.dueDate
                                  ? new Date(item.dueDate).toLocaleDateString("vi-VN")
                                  : "N/A"}
                              </span>
                              <div className="w-7 h-7 rounded-xl bg-slate-900 flex items-center justify-center text-white text-[10px] font-black uppercase shadow-md">
                                {(item.assigneeName || item.assigneeEmail || "?").charAt(0)}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {isDetailOpen && editingTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {editingTask.title}
                </h2>
                <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest mt-1">
                  Du an: {projectsMap[editingTask.projectId]?.name}
                </p>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center text-slate-500 hover:text-rose-500 hover:bg-rose-50 transition-all shadow-sm"
              >
                x
              </button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              <div className="flex-1 p-8 overflow-y-auto space-y-8 border-r border-slate-100">
                <div>
                  <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest block mb-2">
                    Mo ta chi tiet
                  </label>
                  <div className="w-full text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-[1.2rem] px-6 py-4">
                    {editingTask.description || "Khong co mo ta"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mt-8">
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
                    <span className="text-[11px] font-black text-slate-600 uppercase block mb-3">
                      Muc do uu tien
                    </span>
                    <div className="font-bold text-slate-700">{editingTask.priority || "MEDIUM"}</div>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
                    <span className="text-[11px] font-black text-slate-600 uppercase block mb-3">
                      Han xu ly
                    </span>
                    <div className="font-bold text-slate-700">
                      {editingTask.dueDate
                        ? new Date(editingTask.dueDate).toLocaleString("vi-VN")
                        : "Chua dat"}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
                  <span className="text-[11px] font-black text-slate-600 uppercase block mb-3">
                    Cap nhat trang thai
                  </span>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 font-bold text-xs text-slate-700 outline-none shadow-sm"
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                </div>
              </div>

              <div className="w-full md:w-[380px] flex flex-col bg-slate-50/40">
                <div className="p-6 border-b border-slate-200 font-black text-[11px] text-slate-600 uppercase tracking-widest">
                  Binh luan ({comments.length})
                </div>
                <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar">
                  {comments.map((c) => (
                    <div key={c.id} className="flex gap-4">
                      <div className="w-9 h-9 bg-blue-600 rounded-[1rem] flex items-center justify-center text-[10px] text-white font-black shrink-0 shadow-lg">
                        {c.userName?.charAt(0) || "U"}
                      </div>
                      <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                        <p className="text-[10px] font-black text-slate-900 mb-1">{c.userName}</p>
                        <p className="text-[12px] text-slate-700 leading-relaxed font-medium">{c.content}</p>
                      </div>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <div className="text-center py-10 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      Chua co thao luan nao
                    </div>
                  )}
                </div>
                <div className="p-6 bg-white border-t border-slate-200 flex gap-3">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
                    placeholder="Phan hoi..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                  <button
                    onClick={handleSendComment}
                    className="bg-blue-600 text-white px-6 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-blue-200 hover:scale-105 active:scale-95 transition-all"
                  >
                    Gui
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-8 py-3 text-xs font-black text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest"
              >
                Dong
              </button>
              <button
                onClick={handleUpdateTask}
                disabled={isUpdating}
                className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase shadow-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-50"
              >
                {isUpdating ? "Dang luu..." : "Cap nhat trang thai"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
