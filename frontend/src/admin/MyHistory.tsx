import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
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
            const token = localStorage.getItem('access_token');
            const response = await axios.get(`http://localhost:3000/borrow-requests/all?page=${page}&limit=6`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data?.data) {
                setRequests(response.data.data);
                setTotalPages(response.data.meta?.lastPage || 1);
                setCurrentPage(page);
            } else {
                setRequests(Array.isArray(response.data) ? response.data : []);
                setTotalPages(1);
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
        const confirm = await notify.confirm(
            'COMMAND AUTHORIZATION',
            `ยืนยันการดำเนินการ ${status} สำหรับ ${assetName}?`
        );
        if (!confirm) return;

        try {
            const token = localStorage.getItem('access_token');
            const url = status === 'RETURNED'
                ? `http://localhost:3000/borrow-requests/${id}/return`
                : `http://localhost:3000/borrow-requests/${id}`;

            await axios.patch(url,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            notify.success('UPDATED', `บันทึกสถานะ ${status} เรียบร้อย`);
            fetchRequests(currentPage);
        } catch (error: any) {
            notify.error('DENIED', error.response?.data?.message || 'Forbidden resource');
        }
    };

    const handlePermanentDelete = async (id: number, assetName: string) => {
        const confirm = await notify.confirm(
            '⚠️ WARNING: PERMANENT DESTROY',
            `ท่านจอมพลยืนยันจะทำลายข้อมูล "${assetName}" ทิ้งถาวรหรือไม่? (ไม่สามารถกู้คืนได้)`
        );
        if (!confirm) return;

        try {
            const token = localStorage.getItem('access_token');
            await axios.delete(`http://localhost:3000/borrow-requests/${id}/permanent`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            notify.success('DESTROYED', 'ข้อมูลถูกทำลายถาวรเรียบร้อยแล้ว');
            fetchRequests(currentPage);
        } catch (error: any) {
            notify.error('ERROR', error.response?.data?.message || 'การทำลายข้อมูลล้มเหลว');
        }
    };

    return (
        <div className="p-6 lg:p-10 bg-[#fafafa] min-h-screen font-sans text-slate-900 relative">
            {loading && (
                <div className="fixed inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                        <span className="text-[10px] font-black text-indigo-600 tracking-[0.3em] uppercase">Syncing...</span>
                    </div>
                </div>
            )}

            <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter italic uppercase text-slate-900">
                        <span className="text-gray-400">Surveillance</span> <span>Logs</span>
                    </h2>
                    <p className="text-[10px] font-black text-slate-400 tracking-[0.3em] mt-1 uppercase">Real-time Asset Tracking System</p>
                </div>
                <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-6 text-slate-900 text-center">
                    <div className="border-r border-slate-100 pr-6">
                        <div className="text-xl font-black">{requests.filter(r => r.status === 'PENDING').length}</div>
                        <div className="text-[8px] font-black text-amber-500 uppercase">Pending</div>
                    </div>
                    <div>
                        <div className="text-xl font-black">{requests.filter(r => r.status === 'APPROVED').length}</div>
                        <div className="text-[8px] font-black text-indigo-500 uppercase">Deployed</div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400">
                                <th className="p-4 text-left text-[9px] font-bold uppercase tracking-wider">Personnel</th>
                                <th className="p-4 text-left text-[9px] font-bold uppercase tracking-wider">Asset</th>
                                <th className="p-4 text-center text-[9px] font-bold uppercase tracking-wider">Timeline</th>
                                <th className="p-4 text-center text-[9px] font-bold uppercase tracking-wider">Status</th>
                                <th className="p-4 text-center text-[9px] font-bold uppercase tracking-wider">Cmd</th>
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
                                        <tr key={req.id} className="hover:bg-slate-50/30 transition group text-slate-900">
                                            <td className="p-4">
                                                <div className="font-bold text-[11px] uppercase">{req.user?.name || 'Unknown'}</div>
                                                <div className="text-[9px] text-slate-400 font-medium uppercase">{req.user?.department || 'Sector N/A'}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-indigo-600 text-[11px] uppercase">{req.asset?.name}</div>
                                                <div className="text-[9px] font-mono text-slate-400 font-bold tracking-tight">SN: {req.asset?.serialNumber}</div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="text-[10px] font-bold text-slate-600">{new Date(req.createdAt).toLocaleDateString()}</div>
                                                <Lucide.ArrowDown size={10} className="mx-auto my-0.5 text-slate-300" />
                                                <div className="text-[10px] font-bold text-rose-500">{new Date(req.expectedReturn).toLocaleDateString()}</div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${req.status === 'APPROVED' ? 'bg-indigo-50 text-indigo-600 border-indigo-100 animate-pulse' :
                                                    req.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                        req.status === 'RETURNED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                            req.status === 'DELETE' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-400'
                                                    }`}>
                                                    {req.status === 'APPROVED' ? 'ยืมใช้งานอยู่' : req.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-center gap-1.5">
                                                    {isAdmin && (
                                                        <div className="flex items-center gap-1.5">
                                                            {req.status === 'DELETE' ? (
                                                                <button onClick={() => handlePermanentDelete(req.id, req.asset.name)} className="p-2 bg-rose-600 text-white rounded-xl hover:bg-rose-800 transition shadow-lg animate-bounce">
                                                                    <Lucide.Skull size={14} />
                                                                </button>
                                                            ) : (
                                                                <button onClick={() => handleAction(req.id, 'DELETE', req.asset.name)} className="p-2 text-slate-300 hover:text-rose-600 transition">
                                                                    <Lucide.Trash2 size={14} />
                                                                </button>
                                                            )}
                                                            {req.status === 'PENDING' && (
                                                                <>
                                                                    <button onClick={() => handleAction(req.id, 'APPROVED', req.asset.name)} className="p-2 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 shadow-lg active:scale-90 transition">
                                                                        <Lucide.ShieldCheck size={14} />
                                                                    </button>
                                                                    <button onClick={() => handleAction(req.id, 'REJECTED', req.asset.name)} className="p-2 bg-white text-rose-500 border border-rose-100 rounded-xl hover:bg-rose-50 active:scale-90 transition">
                                                                        <Lucide.ShieldX size={14} />
                                                                    </button>
                                                                </>
                                                            )}
                                                            {req.status === 'APPROVED' && (
                                                                <button onClick={() => handleAction(req.id, 'RETURNED', req.asset.name)} className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-black text-[9px] uppercase hover:bg-emerald-600 shadow-lg flex items-center gap-1.5 active:scale-95 transition-all">
                                                                    <Lucide.RotateCcw size={12} /> RECV
                                                                </button>
                                                            )}
                                                            {req.status === 'RETURNED' && <Lucide.CheckCircle2 size={16} className="text-emerald-500" />}
                                                        </div>
                                                    )}
                                                    {!isAdmin && req.status === 'APPROVED' && (
                                                        <button onClick={() => handleAction(req.id, 'RETURNED', req.asset.name)} className="px-4 py-2 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-emerald-600 shadow-lg flex items-center gap-1.5 active:scale-95 transition-all">
                                                            <Lucide.RotateCcw size={12} /> คืนอุปกรณ์
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ));
                                } else {
                                    return !loading && (
                                        <tr>
                                            <td colSpan={5} className="p-24 text-center">
                                                <Lucide.DatabaseZap size={40} className="mx-auto text-slate-200 mb-3" />
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">No Data Found</p>
                                            </td>
                                        </tr>
                                    );
                                }
                            })()}
                        </tbody>
                    </table>
                </div>
                <div className="p-5 bg-slate-50/50 border-t border-slate-100">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(p) => fetchRequests(p)}
                    />
                </div>
            </div>
        </div>
    );
};

export default ManageRequests;