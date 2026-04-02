import React, { useState } from 'react';
import api from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';
import * as Lucide from 'lucide-react';
import Navbar from '../components/Navbar';
import { notify } from '../utils/swal';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // 🚩 ป้องกันการกดซ้ำ
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            // 🚩 ตรวจสอบว่า NestJS ของท่านรอรับที่ /auth/login หรือไม่
            const response = await api.post('/auth/login', {
                username,
                password
            });

            // ✅ ตรวจสอบโครงสร้าง Response ให้ชัวร์
            const payload = response.data?.data || response.data;
            const { access_token, user } = payload;

            if (!access_token) {
                throw new Error('Incomplete Credentials: Missing Access Token');
            }

            localStorage.setItem('access_token', access_token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('role', user.role);

            notify.success('เข้าสู่ระบบสำเร็จ', `สวัสดีครับคุณ ${user.name}`);

            setTimeout(() => {
                if (user.role === 'ADMIN') {
                    navigate('/admin-dashboard');
                } else {
                    navigate('/borrow-assets');
                }
            }, 800);

        } catch (error: any) {
            console.error('Login Error Status:', error.response?.status);

            // 🚩 ถ้า error.response ไม่มีค่า แปลว่าติดต่อ Server ไม่ได้เลย (Server ดับ/URL ผิด)
            if (!error.response) {
                notify.error('การสื่อสารขัดข้อง', 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้ (Network Error)');
            } else {
                const status = error.response.status;
                const message = error.response.data?.message;

                if (status === 401) {
                    notify.error('สิทธิ์การเข้าถึงถูกปฏิเสธ', 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
                } else if (status === 404) {
                    notify.error('ไม่พบพิกัด API', 'กรุณาตรวจสอบ baseURL ใน api.ts (404)');
                } else {
                    notify.error('ระบบขัดข้อง', message || 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์');
                }
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Navbar />
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
                    <header className="relative pt-12 pb-8 text-center">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-xl shadow-blue-100 -rotate-3 hover:rotate-0 transition-transform duration-500">
                            <Lucide.ShieldCheck className="text-white" size={32} />
                        </div>
                        <h3 className="text-3xl font-black tracking-tight text-gray-900 mb-2 italic uppercase">Log In</h3>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">Secure Management Access</p>
                    </header>

                    <form onSubmit={handleSubmit} className="px-10 pb-12 space-y-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 ml-1 uppercase">
                                <Lucide.User size={14} className="text-blue-500" /> Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full p-4 text-sm bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-300"
                                placeholder="Identity ID"
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase">
                                    <Lucide.Lock size={14} className="text-blue-500" /> Password
                                </label>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-4 text-sm bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-300"
                                placeholder="••••••••"
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-4 text-white text-sm font-black rounded-2xl transition-all duration-300 shadow-xl flex items-center justify-center gap-3 group
                                ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-blue-600 shadow-blue-100 active:scale-[0.98]'}`}
                        >
                            {isSubmitting ? 'Verifying...' : 'Authorize Sign In'}
                            {!isSubmitting && <Lucide.ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                        </button>

                        <div className="pt-8 text-center">
                            <p className="text-sm text-gray-400 font-medium">
                                ยังไม่มีบัญชี? <Link to="/register" className="text-blue-600 font-black hover:text-indigo-600 transition-colors">สมัครสมาชิก</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;