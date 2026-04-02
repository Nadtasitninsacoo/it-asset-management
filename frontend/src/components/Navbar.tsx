import { useState, useEffect } from 'react';
import { LayoutDashboard, Package, ClipboardCheck, RefreshCcw, Menu, X, LogOut, Settings, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { notify } from '../utils/swal';

type User = { name: string; role: string };

const Navbar = ({ onMenuClick }: { onMenuClick?: () => void }) => {
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
                    {/* ปุ่ม Hamburger สำหรับเปิด Sidebar จริงๆ (ถ้า MainLayout ตั้งไว้) */}
                    <button onClick={onMenuClick} className="lg:hidden p-2 text-slate-600">
                        <Menu size={24} />
                    </button>
                    <span className="font-black text-slate-800 tracking-tighter uppercase italic">Sentinel</span>
                </div>

                <div className="flex items-center gap-3">
                    {/* ปุ่มแสดง Dropdown เมนูบนมือถือ */}
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="lg:hidden p-2 text-indigo-600">
                        {isDropdownOpen ? <X size={24} /> : <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center"><Users size={18} /></div>}
                    </button>

                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-800 leading-none">{userData.name}</p>
                        <p className="text-[10px] text-indigo-600 font-black uppercase mt-1 tracking-wider">{userData.role}</p>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            <div className={`lg:hidden transition-all duration-300 ease-in-out bg-white border-t border-slate-50 overflow-hidden ${isDropdownOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-4 space-y-1">
                    {isAdmin && (
                        <>
                            <NavLink to="/admin-dashboard" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-600 font-bold hover:bg-slate-50"><LayoutDashboard size={18} /> Dashboard</NavLink>
                            <NavLink to="/manage-requests" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-600 font-bold hover:bg-slate-50"><ClipboardCheck size={18} /> Manage Requests</NavLink>
                            {/* 🛡️ ติดตั้งปุ่มที่หายไปในมือถือเรียบร้อย! */}
                            <NavLink to="/manage-assets" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-600 font-bold hover:bg-slate-50"><Settings size={18} /> Assets Control</NavLink>
                            <NavLink to="/manage-users" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-600 font-bold hover:bg-slate-50"><Users size={18} /> Personnel</NavLink>
                        </>
                    )}
                    <NavLink to="/borrow-assets" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-600 font-bold hover:bg-slate-50"><Package size={18} /> Borrow Asset</NavLink>
                    <NavLink to="/my-history" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-600 font-bold hover:bg-slate-50"><RefreshCcw size={18} /> History</NavLink>

                    <button onClick={handleLogout} className="flex items-center gap-4 px-4 py-3 w-full rounded-xl font-bold text-rose-500 border-t mt-2 pt-4">
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;