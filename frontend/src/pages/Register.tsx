import React, { useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import * as Lucide from 'lucide-react';
import { notify } from '../utils/swal';

const Register = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false); // 🚩 ป้องกันกดซ้ำ

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
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            // 🚩 ยิงข้อมูลไปยัง NestJS Endpoint
            const response = await api.post('/auth/register', formData);

            // ✅ ตรวจสอบโครงสร้างข้อมูลที่ส่งกลับมา
            const resData = response.data?.data || response.data;

            if (resData.access_token) {
                localStorage.setItem('access_token', resData.access_token);
                localStorage.setItem('user', JSON.stringify(resData.user));
                localStorage.setItem('role', resData.user.role);
            }

            notify.success('ลงทะเบียนสำเร็จ', `ยินดีต้อนรับคุณ ${formData.name} เข้าสู่ค่าย Sentinel ครับ`);

            setTimeout(() => {
                // 🚩 ถ้ายืนยันตัวตนสำเร็จให้ไปหน้ายืมพัสดุ ถ้าไม่มี token ให้ไป login
                navigate(resData.access_token ? '/borrow-assets' : '/login');
            }, 1500);

        } catch (error: any) {
            console.error('Register Strategic Error:', error);

            if (!error.response) {
                // 🚩 กรณีติดต่อไม่ได้เลย (Server ดับ/URL ผิด/เน็ตหลุด)
                notify.error('การสื่อสารล้มเหลว', 'ไม่สามารถติดต่อศูนย์บัญชาการได้ (Network Error)');
            } else {
                const status = error.response.status;
                const msg = error.response.data?.message;

                if (status === 409 || (typeof msg === 'string' && msg.includes('duplicate'))) {
                    notify.error('ลงทะเบียนไม่สำเร็จ', 'ชื่อผู้ใช้งานนี้ถูกใช้ไปแล้วในระบบ');
                } else if (status === 400) {
                    notify.error('ข้อมูลไม่ถูกต้อง', Array.isArray(msg) ? msg[0] : 'กรุณาตรวจสอบข้อมูลอีกครั้ง');
                } else {
                    notify.error('ระบบขัดข้อง', Array.isArray(msg) ? msg[0] : msg || 'ไม่สามารถสมัครสมาชิกได้');
                }
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
                <header className="relative pt-12 pb-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-xl shadow-blue-100 rotate-6 hover:rotate-0 transition-transform duration-500">
                        <Lucide.UserPlus className="text-white" size={32} />
                    </div>
                    <h3 className="text-3xl font-black tracking-tight text-gray-900 mb-2 italic uppercase">Create Account</h3>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">Sentinel Core Personnel Only</p>
                </header>

                <form onSubmit={handleSubmit} className="px-10 pb-12 space-y-5">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-gray-700 ml-1 uppercase">
                            <Lucide.User size={14} className="text-blue-500" /> ชื่อ-นามสกุล
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-4 text-sm bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all duration-300"
                            placeholder="Identify Your Name"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 ml-1 uppercase">
                                <Lucide.AtSign size={14} className="text-blue-500" /> Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full p-4 text-sm bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all duration-300"
                                placeholder="User ID"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 ml-1 uppercase">
                                <Lucide.Lock size={14} className="text-blue-500" /> Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full p-4 text-sm bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all duration-300"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2 pb-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-gray-700 ml-1 uppercase">
                            <Lucide.Building2 size={14} className="text-blue-500" /> แผนก / สังกัด
                        </label>
                        <input
                            type="text"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            className="w-full p-4 text-sm bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all duration-300"
                            placeholder="Department Section"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-4 text-white text-sm font-black rounded-2xl transition-all duration-300 shadow-xl flex items-center justify-center gap-3 group
                            ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-blue-600 shadow-blue-100 active:scale-[0.98]'}`}
                    >
                        {isSubmitting ? 'Processing...' : 'Deploy Personal Data'}
                        {!isSubmitting && <Lucide.ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                    </button>

                    <div className="pt-6 text-center">
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="text-sm text-gray-400 font-medium hover:text-blue-600 transition-colors"
                        >
                            มีบัญชีอยู่แล้ว? <span className="text-blue-600 font-bold uppercase">Back to Base</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;