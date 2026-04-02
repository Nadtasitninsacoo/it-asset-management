import { useState, useCallback, useEffect } from 'react';
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
            console.error("Fetch Error", error);
            setRequests([]);
        } finally {
            setTimeout(() => setLoading(false), 500);
        }
    }, []);

    useEffect(() => {
        fetchRequests(currentPage);
    }, [currentPage, fetchRequests]);

    const handleAction = async (id: number, status: string, assetName: string) => {
        const confirm = await notify.confirm('ยืนยันยุทธการ', `เปลี่ยนสถานะเป็น ${status} สำหรับ ${assetName}?`);
        if (!confirm) return;
        try {
            const endpoint = status === 'RETURNED' ? `/borrow-requests/${id}/return` : `/borrow-requests/${id}`;
            await api.patch(endpoint, { status });
            notify.success('สำเร็จ', `อัปเดตสถานะเป็น ${status} เรียบร้อย`);
            fetchRequests(currentPage);
        } catch (error: any) {
            notify.error('ล้มเหลว', error.response?.data?.message || 'ไม่สามารถทำรายการได้');
        }
    };

    const handlePermanentDelete = async (id: number) => {
        const confirm = await notify.confirm('⚠️ ยืนยันลบถาวร', 'ข้อมูลนี้จะหายไปตลอดกาล! (Hard Delete)');
        if (!confirm) return;
        try {
            await api.delete(`/borrow-requests/${id}/permanent`);
            notify.success('สำเร็จ', 'ทำลายข้อมูลสิ้นซากแล้ว');
            fetchRequests(currentPage);
        } catch (error: any) {
            notify.error('ล้มเหลว', error.response?.data?.message || 'ไม่สามารถลบได้');
        }
    };

    return (
        <div className="p-4 md:p-10 bg-[#fafafa] min-h-screen font-sans text-slate-900 relative">
            {loading && (
                <div className="fixed inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                        <span className="text-[10px] font-black text-indigo-600 tracking-[0.3em] uppercase">Syncing...</span>
                    </div>
                </div>
            )}

            <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic uppercase text-slate-900 leading-none">
                        <span className="text-gray-400">Surveillance</span> <span>Logs</span>
                    </h2>
                    <p className="text-[10px] font-black text-slate-400 tracking-[0.3em] mt-2 uppercase">Real-time Asset Tracking</p>
                </div>
            </header>

            <div className="max-w-7xl mx-auto bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-xs min-w-[850px]">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400">
                                <th className="p-5 text-left text-[9px] font-bold uppercase tracking-widest">Personnel</th>
                                <th className="p-5 text-left text-[9px] font-bold uppercase tracking-widest">Asset Intelligence</th>
                                <th className="p-5 text-center text-[9px] font-bold uppercase tracking-widest">Timeline</th>
                                <th className="p-5 text-center text-[9px] font-bold uppercase tracking-widest">Status</th>
                                <th className="p-5 text-center text-[9px] font-bold uppercase tracking-widest">Command</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-slate-900">
                            {(() => {
                                const userSession = localStorage.getItem('user');
                                const userData = userSession ? JSON.parse(userSession) : {};
                                const isAdmin = userData.role === 'ADMIN';
                                const visibleRequests = requests.filter(req => isAdmin || req.userId === userData.id);

                                if (visibleRequests.length > 0) {
                                    return visibleRequests.map((req) => (
                                        <tr key={req.id} className="hover:bg-slate-50/30 transition group">
                                            <td className="p-5">
                                                <div className="font-black text-xs uppercase text-slate-800">{req.user?.name}</div>
                                                <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">{req.user?.department}</div>
                                            </td>
                                            <td className="p-5">
                                                <div className="font-black text-xs text-slate-700 uppercase">{req.asset?.name}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">SN: {req.asset?.serialNumber}</div>
                                            </td>
                                            <td className="p-5 text-center">
                                                <div className="text-[10px] font-bold text-slate-600">{new Date(req.createdAt).toLocaleDateString()}</div>
                                                <Lucide.ArrowDown size={10} className="mx-auto my-0.5 text-slate-300" />
                                                <div className="text-[10px] font-bold text-rose-500">{new Date(req.expectedReturn).toLocaleDateString()}</div>
                                            </td>
                                            <td className="p-5 text-center">
                                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${req.status === 'APPROVED' ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="p-6 text-center">
                                                <div className="flex justify-center items-center gap-2">
                                                    {isAdmin && (
                                                        <>
                                                            {/* 🚩 ถ้าสถานะเป็น DELETE หรือ REJECTED ให้ลบถาวรได้ */}
                                                            {(req.status === 'DELETE' || req.status === 'REJECTED') ? (
                                                                <button
                                                                    onClick={() => handlePermanentDelete(req.id)}
                                                                    className="px-4 py-2 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-rose-800 transition-all shadow-lg animate-pulse"
                                                                >
                                                                    Kill Data
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleAction(req.id, 'DELETE', req.asset.name)}
                                                                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                                                >
                                                                    <Lucide.Trash2 size={16} />
                                                                </button>
                                                            )}

                                                            {req.status === 'PENDING' && (
                                                                <div className="flex gap-2 ml-2">
                                                                    <button onClick={() => handleAction(req.id, 'APPROVED', req.asset.name)} className="p-2 bg-slate-900 text-white rounded-xl hover:bg-indigo-600"><Lucide.Check size={16} /></button>
                                                                    <button onClick={() => handleAction(req.id, 'REJECTED', req.asset.name)} className="p-2 bg-white border border-rose-100 text-rose-500 rounded-xl hover:bg-rose-50"><Lucide.X size={16} /></button>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                    {req.status === 'APPROVED' && (
                                                        <button onClick={() => handleAction(req.id, 'RETURNED', req.asset.name)} className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase">Finalize</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ));
                                } else {
                                    return !loading && (
                                        <tr>
                                            <td colSpan={5} className="p-32 text-center">
                                                <Lucide.DatabaseZap size={56} className="text-slate-100 mx-auto mb-4" />
                                                <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Intelligence Data Empty</p>
                                            </td>
                                        </tr>
                                    );
                                }
                            })()}
                        </tbody>
                    </table>
                </div>
                <div className="p-8 bg-slate-50/50 border-t border-slate-100">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={fetchRequests} />
                </div>
            </div>
        </div>
    );
};

export default ManageRequests;