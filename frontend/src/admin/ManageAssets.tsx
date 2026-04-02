import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import * as Lucide from 'lucide-react';
import { notify } from '../utils/swal';
import Pagination from '../components/Pagination';

type Role = 'ADMIN' | 'USER';

type User = {
    id: number;
    username: string;
    name: string;
    department: string;
    role: Role;
    createdAt: string;
};

const ROLES: Role[] = ["ADMIN", "USER"];
const DEPARTMENTS = ["IT", "HR", "Accounting", "Operations", "Management"];

const ManageUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const fetchUsers = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get(`/users?page=${page}`);
            const raw = response.data;
            const data: User[] = Array.isArray(raw) ? raw : Array.isArray(raw.data) ? raw.data : [];

            setTotalPages(raw.meta?.lastPage || 1);

            const prioritizedUsers = [...data].sort((a, b) => {
                if (a.role === 'ADMIN' && b.role !== 'ADMIN') return -1;
                if (a.role !== 'ADMIN' && b.role === 'ADMIN') return 1;
                return 0;
            });

            setUsers(prioritizedUsers);
        } catch (error) {
            notify.error('ผิดพลาด', 'โหลดข้อมูลบุคลากรล้มเหลว');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage, fetchUsers]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data: any = Object.fromEntries(formData.entries());

        if (currentUser && !data.password) delete data.password;

        try {
            if (currentUser) {
                await api.patch(`/users/${currentUser.id}`, data);
            } else {
                await api.post('/users', data);
            }
            notify.success('สำเร็จ', 'บันทึกข้อมูลเรียบร้อย');
            setIsModalOpen(false);
            setCurrentUser(null);
            fetchUsers(currentPage);
        } catch (error: any) {
            notify.error('ผิดพลาด', error.response?.data?.message || 'Username อาจถูกใช้งานแล้ว');
        }
    };

    const handleDelete = async (id: number) => {
        const confirm = await notify.confirm('กวาดล้างบุคลากร?', 'ยืนยันการลบออกจากระบบ?');
        if (!confirm) return;
        try {
            await api.delete(`/users/${id}`);
            notify.success('สำเร็จ', 'ลบผู้ใช้ออกจากระบบแล้ว');
            if (users.length === 1 && currentPage > 1) {
                setCurrentPage(prev => prev - 1);
            } else {
                fetchUsers(currentPage);
            }
        } catch (error) {
            notify.error('ล้มเหลว', 'ไม่สามารถลบผู้ดูแลระบบหลักได้');
        }
    };

    return (
        <div className="p-4 md:p-8 lg:p-10 bg-slate-50 min-h-screen font-sans">
            {/* 🛡️ HEADER SECTION */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 max-w-7xl mx-auto">
                <div>
                    <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none">Personnel</h3>
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.3em] mt-2">Manage System Authorities</p>
                </div>
                <button
                    onClick={() => { setCurrentUser(null); setIsModalOpen(true); }}
                    className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 active:scale-95 group"
                >
                    <Lucide.UserPlus size={20} className="group-hover:rotate-12 transition-transform" />
                    <span className="text-xs uppercase tracking-widest">Add Personnel</span>
                </button>
            </div>

            <div className="max-w-7xl mx-auto">
                {/* 🌀 LOADING & EMPTY STATE */}
                {loading ? (
                    <div className="bg-white rounded-[2rem] border border-slate-100 p-20 text-center">
                        <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Synchronizing Data...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="bg-white rounded-[2rem] border border-dashed border-slate-200 p-20 text-center flex flex-col items-center gap-3">
                        <Lucide.Users size={48} className="text-slate-200" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Intelligence Found</p>
                    </div>
                ) : (
                    <>
                        {/* 💻 DESKTOP TABLE */}
                        <div className="hidden md:block bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 border-b border-slate-100">
                                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <th className="p-6">Identity</th>
                                        <th className="p-6">Department</th>
                                        <th className="p-6">System Role</th>
                                        <th className="p-6 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {users.map(user => (
                                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black text-xs border border-indigo-100">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-700 text-sm">{user.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium tracking-tight">@{user.username}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6 text-xs font-bold text-slate-500 uppercase tracking-wider">{user.department}</td>
                                            <td className="p-6">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm
                                                    ${user.role === 'ADMIN' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex justify-center gap-3">
                                                    <button onClick={() => { setCurrentUser(user); setIsModalOpen(true); }} className="p-2.5 bg-white border border-slate-100 text-slate-400 rounded-xl hover:text-yellow-600 hover:border-yellow-200 transition-all shadow-sm active:scale-90"><Lucide.Edit size={18} /></button>
                                                    <button onClick={() => handleDelete(user.id)} className="p-2.5 bg-white border border-slate-100 text-slate-400 rounded-xl hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm active:scale-90"><Lucide.Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* 📱 MOBILE CARDS */}
                        <div className="grid grid-cols-1 gap-4 md:hidden">
                            {users.map(user => (
                                <div key={user.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                                    <div className={`absolute top-0 left-0 w-1 h-full ${user.role === 'ADMIN' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-100">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-800 text-base">{user.name}</h4>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">@{user.username}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${user.role === 'ADMIN' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                            {user.role}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setCurrentUser(user); setIsModalOpen(true); }} className="flex-1 py-3.5 bg-slate-50 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-yellow-50 hover:text-yellow-600 transition-all active:scale-95 border border-slate-100">Edit</button>
                                        <button onClick={() => handleDelete(user.id)} className="w-14 py-3.5 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-100 active:scale-95 transition-all"><Lucide.Trash2 size={18} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                <div className="mt-10 py-6 border-t border-slate-100">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            </div>

            {/* 🛡️ MODAL SYSTEM */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
                    <div className="bg-white rounded-t-[2.5rem] sm:rounded-[3rem] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300 sm:zoom-in">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-sm z-10">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase">{currentUser ? 'Edit Identity' : 'Authorize User'}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Intelligence Database Update</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-300 hover:text-rose-500 transition-all border border-slate-100">
                                <Lucide.X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6 mb-4">
                            <div className="space-y-4">
                                <div className="group">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest group-focus-within:text-indigo-500 transition-colors">Personnel Name</label>
                                    <input name="name" placeholder="Full identity..." defaultValue={currentUser?.name} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-sm transition-all" required />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Username</label>
                                        <input name="username" placeholder="Login ID" defaultValue={currentUser?.username} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-sm transition-all" required />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Secret Key</label>
                                        <input name="password" type="password" placeholder={currentUser ? "Keep secret" : "Security code"} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-sm transition-all" required={!currentUser} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Sector</label>
                                        <div className="relative">
                                            <select name="department" defaultValue={currentUser?.department || 'IT'} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-xs appearance-none focus:border-indigo-500 transition-all">
                                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                            <Lucide.ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">System Level</label>
                                        <div className="relative">
                                            <select name="role" defaultValue={currentUser?.role || 'USER'} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-xs appearance-none focus:border-indigo-500 transition-all">
                                                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                            <Lucide.ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="w-full py-5 bg-slate-900 text-white text-xs font-black rounded-3xl hover:bg-indigo-600 shadow-2xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] active:scale-95">
                                <Lucide.ShieldCheck size={20} /> Authorize Deployment
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;