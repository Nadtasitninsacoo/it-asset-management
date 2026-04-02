// src/components/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import * as Lucide from 'lucide-react';

type User = {
    name: string;
    role: string;
};

interface SidebarProps {
    isOpen: boolean;
    onClose?: () => void;
    userData: User | null; // <-- ต้องมี userData
}

const Sidebar = ({ isOpen, onClose, userData }: SidebarProps) => {
    if (!userData) return null; // รอโหลด user

    const menuItems = [
        { icon: <Lucide.LayoutDashboard size={18} />, label: 'Dashboard', path: '/admin-dashboard', adminOnly: true },
        { icon: <Lucide.ClipboardCheck size={18} />, label: 'Manage Requests', path: '/manage-requests', adminOnly: true },
        { icon: <Lucide.Package size={18} />, label: 'Borrow Asset', path: '/borrow-assets', adminOnly: false },
        { icon: <Lucide.RefreshCcw size={18} />, label: 'History', path: '/my-history', adminOnly: false },
    ];

    return (
        <aside
            className={`fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static flex flex-col px-5 py-8 border-r border-slate-100`}
        >
            <button
                onClick={() => onClose?.()}
                className="lg:hidden absolute top-4 right-4 text-slate-400 hover:text-rose-500 transition-colors"
            >
                <Lucide.X size={22} />
            </button>

            <nav className="flex-1 mt-4 space-y-2">
                {menuItems
                    .filter(item => !item.adminOnly || userData.role === 'ADMIN')
                    .map((item, idx) => (
                        <NavLink
                            key={idx}
                            to={item.path}
                            onClick={() => onClose?.()}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'
                                }`
                            }
                        >
                            {item.icon} {item.label}
                        </NavLink>
                    ))}
            </nav>
        </aside>
    );
};

export default Sidebar;