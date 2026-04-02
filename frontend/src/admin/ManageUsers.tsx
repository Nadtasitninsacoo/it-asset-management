import { useState, useEffect } from 'react';
import api from '../utils/api';
import * as Lucide from 'lucide-react';
import { notify } from '../utils/swal';
import Pagination from '../components/Pagination';

type User = {
    id: number;
    username: string;
    name: string;
    department: string;
    role: string;
    createdAt: string;
};

const ROLES = ["ADMIN", "USER"];
const DEPARTMENTS = ["IT", "HR", "Accounting", "Operations", "Management"];

const ManageUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchUsers = async (page = 1) => {
        try {
            const response = await api.get(`/users?page=${page}`);
            let sortedData: User[] = [];
            const data = response.data.data || response.data;

            if (Array.isArray(data)) {
                sortedData = data;
                if (response.data.meta?.lastPage) {
                    setTotalPages(response.data.meta.lastPage);
                }
            }

            const prioritizedUsers = [...sortedData].sort((a, b) => {
                if (a.role === 'ADMIN' && b.role !== 'ADMIN') return -1;
                if (a.role !== 'ADMIN' && b.role === 'ADMIN') return 1;
                return 0;
            });

            setUsers(prioritizedUsers);
        } catch (error) {
            console.error("Fetch Error:", error);
            setUsers([]);
        }
    };

    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            if (currentUser) {
                await api.patch(`/users/${currentUser.id}`, data);
            } else {
                await api.post('/users', data);
            }

            notify.success('สำเร็จ', 'บันทึกข้อมูลเรียบร้อย');
            setIsModalOpen(false);
            fetchUsers(currentPage);
        } catch (error: any) {
            notify.error('ผิดพลาด', error.response?.data?.message || 'Username นี้อาจถูกใช้งานไปแล้ว');
        }
    };

    const handleDelete = async (id: number) => {
        const confirm = await notify.confirm('กวาดล้างผู้ใช้?', 'ยืนยันการลบออกจากระบบ?');
        if (!confirm) return;
        try {
            await api.delete(`/users/${id}`);
            notify.success('กำจัดสำเร็จ', 'ลบผู้ใช้งานเรียบร้อย');
            fetchUsers(currentPage);
        } catch (error) {
            notify.error('ล้มเหลว', 'ไม่สามารถลบผู้ดูแลระบบหลักได้');
        }
    };

    return (
        <div className="p-4 md:p-8 lg:p-10 bg-gray-50 min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h3 className="text-xl md:text-2xl font-black text-gray-800 uppercase tracking-tight leading-none">Personnel Management</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">หน่วยควบคุมสิทธิ์และบุคลากร</p>
                </div>
                <button
                    onClick={() => {
                        setCurrentUser(null);
                        setIsModalOpen(true);
                    }}
                    className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group active:scale-95"
                >
                    <Lucide.UserPlus size={18} />
                    <span className="text-sm tracking-wide uppercase">เพิ่มบุคลากร</span>
                </button>
            </div>

            <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
                {/* 🚩 ระบบเลื่อนตารางแนวนอนสำหรับมือถือ */}
                <div className="overflow-x-auto">
                    <table className="w-full text-xs min-w-[750px]">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400">
                                <th className="p-5 text-left font-bold uppercase text-[9px] tracking-widest">Profile</th>
                                <th className="p-5 text-left font-bold uppercase text-[9px] tracking-widest">Username</th>
                                <th className="p-5 text-left font-bold uppercase text-[9px] tracking-widest">Department</th>
                                <th className="p-5 text-left font-bold uppercase text-[9px] tracking-widest">Role</th>
                                <th className="p-5 font-bold uppercase text-[9px] tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-50">
                            {users.length > 0 ? (
                                users.map(user => (
                                    <tr key={user.id} className="hover:bg-indigo-50/20 transition group">
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-gradient-to-tr from-indigo-100 to-white rounded-xl flex items-center justify-center text-indigo-600 font-black text-xs shadow-sm border border-indigo-50">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-bold text-slate-700 text-sm">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-slate-500 font-medium">@{user.username}</td>
                                        <td className="p-5">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-tighter">
                                                {user.department}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border
                                                ${user.role === 'ADMIN' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setCurrentUser(user);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="p-2 bg-yellow-50 text-yellow-600 rounded-xl hover:bg-yellow-500 hover:text-white transition-all shadow-sm"
                                                >
                                                    <Lucide.Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                >
                                                    <Lucide.Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-24 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-20">
                                            <Lucide.Users size={48} className="text-slate-400" />
                                            <p className="font-black uppercase text-xs tracking-[0.3em] text-slate-400">No Personnel Found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 bg-gray-50/30 border-t border-gray-100">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                </div>
            </div>

            {/* 🚩 Modal ปรับแต่งความกว้างสำหรับมือถือ */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-300">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                            <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">
                                {currentUser ? '📝 Edit Profile' : '👑 New Admin'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-rose-500 transition-colors">
                                <Lucide.XCircle size={28} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black text-indigo-400 uppercase mb-2 ml-1 tracking-[0.2em]">Personnel Identity</label>
                                    <input name="name" placeholder="Full Name" defaultValue={currentUser?.name} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-sm transition-all" required />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-indigo-400 uppercase mb-2 ml-1 tracking-[0.2em]">Username</label>
                                        <input name="username" placeholder="@username" defaultValue={currentUser?.username} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-sm transition-all" required />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-indigo-400 uppercase mb-2 ml-1 tracking-[0.2em]">Auth Secret</label>
                                        <input name="password" type="password" placeholder={currentUser ? "••••••" : "Password"} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-sm transition-all" required={!currentUser} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-indigo-400 uppercase mb-2 ml-1 tracking-[0.2em]">Department</label>
                                        <select name="department" defaultValue={currentUser?.department || 'IT'} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-xs appearance-none">
                                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-indigo-400 uppercase mb-2 ml-1 tracking-[0.2em]">System Role</label>
                                        <select name="role" defaultValue={currentUser?.role || 'USER'} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-xs appearance-none">
                                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="w-full py-5 mt-2 bg-slate-900 text-white text-xs font-black rounded-2xl hover:bg-indigo-600 shadow-xl shadow-slate-100 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
                                <Lucide.ShieldCheck size={18} /> บันทึกข้อมูลบุคลากร
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;