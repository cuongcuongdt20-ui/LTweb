import { useState, useEffect } from 'react';

interface Project {
    id: number;
}

interface Task {
    id: number;
    status: string;
    dueDate: string | null;
}

export default function Dashboard() {
    const [totalProjects, setTotalProjects] = useState(0);
    const [inProgressTasks, setInProgressTasks] = useState(0);
    const [overdueTasks, setOverdueTasks] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    // Phần này sau backend xong thì sửa giờ đang mặc định 
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));

                const mockProjectsRes = {
                    data: [
                        { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }
                    ]
                };

                const mockTasksRes = {
                    data: [
                        { id: 1, status: 'IN_PROGRESS', dueDate: '2026-04-01' }, 
                        { id: 2, status: 'IN_PROGRESS', dueDate: '2026-03-01' }, 
                        { id: 3, status: 'TODO', dueDate: '2026-03-10' },        
                        { id: 4, status: 'DONE', dueDate: '2026-02-15' },        
                        { id: 5, status: 'IN_PROGRESS', dueDate: '2026-05-15' }, 
                    ]
                };

                const projectsRes = mockProjectsRes;
                const tasksRes = mockTasksRes;

                const projects: Project[] = projectsRes.data;
                const myTasks: Task[] = tasksRes.data;

                setTotalProjects(projects.length);

                const inProgress = myTasks.filter(task => task.status === 'IN_PROGRESS').length;
                setInProgressTasks(inProgress);

                const now = new Date();
                const overdue = myTasks.filter(task => {
                    if (task.status === 'DONE' || !task.dueDate) return false;
                    const deadline = new Date(task.dueDate);
                    return deadline < now;
                }).length;
                setOverdueTasks(overdue);

            } catch (error) {
                console.error("Lỗi khi tải dữ liệu Dashboard:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (isLoading) {
        return <div className="text-blue-600 p-8 text-xl font-semibold bg-blue-50 min-h-screen">Đang tổng hợp dữ liệu... ⏳</div>;
    }

    return (
        <div className="min-h-screen flex flex-col bg-blue-50 p-6 md:p-8">
            <h1 className="text-3xl font-black mb-8 text-gray-800">Tổng quan hệ thống</h1>
            
            {/* 3 Thẻ thống kê (Card) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Card Dự án */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h3 className="text-gray-500 font-medium mb-1 text-sm uppercase tracking-wider">Tổng số Dự án</h3>
                    <p className="text-5xl font-black text-blue-600 mt-2">{totalProjects}</p>
                </div>

                {/* Card Đang làm */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-gray-500 font-medium mb-1 text-sm uppercase tracking-wider">Task đang làm</h3>
                    <p className="text-5xl font-black text-yellow-500 mt-2">{inProgressTasks}</p>
                </div>

                {/* Card Trễ hạn */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-gray-500 font-medium mb-1 text-sm uppercase tracking-wider">Task trễ hạn</h3>
                    <p className="text-5xl font-black text-red-500 mt-2">{overdueTasks}</p>
                </div>
            </div>

            {/* Vùng trống */}
            <div className="flex-1 bg-white rounded-2xl border-2 border-gray-200 border-dashed flex items-center justify-center min-h-[300px]">
                <p className="text-gray-400 italic">Khu vực này có thể để trống hoặc thêm biểu đồ (Chart) sau này...</p>
            </div>
        </div>
    );
}