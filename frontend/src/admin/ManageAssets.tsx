import { useState, useEffect } from 'react';
import api from '../utils/api';
import * as Lucide from 'lucide-react';
import { notify } from '../utils/swal';
import Pagination from '../components/Pagination';

type Asset = {
    id: number;
    name: string;
    category: string;
    status: string;
    image?: string;
    serialNumber: string;
};

const getImageUrl = (image?: string) => {
    if (!image || image === 'null') return '/default-image.png';
    if (image.startsWith('http')) return image;
    const fileName = image.includes('/') ? image.split('/').pop() : image;
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '');
    return `${baseUrl}/uploads/${fileName}`;
};

const CATEGORIES = ["Computer", "Tablet", "Network", "Peripheral", "Software", "Other"];

const ManageAssets = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAsset, setCurrentAsset] = useState<Asset | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedFileName, setSelectedFileName] = useState("");

    const fetchAssets = async (page: number) => {
        try {
            const response = await api.get(`/assets?page=${page}`);

            if (response.data && response.data.data) {
                setAssets(response.data.data);

                if (response.data.meta) {
                    setTotalPages(response.data.meta.lastPage || 1);
                }
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            notify.error('ผิดพลาด', 'ไม่สามารถดึงข้อมูลยุทโธปกรณ์ได้');
        }
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        fetchAssets(currentPage);
    }, [currentPage]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const fileInput = formData.get('file') as File | null;

        const sendData = new FormData();
        sendData.append('name', formData.get('name') as string);
        sendData.append('serialNumber', formData.get('serialNumber') as string);
        sendData.append('category', formData.get('category') as string);
        sendData.append('status', formData.get('status') as string);

        if (fileInput && fileInput.size > 0) {
            sendData.append('image', fileInput);
        } else {
            const imageUrl = formData.get('image_url') as string;
            sendData.append('image', imageUrl || '');
        }

        try {
            const endpoint = currentAsset ? `/assets/${currentAsset.id}` : '/assets';
            if (currentAsset) {
                await api.patch(endpoint, sendData, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await api.post(endpoint, sendData, { headers: { 'Content-Type': 'multipart/form-data' } });
            }

            notify.success('สำเร็จ', 'บันทึกข้อมูลยุทโธปกรณ์แล้ว');
            setIsModalOpen(false);
            fetchAssets(currentPage);
        } catch (error) {
            notify.error('ผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้');
        }
    };

    const handleDelete = async (id: number) => {
        const confirm = await notify.confirm('ยืนยันการทำลาย?', 'ท่านต้องการลบอุปกรณ์ชิ้นนี้ใช่หรือไม่?');
        if (!confirm) return;
        try {
            await api.delete(`/assets/${id}`);
            notify.success('ลบสำเร็จ', 'ข้อมูลถูกกำจัดเรียบร้อย');
            fetchAssets(currentPage);
        } catch (error) {
            notify.error('ล้มเหลว', 'เซิร์ฟเวอร์ปฏิเสธการลบข้อมูล');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFileName(e.target.files[0].name);
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Manage Assets</h3>
                </div>
                <button
                    onClick={() => {
                        setCurrentAsset(null);
                        setSelectedFileName("");
                        setIsModalOpen(true);
                    }}
                    className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold shadow-sm hover:bg-indigo-700 transition-all flex items-center gap-1.5 text-[11px] uppercase tracking-wider"
                >
                    <Lucide.Plus size={14} strokeWidth={3} />
                    <span>เพิ่มอุปกรณ์</span>
                </button>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="bg-gray-100/40 border-b border-gray-100">
                            <th className="p-2 font-semibold text-gray-400 uppercase tracking-wider text-[9px]">IMAGE</th>
                            <th className="p-2 font-semibold text-gray-400 uppercase tracking-wider text-[9px]">NAME</th>
                            <th className="p-2 font-semibold text-gray-400 uppercase tracking-wider text-[9px]">CATEGORY</th>
                            <th className="p-2 font-semibold text-gray-400 uppercase tracking-wider text-[9px]">STATUS</th>
                            <th className="p-2 font-semibold text-gray-400 uppercase tracking-wider text-[9px] text-center">ACTION</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {assets.map(asset => (
                            <tr key={asset.id} className="hover:bg-gray-50/40 transition">
                                <td className="p-2">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden border flex items-center justify-center">
                                        <img
                                            src={getImageUrl(asset.image)}
                                            alt={asset.name}
                                            className="w-full h-full object-cover hover:scale-110 transition"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=No+Image';
                                            }}
                                        />
                                    </div>
                                </td>
                                <td className="p-2 font-semibold text-gray-700">{asset.name}</td>
                                <td className="p-2">
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md text-[9px] font-bold uppercase">
                                        {asset.category}
                                    </span>
                                </td>
                                <td className="p-2">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase
                                        ${asset.status === 'AVAILABLE' ? 'bg-green-100 text-green-600' :
                                            asset.status === 'REPAIRING' ? 'bg-rose-100 text-rose-600' :
                                                asset.status === 'BORROWED' ? 'bg-amber-100 text-amber-600' :
                                                    'bg-gray-100 text-gray-500'}`}>
                                        {asset.status === 'AVAILABLE' && 'พร้อมใช้'}
                                        {asset.status === 'BORROWED' && 'ถูกยืม'}
                                        {asset.status === 'REPAIRING' && 'ส่งซ่อม'}
                                        {asset.status === 'LOST' && 'สูญหาย'}
                                    </span>
                                </td>
                                <td className="p-2 text-center flex justify-center gap-1">
                                    <button
                                        onClick={() => {
                                            setCurrentAsset(asset);
                                            setSelectedFileName(asset.image?.split("/").pop() || "");
                                            setIsModalOpen(true);
                                        }}
                                        className="bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-md text-[9px] font-bold hover:bg-yellow-200 transition"
                                    >
                                        EDIT
                                    </button>
                                    <button
                                        onClick={() => handleDelete(asset.id)}
                                        className="bg-red-100 text-red-600 px-2 py-0.5 rounded-md text-[9px] font-bold hover:bg-red-200 transition"
                                    >
                                        DELETE
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="p-4 border-t border-gray-50">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
                            <h3 className="text-lg font-black text-slate-800 tracking-tight">
                                {currentAsset ? '📝 EDIT ASSET' : '🚀 NEW ASSET'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-rose-500 transition-colors">
                                <Lucide.XCircle size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-7 space-y-4">
                            <div className="space-y-3">
                                <label className="block text-[9px] font-black text-indigo-400 uppercase mb-1.5 ml-1 tracking-widest">Asset Image</label>
                                <div className="flex flex-col gap-2">
                                    <input
                                        name="image_url"
                                        defaultValue={currentAsset?.image || ''}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold transition-all"
                                        placeholder="Paste Image URL here..."
                                    />
                                    <label className="flex items-center justify-center w-full py-2.5 bg-indigo-50 border border-dashed border-indigo-200 rounded-xl cursor-pointer hover:bg-indigo-100 transition-all text-[10px] font-black text-indigo-600 uppercase tracking-tight">
                                        <Lucide.UploadCloud size={14} className="mr-2" />
                                        {selectedFileName ? 'Change Image' : 'Upload Local File'}
                                        <input type="file" name="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                    </label>
                                    {selectedFileName && (
                                        <p className="text-[9px] text-slate-400 font-bold ml-1 italic truncate">📎 {selectedFileName}</p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[9px] font-black text-indigo-400 uppercase mb-1.5 ml-1 tracking-widest">Asset Name</label>
                                    <input name="name" defaultValue={currentAsset?.name} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold text-sm transition-all" required />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[9px] font-black text-indigo-400 uppercase mb-1.5 ml-1 tracking-widest">Category</label>
                                        <select name="category" defaultValue={currentAsset?.category || 'Computer'} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold text-xs appearance-none">
                                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-indigo-400 uppercase mb-1.5 ml-1 tracking-widest">Serial Number</label>
                                        <input name="serialNumber" defaultValue={currentAsset?.serialNumber} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold text-sm transition-all" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-indigo-400 uppercase mb-1.5 ml-1 tracking-widest">Current Status</label>
                                    <select name="status" defaultValue={currentAsset?.status || 'AVAILABLE'} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold text-xs appearance-none">
                                        <option value="AVAILABLE">✅ พร้อมใช้งาน</option>
                                        <option value="BORROWED">📤 ถูกยืมออก</option>
                                        <option value="REPAIRING">🛠️ ส่งซ่อมบำรุง</option>
                                        <option value="LOST">❌ สูญหาย</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="w-full py-4 mt-2 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-indigo-600 shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
                                <Lucide.Save size={16} /> บันทึกอุปกรณ์
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageAssets;