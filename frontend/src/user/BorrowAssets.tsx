import { useState, useEffect } from 'react';
import api from '../utils/api';
import Swal from 'sweetalert2';
import { Search, Filter, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
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
            html: `
                <div class="text-left">
                    <h3 class="text-lg font-bold mb-4">สร้างคำขอเบิกยืม</h3>
                    <textarea id="swal-purpose" class="w-full p-3 border rounded-xl text-sm mb-3" placeholder="เหตุผล"></textarea>
                    <input type="date" id="swal-return" class="w-full p-3 border rounded-xl text-sm">
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'ยืนยัน',
            preConfirm: () => {
                const purpose = (document.getElementById('swal-purpose') as HTMLTextAreaElement).value;
                const expectedReturn = (document.getElementById('swal-return') as HTMLInputElement).value;
                if (!purpose || !expectedReturn) return Swal.showValidationMessage('กรอกข้อมูล');
                return { purpose, expectedReturn };
            }
        });

        if (result.isConfirmed && result.value) {
            try {
                const userSession = localStorage.getItem('user');
                const userData = userSession ? JSON.parse(userSession) : null;

                await api.post('/borrow-requests', {
                    assetId: asset.id,
                    userId: userData.id,
                    purpose: result.value.purpose,
                    expectedReturn: new Date(result.value.expectedReturn).toISOString(),
                });

                notify.success('สำเร็จ', 'ส่งคำขอแล้ว');
                fetchAssets(currentPage);
            } catch {
                notify.error('ล้มเหลว', 'เกิดข้อผิดพลาด');
            }
        }
    };

    return (
        <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 py-4">
            <header className="mb-6 flex flex-col lg:flex-row gap-4 lg:items-end justify-between">
                <div>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-black">Central warehouse</h3>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1">คลังพัสดุ</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border rounded-xl text-sm"
                            placeholder="ค้นหา..."
                        />
                    </div>

                    <button className="hidden sm:flex p-3 border rounded-xl">
                        <Filter size={18} />
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="animate-spin" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {filteredAssets.map(asset => (
                            <div key={asset.id} className="bg-white rounded-2xl p-4 flex flex-col">
                                <div className="h-40 sm:h-44 md:h-48 bg-slate-100 rounded-xl mb-4 overflow-hidden">
                                    <img
                                        src={asset.image}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <h3 className="font-bold text-sm sm:text-base line-clamp-1">{asset.name}</h3>
                                <p className="text-xs text-slate-400 mb-3">S/N: {asset.serialNumber}</p>

                                <button
                                    onClick={() => handleBorrowRequest(asset)}
                                    className="mt-auto py-3 bg-slate-900 text-white rounded-xl text-xs"
                                >
                                    Request
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-center items-center gap-2 overflow-x-auto">
                        <button onClick={() => setCurrentPage(p => p - 1)}>
                            <ChevronLeft />
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button key={i} onClick={() => setCurrentPage(i + 1)} className="px-3 py-2 text-sm">
                                {i + 1}
                            </button>
                        ))}

                        <button onClick={() => setCurrentPage(p => p + 1)}>
                            <ChevronRight />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default BorrowAssets;