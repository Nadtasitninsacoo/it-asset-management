import { useState, useEffect } from 'react';
import { LayoutDashboard, Package, ClipboardCheck, RefreshCcw, Menu, X, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { notify } from '../utils/swal';

type User = { name: string; role: string };

const Navbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [userData, setUserData] = useState<User | null>(null);

    useEffect(() => {
        const raw = localStorage.getItem('user');
        if (raw) {
            try {
                const parsed = JSON.parse(raw) as User;
                setUserData({ ...parsed, role: parsed.role?.trim().toUpperCase() || 'USER' });
            } catch { setUserData({ name: 'Guest', role: 'USER' }); }
        }
    }, []);

    const handleLogout = async () => {
        const confirm = await notify.confirm('Sign Out', 'คุณต้องการออกจากระบบใช่หรือไม่?');
        if (confirm) {
            localStorage.clear();
            window.location.href = '/login';
        }
    };

    if (!userData) return null;

    const isAdmin = userData.role === 'ADMIN';

    return (
        <nav className="bg-white border-b border-slate-100 sticky top-0 z-[100] w-full shadow-sm">
            <div className="h-16 px-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="lg:hidden p-2 text-slate-600">
                        {isDropdownOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <span className="font-black text-slate-800 tracking-tighter uppercase italic">Sentinel</span>
                </div>

                {/* ✅ กู้คืนข้อมูลชื่อผู้ใช้บน Navbar */}
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-800 leading-none">{userData.name}</p>
                        <p className="text-[10px] text-indigo-600 font-black uppercase mt-1 tracking-wider">{userData.role}</p>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-black shadow-lg">
                        {userData.name.charAt(0).toUpperCase()}
                    </div>
                </div>
            </div>

            {/* Mobile dropdown */}
            <div className={`lg:hidden transition-all duration-300 ease-in-out bg-white border-t border-slate-50 ${isDropdownOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                <div className="p-4 space-y-1">
                    {/* ✅ แก้ไข Logic: Admin ต้องเห็น Dashboard และ Requests */}
                    {isAdmin && (
                        <>
                            <NavLink to="/admin-dashboard" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-600 font-bold"><LayoutDashboard size={18} /> Dashboard</NavLink>
                            <NavLink to="/manage-requests" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-600 font-bold"><ClipboardCheck size={18} /> Manage Requests</NavLink>
                        </>
                    )}
                    <NavLink to="/borrow-assets" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-600 font-bold"><Package size={18} /> Borrow Asset</NavLink>
                    <NavLink to="/my-history" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-600 font-bold"><RefreshCcw size={18} /> History</NavLink>

                    <button onClick={handleLogout} className="flex items-center gap-4 px-4 py-3 w-full rounded-xl font-bold text-rose-500 border-t mt-2 pt-4">
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;