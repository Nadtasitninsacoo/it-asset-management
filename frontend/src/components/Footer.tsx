import { ShieldCheck, Mail, Phone, Globe, ChevronRight } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-white border-t pt-16 pb-8 px-6 sm:px-10">
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

                {/* 🛡️ BRAND IDENTITY */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                            <ShieldCheck className="text-blue-500" size={22} />
                        </div>
                        <span className="font-black text-xl tracking-tighter uppercase italic text-slate-800">
                            Sentinel<span className="text-blue-600">.</span>
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed max-w-[200px]">
                        ระบบบริหารจัดการพัสดุไอทีอัจฉริยะ เพื่อการควบคุมทรัพยากรอย่างมีประสิทธิภาพ
                    </p>
                </div>

                {/* 🔗 QUICK MENU */}
                <div>
                    <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-800 mb-6">Quick Links</h4>
                    <ul className="text-sm text-slate-500 space-y-3">
                        {['Dashboard', 'คลังพัสดุ', 'ประวัติการใช้งาน'].map((item) => (
                            <li key={item}>
                                <a href="#" className="flex items-center gap-2 hover:text-blue-600 hover:translate-x-1 transition-all duration-300">
                                    <ChevronRight size={12} className="text-slate-300" />
                                    {item}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 📞 CONTACT AGENT */}
                <div>
                    <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-800 mb-6">Contact Intel</h4>
                    <ul className="text-sm text-slate-500 space-y-4">
                        <li className="flex items-center gap-3 group cursor-pointer">
                            <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                                <Mail size={14} className="group-hover:text-blue-600" />
                            </div>
                            <span className="group-hover:text-slate-800 transition-colors">support@sentinel.io</span>
                        </li>
                        <li className="flex items-center gap-3 group cursor-pointer">
                            <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                                <Phone size={14} className="group-hover:text-blue-600" />
                            </div>
                            <span className="group-hover:text-slate-800 transition-colors">+66 2 123 4567</span>
                        </li>
                        <li className="flex items-center gap-3 group cursor-pointer">
                            <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                                <Globe size={14} className="group-hover:text-blue-600" />
                            </div>
                            <span className="group-hover:text-slate-800 transition-colors">www.sentinel-core.com</span>
                        </li>
                    </ul>
                </div>

                {/* 🌐 SOCIAL DEPLOYMENT */}
                <div>
                    <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-800 mb-6">Follow the Core</h4>
                    <div className="flex gap-3">
                        {/* GitHub */}
                        <a href="#" className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white hover:-translate-y-1 transition-all duration-300 border border-slate-100 shadow-sm">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.1 3.29 9.42 7.86 10.96.57.1.78-.25.78-.56v-2.02c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.72 0-1.27.46-2.31 1.2-3.13-.12-.3-.52-1.5.12-3.13 0 0 .98-.31 3.2 1.2a11.1 11.1 0 0 1 5.83 0c2.22-1.51 3.2-1.2 3.2-1.2.64 1.63.24 2.83.12 3.13.75.82 1.2 1.86 1.2 3.13 0 4.45-2.7 5.43-5.28 5.71.42.36.8 1.1.8 2.22v3.29c0 .31.21.67.79.56A11.52 11.52 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
                            </svg>
                        </a>
                        {/* Facebook */}
                        <a href="#" className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 rounded-2xl hover:bg-[#1877F2] hover:text-white hover:-translate-y-1 transition-all duration-300 border border-slate-100 shadow-sm">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M22 12a10 10 0 1 0-11.56 9.87v-6.99H8.08V12h2.36V9.8c0-2.33 1.39-3.63 3.52-3.63.99 0 2.03.18 2.03.18v2.23h-1.14c-1.12 0-1.47.7-1.47 1.41V12h2.5l-.4 2.88h-2.1v6.99A10 10 0 0 0 22 12z" />
                            </svg>
                        </a>
                        {/* Instagram */}
                        <a href="#" className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 rounded-2xl hover:bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:text-white hover:-translate-y-1 transition-all duration-300 border border-slate-100 shadow-sm">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm5 5a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm6.5-.75a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto border-t border-slate-100 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    &copy; {currentYear} Sentinel System <span className="mx-2 text-slate-200">|</span>
                    <span className="text-slate-600 italic">Strategic Asset Control</span>
                </p>
                <div className="flex gap-6">
                    <a href="#" className="text-[10px] font-bold text-slate-400 hover:text-slate-800 uppercase tracking-widest transition-colors">Privacy Policy</a>
                    <a href="#" className="text-[10px] font-bold text-slate-400 hover:text-slate-800 uppercase tracking-widest transition-colors">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;