import { useState, useCallback, useEffect, useMemo } from 'react';
import api from '../utils/api';
import * as Lucide from 'lucide-react';
import { notify } from '../utils/swal';
import Pagination from '../components/Pagination';

type BorrowRequest = {
    id: number;
    userId: number;
    assetId: number;
    createdAt: string;
    expectedReturn: string;
    actualReturn: string | null;
    purpose: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED' | 'DELETE';
    user: { name: string; department: string };
    asset: { name: string; serialNumber: string };
};

const ManageRequests = () => {
    const [requests, setRequests] = useState<BorrowRequest[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    // 🚩 1. สกัดข้อมูล User ป้องกัน Crash และดึงสิทธิ์ Admin
    const userData = useMemo(() => {
        const session = localStorage.getItem('user');
        try {
            return session ? JSON.parse(session) : {};
        } catch {
            return {};
        }
    }, []);

    const isAdmin = userData.role === 'ADMIN';

    // 🚩 2. ระบบดึงข้อมูล Intel
    const fetchRequests = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get(`/borrow-requests/all?page=${page}&limit=6`);
            if (response.data?.data) {
                setRequests(response.data.data);
                setTotalPages(response.data.meta?.lastPage || 1);
                setCurrentPage(page);
            }
        } catch (error) {
            notify.error('ผิดพลาด', 'การเชื่อมต่อฐานข้อมูลล้มเหลว');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests(currentPage);
    }, [currentPage, fetchRequests]);

    // 🚩 3. กรองรายการที่เหมาะสมกับผู้ใช้ (ย้ายออกจาก JSX เพื่อความคลีน)
    const visibleRequests = useMemo(() => {
        return requests.filter(req => isAdmin || req.userId === userData.id);
    }, [requests, isAdmin, userData.id]);

    // 🚩 4. ยุทธการเปลี่ยนสถานะ
    const handleAction = async (id: number, status: string, assetName: string) => {
        const confirm = await notify.confirm('ยืนยันยุทธการ', `เปลี่ยนสถานะเป็น ${status} สำหรับ ${assetName}?`);
        if (!confirm) return;
        try {
            const endpoint = status === 'RETURNED' ? `/borrow-requests/${id}/return` : `/borrow-requests/${id}`;
            await api.patch(endpoint, { status });
            notify.success('สำเร็จ', `อัปเดตสถานะ ${status} เรียบร้อย`);
            fetchRequests(currentPage);
        } catch (error: any) {
            notify.error('ล้มเหลว', error.response?.data?.message || 'การสื่อสารขัดข้อง');
        }
    };

    // 🚩 5. ยุทธการลบถาวร (แก้เส้นแดงเรียบร้อย)
    const handlePermanentDelete = async (id: number, assetName: string) => {
        const confirm = await notify.confirm('⚠️ ลบถาวร', `ทำลายข้อมูล "${assetName}" ทิ้งถาวรหรือไม่?`);
        if (!confirm) return;
        try {
            await api.delete(`/borrow-requests/${id}/permanent`);
            notify.success('สำเร็จ', 'ข้อมูลถูกทำลายสิ้นซาก');
            fetchRequests(currentPage);
        } catch (error: any) {
            notify.error('ผิดพลาด', 'ไม่สามารถเข้าถึงคำสั่งทำลายได้');
        }
    };

    return (
        <div className="p-4 md:p-8 lg:p-10 bg-[#fafafa] min-h-screen font-sans text-slate-900">
            <header className="max-w-7xl mx-auto mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                <div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic">
                        <span className="text-slate-300">Surveillance</span> <span>Logs</span>
                    </h2>
                    <p className="text-xs font-bold text-indigo-500 tracking-widest mt-2 uppercase">Personnel Activity Intel</p>
                </div>
            </header>

            <div className="max-w-7xl mx-auto">
                {/* 💻 Desktop View (Table) - ซ่อนในมือถือ */}
                <div className="hidden md:block bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[900px]">
                            <thead className="bg-slate-50/50 border-b border-slate-100 uppercase text-[10px] font-black text-slate-400 tracking-widest">
                                <tr>
                                    <th className="p-6">Personnel</th>
                                    <th className="p-6">Asset Intelligence</th>
                                    <th className="p-6 text-center">Timeline</th>
                                    <th className="p-6 text-center">Status</th>
                                    <th className="p-6 text-center">Command</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {visibleRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-6">
                                            <div className="font-black text-xs uppercase text-slate-800">{req.user?.name}</div>
                                            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">{req.user?.department}</div>
                                        </td>
                                        <td className="p-6">
                                            <div className="font-black text-xs text-slate-700 uppercase">{req.asset?.name}</div>
                                            <div className="text-[10px] font-bold text-slate-400">SN: {req.asset?.serialNumber}</div>
                                        </td>
                                        <td className="p-6 text-center text-xs font-bold text-slate-500 italic">
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${req.status === 'APPROVED' ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="flex justify-center gap-2">
                                                {isAdmin && (
                                                    <>
                                                        {req.status === 'PENDING' ? (
                                                            <div className="flex gap-2">
                                                                <button onClick={() => handleAction(req.id, 'APPROVED', req.asset.name)} className="p-2 bg-slate-900 text-white rounded-xl hover:bg-indigo-600"><Lucide.Check size={16} /></button>
                                                                <button onClick={() => handleAction(req.id, 'REJECTED', req.asset.name)} className="p-2 bg-white border border-rose-100 text-rose-500 rounded-xl hover:bg-rose-50"><Lucide.X size={16} /></button>
                                                            </div>
                                                        ) : (
                                                            <button onClick={() => handlePermanentDelete(req.id, req.asset.name)} className="p-2 text-slate-300 hover:text-rose-500"><Lucide.Trash2 size={16} /></button>
                                                        )}
                                                    </>
                                                )}
                                                {req.status === 'APPROVED' && (
                                                    <button onClick={() => handleAction(req.id, 'RETURNED', req.asset.name)} className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase">Finalize</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 📱 Mobile View (Cards) - แสดงเฉพาะมือถือ */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {visibleRequests.map((req) => (
                        <div key={req.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="flex justify-between items-center mb-4">
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black">
                                    {req.user?.name.charAt(0).toUpperCase()}
                                </div>
                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${req.status === 'APPROVED' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    {req.status}
                                </span>
                            </div>
                            <h4 className="font-black text-slate-800 text-sm uppercase leading-tight mb-1">{req.asset?.name}</h4>
                            <p className="text-[10px] font-bold text-slate-400 mb-4 uppercase">SN: {req.asset?.serialNumber}</p>

                            <div className="flex items-center gap-2 mb-6">
                                <Lucide.User size={12} className="text-indigo-400" />
                                <span className="text-xs font-bold text-slate-600">{req.user?.name}</span>
                            </div>

                            <div className="flex gap-2 border-t border-slate-50 pt-4">
                                {isAdmin && req.status === 'PENDING' ? (
                                    <>
                                        <button onClick={() => handleAction(req.id, 'APPROVED', req.asset.name)} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase">Approve</button>
                                        <button onClick={() => handleAction(req.id, 'REJECTED', req.asset.name)} className="flex-1 py-3 bg-rose-50 text-rose-500 rounded-xl font-black text-[10px] uppercase">Deny</button>
                                    </>
                                ) : req.status === 'APPROVED' ? (
                                    <button onClick={() => handleAction(req.id, 'RETURNED', req.asset.name)} className="w-full py-4 bg-emerald-500 text-white rounded-xl font-black text-xs uppercase shadow-lg shadow-emerald-100">Finalize Return</button>
                                ) : (
                                    <div className="flex-1 flex gap-2">
                                        <div className="flex-1 py-3 bg-slate-50 text-slate-300 rounded-xl text-center text-[10px] font-bold uppercase italic border border-slate-100">Log Finalized</div>
                                        {isAdmin && (
                                            <button onClick={() => handlePermanentDelete(req.id, req.asset.name)} className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center border border-rose-100"><Lucide.Trash2 size={18} /></button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* 🚩 6. Empty State */}
                {!loading && visibleRequests.length === 0 && (
                    <div className="bg-white rounded-[2.5rem] py-20 border border-dashed border-slate-200 flex flex-col items-center">
                        <Lucide.DatabaseZap size={48} className="text-slate-100 mb-4" />
                        <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Intelligence Data Empty</p>
                    </div>
                )}

                <div className="mt-10">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={fetchRequests} />
                </div>
            </div>
        </div>
    );
};

export default ManageRequests;