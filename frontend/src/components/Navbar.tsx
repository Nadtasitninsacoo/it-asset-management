// src/components/Navbar.tsx
import { useState, useEffect } from 'react';
import { LayoutDashboard, Package, ClipboardCheck, RefreshCcw, LogOut, Menu, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';

type User = {
    name: string;
    role: string;
};

const Navbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [userData, setUserData] = useState<User | null>(null);

    // โหลด user จาก localStorage
    useEffect(() => {
        const raw = localStorage.getItem('user');
        if (raw) {
            try {
                const parsed = JSON.parse(raw) as User;
                setUserData({
                    ...parsed,
                    role: parsed.role?.trim().toUpperCase() || 'USER',
                });
            } catch {
                setUserData({ name: 'Guest', role: 'USER' });
            }
        } else {
            setUserData({ name: 'Guest', role: 'USER' });
        }
    }, []);

    // เมนูหลัก
    const menuItems = [
        { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/admin-dashboard', adminOnly: true },
        { icon: <ClipboardCheck size={18} />, label: 'Requests', path: '/manage-requests', adminOnly: true },
        { icon: <Package size={18} />, label: 'Borrow', path: '/borrow-assets', adminOnly: false },
        { icon: <RefreshCcw size={18} />, label: 'History', path: '/my-history', adminOnly: false },
    ];

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    if (!userData) return null;

    return (
        <nav className="bg-white border-b border-slate-100 sticky top-0 z-[100] w-full shadow-sm">
            {/* Navbar header */}
            <div className="h-16 px-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* ปุ่มเปิด dropdown สำหรับมือถือ */}
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
                    >
                        {isDropdownOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <span className="font-black text-slate-800 tracking-tighter uppercase italic">Sentinel</span>
                </div>

                {/* แสดงชื่อและยศ */}
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-800 leading-none">{userData.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">{userData.role}</p>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-100 ring-2 ring-white">
                        {userData.name.charAt(0).toUpperCase()}
                    </div>
                </div>
            </div>

            {/* Mobile dropdown */}
            <div
                className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white border-t border-slate-50
                    ${isDropdownOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
            >
                <div className="p-4 space-y-2">
                    {menuItems
                        .filter(item => !item.adminOnly || userData.role === 'ADMIN') // คุมสิทธิ์ Admin
                        .map((item, idx) => (
                            <NavLink
                                key={idx}
                                to={item.path}
                                onClick={() => setIsDropdownOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-sm transition-all ${isActive ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                                    }`
                                }
                            >
                                {item.icon} {item.label}
                            </NavLink>
                        ))}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-4 py-3 w-full rounded-xl font-bold text-sm text-rose-500 hover:bg-rose-50 transition-colors mt-2 border-t border-slate-50 pt-4"
                    >
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;