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
                recentActivities: requests.slice(0, 4)
            });
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setTimeout(() => setLoading(false), 500);
        }
    }, []);

    useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

    const statCards = [
        { label: 'Users', count: stats.totalUsers, sub: `+${stats.newUsersToday} Today`, icon: <Lucide.Users size={16} />, color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-300' },
        { label: 'Assets', count: stats.totalAssets, sub: 'Inventory', icon: <Lucide.Package size={16} />, color: 'text-sky-700', bg: 'bg-sky-100', border: 'border-sky-300' },
        { label: 'On Loan', count: stats.currentlyOut, sub: 'Deployed', icon: <Lucide.Share2 size={16} />, color: 'text-cyan-700', bg: 'bg-cyan-100', border: 'border-cyan-300' },
        { label: 'Pending', count: stats.pendingRequests, sub: 'Needs Action', icon: <Lucide.Inbox size={16} />, color: 'text-indigo-700', bg: 'bg-indigo-100', border: 'border-indigo-300' },
    ];

    return (
        <div className="p-4 md:p-8 bg-[#E0F0FF] min-h-screen font-sans">
            {/* Header: ปรับให้ยืดหยุ่นในมือถือ */}
            <header className="flex flex-row justify-between items-center mb-8 max-w-7xl mx-auto gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-10 bg-blue-700 rounded-full shadow-md shadow-blue-300"></div>
                    <div>
                        <h4 className="text-xl md:text-2xl font-black text-slate-700 tracking-tighter uppercase leading-none">CORE INTEL</h4>
                        <p className="text-blue-600 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Management Dashboard</p>
                    </div>
                </div>
                <button onClick={fetchDashboardData} className="p-3 bg-white border border-blue-200 rounded-2xl shadow-sm hover:bg-blue-50 transition-all active:scale-90">
                    <Lucide.RefreshCw size={16} className={`text-blue-700 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </header>

            {/* Stat Cards: 1 คอลัมน์ในมือถือ, 2 ในแท็บเล็ต, 4 ในจอใหญ่ */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((card, i) => (
                    <div key={i} className={`bg-white p-5 rounded-[2rem] border ${card.border} shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl ${card.bg} ${card.color} group-hover:rotate-6 transition-transform`}>{card.icon}</div>
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-100 animate-pulse"></div>
                        </div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{card.label}</p>
                        <h2 className="text-3xl font-black text-slate-800 mt-1">{loading ? '...' : card.count.toLocaleString()}</h2>
                        <p className={`text-[9px] font-bold ${card.color} mt-2 uppercase bg-gray-50 inline-block px-2 py-0.5 rounded-lg`}>{card.sub}</p>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activities: ปรับ Padding และการแสดงผลรายการ */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-blue-100 p-6 md:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-black text-slate-800 flex items-center gap-3 uppercase">
                            <Lucide.LayoutList size={22} className="text-blue-600" /> Recent Logs
                        </h2>
                        <button onClick={() => navigate('/manage-requests')} className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-black uppercase hover:bg-blue-700 hover:text-white transition-all tracking-widest">View All</button>
                    </div>

                    <div className="space-y-3">
                        {stats.recentActivities.length > 0 ? stats.recentActivities.map((req, i) => (
                            <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-blue-50/30 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-white transition-all group gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center border border-blue-50 shadow-sm group-hover:scale-110 transition-transform">
                                        <Lucide.Zap size={16} className={req.status === 'PENDING' ? 'text-blue-600' : 'text-sky-500'} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-700 uppercase leading-snug">
                                            {req.user?.name || 'User'} <span className="text-slate-400 font-medium lowercase">deployed</span> {req.asset?.name || 'Asset'}
                                        </p>
                                        <p className="text-[9px] font-black text-slate-400 mt-1.5 uppercase flex items-center gap-2">
                                            <Lucide.Clock size={10} /> {req.createdAt ? new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'} • {req.status}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => navigate('/manage-requests')} className="w-full sm:w-auto px-6 py-2 bg-white border border-blue-200 rounded-xl text-[10px] font-black text-blue-700 uppercase hover:bg-blue-700 hover:text-white transition-all shadow-sm">Verify</button>
                            </div>
                        )) : <div className="py-20 text-center text-blue-200 font-black uppercase text-xs tracking-widest">Waiting for Intel...</div>}
                    </div>
                </div>

                {/* Sidebar Stats: Inventory Health */}
                <div className="flex flex-col gap-6">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-blue-100 shadow-sm relative overflow-hidden group">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase mb-6 tracking-[0.2em] italic">Inventory Health</h3>
                        <div className="mb-8 text-center relative">
                            <div className="relative inline-flex items-center justify-center p-10 bg-blue-50/50 rounded-full">
                                <span className="text-5xl font-black text-blue-700 tracking-tighter z-10">
                                    {stats.totalAssets > 0 ? Math.round((stats.available / stats.totalAssets) * 100) : 0}%
                                </span>
                                <div className="absolute inset-0 border-[6px] border-white rounded-full shadow-inner"></div>
                            </div>
                            <p className="text-[10px] font-black text-blue-500 uppercase mt-4 tracking-widest">Total Readiness</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-blue-50/80 rounded-2xl text-center border border-blue-100">
                                <p className="text-[9px] font-black text-blue-600 uppercase mb-1">Ready</p>
                                <p className="text-xl font-black text-slate-800">{stats.available}</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-2xl text-center border border-slate-100">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Out</p>
                                <p className="text-xl font-black text-slate-800">{stats.currentlyOut}</p>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-100/50 rounded-full blur-3xl"></div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-700 to-indigo-600 rounded-[2rem] p-6 text-white shadow-xl shadow-blue-200 flex items-center gap-4 group cursor-pointer hover:scale-[1.02] transition-transform">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md group-hover:rotate-12 transition-transform">
                            <Lucide.ShieldCheck size={24} />
                        </div>
                        <div>
                            <h4 className="text-[11px] font-black uppercase tracking-tight mb-1">Status: Secured</h4>
                            <p className="text-[9px] text-blue-100 font-bold uppercase tracking-widest opacity-80 leading-none">Sentinel Core Functional</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;