import { useState } from 'react';
import { LayoutDashboard, Package, ClipboardCheck, RefreshCcw, Menu, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';

type User = { name: string; role: string };

const Navbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [userData, setUserData] = useState<User | null>(null);

    // โหลด user จาก localStorage
    useState(() => {
        const raw = localStorage.getItem('user');
        if (raw) {
            try {
                const parsed = JSON.parse(raw) as User;
                setUserData({ ...parsed, role: parsed.role?.trim().toUpperCase() || 'USER' });
            } catch { setUserData({ name: 'Guest', role: 'USER' }); }
        } else setUserData({ name: 'Guest', role: 'USER' });
    });

    if (!userData) return null;

    const menuItems = [
        { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/admin-dashboard', adminOnly: false },
        { icon: <ClipboardCheck size={18} />, label: 'Manage Requests', path: '/manage-requests', adminOnly: false },
        { icon: <Package size={18} />, label: 'Borrow', path: '/borrow-assets', adminOnly: false },
        { icon: <RefreshCcw size={18} />, label: 'History', path: '/my-history', adminOnly: false },
    ];

    return (
        <nav className="bg-white border-b border-slate-100 sticky top-0 z-[100] w-full">
            <div className="h-16 px-6 flex items-center justify-between">
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="lg:hidden p-2">
                    {isDropdownOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <span className="font-black text-slate-800 tracking-tighter uppercase italic">Sentinel</span>
            </div>

            {/* Mobile dropdown */}
            <div className={`lg:hidden transition-all ${isDropdownOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                <div className="p-4 space-y-2">
                    {menuItems
                        .filter(item => userData.role !== 'ADMIN' || !['Manage Requests', 'Dashboard'].includes(item.label)) // ❌ Admin กรอง
                        .map((item, idx) => (
                            <NavLink key={idx} to={item.path} onClick={() => setIsDropdownOpen(false)}>
                                <div className="flex items-center gap-4 px-4 py-3 rounded-xl">{item.icon}{item.label}</div>
                            </NavLink>
                        ))}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;