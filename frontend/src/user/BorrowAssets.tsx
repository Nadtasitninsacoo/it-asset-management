import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Search, Package, ArrowRight, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
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
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/assets?page=${page}`);

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
            name.includes(word) ||
            serial.includes(word) ||
            category.includes(word)
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
                const token = localStorage.getItem('access_token');

                if (!userData?.id || !token) {
                    return notify.error('ผิดพลาด', 'ไม่พบข้อมูลผู้ใช้หรือ Token');
                }

                const isoDate = new Date(result.value.expectedReturn).toISOString();

                await axios.post('http://localhost:3000/borrow-requests', {
                    assetId: Number(asset.id),
                    userId: Number(userData.id),
                    purpose: result.value.purpose,
                    expectedReturn: isoDate,
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
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
        <div className="min-h-full font-sans text-slate-900">
            <header className="mb-10 flex justify-between items-end">
                <div>
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight text-slate-800">Central warehouse</h3>
                    <p className="text-slate-400 text-sm font-medium mt-1">คลังพัสดุสำหรับเบิกยืมอุปกรณ์</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="ค้นหา: ชื่อ / หมวดหมู่ / รหัสอุปกรณ์"
                            className="bg-white border border-slate-100 pl-12 pr-6 py-3 rounded-[1.5rem] text-sm focus:border-indigo-200 focus:ring-[8px] focus:ring-indigo-50/50 outline-none w-80 shadow-sm transition-all"
                        />
                    </div>
                    <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                        <Filter size={20} />
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center items-center h-64 text-slate-400 font-bold uppercase tracking-widest animate-pulse">
                    กำลังตรวจสอบคลังยุทโธปกรณ์...
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 text-slate-900">
                        {filteredAssets.map((asset) => (
                            <div key={asset.id} className="bg-white rounded-[2.5rem] border border-slate-50 p-5 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] transition-all duration-500 group relative">
                                <div className="absolute top-5 right-5 z-10">
                                    <span
                                        className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase ${asset.status === 'AVAILABLE'
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50'
                                            : 'bg-rose-50 text-rose-600 border-rose-100/50'
                                            }`}
                                    >
                                        {asset.status === 'AVAILABLE' ? 'Available' : asset.status}
                                    </span>
                                </div>
                                <div className="h-48 bg-slate-50 rounded-[2rem] mb-6 overflow-hidden text-center flex items-center justify-center">
                                    <img
                                        src={asset.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        alt={asset.name}
                                    />
                                </div>
                                <div className="px-2">
                                    <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">{asset.name}</h3>
                                    <p className="text-xs text-slate-400 font-bold mb-6 flex items-center gap-1">
                                        <Package size={12} /> รหัส: {asset.serialNumber}
                                    </p>
                                    <button
                                        onClick={() => handleBorrowRequest(asset)}
                                        disabled={asset.status !== 'AVAILABLE'}
                                        className={`relative overflow-hidden w-full py-3 text-white font-bold text-sm rounded-xl transition-all duration-300 ${asset.status === 'AVAILABLE'
                                            ? 'bg-gray-900 hover:scale-105 active:scale-95'
                                            : 'bg-slate-300 cursor-not-allowed'
                                            }`}
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            {asset.status === 'AVAILABLE' ? 'ทำเรื่องขอเบิกยืม' : 'ไม่พร้อมให้บริการ'}
                                            {asset.status === 'AVAILABLE' && <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-2" />}
                                        </span>
                                        {asset.status === 'AVAILABLE' && (
                                            <>
                                                <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-pink-500 to-purple-500 opacity-40 animate-lines pointer-events-none"></span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 flex justify-center items-center gap-3 pb-10">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all shadow-sm">
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex gap-2">
                            {[...Array(totalPages)].map((_, idx) => (
                                <button key={idx} onClick={() => setCurrentPage(idx + 1)} className={`w-11 h-11 rounded-2xl font-bold text-sm transition-all ${currentPage === idx + 1 ? 'bg-gray-900 text-white shadow-lg' : 'bg-white border border-slate-100 text-slate-500 hover:border-indigo-200'}`}>
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all shadow-sm">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </>
            )}

            {!loading && filteredAssets.length === 0 && (
                <div className="text-center py-20 text-slate-400 font-bold">ไม่พบยุทโธปกรณ์ที่ท่านต้องการในขณะนี้</div>
            )}
        </div>
    );
};

export default BorrowAssets;