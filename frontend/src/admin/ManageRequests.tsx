import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import * as Lucide from 'lucide-react';
import { notify } from '../utils/swal';
import Pagination from '../components/Pagination';

type BorrowRequest = {
    id: number;
    userId: number;
    assetId: number;
    borrowDate: string;
    expectedReturn: string;
    actualReturn: string | null;
    purpose: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED';
    user: { name: string };
    asset: { name: string; serialNumber: string };
};

const ManageRequests = () => {
    const [requests, setRequests] = useState<BorrowRequest[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    const fetchRequests = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');
            const response = await axios.get(`http://localhost:3000/borrow-requests/all?page=${page}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data?.data) {
                setRequests(response.data.data);
                setTotalPages(response.data.meta?.lastPage || 1);
            } else {
                setRequests(Array.isArray(response.data) ? response.data : []);
            }
        } catch (error) {
            console.error("❌ ภารกิจดึงข้อมูลล้มเหลว");
            setRequests([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests(currentPage);
    }, [currentPage, fetchRequests]);

    const handleUpdateStatus = async (id: number, status: string) => {
        const confirm = await notify.confirm(
            'ยืนยันการดำเนินการ?',
            `ท่านต้องการเปลี่ยนสถานะเป็น ${status} ใช่หรือไม่?`
        );
        if (!confirm) return;

        try {
            const token = localStorage.getItem('access_token');
            await axios.patch(`http://localhost:3000/borrow-requests/${id}`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            notify.success('สำเร็จ', `อัปเดตสถานะเป็น ${status} เรียบร้อย`);
            fetchRequests(currentPage);
        } catch (error: any) {
            notify.error('ผิดพลาด', error.response?.data?.message || 'ไม่สามารถเปลี่ยนสถานะได้');
        }
    };

    const pendingCount = requests.filter(r => r.status === 'PENDING').length;
    const activeCount = requests.filter(r => r.status === 'APPROVED').length;

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans">
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter italic">
                        Surveillance <span className="text-indigo-600">Logs</span>
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 tracking-[0.3em] mt-1 uppercase">Asset Command & Control</p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                        <div className="relative">
                            <Lucide.Bell size={20} className="text-amber-500" />
                            {pendingCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                                    {pendingCount}
                                </span>
                            )}
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase leading-none">Pending</div>
                            <div className="text-lg font-black text-slate-700">{pendingCount}</div>
                        </div>
                    </div>

                    <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                        <Lucide.PackageCheck size={20} className="text-indigo-500" />
                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase leading-none">Deployed</div>
                            <div className="text-lg font-black text-slate-700">{activeCount}</div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="p-4 text-left font-bold text-slate-400 uppercase text-[9px] tracking-widest">Personnel</th>
                                <th className="p-4 text-left font-bold text-slate-400 uppercase text-[9px] tracking-widest">Asset Details</th>
                                <th className="p-4 text-left font-bold text-slate-400 uppercase text-[9px] tracking-widest">Timeline</th>
                                <th className="p-4 text-center font-bold text-slate-400 uppercase text-[9px] tracking-widest">Status</th>
                                <th className="p-4 text-center font-bold text-slate-400 uppercase text-[9px] tracking-widest">Authorize</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest animate-pulse">Syncing Intel...</td>
                                </tr>
                            ) : requests.length > 0 ? (
                                requests.map(req => (
                                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-4">
                                            <div className="font-bold text-slate-700 text-[12px] uppercase">{req.user?.name || 'Unknown'}</div>
                                            <div className="text-[9px] text-slate-400 font-black tracking-wider uppercase">ID: {req.userId}</div>
                                        </td>

                                        <td className="p-4">
                                            <div className="font-bold text-indigo-600 text-[12px] uppercase">{req.asset?.name || 'N/A'}</div>
                                            <div className="text-[9px] text-slate-400 font-mono font-bold">SN: {req.asset?.serialNumber}</div>
                                        </td>

                                        <td className="p-4">
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                                                    <span className="w-8 text-slate-300">OUT</span>
                                                    {new Date(req.borrowDate).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-rose-500">
                                                    <span className="w-8 text-rose-200">IN</span>
                                                    {new Date(req.expectedReturn).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border
                                                ${req.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse' :
                                                    req.status === 'APPROVED' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                                        req.status === 'RETURNED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                            'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                                {req.status}
                                            </span>
                                        </td>

                                        <td className="p-4">
                                            <div className="flex justify-center gap-2">
                                                {req.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                                                            className="p-2 bg-slate-900 text-white rounded-xl hover:bg-emerald-500 transition-all shadow-lg active:scale-90"
                                                            title="Authorize"
                                                        >
                                                            <Lucide.Check size={14} strokeWidth={3} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                                                            className="p-2 bg-white text-rose-500 border border-rose-100 rounded-xl hover:bg-rose-50 transition-all active:scale-90"
                                                            title="Deny"
                                                        >
                                                            <Lucide.X size={14} strokeWidth={3} />
                                                        </button>
                                                    </>
                                                )}

                                                {req.status === 'APPROVED' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(req.id, 'RETURNED')}
                                                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                                                    >
                                                        <Lucide.RotateCcw size={12} /> Receive
                                                    </button>
                                                )}

                                                {req.status === 'RETURNED' && (
                                                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100">
                                                        <Lucide.ShieldCheck size={18} />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center italic text-slate-300 font-bold uppercase tracking-[0.5em]">No Intelligence Found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 bg-slate-50/50 border-t border-slate-100">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(p) => setCurrentPage(p)}
                    />
                </div>
            </div>
        </div>
    );
};

export default ManageRequests;