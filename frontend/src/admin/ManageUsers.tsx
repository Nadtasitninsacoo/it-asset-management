import { useState, useEffect } from 'react';
import axios from 'axios';
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
            const response = await axios.get(`http://localhost:3000/users?page=${page}`);
            let sortedData: User[] = [];

            if (response.data.meta?.page && response.data.meta.page !== currentPage) {
                setCurrentPage(response.data.meta.page);
            } else if (Array.isArray(response.data)) {
                sortedData = response.data;
                setTotalPages(1);
            }

            const prioritizedUsers = [...sortedData].sort((a, b) => {
                if (a.role === 'ADMIN' && b.role !== 'ADMIN') return -1;
                if (a.role !== 'ADMIN' && b.role === 'ADMIN') return 1;
                return 0;
            });

            setUsers(prioritizedUsers);

        } catch (error) {
            console.error("Fetch and Sort Error:", error);
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
            const url = currentUser ? `http://localhost:3000/users/${currentUser.id}` : 'http://localhost:3000/users';
            const method = currentUser ? 'patch' : 'post';

            await axios({ method, url, data });

            notify.success('สำเร็จ', 'บันทึกข้อมูลผู้ใช้เรียบร้อยแล้ว');
            setIsModalOpen(false);
            fetchUsers(currentPage);
        } catch (error) {
            notify.error('ผิดพลาด', 'Username นี้อาจถูกใช้งานไปแล้ว');
        }
    };

    const handleDelete = async (id: number) => {
        const confirm = await notify.confirm('กวาดล้างผู้ใช้?', 'ท่านต้องการลบผู้ใช้งานท่านนี้ออกจากระบบใช่หรือไม่?');
        if (!confirm) return;
        try {
            await axios.delete(`http://localhost:3000/users/${id}`);
            notify.success('กำจัดสำเร็จ', 'ลบผู้ใช้งานเรียบร้อย');
            fetchUsers(currentPage);
        } catch (error) {
            notify.error('ล้มเหลว', 'ไม่สามารถลบผู้ดูแลระบบหลักได้');
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Personnel Management</h3>
                </div>
                <button
                    onClick={() => {
                        setCurrentUser(null);
                        setIsModalOpen(true);
                    }}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2 group active:scale-95"
                >
                    <Lucide.UserPlus size={18} className="group-hover:translate-y-[-2px] transition-transform" />
                    <span className="text-sm tracking-wide">เพิ่มบุคลากรใหม่</span>
                </button>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="bg-gray-100/40 border-b border-gray-100">
                            <th className="p-2 font-bold text-gray-400 uppercase text-[9px] tracking-wider">Profile</th>
                            <th className="p-2 font-bold text-gray-400 uppercase text-[9px] tracking-wider">Username</th>
                            <th className="p-2 font-bold text-gray-400 uppercase text-[9px] tracking-wider">Department</th>
                            <th className="p-2 font-bold text-gray-400 uppercase text-[9px] tracking-wider">Role</th>
                            <th className="p-2 font-bold text-gray-400 uppercase text-[9px] tracking-wider text-center">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-50">
                        {users.length > 0 ? (
                            users.map(user => (
                                <tr key={user.id} className="hover:bg-indigo-50/20 transition group">
                                    <td className="p-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-100 to-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-black text-[11px]">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-semibold text-slate-700 text-[11px]">{user.name}</span>
                                        </div>
                                    </td>

                                    <td className="p-2 text-slate-500 text-[11px]">@{user.username}</td>

                                    <td className="p-2">
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[9px] font-bold uppercase">
                                            {user.department}
                                        </span>
                                    </td>

                                    <td className="p-2">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase
                            ${user.role === 'ADMIN'
                                                ? 'bg-rose-100 text-rose-600'
                                                : 'bg-emerald-100 text-emerald-600'}`}>
                                            {user.role}
                                        </span>
                                    </td>

                                    <td className="p-2 text-center flex justify-center gap-1">
                                        <button
                                            onClick={() => {
                                                setCurrentUser(user);
                                                setIsModalOpen(true);
                                            }}
                                            className="bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-md text-[9px] font-bold hover:bg-yellow-200 transition uppercase"
                                        >
                                            EDIT
                                        </button>

                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="bg-red-100 text-red-600 px-2 py-0.5 rounded-md text-[9px] font-bold hover:bg-red-200 transition uppercase"
                                        >
                                            DELETE
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-10 text-center">
                                    <div className="flex flex-col items-center gap-2 opacity-20">
                                        <Lucide.Users size={32} />
                                        <p className="font-bold uppercase text-[10px] tracking-wider">No Personnel</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className="p-2">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">

                        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
                            <h3 className="text-lg font-black text-slate-800 tracking-tight">
                                {currentUser ? '📝 EDIT PROFILE' : '👑 NEW ADMIN'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-rose-500 transition-colors">
                                <Lucide.XCircle size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-7 space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[9px] font-black text-indigo-400 uppercase mb-1.5 ml-1 tracking-widest">Full Name</label>
                                    <input name="name" defaultValue={currentUser?.name} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold text-sm transition-all" required />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[9px] font-black text-indigo-400 uppercase mb-1.5 ml-1 tracking-widest">Username</label>
                                        <input name="username" defaultValue={currentUser?.username} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold text-sm transition-all" required />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-indigo-400 uppercase mb-1.5 ml-1 tracking-widest">Password</label>
                                        <input name="password" type="password" placeholder={currentUser ? "••••••" : ""} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold text-sm transition-all" required={!currentUser} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[9px] font-black text-indigo-400 uppercase mb-1.5 ml-1 tracking-widest">Department</label>
                                        <select name="department" defaultValue={currentUser?.department || 'IT'} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold text-xs appearance-none">
                                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-indigo-400 uppercase mb-1.5 ml-1 tracking-widest">System Role</label>
                                        <select name="role" defaultValue={currentUser?.role || 'USER'} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold text-xs appearance-none">
                                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="w-full py-3.5 mt-2 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-indigo-600 shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
                                <Lucide.ShieldCheck size={16} /> บันทึกข้อมูล
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;