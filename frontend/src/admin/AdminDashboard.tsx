import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
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
            const token = localStorage.getItem('access_token');
            const headers = { Authorization: `Bearer ${token}` };
            const [resAssets, resRequests, resUsers] = await Promise.all([
                axios.get('http://localhost:3000/assets', { headers }),
                axios.get('http://localhost:3000/borrow-requests/all', { headers }),
                axios.get('http://localhost:3000/users', { headers })
            ]);
            const assets = Array.isArray(resAssets.data) ? resAssets.data : (resAssets.data?.data || resAssets.data?.assets || []);
            const requests = Array.isArray(resRequests.data) ? resRequests.data : (resRequests.data?.data || resRequests.data?.borrowRequests || []);
            const users = Array.isArray(resUsers.data) ? resUsers.data : (resUsers.data?.data || resUsers.data?.users || []);
            const today = new Date().toISOString().split('T')[0];

            setStats({
                totalAssets: assets.length,
                currentlyOut: assets.filter((a: any) => a.status === 'BORROWED').length,
                available: assets.filter((a: any) => a.status === 'AVAILABLE').length,
                pendingRequests: requests.filter((r: any) => r.status === 'PENDING').length,
                totalUsers: users.length,
                newUsersToday: users.filter((u: any) => u.createdAt?.includes(today)).length,
                recentActivities: requests.slice(0, 4)
            });
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
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
        <div className="p-3 md:p-5 pt-6 bg-[#E0F0FF] min-h-screen font-sans">
            {/* Header */}
            <header className="flex justify-between items-center mb-6 max-w-6xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-9 bg-blue-700 rounded-full shadow-md shadow-blue-300"></div>
                    <div>
                        <h4 className="text-xl font-black text-slate-600 tracking-tight uppercase">CORE INTEL</h4>
                        <p className="text-blue-600 text-[9px] font-bold uppercase tracking-widest mt-1">Management Dashboard</p>
                    </div>
                </div>
                <button onClick={fetchDashboardData} className="p-2 bg-white border border-blue-200 rounded-xl shadow-sm hover:bg-blue-50 transition-all active:scale-95">
                    <Lucide.RefreshCw size={14} className={`text-blue-700 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </header>

            {/* Stat Cards */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {statCards.map((card, i) => (
                    <div key={i} className={`bg-white p-4 rounded-xl border ${card.border} shadow-sm transition-all hover:shadow-lg group`}>
                        <div className="flex justify-between items-start mb-3">
                            <div className={`p-2 rounded-xl ${card.bg} ${card.color} group-hover:scale-110 transition-transform`}>{card.icon}</div>
                            <div className="w-2 h-2 rounded-full bg-blue-100"></div>
                        </div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">{card.label}</p>
                        <h2 className="text-2xl font-black text-slate-800 mt-1">{loading ? '...' : card.count}</h2>
                        <p className={`text-[9px] font-bold ${card.color} mt-1 uppercase`}>{card.sub}</p>
                    </div>
                ))}
            </div>

            {/* Main Grid */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activities */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-blue-100 p-4 md:p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-md font-black text-slate-800 flex items-center gap-2 uppercase">
                            <Lucide.LayoutList size={18} className="text-blue-600" /> Recent Logs
                        </h2>
                        <button onClick={() => navigate('/manage-requests')} className="text-blue-700 text-[10px] font-black uppercase hover:underline tracking-widest">View All</button>
                    </div>

                    <div className="space-y-2">
                        {stats.recentActivities.length > 0 ? stats.recentActivities.map((req, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-blue-100/30 rounded-xl border border-transparent hover:border-blue-200 hover:bg-white transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-blue-100 shadow-sm group-hover:shadow-blue-200 transition-all">
                                        <Lucide.Zap size={14} className={req.status === 'PENDING' ? 'text-blue-600' : 'text-sky-500'} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-700 uppercase leading-none">
                                            {req.user?.name || 'User'} <span className="text-slate-300 font-medium lowercase">is deploying</span> {req.asset?.name || 'Asset'}
                                        </p>
                                        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">
                                            {req.createdAt ? new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'} • {req.status}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => navigate('/manage-requests')} className="px-4 py-1.5 bg-white border border-blue-200 rounded-lg text-[9px] font-black text-blue-700 uppercase hover:bg-blue-700 hover:text-white transition-all shadow-sm">Verify</button>
                            </div>
                        )) : <div className="py-10 text-center text-blue-300 font-black uppercase text-xs">Waiting for Intel...</div>}
                    </div>
                </div>

                {/* Inventory Health */}
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm relative overflow-hidden group">
                        <h3 className="text-[9px] font-black text-slate-400 uppercase mb-4 tracking-widest italic leading-none">Inventory Health</h3>
                        <div className="mb-4 text-center">
                            <div className="relative inline-flex items-center justify-center p-8">
                                <span className="text-4xl font-black text-blue-700 tracking-tighter">
                                    {stats.totalAssets > 0 ? Math.round((stats.available / stats.totalAssets) * 100) : 0}%
                                </span>
                                <div className="absolute inset-0 border-[5px] border-blue-100 rounded-full"></div>
                            </div>
                            <p className="text-[9px] font-black text-blue-400 uppercase mt-2 tracking-widest leading-none">Total Readiness</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 relative z-10">
                            <div className="p-2 bg-blue-100/50 rounded-xl text-center">
                                <p className="text-[8px] font-bold text-blue-600 uppercase leading-none mb-1">Ready</p>
                                <p className="text-lg font-black text-slate-800">{stats.available}</p>
                            </div>
                            <div className="p-2 bg-slate-50 rounded-xl text-center">
                                <p className="text-[8px] font-bold text-slate-400 uppercase leading-none mb-1">Out</p>
                                <p className="text-lg font-black text-slate-800">{stats.currentlyOut}</p>
                            </div>
                        </div>
                        <div className="absolute -bottom-8 -right-8 w-36 h-36 bg-blue-100 rounded-full blur-3xl group-hover:bg-blue-200 transition-colors"></div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-700 to-sky-600 rounded-xl p-4 text-white shadow-lg flex items-center gap-3 group">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md group-hover:scale-110 transition-transform">
                            <Lucide.ShieldCheck size={18} />
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase leading-none mb-1 tracking-tight">Status: Secured</h4>
                            <p className="text-[8px] text-blue-100 font-bold uppercase tracking-widest opacity-90">All nodes functional</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;