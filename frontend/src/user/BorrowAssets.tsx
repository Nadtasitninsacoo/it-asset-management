import { useState, useEffect } from 'react';
import api from '../utils/api';
import Swal from 'sweetalert2';
import { Search, Package, ArrowRight, Filter, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { notify } from '../utils/swal';

type Asset = {
    id: number;
    name: string;
    serialNumber: string;
    category: string;
    status: string;
    image: string;
};

const BorrowAssets = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchAssets = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get(`/assets?page=${page}`);

            if (response.data?.data) {
                setAssets(response.data.data);
                setTotalPages(response.data.meta.lastPage);
                setCurrentPage(response.data.meta.page);
            } else {
                setAssets(response.data);
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            notify.error('ผิดพลาด', 'ไม่สามารถเชื่อมต่อคลังยุทโธปกรณ์ได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets(currentPage);
    }, [currentPage]);

    const filteredAssets = assets.filter(asset => {
        const keywords = searchQuery.toLowerCase().trim().split(' ');
        const name = asset.name?.toLowerCase() || '';
        const serial = asset.serialNumber?.toLowerCase() || '';
        const category = asset.category?.toLowerCase() || '';

        return keywords.every(word =>
            name.includes(word) || serial.includes(word) || category.includes(word)
        );
    });

    const handleBorrowRequest = async (asset: Asset) => {
        if (asset.status !== 'AVAILABLE') {
            return notify.error('ไม่ว่าง', 'อุปกรณ์นี้ถูกยืมอยู่');
        }

        const result = await Swal.fire({
            background: '#fff',
            html: `
        <div class="text-left">
            <div class="flex items-center gap-3 mb-5 pb-3 border-b border-slate-50">
                <div class="p-2.5 bg-indigo-50 rounded-2xl text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                </div>
                <span class="text-xl font-black text-slate-800">สร้างคำขอเบิกยืม</span>
            </div>

            <div class="mb-4 p-3.5 bg-slate-50 rounded-[1.5rem] border border-slate-100 flex items-center gap-4">
                <div class="w-11 h-11 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-500 border border-slate-50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
                    </svg>
                </div>
                <div>
                    <p class="text-[9px] font-black text-indigo-400 uppercase leading-none mb-1">อุปกรณ์</p>
                    <h4 class="text-sm font-bold text-slate-700 leading-tight">${asset.name}</h4>
                </div>
            </div>

            <div class="space-y-1.5 mb-4">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">เหตุผล (Purpose)</label>
                <textarea id="swal-purpose" class="w-full p-4 bg-white border border-slate-200 rounded-[1.2rem] text-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-300 outline-none min-h-[90px]" placeholder="ระบุวัตถุประสงค์..."></textarea>
            </div>

            <div class="space-y-1.5">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">วันที่คืน (Return Date)</label>
                <input type="date" id="swal-return" class="w-full p-4 bg-white border border-slate-200 rounded-[1.2rem] text-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-300 outline-none" min="${new Date().toISOString().split('T')[0]}">
            </div>
        </div>
        `,
            showCancelButton: true,
            confirmButtonText: 'ยืนยัน',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#4f46e5',
            preConfirm: () => {
                const purpose = (document.getElementById('swal-purpose') as HTMLTextAreaElement).value;
                const expectedReturn = (document.getElementById('swal-return') as HTMLInputElement).value;
                if (!purpose || !expectedReturn) return Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบ');
                return { purpose, expectedReturn };
            }
        });

        if (result.isConfirmed && result.value) {
            try {
                const userSession = localStorage.getItem('user');
                const userData = userSession ? JSON.parse(userSession) : null;

                if (!userData?.id) {
                    return notify.error('ผิดพลาด', 'ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
                }

                const isoDate = new Date(result.value.expectedReturn).toISOString();

                await api.post('/borrow-requests', {
                    assetId: Number(asset.id),
                    userId: Number(userData.id),
                    purpose: result.value.purpose,
                    expectedReturn: isoDate,
                });

                notify.success('สำเร็จ', 'ส่งคำขอเบิกยืมเรียบร้อยแล้ว');
                fetchAssets(currentPage);

            } catch (e: any) {
                console.error('BORROW ERROR:', e.response?.data || e);
                notify.error('ล้มเหลว', e.response?.data?.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
            }
        }
    };

    return (
        <div className="p-4 md:p-0 min-h-full font-sans text-slate-900">
            <header className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Central warehouse</h3>
                    <p className="text-slate-400 text-xs md:text-sm font-bold mt-2 uppercase tracking-widest">คลังพัสดุสำหรับเบิกยืมอุปกรณ์</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                    <div className="relative group w-full sm:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="ค้นหาอุปกรณ์..."
                            className="w-full bg-white border border-slate-100 pl-12 pr-6 py-3.5 rounded-2xl text-sm focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50/50 outline-none shadow-sm transition-all font-bold"
                        />
                    </div>
                    <button className="hidden sm:flex p-3.5 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                        <Filter size={20} />
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="flex flex-col justify-center items-center h-64 gap-4 text-slate-300 font-black uppercase tracking-[0.3em] animate-pulse">
                    <Loader2 size={40} className="animate-spin text-indigo-500" />
                    <span className="text-[10px]">Scanning Inventory...</span>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                        {filteredAssets.map((asset) => (
                            <div key={asset.id} className="bg-white rounded-[2.5rem] border border-slate-50 p-5 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 group relative flex flex-col h-full">
                                <div className="absolute top-5 right-5 z-10">
                                    <span
                                        className={`text-[9px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${asset.status === 'AVAILABLE'
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50'
                                            : 'bg-rose-50 text-rose-600 border-rose-100/50'
                                            }`}
                                    >
                                        {asset.status === 'AVAILABLE' ? 'Available' : asset.status}
                                    </span>
                                </div>
                                <div className="h-44 md:h-48 bg-slate-50 rounded-[2rem] mb-6 overflow-hidden flex items-center justify-center border border-slate-50">
                                    <img
                                        src={asset.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        alt={asset.name}
                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
                                    />
                                </div>
                                <div className="px-1 flex flex-col flex-1">
                                    <h3 className="font-black text-slate-800 text-base mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1 uppercase tracking-tight">{asset.name}</h3>
                                    <p className="text-[10px] text-slate-400 font-bold mb-6 flex items-center gap-1.5 uppercase">
                                        <Package size={12} className="text-indigo-400" /> S/N: {asset.serialNumber}
                                    </p>
                                    <button
                                        onClick={() => handleBorrowRequest(asset)}
                                        disabled={asset.status !== 'AVAILABLE'}
                                        className={`mt-auto relative overflow-hidden w-full py-4 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all duration-300 ${asset.status === 'AVAILABLE'
                                            ? 'bg-slate-900 hover:bg-indigo-600 active:scale-95 shadow-lg shadow-slate-200'
                                            : 'bg-slate-200 cursor-not-allowed text-slate-400'
                                            }`}
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            {asset.status === 'AVAILABLE' ? 'Request Item' : 'Busy'}
                                            {asset.status === 'AVAILABLE' && <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1.5" />}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 mb-10 flex justify-center items-center gap-2 md:gap-3 overflow-x-auto py-4">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all shadow-sm">
                            <ChevronLeft size={18} />
                        </button>
                        <div className="flex gap-1.5 md:gap-2">
                            {[...Array(totalPages)].map((_, idx) => (
                                <button key={idx} onClick={() => setCurrentPage(idx + 1)} className={`w-10 h-10 md:w-11 md:h-11 rounded-2xl font-black text-[10px] md:text-xs transition-all ${currentPage === idx + 1 ? 'bg-slate-900 text-white shadow-xl scale-110' : 'bg-white border border-slate-100 text-slate-500 hover:border-indigo-200'}`}>
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all shadow-sm">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </>
            )}

            {!loading && filteredAssets.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 text-slate-300 gap-4">
                    <Search size={48} className="opacity-20" />
                    <p className="font-black uppercase text-xs tracking-widest">No assets found in warehouse</p>
                </div>
            )}
        </div>
    );
};

export default BorrowAssets;