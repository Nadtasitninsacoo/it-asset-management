import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import * as Lucide from 'lucide-react';
import { notify } from '../utils/swal';
import Pagination from '../components/Pagination';

// 🚩 เปลี่ยนโครงสร้างข้อมูลให้เป็น Asset
type Asset = {
    id: number;
    code: string;
    name: string;
    category: string;
    status: string; // Available, Borrowed, Repair
    image?: string;
};

const CATEGORIES = ["Hardware", "Software", "Network", "Furniture", "Others"];
const STATUSES = ["Available", "Borrowed", "Repair"];

const ManageAssets = () => { // 🛡️ เปลี่ยนชื่อ Component ให้ถูกต้อง
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAsset, setCurrentAsset] = useState<Asset | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const fetchAssets = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            // 🚩 เปลี่ยน Endpoint เป็น /assets
            const response = await api.get(`/assets?page=${page}`);
            const raw = response.data;
            const data: Asset[] = Array.isArray(raw) ? raw : Array.isArray(raw.data) ? raw.data : [];

            setTotalPages(raw.meta?.lastPage || 1);
            setAssets(data);
        } catch (error) {
            notify.error('ผิดพลาด', 'โหลดข้อมูลทรัพย์สินล้มเหลว');
            setAssets([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAssets(currentPage);
    }, [currentPage, fetchAssets]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            if (currentAsset) {
                await api.patch(`/assets/${currentAsset.id}`, data);
            } else {
                await api.post('/assets', data);
            }
            notify.success('สำเร็จ', 'บันทึกข้อมูลทรัพย์สินเรียบร้อย');
            setIsModalOpen(false);
            fetchAssets(currentPage);
        } catch (error: any) {
            notify.error('ผิดพลาด', error.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้');
        }
    };

    const handleDelete = async (id: number) => {
        const confirm = await notify.confirm('กวาดล้างทรัพย์สิน?', 'ยืนยันการลบออกจากคลัง?');
        if (!confirm) return;
        try {
            await api.delete(`/assets/${id}`);
            notify.success('สำเร็จ', 'ลบทรัพย์สินเรียบร้อย');
            fetchAssets(currentPage);
        } catch (error) {
            notify.error('ล้มเหลว', 'ไม่สามารถลบทรัพย์สินที่มีการยืมอยู่ได้');
        }
    };

    return (
        <div className="p-4 md:p-8 lg:p-10 bg-slate-50 min-h-screen font-sans">
            {/* 🛡️ HEADER SECTION */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 max-w-7xl mx-auto">
                <div>
                    <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none">Assets Control</h3>
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.3em] mt-2">Inventory Management System</p>
                </div>
                <button
                    onClick={() => { setCurrentAsset(null); setIsModalOpen(true); }}
                    className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 active:scale-95 group"
                >
                    <Lucide.PlusCircle size={20} className="group-hover:rotate-90 transition-transform" />
                    <span className="text-xs uppercase tracking-widest">Register Asset</span>
                </button>
            </div>

            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="bg-white rounded-[2rem] border border-slate-100 p-20 text-center">
                        <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Scanning Inventory...</p>
                    </div>
                ) : assets.length === 0 ? (
                    <div className="bg-white rounded-[2rem] border border-dashed border-slate-200 p-20 text-center flex flex-col items-center gap-3">
                        <Lucide.PackageSearch size={48} className="text-slate-200" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Assets Registered</p>
                    </div>
                ) : (
                    <div className="hidden md:block bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <th className="p-6 text-center">Asset Code</th>
                                    <th className="p-6">Description</th>
                                    <th className="p-6">Category</th>
                                    <th className="p-6">Status</th>
                                    <th className="p-6 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {assets.map(asset => (
                                    <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-6 text-center font-black text-xs text-indigo-600">#{asset.code}</td>
                                        <td className="p-6 font-bold text-slate-700 text-sm">{asset.name}</td>
                                        <td className="p-6 text-xs font-bold text-slate-500 uppercase">{asset.category}</td>
                                        <td className="p-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm
                                                ${asset.status === 'Available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                                {asset.status}
                                            </span>
                                        </td>
                                        <td className="p-6 flex justify-center gap-3">
                                            <button onClick={() => { setCurrentAsset(asset); setIsModalOpen(true); }} className="p-2.5 bg-white border border-slate-100 text-slate-400 rounded-xl hover:text-yellow-600 transition-all"><Lucide.Edit3 size={18} /></button>
                                            <button onClick={() => handleDelete(asset.id)} className="p-2.5 bg-white border border-slate-100 text-slate-400 rounded-xl hover:text-rose-600 transition-all"><Lucide.Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="mt-10 py-6 border-t border-slate-100">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            </div>

            {/* 🛡️ ASSET MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
                    <div className="bg-white rounded-t-[2.5rem] sm:rounded-[3rem] w-full max-w-lg shadow-2xl animate-in slide-in-from-bottom duration-300">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                            <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase">{currentAsset ? 'Update Asset' : 'Register New Asset'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:text-rose-500 transition-all"><Lucide.X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6 mb-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Asset Code</label>
                                    <input name="code" placeholder="AST-001" defaultValue={currentAsset?.code} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold text-sm transition-all" required />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Status</label>
                                    <select name="status" defaultValue={currentAsset?.status || 'Available'} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-xs appearance-none">
                                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Asset Name</label>
                                <input name="name" placeholder="Item description..." defaultValue={currentAsset?.name} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold text-sm" required />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Category</label>
                                <select name="category" defaultValue={currentAsset?.category || 'Hardware'} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-xs appearance-none">
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <button type="submit" className="w-full py-5 bg-slate-900 text-white text-xs font-black rounded-3xl hover:bg-indigo-600 shadow-2xl transition-all uppercase tracking-[0.2em] active:scale-95">
                                <Lucide.PackageCheck size={20} className="inline mr-2" /> Commit Inventory
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageAssets; // 🛡️ ตรวจสอบว่า Export ชื่อนี้