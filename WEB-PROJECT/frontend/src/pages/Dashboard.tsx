import { useEffect, useState } from "react";
import { api, getAuthConfig } from "../lib/api";

interface Project {
  id: number;
  name: string;
}

interface Task {
  id: number;
  status: string | null;
  dueDate: string | null;
}

export default function Dashboard() {
  const [totalProjects, setTotalProjects] = useState(0);
  const [inProgressTasks, setInProgressTasks] = useState(0);
  const [overdueTasks, setOverdueTasks] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const config = getAuthConfig();
        const projectsRes = await api.get("/api/project/my", config);
        const projects: Project[] = projectsRes.data;

        const taskResponses = await Promise.all(
          projects.map((project) => api.get(`/api/project/${project.id}/tasks/my`, config)),
        );
        const myTasks: Task[] = taskResponses.flatMap((response) => response.data);

        setTotalProjects(projects.length);
        setInProgressTasks(
          myTasks.filter((task) => task.status === "IN_PROGRESS").length,
        );

        const now = new Date();
        setOverdueTasks(
          myTasks.filter((task) => {
            if (task.status === "DONE" || !task.dueDate) return false;
            return new Date(task.dueDate) < now;
          }).length,
        );
      } catch (error) {
        console.error("Loi khi tai du lieu Dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="text-blue-600 p-8 text-xl font-semibold">
        Dang tong hop du lieu...
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Bang dieu khien</h1>
        <p className="text-gray-500 mt-1">
          Tong quan ve cac du an va nhiem vu cua ban
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 font-medium mb-2 text-sm">Tong du an</h3>
              <p className="text-4xl font-bold text-gray-800">{totalProjects}</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
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
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 font-medium mb-2 text-sm">Dang thuc hien</h3>
              <p className="text-4xl font-bold text-gray-800">{inProgressTasks}</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 font-medium mb-2 text-sm">Qua han</h3>
              <p className="text-4xl font-bold text-gray-800">{overdueTasks}</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl border-2 border-gray-100 border-dashed flex flex-col items-center justify-center shadow-sm">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <p className="text-gray-400 font-medium">
          So lieu dang duoc tong hop tu cac endpoint hien co cua backend.
        </p>
      </div>
    </div>
  );
}
