import { NavLink } from 'react-router-dom';
import * as Lucide from 'lucide-react';
import { notify } from '../utils/swal'; // ⚔️ อย่าลืม import ตัวแจ้งเตือน

// ... interface SidebarProps เหมือนเดิม ...

const Sidebar = ({ isOpen, onClose, userData }: SidebarProps) => {
    if (!userData) return null;

    const menuItems = [
        { icon: <Lucide.LayoutDashboard size={18} />, label: 'Dashboard', path: '/admin-dashboard', adminOnly: true },
        { icon: <Lucide.ClipboardCheck size={18} />, label: 'Manage Requests', path: '/manage-requests', adminOnly: true },
        { icon: <Lucide.Package size={18} />, label: 'Borrow Asset', path: '/borrow-assets', adminOnly: false },
        { icon: <Lucide.RefreshCcw size={18} />, label: 'History', path: '/my-history', adminOnly: false },
    ];

    // 🚩 ฟังก์ชันออกจากระบบ
    const handleLogout = async () => {
        const confirm = await notify.confirm('Sign Out', 'คุณต้องการออกจากระบบใช่หรือไม่?');
        if (confirm) {
            localStorage.clear();
            window.location.href = '/login';
        }
    };

    return (
        <aside
            className={`fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static flex flex-col px-5 py-8 border-r border-slate-100`}
        >
            {/* ปุ่มปิดสำหรับมือถือ */}
            <button
                onClick={() => onClose?.()}
                className="lg:hidden absolute top-4 right-4 text-slate-400 hover:text-rose-500 transition-colors"
            >
                <Lucide.X size={22} />
            </button>

            {/* โลโก้ระบบ */}
            <div className="mb-10 px-4">
                <span className="text-xl font-black text-slate-800 italic uppercase">SENTINEL</span>
            </div>

            {/* รายการเมนู */}
            <nav className="flex-1 space-y-2">
                {menuItems
                    .filter(item => !item.adminOnly || userData.role === 'ADMIN')
                    .map((item, idx) => (
                        <NavLink
                            key={idx}
                            to={item.path}
                            onClick={() => onClose?.()}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
                                }`
                            }
                        >
                            {item.icon} <span className="text-sm font-bold uppercase">{item.label}</span>
                        </NavLink>
                    ))}
            </nav>

            {/* 🚩 ส่วนล่าง: ปุ่มออกจากระบบ (ที่หายไป) */}
            <div className="mt-auto pt-6 border-t border-slate-50">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all group"
                >
                    <Lucide.LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-black uppercase italic">Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;