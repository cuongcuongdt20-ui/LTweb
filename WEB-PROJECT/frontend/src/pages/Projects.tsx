import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getAuthConfig } from "../lib/api";

interface Project {
  id: number;
  name: string;
  key: string;
  description: string;
  role: string;
  status: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const [joinCode, setJoinCode] = useState("");

  const fetchProjects = async () => {
    try {
      const response = await api.get("/api/project/my", getAuthConfig());
      setProjects(response.data);
    } catch (err) {
      console.error("Loi khi tai du an:", err);
      setError("Khong the tai danh sach du an");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      await api.post(
        "/api/project/create",
        {
          name: newName,
          key: newKey,
          description: newDesc,
        },
        getAuthConfig(),
      );

      setIsModalOpen(false);
      setNewName("");
      setNewKey("");
      setNewDesc("");
      fetchProjects();
    } catch (err: any) {
      alert(err.response?.data?.error || "Co loi xay ra khi tao du an moi");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Ban co chac muon xoa du an nay khong?")) return;

    try {
      await api.delete(`/api/project/delete/${id}`, getAuthConfig());
      fetchProjects();
    } catch (err) {
      alert("Khong the xoa du an");
    }
  };

  const handleJoinProject = () => {
    if (!joinCode.trim()) return;
    alert(
      "Backend hien tai chua co endpoint gia nhap du an bang ma. Hay dung API them thanh vien o phia quan ly du an.",
    );
    setJoinCode("");
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Du an cua toi</h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition shadow-sm hover:shadow-md flex items-center gap-2"
        >
          <span className="text-xl leading-none">+</span> Them du an
        </button>
      </div>

      {isLoading && (
        <p className="text-blue-600 font-medium">Dang tai du lieu du an...</p>
      )}
      {error && <p className="text-red-500 font-medium">{error}</p>}

      {!isLoading && !error && projects.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border-2 border-gray-100 border-dashed shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <p className="text-gray-500 font-medium mb-1">Ban chua tham gia du an nao.</p>
          <p className="text-gray-400 text-sm">Hay tao mot du an moi de bat dau cong viec.</p>
        </div>
      )}

      <div className="mb-10 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl border border-blue-100 flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1">
          <h3 className="text-sm font-black text-blue-900 uppercase">Gia nhap du an</h3>
          <p className="text-xs text-blue-600 font-medium">
            Backend hien tai chua co endpoint join bang ma du an.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Nhap project key"
            className="px-4 py-3 rounded-2xl border-none shadow-sm text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-48"
          />
          <button
            onClick={handleJoinProject}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-xs shadow-lg transition active:scale-95 shrink-0"
          >
            THU NGAY
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
        {projects.map((project) => (
          <div
            onClick={() => navigate(`${project.id}`)}
            key={project.id}
            className="relative bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group flex flex-col"
          >
            <div className="flex justify-between items-start mb-3 gap-3">
              <div>
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1 pr-2">
                  {project.name}
                </h3>
                <p className="text-[11px] text-gray-400 mt-1 uppercase">{project.key}</p>
              </div>
              <span
                className={`text-[10px] uppercase px-2.5 py-1 rounded-md font-bold shrink-0 ${project.role === "MANAGER" ? "bg-purple-100 text-purple-700 border border-purple-200" : "bg-gray-100 text-gray-600 border border-gray-200"}`}
              >
                {project.role}
              </span>
            </div>

            <p className="text-gray-500 text-sm mb-3 line-clamp-2 flex-1">
              {project.description || "Chua co mo ta chi tiet cho du an nay."}
            </p>
            <p className="text-[11px] text-blue-600 font-semibold mb-6">Trang thai: {project.status}</p>

            <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-auto">
              <div className="text-xs font-medium text-gray-400">Nhan de xem chi tiet</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(project.id);
                  }}
                  className="text-xs text-red-500 font-bold hover:underline"
                >
                  Xoa
                </button>
                <button className="text-sm text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  Vao du an <span className="text-lg leading-none">&rarr;</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Tao du an moi</h2>

            <form onSubmit={handleCreateProject} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Ten du an <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="VD: He thong CRM"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Ma du an (Key) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value.toUpperCase())}
                  placeholder="VD: CRM"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Mo ta ngan</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Muc tieu cua du an nay la gi?"
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-bold transition"
                >
                  Huy bo
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition shadow-sm hover:shadow disabled:opacity-50"
                >
                  {isCreating ? "Dang tao..." : "Tao du an"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
