import { useState, useEffect } from 'react';
import { LayoutDashboard, Package, ClipboardCheck, RefreshCcw, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

interface NavbarProps {
    onMenuClick?: () => void;
}

type User = {
    name: string;
    role: string;
};

const Navbar = ({ onMenuClick }: NavbarProps) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [userData, setUserData] = useState<User | null>(null); // ❌ ใช้ null ก่อนโหลด
    const navigate = useNavigate();

    useEffect(() => {
        const raw = localStorage.getItem('user');
        if (raw) {
            try {
                const parsed = JSON.parse(raw) as User;
                setUserData(parsed);
            } catch {
                setUserData({ name: 'Guest', role: 'USER' });
            }
        } else {
            setUserData({ name: 'Guest', role: 'USER' });
        }
    }, []);

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

    // ⛔ ถ้า userData ยัง null ให้ return null (ไม่ render menu)
    if (!userData) return null;

    return (
        <nav className="bg-white border-b border-slate-100 sticky top-0 z-[100] w-full">
            <div className="h-16 px-6 flex items-center justify-between">
                <button onClick={() => onMenuClick?.()}>
                    Menu
                </button>
                <div>{userData.name}</div>
            </div>

            {/* dropdown mobile */}
            <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white border-t border-slate-50
                ${isDropdownOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-4 space-y-2">
                    {menuItems.map((item, idx) => (
                        (!item.adminOnly || userData.role.toUpperCase() === 'ADMIN') && (
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