import { useState } from 'react';
import {
    Bell,
    Menu,
    X,
    LayoutDashboard,
    Package,
    ClipboardCheck,
    RefreshCcw,
    LogOut
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

interface NavbarProps {
    onMenuClick?: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();

    const userRaw = localStorage.getItem('user');
    const userData = userRaw ? JSON.parse(userRaw) : { name: 'Guest', role: 'USER' };

    const menuItems = [
        { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/admin-dashboard', adminOnly: true },
        { icon: <ClipboardCheck size={18} />, label: 'Requests', path: '/manage-requests', adminOnly: true },
        { icon: <Package size={18} />, label: 'Borrow', path: '/borrow-assets', adminOnly: false },
        { icon: <RefreshCcw size={18} />, label: 'History', path: '/my-history', adminOnly: false },
    ];

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <nav className="bg-white border-b border-slate-100 sticky top-0 z-[100] w-full">
            <div className="h-16 px-6 flex items-center justify-between">
                <div className="flex items-center gap-4">

                    {/* ✅ ปุ่มนี้ใช้ onMenuClick */}
                    <button
                        onClick={() => {
                            if (onMenuClick) {
                                onMenuClick(); // 👉 เปิด sidebar
                            } else {
                                setIsDropdownOpen(!isDropdownOpen); // fallback
                            }
                        }}
                        className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                        {isDropdownOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <span className="font-black text-slate-800 lg:hidden tracking-tighter">
                        SENTINEL
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <button className="p-2.5 text-slate-400 hover:text-indigo-600 transition-colors">
                        <Bell size={20} />
                    </button>

                    <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-800 leading-none">
                                {userData.name}
                            </p>
                            <p className="text-[10px] text-slate-400 uppercase mt-1">
                                {userData.role}
                            </p>
                        </div>

                        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100">
                            {userData.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>

            {/* dropdown mobile */}
            <div className={`
                lg:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white border-t border-slate-50
                ${isDropdownOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
            `}>
                <div className="p-4 space-y-2">
                    {menuItems.map((item, idx) => (
                        (!item.adminOnly || userData.role === 'ADMIN') && (
                            <NavLink
                                key={idx}
                                to={item.path}
                                onClick={() => setIsDropdownOpen(false)}
                                className={({ isActive }) => `
                                    flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-sm transition-all
                                    ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}
                                `}
                            >
                                {item.icon} {item.label}
                            </NavLink>
                        )
                    ))}

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-4 py-3 w-full rounded-xl font-bold text-sm text-rose-500 hover:bg-rose-50 transition-colors"
                    >
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;