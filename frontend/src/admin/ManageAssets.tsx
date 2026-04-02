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
        <div className="p-4 md:p-8 bg-gray-50 min-h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h3 className="text-xl md:text-2xl font-black text-gray-800 uppercase tracking-tight">Manage Assets</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">คลังควบคุมพัสดุส่วนกลาง</p>
                </div>
                <button
                    onClick={() => {
                        setCurrentAsset(null);
                        setSelectedFileName("");
                        setIsModalOpen(true);
                    }}
                    className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 text-[11px] uppercase tracking-wider"
                >
                    <Lucide.Plus size={16} strokeWidth={3} />
                    <span>เพิ่มยุทโธปกรณ์</span>
                </button>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                {/* 🚩 ฐานทัพลับ: ระบบเลื่อนตารางในมือถือ */}
                <div className="overflow-x-auto">
                    <table className="w-full text-xs min-w-[700px]">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="p-4 text-left font-bold text-gray-400 uppercase tracking-wider text-[9px]">Preview</th>
                                <th className="p-4 text-left font-bold text-gray-400 uppercase tracking-wider text-[9px]">Asset Name</th>
                                <th className="p-4 text-left font-bold text-gray-400 uppercase tracking-wider text-[9px]">Category</th>
                                <th className="p-4 text-left font-bold text-gray-400 uppercase tracking-wider text-[9px]">Status</th>
                                <th className="p-4 font-bold text-gray-400 uppercase tracking-wider text-[9px] text-center">Command</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {assets.map(asset => (
                                <tr key={asset.id} className="hover:bg-gray-50/40 transition">
                                    <td className="p-4">
                                        <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center shadow-sm">
                                            <img
                                                src={getImageUrl(asset.image)}
                                                alt={asset.name}
                                                className="w-full h-full object-cover hover:scale-110 transition duration-500"
                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=No+Image'; }}
                                            />
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-gray-800 text-sm">{asset.name}</div>
                                        <div className="text-[10px] text-slate-400 font-mono">SN: {asset.serialNumber}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-tighter">
                                            {asset.category}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border
                                            ${asset.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                asset.status === 'REPAIRING' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                    asset.status === 'BORROWED' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                        'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                            {asset.status === 'AVAILABLE' && '🟢 พร้อมใช้งาน'}
                                            {asset.status === 'BORROWED' && '📤 ถูกยืมออก'}
                                            {asset.status === 'REPAIRING' && '🛠️ ส่งซ่อม'}
                                            {asset.status === 'LOST' && '❌ สูญหาย'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setCurrentAsset(asset);
                                                    setSelectedFileName(asset.image?.split("/").pop() || "");
                                                    setIsModalOpen(true);
                                                }}
                                                className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                            >
                                                <Lucide.Edit3 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(asset.id)}
                                                className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                            >
                                                <Lucide.Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-6 bg-gray-50/30 border-t border-gray-100">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>

            {/* 🚩 Modal ปรับแต่งความกว้างสำหรับมือถือ */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-300">
                        <div className="sticky top-0 z-10 p-6 border-b border-gray-50 flex justify-between items-center bg-white/80 backdrop-blur-md">
                            <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">
                                {currentAsset ? '📝 Edit Asset' : '🚀 New Asset'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-rose-500 transition-colors">
                                <Lucide.XCircle size={28} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-1">Asset Imagery</label>
                                <div className="space-y-3">
                                    <input
                                        name="image_url"
                                        defaultValue={currentAsset?.image || ''}
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold transition-all"
                                        placeholder="Image URL Link..."
                                    />
                                    <label className="flex items-center justify-center w-full py-4 bg-indigo-50/50 border-2 border-dashed border-indigo-200 rounded-2xl cursor-pointer hover:bg-indigo-100 transition-all text-xs font-black text-indigo-600 uppercase">
                                        <Lucide.UploadCloud size={18} className="mr-2" />
                                        {selectedFileName ? 'Change File' : 'Upload Local File'}
                                        <input type="file" name="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                    </label>
                                    {selectedFileName && <p className="text-[10px] text-indigo-400 font-bold italic text-center">📎 {selectedFileName}</p>}
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">General Info</label>
                                    <input name="name" placeholder="Asset Name" defaultValue={currentAsset?.name} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-sm transition-all" required />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <select name="category" defaultValue={currentAsset?.category || 'Computer'} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-xs appearance-none">
                                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                    <input name="serialNumber" placeholder="Serial S/N" defaultValue={currentAsset?.serialNumber} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-sm transition-all" required />
                                </div>
                                <select name="status" defaultValue={currentAsset?.status || 'AVAILABLE'} className="w-full px-5 py-4 bg-slate-900 text-white rounded-2xl focus:ring-4 focus:ring-indigo-500/20 outline-none font-bold text-xs">
                                    <option value="AVAILABLE">✅ พร้อมใช้งาน (AVAILABLE)</option>
                                    <option value="BORROWED">📤 ถูกยืมออก (BORROWED)</option>
                                    <option value="REPAIRING">🛠️ ส่งซ่อม (REPAIRING)</option>
                                    <option value="LOST">❌ สูญหาย (LOST)</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full py-5 mt-4 bg-indigo-600 text-white text-xs font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
                                <Lucide.Save size={18} /> Confirm & Save
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageAssets;