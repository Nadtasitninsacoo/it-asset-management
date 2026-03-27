import { useEffect, useState } from 'react';
import api from '../services/api';
import { Package, CheckCircle, Clock, AlertTriangle, ArrowUpRight, Activity, LayoutGrid } from 'lucide-react';

interface Asset {
    id: number;
    status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';
}

const Dashboard = () => {
    const [stats, setStats] = useState({
        total: 0,
        available: 0,
        inUse: 0,
        maintenance: 0
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/assets');
                const assets: Asset[] = response.data;

                setStats({
                    total: assets.length,
                    available: assets.filter(a => a.status === 'AVAILABLE').length,
                    inUse: assets.filter(a => a.status === 'IN_USE').length,
                    maintenance: assets.filter(a => a.status === 'MAINTENANCE').length,
                });
            } catch (error) {
                console.error("Error fetching assets:", error);
            }
        };
        fetchDashboardData();
    }, []);

    const statCards = [
        { label: 'Total Assets', value: stats.total, color: '#6366f1', icon: <Package size={22} />, bg: 'bg-indigo-50' },
        { label: 'Available', value: stats.available, color: '#10b981', icon: <CheckCircle size={22} />, bg: 'bg-emerald-50' },
        { label: 'In Use', value: stats.inUse, color: '#3b82f6', icon: <Clock size={22} />, bg: 'bg-blue-50' },
        { label: 'Maintenance', value: stats.maintenance, color: '#f59e0b', icon: <AlertTriangle size={22} />, bg: 'bg-amber-50' },
    ];

    return (
        <div className="w-full min-h-screen bg-[#fcfcfd] p-4 lg:p-10 space-y-10 text-slate-800">

            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                        <LayoutGrid className="text-indigo-600" size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Overview</h1>
                        <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            ตรวจสอบสถานะอุปกรณ์ทั้งหมดในระบบ
                        </p>
                    </div>
                </div>
                <div className="bg-white px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 self-start">
                    <Clock size={16} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-600">
                        {new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => (
                    <div key={idx} className="group bg-white border border-slate-200 p-7 rounded-[2rem] hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 relative overflow-hidden">
                        <div className="flex justify-between items-start relative z-10">
                            <div className={`p-4 rounded-2xl ${stat.bg} transition-transform group-hover:scale-110 duration-300`} style={{ color: stat.color }}>
                                {stat.icon}
                            </div>
                            <button className="p-2 bg-slate-50 rounded-full text-slate-300 group-hover:text-slate-600 group-hover:bg-white transition-all">
                                <ArrowUpRight size={18} />
                            </button>
                        </div>

                        <div className="mt-8 relative z-10">
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                            <div className="flex items-end gap-2">
                                <h2 className="text-4xl font-black text-slate-900">{stat.value.toLocaleString()}</h2>
                                <span className="text-sm font-bold text-slate-400 mb-1.5">Items</span>
                            </div>
                        </div>

                        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-slate-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="xl:col-span-8 bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden min-h-[450px] flex flex-col justify-center items-center text-center">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-20"></div>
                    <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6 animate-bounce transition-all duration-[2s]">
                        <Activity className="text-indigo-600" size={36} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Activity Analysis</h3>
                    <p className="text-slate-500 text-sm max-w-sm mt-3 leading-relaxed">
                        ระบบกำลังวิเคราะห์ข้อมูลการใช้งานอุปกรณ์
                        กราฟเปรียบเทียบจะแสดงผลที่นี่โดยอัตโนมัติเมื่อมีการบันทึกข้อมูล
                    </p>
                </div>

                <div className="xl:col-span-4 space-y-6">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-900/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                            <Package size={120} />
                        </div>
                        <h3 className="text-lg font-bold mb-2 relative z-10">Quick Action</h3>
                        <p className="text-slate-400 text-xs mb-6 relative z-10 leading-relaxed">ท่านจอมพลสามารถเพิ่มอุปกรณ์ใหม่เข้าสู่คลังได้ทันทีที่นี่</p>
                        <button className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/30 relative z-10 active:scale-95">
                            + เพิ่มอุปกรณ์ใหม่
                        </button>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Clock size={18} className="text-indigo-500" />
                                การเคลื่อนไหวล่าสุด
                            </h3>
                            <button className="text-xs font-bold text-indigo-600 hover:underline">ดูทั้งหมด</button>
                        </div>
                        <div className="space-y-5">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                        <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-indigo-500"></div>
                                    </div>
                                    <div className="flex-1 border-b border-slate-50 pb-2">
                                        <div className="h-4 w-32 bg-slate-100 rounded-md mb-2 animate-pulse" />
                                        <div className="h-2 w-16 bg-slate-50 rounded-md animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;