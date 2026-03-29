import React, { useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import * as Lucide from 'lucide-react';
import { notify } from '../utils/swal';

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        department: '',
        role: 'USER',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/register', formData);

            if (response.data.access_token) {
                localStorage.setItem('access_token', response.data.access_token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                localStorage.setItem('role', response.data.user.role);
            }

            notify.success('ลงทะเบียนสำเร็จ', `ยินดีต้อนรับคุณ ${formData.name} เข้าสู่ระบบครับ`);

            setTimeout(() => {
                navigate('/borrow-assets');
            }, 1500);

        } catch (error: any) {
            console.error('Register Error:', error);

            const msg = error.response?.data?.message || 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้ในขณะนี้';

            notify.error('ลงทะเบียนไม่สำเร็จ', Array.isArray(msg) ? msg[0] : msg);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_25px_70px_rgba(0,0,0,0.07)] border border-gray-100 overflow-hidden">
                <header className="relative pt-12 pb-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-xl shadow-blue-100 rotate-6 hover:rotate-0 transition-transform duration-500">
                        <Lucide.UserPlus className="text-white" size={32} />
                    </div>
                    <h3 className="text-3xl font-black tracking-tight text-gray-900 mb-2">
                        Create Account
                    </h3>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">
                        Sentinel Core Personnel Only
                    </p>
                </header>

                <form onSubmit={handleSubmit} className="px-10 pb-12 space-y-5">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-gray-700 ml-1">
                            <Lucide.User size={14} className="text-blue-500" /> ชื่อ-นามสกุล
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-4 text-sm bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-300 placeholder:text-gray-300"
                            placeholder="ระบุชื่อจริงและนามสกุล"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 ml-1">
                                <Lucide.AtSign size={14} className="text-blue-500" /> Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full p-4 text-sm bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-300"
                                placeholder="ชื่อผู้ใช้งาน"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 ml-1">
                                <Lucide.Lock size={14} className="text-blue-500" /> รหัสผ่าน
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full p-4 text-sm bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-300"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2 pb-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-gray-700 ml-1">
                            <Lucide.Building2 size={14} className="text-blue-500" /> แผนก / สังกัด
                        </label>
                        <input
                            type="text"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            className="w-full p-4 text-sm bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-300"
                            placeholder="เช่น ฝ่ายเทคโนโลยีสารสนเทศ"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-gray-900 text-white text-sm font-black rounded-2xl hover:bg-blue-600 active:scale-[0.98] transition-all duration-300 shadow-xl shadow-blue-100 flex items-center justify-center gap-3 group"
                    >
                        ยืนยันการลงทะเบียน
                        <Lucide.ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="pt-6 text-center">
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="text-sm text-gray-400 font-medium hover:text-blue-600 transition-colors"
                        >
                            มีบัญชีอยู่แล้ว? <span className="text-blue-600 font-bold">เข้าสู่ระบบที่นี่</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;