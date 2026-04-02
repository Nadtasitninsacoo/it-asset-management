import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import * as Lucide from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ActivityRequest {
    id: number; status: string; createdAt: string;
    user?: { name: string };
    asset?: { name: string };
}

type DashboardStats = {
    totalAssets: number; currentlyOut: number; available: number;
    pendingRequests: number; totalUsers: number; newUsersToday: number;
    recentActivities: ActivityRequest[];
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats>({
        totalAssets: 0, currentlyOut: 0, available: 0,
        pendingRequests: 0, totalUsers: 0, newUsersToday: 0,
        recentActivities: []
    });
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            const [resAssets, resRequests, resUsers] = await Promise.all([
                api.get('/assets'),
                api.get('/borrow-requests/all'),
                api.get('/users')
            ]);

            const assets = resAssets.data.data || resAssets.data;
            const requests = resRequests.data.data || resRequests.data;
            const users = resUsers.data.data || resUsers.data;
            const today = new Date().toISOString().split('T')[0];

            setStats({
                totalAssets: assets.length,
                currentlyOut: assets.filter((a: any) => a.status === 'BORROWED' || a.status === 'IN_USE').length,
                available: assets.filter((a: any) => a.status === 'AVAILABLE').length,
                pendingRequests: requests.filter((r: any) => r.status === 'PENDING').length,
                totalUsers: users.length,
                newUsersToday: users.filter((u: any) => u.createdAt?.includes(today)).length,
                recentActivities: requests.slice(0, 5) // เพิ่มเป็น 5 รายการให้ดูเต็ม
            });
        } catch (error) {
            console.error(error);
        } finally {
            setTimeout(() => setLoading(false), 300);
        }
    }, []);

    useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

    const statCards = [
        { label: 'Personnel', count: stats.totalUsers, sub: `+${stats.newUsersToday} Today`, icon: <Lucide.Users size={18} />, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100' },
        { label: 'Inventory', count: stats.totalAssets, sub: 'Total Assets', icon: <Lucide.Package size={18} />, color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-100' },
        { label: 'Deployed', count: stats.currentlyOut, sub: 'Currently Out', icon: <Lucide.Share2 size={18} />, color: 'text-cyan-700', bg: 'bg-cyan-50', border: 'border-cyan-100' },
        { label: 'Requests', count: stats.pendingRequests, sub: 'Needs Review', icon: <Lucide.Inbox size={18} />, color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-100' },
    ];

    return (
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-6 md:py-10 bg-[#F8FAFC] min-h-screen font-sans">

            {/* 🛡️ TOP NAVIGATION / HEADER */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-2 h-12 bg-blue-600 rounded-full shadow-lg shadow-blue-100"></div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none italic">SENTINEL <span className="text-blue-600">CORE</span></h2>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Strategic Intelligence Dashboard</p>
                    </div>
                </div>

                <button
                    onClick={fetchDashboardData}
                    className="group self-start sm:self-auto p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-blue-500 transition-all active:scale-90"
                >
                    <Lucide.RefreshCw size={18} className={`text-slate-400 group-hover:text-blue-600 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </header>

            {/* 📊 STATS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
                {statCards.map((card, i) => (
                    <div key={i} className={`bg-white p-6 rounded-[2.5rem] border ${card.border} shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-slate-100 transition-all duration-300`}>
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-3.5 rounded-2xl ${card.bg} ${card.color} shadow-inner`}>{card.icon}</div>
                            <Lucide.ArrowUpRight size={14} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
                        </div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{card.label}</p>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-800 mt-1">
                            {loading ? <span className="animate-pulse opacity-20">---</span> : card.count}
                        </h2>
                        <p className={`text-[9px] font-bold ${card.color} mt-2 flex items-center gap-1.5`}>
                            <span className="w-1 h-1 rounded-full bg-current"></span> {card.sub}
                        </p>
                    </div>
                ))}
            </div>

            {/* ⚔️ MAIN CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">

                {/* RECENT LOGS */}
                <div className="lg:col-span-8 bg-white rounded-[3rem] shadow-sm border border-slate-100 p-6 md:p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100">
                                <Lucide.LayoutList size={18} />
                            </div>
                            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Surveillance Logs</h2>
                        </div>
                        <button
                            onClick={() => navigate('/manage-requests')}
                            className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all"
                        >
                            View All
                        </button>
                    </div>

                    <div className="space-y-4">
                        {stats.recentActivities.length > 0 ? stats.recentActivities.map((req, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 transition-all group">
                                <div className="flex items-center gap-4 min-w-0"> {/* ✅ min-w-0 ช่วยป้องกันการเบียด */}
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 text-blue-600">
                                        <Lucide.Zap size={16} />
                                    </div>
                                    <div className="min-w-0 flex-1"> {/* ✅ คุมพื้นที่ข้อความ */}
                                        <p className="text-xs font-bold text-slate-700 truncate"> {/* ✅ truncate กันล้น */}
                                            {req.user?.name} <span className="text-slate-300 font-normal mx-1">deploying</span> {req.asset?.name}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-tighter">
                                            {req.createdAt ? new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'} • <span className="text-blue-500">{req.status}</span>
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/manage-requests')}
                                    className="hidden sm:flex p-2 text-slate-300 hover:text-blue-600 transition-colors"
                                >
                                    <Lucide.ChevronRight size={18} />
                                </button>
                            </div>
                        )) : (
                            <div className="py-16 text-center">
                                <Lucide.Inbox size={40} className="mx-auto text-slate-100 mb-3" />
                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">No Intel Logged</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 🛡️ SIDE PANEL */}
                <div className="lg:col-span-4 space-y-6">

                    {/* READINESS CARD */}
                    <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-8 flex flex-col items-center justify-center text-center">
                        <div className="relative mb-6">
                            {/* Circular Progress (Simulated) */}
                            <svg className="w-32 h-32 transform -rotate-90">
                                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-50" />
                                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent"
                                    strokeDasharray={364.4}
                                    strokeDashoffset={364.4 - (364.4 * (stats.totalAssets > 0 ? (stats.available / stats.totalAssets) : 0))}
                                    className="text-blue-600 transition-all duration-1000"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-slate-800 leading-none">
                                    {stats.totalAssets > 0 ? Math.round((stats.available / stats.totalAssets) * 100) : 0}%
                                </span>
                                <span className="text-[8px] font-black text-slate-400 uppercase mt-1 tracking-widest">Ready</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 w-full">
                            <div className="p-4 bg-blue-50 rounded-[1.5rem] border border-blue-100">
                                <p className="text-[8px] font-black text-blue-400 uppercase mb-1">Available</p>
                                <p className="text-xl font-black text-blue-700">{stats.available}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">In Use</p>
                                <p className="text-xl font-black text-slate-800">{stats.currentlyOut}</p>
                            </div>
                        </div>
                    </div>

                    {/* SYSTEM STATUS */}
                    <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl shadow-slate-200">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/50">
                                <Lucide.ShieldCheck size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-sm uppercase tracking-tight italic">SENTINEL-CORE OK</h4>
                                <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Protection Active</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;