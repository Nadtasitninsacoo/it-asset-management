import { NavLink, useNavigate } from 'react-router-dom';
import * as Lucide from 'lucide-react';
import { notify } from '../utils/swal';

// 🚩 เพิ่ม Interface เพื่อรับคำสั่งปิดจาก MainLayout
interface SidebarProps {
    onClose?: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('role');

    const menuItems = [
        {
            icon: <Lucide.LayoutDashboard size={18} />,
            label: 'Dashboard',
            path: '/admin-dashboard',
            show: userRole === 'ADMIN'
        },
        {
            icon: <Lucide.ClipboardCheck size={18} />,
            label: 'Manage Requests',
            path: '/manage-requests',
            show: userRole === 'ADMIN'
        },
        {
            icon: <Lucide.Settings size={18} />,
            label: 'Assets Control',
            path: '/manage-assets',
            show: userRole === 'ADMIN'
        },
        {
            icon: <Lucide.Users size={18} />,
            label: 'Personnel',
            path: '/manage-users',
            show: userRole === 'ADMIN'
        },
        {
            icon: <Lucide.Package size={18} />,
            label: 'Borrow Asset',
            path: '/borrow-assets',
            show: true
        },
        {
            icon: <Lucide.RefreshCcw size={18} />,
            label: 'Return Assets',
            path: '/my-history',
            show: true
        },
    ];

    const handleLogout = async () => {
        const confirm = await notify.confirm('Sign Out', 'คุณต้องการออกจากระบบใช่หรือไม่?');
        if (confirm) {
            localStorage.clear();
            navigate('/login');
        }
    };

    return (
        <aside className="w-64 h-screen border-r border-slate-100 bg-white flex flex-col px-5 py-8 transition-all duration-300 shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative">

            {/* 🚩 ปุ่มปิดสำหรับมือถือ (แสดงเฉพาะหน้าจอเล็ก) */}
            <button
                onClick={onClose}
                className="lg:hidden absolute top-4 right-4 text-slate-400 hover:text-rose-500 transition-colors"
            >
                <Lucide.XCircle size={22} />
            </button>

            <div className="mb-12 flex items-center gap-3.5 px-3">
                <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100 rotate-3 group-hover:rotate-0 transition-transform">
                    <Lucide.Cpu className="text-white" size={20} />
                </div>
                <div className="flex flex-col">
                    <span className="text-lg font-black tracking-tight text-slate-800 leading-none">SENTINEL</span>
                    <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] mt-1">CORE SYSTEM</span>
                </div>
            </div>

            <nav className="flex-1 space-y-1.5 overflow-y-auto pr-2 custom-scrollbar">
                {menuItems.filter(item => item.show).map((item, index) => (
                    <NavLink
                        key={index}
                        to={item.path}
                        onClick={onClose} // 🚩 เมื่อกดเมนูในมือถือ ให้พับ Sidebar เก็บอัตโนมัติ
                        className={({ isActive }) => `
                            flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300 group relative
                            ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50'}
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                <span className={`
                                    absolute left-0 w-1 h-5 bg-indigo-600 rounded-r-full transition-all duration-300
                                    ${isActive ? 'opacity-100' : 'opacity-0'}
                                `}></span>
                                <span className="group-hover:scale-110 transition-transform duration-300">
                                    {item.icon}
                                </span>
                                <span className="text-sm font-bold tracking-wide">{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-50">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3.5 px-4 py-3.5 w-full rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 transition-all duration-300 group"
                >
                    <Lucide.LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold tracking-wide">Sign Out</span>
                </button>

                <div className="mt-4 px-4">
                    <div className="bg-slate-50 rounded-2xl p-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-[10px] font-bold text-indigo-500">
                            V1
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">System Ready</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;