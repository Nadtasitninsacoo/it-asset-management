import { NavLink } from 'react-router-dom';
import * as Lucide from 'lucide-react';

type User = { name: string; role: string };

interface SidebarProps {
    isOpen: boolean;
    onClose?: () => void;
    userData: User | null;
}

const Sidebar = ({ isOpen, onClose, userData }: SidebarProps) => {
    const userRole = userData?.role?.trim().toUpperCase() || 'USER';

    const menuItems = [
        { icon: <Lucide.LayoutDashboard size={18} />, label: 'Dashboard', path: '/admin-dashboard', show: userRole !== 'ADMIN' }, // ❌ Admin ไม่เห็น
        { icon: <Lucide.ClipboardCheck size={18} />, label: 'Manage Requests', path: '/manage-requests', show: userRole !== 'ADMIN' }, // ❌ Admin ไม่เห็น
        { icon: <Lucide.Settings size={18} />, label: 'Assets Control', path: '/manage-assets', show: userRole === 'ADMIN' },
        { icon: <Lucide.Users size={18} />, label: 'Personnel', path: '/manage-users', show: userRole === 'ADMIN' },
        { icon: <Lucide.Package size={18} />, label: 'Borrow Asset', path: '/borrow-assets', show: true },
        { icon: <Lucide.History size={18} />, label: 'Borrow History', path: '/my-history', show: true },
    ];

    return (
        <aside
            className={`fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:static lg:flex
                flex flex-col px-5 py-8 border-r border-slate-100
            `}
        >
            <button onClick={() => onClose?.()} className="lg:hidden absolute top-4 right-4 text-slate-400 hover:text-rose-500">
                <Lucide.XCircle size={22} />
            </button>

            <nav className="flex-1 space-y-1.5 overflow-y-auto pr-2">
                {menuItems.filter(item => item.show).map((item, idx) => (
                    <NavLink
                        key={idx}
                        to={item.path}
                        onClick={() => onClose?.()}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                            ${isActive
                                ? 'bg-indigo-600 text-white shadow-xl'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`
                        }
                    >
                        {item.icon}
                        <span className="text-sm uppercase tracking-tight">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;