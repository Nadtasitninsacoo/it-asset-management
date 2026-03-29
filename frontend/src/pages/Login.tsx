import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import * as Lucide from 'lucide-react';
import Navbar from '../components/Navbar';
import { notify } from '../utils/swal';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
                username,
                password
            });

            const { access_token, user } = response.data;

            localStorage.setItem('access_token', access_token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('role', user.role);

            notify.success('Access Granted', `ยินดีต้อนรับกลับมาครับ ท่านจอมพล ${user.name}`);

            setTimeout(() => {
                if (user.role === 'ADMIN') {
                    navigate('/admin-dashboard');
                } else {
                    navigate('/borrow-assets');
                }
            }, 500);

        } catch (error: any) {
            console.error('Login Error:', error);
            const status = error.response?.status;

            if (status === 401) {
                notify.error('Login Failed', 'รหัสลับไม่ถูกต้อง! บัตรผ่านของท่านไม่ได้รับการอนุมัติ');
            } else {
                notify.error('System Offline', 'ติดต่อศูนย์บัญชาการไม่ได้! กรุณาเช็ค Backend และ MySQL');
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Navbar />

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_25px_70px_rgba(0,0,0,0.07)] border border-gray-100 overflow-hidden">

                    <header className="relative pt-12 pb-8 text-center">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-xl shadow-blue-100 -rotate-3 hover:rotate-0 transition-transform duration-500">
                            <Lucide.ShieldCheck className="text-white" size={32} />
                        </div>
                        <h3 className="text-3xl font-black tracking-tight text-gray-900 mb-2">
                            Log In
                        </h3>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">
                            Secure Management Access
                        </p>
                    </header>

                    <form onSubmit={handleSubmit} className="px-10 pb-12 space-y-6">

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 ml-1">
                                <Lucide.User size={14} className="text-blue-500" /> Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full p-4 text-sm bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-300 placeholder:text-gray-300"
                                placeholder="Enter your identity"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="flex items-center gap-2 text-xs font-bold text-gray-700">
                                    <Lucide.Lock size={14} className="text-blue-500" /> Password
                                </label>
                                <a href="#" className="text-[10px] font-bold text-gray-400 hover:text-blue-600 transition-colors">ลืมรหัสผ่าน?</a>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-4 text-sm bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-300 placeholder:text-gray-300"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-gray-900 text-white text-sm font-black rounded-2xl hover:bg-blue-600 active:scale-[0.98] transition-all duration-300 shadow-xl shadow-blue-100 flex items-center justify-center gap-3 group"
                        >
                            Sign In
                            <Lucide.ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>

                        <div className="pt-8 text-center">
                            <p className="text-sm text-gray-400 font-medium">
                                ยังไม่มีบัญชีใช่หรือไม่?{' '}
                                <Link
                                    to="/register"
                                    className="text-blue-600 font-black hover:text-indigo-600 transition-colors"
                                >
                                    สมัครสมาชิกใหม่
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;