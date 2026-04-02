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
            'ยืนยันการดำเนินการ',
            `คุณต้องการเปลี่ยนสถานะเป็น ${status} สำหรับ ${assetName}?`
        );
        if (!confirm) return;

        try {
            const endpoint = status === 'RETURNED'
                ? `/borrow-requests/${id}/return`
                : `/borrow-requests/${id}`;

            await api.patch(endpoint, { status });

            notify.success('สำเร็จ', `อัปเดตสถานะเป็น ${status} เรียบร้อย`);
            fetchRequests(currentPage);
        } catch (error: any) {
            notify.error('ล้มเหลว', error.response?.data?.message || 'ไม่สามารถทำรายการได้');
        }
    };

    const handlePermanentDelete = async (id: number, assetName: string) => {
        const confirm = await notify.confirm(
            '⚠️ คำเตือน: ลบถาวร',
            `ยืนยันจะลบข้อมูล "${assetName}" ทิ้งถาวรหรือไม่? (กู้คืนไม่ได้)`
        );
        if (!confirm) return;

        try {
            await api.delete(`/borrow-requests/${id}/permanent`);
            notify.success('ลบสำเร็จ', 'ข้อมูลถูกลบออกจากระบบถาวรแล้ว');
            fetchRequests(currentPage);
        } catch (error: any) {
            notify.error('ผิดพลาด', error.response?.data?.message || 'การลบข้อมูลล้มเหลว');
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
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic uppercase text-slate-900">
                        <span className="text-gray-400">Surveillance</span> <span>Logs</span>
                    </h2>
                    <p className="text-[10px] font-black text-slate-400 tracking-[0.3em] mt-1 uppercase">Real-time Asset Tracking</p>
                </div>

                <div className="flex gap-4 self-end md:self-center">
                    <div className="bg-white px-4 md:px-6 py-2 md:py-3 rounded-2xl border border-slate-100 shadow-sm text-center">
                        <div className="text-lg md:text-xl font-black text-amber-500">{requests.filter(r => r.status === 'PENDING').length}</div>
                        <div className="text-[8px] font-black text-slate-400 uppercase">Pending</div>
                    </div>
                    <div className="bg-white px-4 md:px-6 py-2 md:py-3 rounded-2xl border border-slate-100 shadow-sm text-center">
                        <div className="text-lg md:text-xl font-black text-indigo-500">{requests.filter(r => r.status === 'APPROVED').length}</div>
                        <div className="text-[8px] font-black text-slate-400 uppercase">Deployed</div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
                {/* 🚩 ระบบเลื่อนตารางแนวนอนสำหรับมือถือ */}
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-xs min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400">
                                <th className="p-5 text-left text-[9px] font-bold uppercase tracking-wider">Personnel</th>
                                <th className="p-5 text-left text-[9px] font-bold uppercase tracking-wider">Asset</th>
                                <th className="p-5 text-center text-[9px] font-bold uppercase tracking-wider">Timeline</th>
                                <th className="p-5 text-center text-[9px] font-bold uppercase tracking-wider">Status</th>
                                <th className="p-5 text-center text-[9px] font-bold uppercase tracking-wider">Command</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {(() => {
                                const userSession = localStorage.getItem('user');
                                const userData = userSession ? JSON.parse(userSession) : {};
                                const isAdmin = userData.role === 'ADMIN';
                                const visibleRequests = requests.filter(req => isAdmin || req.userId === userData.id);

                                if (visibleRequests.length > 0) {
                                    return visibleRequests.map((req) => (
                                        <tr key={req.id} className="hover:bg-slate-50/30 transition-colors group">
                                            <td className="p-5">
                                                <div className="font-bold text-[11px] uppercase text-slate-700">{req.user?.name || 'ไม่ระบุชื่อ'}</div>
                                                <div className="text-[9px] text-slate-400 font-medium uppercase">{req.user?.department || 'ฝ่ายทั่วไป'}</div>
                                            </td>
                                            <td className="p-5">
                                                <div className="font-bold text-indigo-600 text-[11px] uppercase">{req.asset?.name}</div>
                                                <div className="text-[9px] font-mono text-slate-400 tracking-tighter uppercase">SN: {req.asset?.serialNumber}</div>
                                            </td>
                                            <td className="p-5 text-center">
                                                <div className="text-[10px] font-bold text-slate-600">{new Date(req.createdAt).toLocaleDateString()}</div>
                                                <Lucide.ArrowDown size={10} className="mx-auto my-0.5 text-slate-300" />
                                                <div className="text-[10px] font-bold text-rose-500">{new Date(req.expectedReturn).toLocaleDateString()}</div>
                                            </td>
                                            <td className="p-5 text-center">
                                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border tracking-wider
                                                    ${req.status === 'APPROVED' ? 'bg-indigo-50 text-indigo-600 border-indigo-100 animate-pulse' :
                                                        req.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                            req.status === 'RETURNED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                                    {req.status === 'APPROVED' ? 'กำลังยืมใช้งาน' :
                                                        req.status === 'PENDING' ? 'รออนุมัติ' :
                                                            req.status === 'RETURNED' ? 'คืนแล้ว' :
                                                                req.status === 'REJECTED' ? 'ไม่อนุมัติ' : req.status}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex justify-center gap-2">
                                                    {isAdmin && (
                                                        <div className="flex items-center gap-2">
                                                            {req.status === 'DELETE' ? (
                                                                <button onClick={() => handlePermanentDelete(req.id, req.asset.name)} className="px-3 py-1.5 bg-rose-600 text-white rounded-xl font-bold text-[10px] uppercase hover:bg-rose-800 transition flex items-center gap-1.5 shadow-lg shadow-rose-100">
                                                                    <Lucide.Skull size={12} /> ลบถาวร
                                                                </button>
                                                            ) : (
                                                                <button onClick={() => handleAction(req.id, 'DELETE', req.asset.name)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors" title="ย้ายไปถังขยะ">
                                                                    <Lucide.Trash2 size={16} />
                                                                </button>
                                                            )}
                                                            {req.status === 'PENDING' && (
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => handleAction(req.id, 'APPROVED', req.asset.name)} className="px-4 py-1.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase hover:bg-indigo-600 transition shadow-md flex items-center gap-1.5">
                                                                        <Lucide.CheckCircle size={12} /> อนุมัติ
                                                                    </button>
                                                                    <button onClick={() => handleAction(req.id, 'REJECTED', req.asset.name)} className="px-4 py-1.5 bg-white text-rose-500 border border-rose-100 rounded-xl font-black text-[10px] uppercase hover:bg-rose-50 transition flex items-center gap-1.5">
                                                                        <Lucide.XCircle size={12} /> ปฏิเสธ
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    {req.status === 'APPROVED' && (
                                                        <button onClick={() => handleAction(req.id, 'RETURNED', req.asset.name)} className="px-5 py-2 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase hover:bg-emerald-600 shadow-lg shadow-emerald-50 flex items-center gap-2 active:scale-95 transition-all">
                                                            <Lucide.RotateCcw size={13} /> รับคืนอุปกรณ์
                                                        </button>
                                                    )}
                                                    {req.status === 'RETURNED' && (
                                                        <div className="flex items-center gap-1.5 text-emerald-500 font-black text-[9px] uppercase bg-emerald-50 px-4 py-1.5 rounded-xl border border-emerald-100">
                                                            <Lucide.CheckCircle2 size={14} /> คืนสำเร็จ
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ));
                                } else {
                                    return !loading && (
                                        <tr>
                                            <td colSpan={5} className="p-24 text-center">
                                                <Lucide.DatabaseZap size={40} className="mx-auto text-slate-100 mb-3" />
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">ไม่พบข้อมูลในระบบ</p>
                                            </td>
                                        </tr>
                                    );
                                }
                            })()}
                        </tbody>
                    </table>
                </div>
                <div className="p-6 bg-slate-50/50 border-t border-slate-100">
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