import { NavLink } from 'react-router-dom';
import * as Lucide from 'lucide-react';
import { notify } from '../utils/swal';

type User = { name: string; role: string };

interface SidebarProps {
    isOpen: boolean;
    onClose?: () => void;
    userData: User | null;
}

const Sidebar = ({ isOpen, onClose, userData }: SidebarProps) => {
    const userRole = userData?.role?.trim().toUpperCase() || 'USER';
    const isAdmin = userRole === 'ADMIN';

    const menuItems = [
        { icon: <Lucide.LayoutDashboard size={18} />, label: 'Dashboard', path: '/admin-dashboard', show: isAdmin },
        { icon: <Lucide.ClipboardCheck size={18} />, label: 'Manage Requests', path: '/manage-requests', show: isAdmin },
        { icon: <Lucide.Settings size={18} />, label: 'Assets Control', path: '/manage-assets', show: isAdmin },
        { icon: <Lucide.Users size={18} />, label: 'Personnel', path: '/manage-users', show: isAdmin },
        { icon: <Lucide.Package size={18} />, label: 'Borrow Asset', path: '/borrow-assets', show: true },
        { icon: <Lucide.History size={18} />, label: 'Borrow History', path: '/my-history', show: true },
    ];

    const handleLogout = async () => {
        const confirm = await notify.confirm('Sign Out', 'คุณต้องการออกจากระบบใช่หรือไม่?');
        if (confirm) {
            localStorage.clear();
            window.location.href = '/login';
        }
    };

    return (
        <aside className={`fixed top-0 left-0 h-full w-64 bg-white z-[150] transform transition-transform duration-300
            ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex flex-col px-5 py-8 border-r border-slate-100 shadow-sm`}>

            <button onClick={() => onClose?.()} className="lg:hidden absolute top-4 right-4 text-slate-400 hover:text-rose-500">
                <Lucide.XCircle size={22} />
            </button>

            <div className="mb-10 px-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                    <Lucide.Cpu size={18} />
                </div>
                <span className="text-xl font-black text-slate-800 tracking-tighter italic uppercase">Sentinel</span>
            </div>

            <nav className="flex-1 space-y-1.5 overflow-y-auto pr-2 custom-scrollbar">
                {menuItems.filter(item => item.show).map((item, idx) => (
                    <NavLink
                        key={idx}
                        to={item.path}
                        onClick={() => onClose?.()}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm
                            ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`
                        }
                    >
                        {item.icon} <span className="uppercase tracking-tight">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-50">
                <button onClick={handleLogout} className="...">
                    <Lucide.LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-black uppercase italic">Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;