import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, getAuthConfig } from "../lib/api";

interface Project {
  id: number;
  name: string;
  description: string;
  key: string;
  status: string;
  ownerName: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string | null;
  priority: string | null;
  progress: number | null;
  dueDate: string | null;
  assigneeId: number | null;
  assigneeName: string | null;
  assigneeEmail: string | null;
  reporterName: string | null;
  projectId: number;
  estimatedHours: number | null;
}

interface Member {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  role: string;
}

interface CommentItem {
  id: number;
  content: string;
  createdAt: string;
  userName: string;
  userEmail: string;
}

export default function ProjectDetail() {
  const { id } = useParams();
  const projectId = Number(id);

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [projectMembersList, setProjectMembersList] = useState<Member[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("MEDIUM");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newTaskEstimate, setNewTaskEstimate] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentText, setCommentText] = useState("");

  const assigneeOptions = useMemo(
    () => projectMembersList.filter((member) => !!member.userEmail),
    [projectMembersList],
  );

  const fetchData = async () => {
    if (!projectId) return;

    setIsLoading(true);
    try {
      const config = getAuthConfig();
      const [projectRes, taskRes, membersRes] = await Promise.all([
        api.get(`/api/project/${projectId}`, config),
        api.get(`/api/project/${projectId}/tasks/my`, config),
        api.get(`/api/project/${projectId}/members`, config),
      ]);

      setProject(projectRes.data);
      setTasks(taskRes.data);
      setProjectMembersList(membersRes.data);
      if (!newTaskAssignee && membersRes.data.length > 0) {
        setNewTaskAssignee(membersRes.data[0].userEmail);
      }
    } catch (error: any) {
      console.error("Loi tai du lieu:", error);
      if (error.response?.status === 404) {
        alert("Khong tim thay du an.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchComments = async (taskId: number) => {
    try {
      const res = await api.get(
        `/api/project/${projectId}/tasks/${taskId}/comments`,
        getAuthConfig(),
      );
      setComments(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenDetail = (task: Task) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
    setCommentText("");
    fetchComments(task.id);
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || !selectedTask) return;
    try {
      await api.post(
        `/api/project/${projectId}/tasks/${selectedTask.id}/comments`,
        { content: commentText },
        getAuthConfig(),
      );
      setCommentText("");
      fetchComments(selectedTask.id);
    } catch (error) {
      alert("Loi gui binh luan");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskAssignee) {
      alert("Hay chon nguoi duoc giao.");
      return;
    }

    setIsCreating(true);
    try {
      await api.post(
        `/api/project/${projectId}/tasks`,
        {
          title: newTaskTitle,
          description: newTaskDesc || undefined,
          priority: newTaskPriority,
          dueDate: newTaskDueDate
            ? `${newTaskDueDate}T00:00:00`
            : null,
          assigneeEmail: newTaskAssignee,
          estimatedHours: newTaskEstimate ? Number(newTaskEstimate) : null,
        },
        getAuthConfig(),
      );

      setIsModalOpen(false);
      setNewTaskTitle("");
      setNewTaskDesc("");
      setNewTaskPriority("MEDIUM");
      setNewTaskDueDate("");
      setNewTaskEstimate("");
      fetchData();
    } catch (error: any) {
      alert("Loi tao task: " + (error.response?.data?.error || error.message));
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!window.confirm("Xoa the cong viec nay?")) return;
    try {
      await api.delete(
        `/api/project/${projectId}/tasks/${taskId}`,
        getAuthConfig(),
      );
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || "Loi khi xoa task");
    }
  };

  const getStatusStyle = (status: string | null) => {
    switch (status) {
      case "TODO":
        return "bg-gray-50 text-gray-500 border-gray-200";
      case "IN_PROGRESS":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "DONE":
        return "bg-green-50 text-green-600 border-green-200";
      default:
        return "bg-gray-50 text-gray-500 border-gray-200";
    }
  };

  const getPriorityStyle = (priority: string | null) => {
    switch (priority) {
      case "HIGH":
        return "bg-orange-50 text-orange-600";
      case "URGENT":
        return "bg-red-50 text-red-600 border-red-100";
      default:
        return "bg-gray-50 text-gray-500";
    }
  };

  if (isLoading) {
    return <div className="p-10 text-blue-600 font-black animate-pulse">Dang tai du lieu...</div>;
  }

  if (!project) {
    return <div className="p-10 text-red-500 font-bold">Khong tim thay du an.</div>;
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-start gap-6 mb-8 border-b border-gray-100 pb-8 px-2">
        <Link
          to="/projects"
          className="mt-1 flex items-center justify-center bg-white border border-gray-200 hover:bg-gray-50 text-gray-400 w-10 h-10 rounded-xl transition shadow-sm"
        >
          &larr;
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black text-gray-900">{project.name}</h1>
            <span className="text-[10px] bg-blue-600 text-white px-3 py-1 rounded-full font-black tracking-widest shadow-lg shadow-blue-100 uppercase">
              {project.key}
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-2 font-medium">{project.description}</p>
          <p className="text-xs text-blue-600 font-semibold mt-2">
            Trang thai du an: {project.status} • Quan ly: {project.ownerName}
          </p>
        </div>
        <div className="hidden md:block text-right">
          <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest block mb-1">
            Thanh vien
          </span>
          <code className="bg-gray-50 px-3 py-2 rounded-xl border border-dashed border-gray-200 text-blue-600 font-bold text-xs">
            {projectMembersList.length}
          </code>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6 px-2">
        <div>
          <h2 className="text-xl font-black text-gray-900">Task cua toi trong du an</h2>
          <p className="text-gray-400 text-xs mt-1">
            Backend hien tai chi cung cap endpoint `/tasks/my` theo tung project.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-blue-200 transition active:scale-95 flex items-center gap-2"
        >
          <span className="text-lg">+</span> Them Task
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-visible mx-2">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-[10px] uppercase tracking-widest">
              <th className="p-5 font-black">Cong viec</th>
              <th className="p-5 font-black text-center">Trang thai</th>
              <th className="p-5 font-black text-center">Uu tien</th>
              <th className="p-5 font-black text-center">Thoi han</th>
              <th className="p-5 font-black text-right">Nguoi duoc giao</th>
              <th className="p-5 font-black text-center">Xoa</th>
            </tr>
          </thead>
        </table>
        <div className="overflow-y-auto max-h-[calc(100vh-420px)] custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-gray-50">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-blue-50/20 transition-all group">
                  <td className="p-5 cursor-pointer" onClick={() => handleOpenDetail(task)}>
                    <p className="text-gray-900 font-bold text-sm group-hover:text-blue-600 transition-colors">
                      {task.title}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5 line-clamp-1 font-normal">
                      {task.description}
                    </p>
                  </td>
                  <td className="p-5 text-center">
                    <span
                      className={`text-[10px] uppercase px-3 py-1 rounded-full font-black border ${getStatusStyle(task.status)}`}
                    >
                      {task.status || "TODO"}
                    </span>
                  </td>
                  <td className="p-5 text-center">
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-md font-black ${getPriorityStyle(task.priority)}`}
                    >
                      {task.priority || "MEDIUM"}
                    </span>
                  </td>
                  <td className="p-5 text-center text-[11px] text-gray-500 font-bold">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString("vi-VN") : "-"}
                  </td>
                  <td className="p-5 text-right text-xs font-bold text-gray-700">
                    {task.assigneeName || task.assigneeEmail || "Chua giao"}
                  </td>
                  <td className="p-5 text-center">
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-gray-200 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-gray-400">
                    Chua co task nao duoc giao cho ban trong du an nay.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 backdrop-blur-sm p-4">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-2xl border border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-8">Tao cong viec moi</h2>
            <form onSubmit={handleCreateTask} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-black-400 uppercase tracking-widest">
                  Tieu de
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ten cong viec..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-black-400 uppercase tracking-widest">
                  Mo ta chi tiet
                </label>
                <textarea
                  rows={3}
                  placeholder="Mo ta..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 text-sm font-bold"
                >
                  <option value="LOW">Thap</option>
                  <option value="MEDIUM">Trung binh</option>
                  <option value="HIGH">Cao</option>
                  <option value="URGENT">Khan cap</option>
                </select>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 text-sm outline-none"
                />
                <select
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 text-sm font-bold"
                >
                  {assigneeOptions.map((member) => (
                    <option key={member.id} value={member.userEmail}>
                      {member.userName} ({member.userEmail})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={newTaskEstimate}
                  onChange={(e) => setNewTaskEstimate(e.target.value)}
                  placeholder="Estimated hours"
                  className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 text-sm outline-none"
                />
              </div>
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 text-gray-400 font-bold"
                >
                  Huy
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black disabled:opacity-50"
                >
                  {isCreating ? "Dang xu ly..." : "Tao ngay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDetailOpen && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col border border-gray-100">
            <div className="p-7 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <h2 className="text-xl font-black text-gray-900">{selectedTask.title}</h2>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="bg-white border w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 shadow-sm transition"
              >
                x
              </button>
            </div>
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              <div className="flex-1 p-8 overflow-y-auto space-y-8 border-r border-gray-50">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Mo ta chi tiet
                  </label>
                  <p className="bg-gray-50 p-6 rounded-2xl text-sm text-gray-600 mt-3 leading-relaxed border border-gray-100">
                    {selectedTask.description || "Khong co mo ta"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-5 rounded-2xl">
                    <span className="text-[9px] block font-black text-gray-400 uppercase mb-1">
                      Trang thai
                    </span>
                    <span className={`text-[10px] uppercase px-3 py-1 rounded-full font-black border ${getStatusStyle(selectedTask.status)}`}>
                      {selectedTask.status || "TODO"}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-2xl">
                    <span className="text-[9px] block font-black text-gray-400 uppercase mb-1">
                      Uu tien
                    </span>
                    <span className={`text-[10px] px-2.5 py-1 rounded-md font-black ${getPriorityStyle(selectedTask.priority)}`}>
                      {selectedTask.priority || "MEDIUM"}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-2xl">
                    <span className="text-[9px] block font-black text-gray-400 uppercase mb-1">
                      Due date
                    </span>
                    <span>{selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleString("vi-VN") : "-"}</span>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-2xl">
                    <span className="text-[9px] block font-black text-gray-400 uppercase mb-1">
                      Assignee
                    </span>
                    <span>{selectedTask.assigneeName || selectedTask.assigneeEmail || "-"}</span>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-[360px] flex flex-col bg-gray-50/50">
                <div className="p-5 border-b border-gray-100 bg-white font-black text-[11px] text-gray-400 uppercase tracking-widest">
                  Binh luan ({comments.length})
                </div>
                <div className="flex-1 p-5 overflow-y-auto space-y-5 custom-scrollbar">
                  {comments.map((c) => (
                    <div key={c.id} className="flex gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-[10px] text-white font-black uppercase shrink-0 shadow-md">
                        {c.userName?.charAt(0) || "U"}
                      </div>
                      <div className="flex-1 bg-white border border-gray-100 p-3 rounded-2xl shadow-sm">
                        <p className="text-[10px] font-black text-gray-900 mb-1">{c.userName}</p>
                        <p className="text-xs text-gray-600">{c.content}</p>
                      </div>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <div className="text-xs text-gray-400">Chua co binh luan nao.</div>
                  )}
                </div>
                <div className="p-5 bg-white border-t border-gray-100 flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
                    placeholder="Phan hoi..."
                    className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                  <button
                    onClick={handleSendComment}
                    className="bg-blue-600 text-white px-4 rounded-xl font-black text-[10px] uppercase shadow-md shadow-blue-100 transition active:scale-90"
                  >
                    Gui
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
