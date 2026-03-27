import { Bell, ChevronDown, Menu } from 'lucide-react';
import { notify } from '../utils/swal';

const Navbar = () => {
    const userRaw = localStorage.getItem('user');
    const userData = userRaw ? JSON.parse(userRaw) : { name: 'Guest', role: 'USER' };

    const handleProfileClick = () => {
        notify.success('Account Settings', 'กำลังเข้าสู่โหมดการจัดการบัญชีผู้ใช้งาน');
    };

    const handleNotificationClick = () => {
        notify.success('Notifications', 'คุณมีรายการอุปกรณ์ที่ใกล้ครบกำหนดคืน 2 รายการ');
    };

    return (
        <nav className="h-16 border-b border-slate-100 px-6 md:px-10 flex items-center justify-between bg-white/70 backdrop-blur-xl sticky top-0 z-50 w-full transition-all duration-300">
            {/* Left side */}
            <div className="flex items-center gap-6 flex-1">
                <button className="md:hidden p-2 text-slate-400">
                    <Menu size={20} />
                </button>
            </div>

            <div className="flex items-center gap-4 md:gap-7">
                <button onClick={handleNotificationClick} className="relative p-2.5 text-slate-400 hover:text-indigo-600 transition-all">
                    <Bell size={20} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="flex items-center gap-4 pl-6 border-l border-slate-100 group select-none">
                    <div onClick={handleProfileClick} className="flex items-center gap-3 cursor-pointer">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-bold text-slate-800">{userData.name}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-semibold">{userData.role}</p>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 overflow-hidden shadow-sm border border-slate-50">
                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=6366f1&color=fff`}
                                alt="Avatar"
                            />
                        </div>
                    </div>
                    <ChevronDown size={14} className="text-slate-400" />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;