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
        <div className="p-4 md:p-8 lg:p-10 bg-gray-50 min-h-screen font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                <div>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none">Personnel</h3>
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] mt-2">Manage System Authorities</p>
                </div>
                <button
                    onClick={() => {
                        setCurrentUser(null);
                        setIsModalOpen(true);
                    }}
                    /* 🚩 ปรับปุ่มให้ Mobile Friendly: text-xs และ py-4 */
                    className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-2xl shadow-slate-200 hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 active:scale-95 group"
                >
                    <Lucide.UserPlus size={20} className="group-hover:rotate-12 transition-transform" />
                    <span className="text-xs tracking-widest uppercase">Add Personnel</span>
                </button>
            </div>

            <div className="space-y-4">
                <div className="hidden md:block bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Profile</th>
                                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Identify</th>
                                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Affiliation</th>
                                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-6">
                                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black border border-indigo-100 shadow-sm">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <p className="font-bold text-slate-700 text-sm">{user.name}</p>
                                        <p className="text-xs text-slate-400 font-medium">@{user.username}</p>
                                    </td>
                                    <td className="p-6">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-black uppercase tracking-tighter">
                                            {user.department}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border shadow-sm
                                            ${user.role === 'ADMIN' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex justify-center gap-3">
                                            <button onClick={() => { setCurrentUser(user); setIsModalOpen(true); }} className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-yellow-600 hover:border-yellow-200 transition-all shadow-sm">
                                                <Lucide.Edit size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(user.id)} className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm">
                                                <Lucide.Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {users.map(user => (
                        <div key={user.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-100">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-800 text-base">{user.name}</h4>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">@{user.username}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                    <p className="text-xs font-black text-slate-400 uppercase mb-1">Department</p>
                                    <p className="text-xs font-bold text-slate-700">{user.department}</p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                    <p className="text-xs font-black text-slate-400 uppercase mb-1">Status</p>
                                    <p className={`text-xs font-black ${user.role === 'ADMIN' ? 'text-rose-600' : 'text-emerald-600'}`}>{user.role}</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button onClick={() => { setCurrentUser(user); setIsModalOpen(true); }} className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-yellow-50 hover:text-yellow-600 transition-all border border-slate-100">
                                    Edit Identity
                                </button>
                                <button onClick={() => handleDelete(user.id)} className="w-14 py-4 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-100 transition-colors">
                                    <Lucide.Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 🚩 ภารกิจลับ: Empty State กันโดนแอดมินถาม */}
                {users.length === 0 && (
                    <div className="bg-white rounded-[2rem] border border-dashed border-slate-200 py-20 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                            <Lucide.Users size={40} />
                        </div>
                        <h4 className="text-slate-400 text-xs font-black uppercase tracking-[0.3em]">Intelligence Briefing</h4>
                        <p className="text-slate-300 text-[10px] font-bold uppercase mt-2">No personnel data found in current sectors</p>
                    </div>
                )}
            </div>

            <div className="mt-10 py-6 border-t border-slate-100">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                />
            </div>

            {/* 🚩 แก้ไขจุดยุทธศาสตร์: Modal กันล้นจอด้วย max-h-[90vh] และ overflow-y-auto */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
                    <div className="bg-white rounded-t-[2.5rem] sm:rounded-[3rem] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300 sm:zoom-in custom-scrollbar">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10 backdrop-blur-md">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase leading-none">
                                    {currentUser ? 'Edit Profile' : 'Authorize User'}
                                </h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Personnel Intelligence</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-slate-300 hover:text-rose-500 shadow-sm border border-slate-100 transition-colors">
                                <Lucide.X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Full Name</label>
                                    <input name="name" placeholder="Full identity..." defaultValue={currentUser?.name} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-sm transition-all" required />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Username</label>
                                        <input name="username" placeholder="Login ID" defaultValue={currentUser?.username} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-sm transition-all" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Auth Key</label>
                                        <input name="password" type="password" placeholder={currentUser ? "Keep secret" : "Security Code"} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-sm transition-all" required={!currentUser} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Department</label>
                                        <select name="department" defaultValue={currentUser?.department || 'IT'} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-xs appearance-none">
                                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">System Role</label>
                                        <select name="role" defaultValue={currentUser?.role || 'USER'} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-xs appearance-none">
                                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="w-full py-5 mt-4 bg-slate-900 text-white text-xs font-black rounded-2xl hover:bg-indigo-600 shadow-2xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em]">
                                <Lucide.ShieldCheck size={20} /> Authorize Data
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;