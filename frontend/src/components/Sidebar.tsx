import { NavLink } from 'react-router-dom';
import * as Lucide from 'lucide-react';
import { notify } from '../utils/swal';

interface SidebarProps {
    onClose?: () => void;
    isOpen: boolean;
}

const Sidebar = ({ onClose, isOpen }: SidebarProps) => {
    const rawRole = localStorage.getItem('role');
    const userRole = rawRole ? rawRole.trim().toUpperCase() : 'USER';

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
            window.location.href = '/login';
        }
    };

    return (
        <aside
            className={`
                fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:static lg:flex
                flex flex-col px-5 py-8 border-r border-slate-100
            `}
        >
            <button
                onClick={() => onClose?.()}
                className="lg:hidden absolute top-4 right-4 text-slate-400 hover:text-rose-500 transition-colors"
            >
                <Lucide.XCircle size={22} />
            </button>

            <div className="mb-12 flex items-center gap-3.5 px-3">
                <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                    <Lucide.Cpu className="text-white" size={20} />
                </div>
                <div>
                    <span className="text-lg font-black text-slate-800 uppercase tracking-tighter italic">SENTINEL</span>
                    <div className="text-[10px] text-slate-400 font-bold tracking-widest uppercase leading-none mt-0.5">Core System</div>
                </div>
            </div>

            <nav className="flex-1 space-y-1.5 overflow-y-auto pr-2 custom-scrollbar">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-4 opacity-70">
                    {userRole === 'ADMIN' ? 'Strategic Control' : 'Personnel Access'}
                </div>

                {menuItems.filter(item => item.show).map((item, index) => (
                    <NavLink
                        key={index}
                        to={item.path}
                        onClick={() => onClose?.()}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                            ${isActive
                                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-[1.02] font-bold'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600 font-medium'}
                        `}
                    >
                        {item.icon}
                        <span className="text-sm uppercase tracking-tight">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-50">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200 group"
                >
                    <Lucide.LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-black italic uppercase">Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;