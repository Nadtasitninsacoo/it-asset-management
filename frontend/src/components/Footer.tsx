import { ShieldCheck, Mail, Phone, Globe } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-white border-t pt-10 pb-6 px-6">
            <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">

                {/* Logo */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <ShieldCheck className="text-white" size={18} />
                        </div>
                        <span className="font-bold">Sentinel</span>
                    </div>
                    <p className="text-sm text-gray-500">
                        ระบบบริหารจัดการพัสดุไอที
                    </p>
                </div>

                {/* Menu */}
                <div>
                    <h4 className="font-semibold mb-2">เมนู</h4>
                    <ul className="text-sm text-gray-500 space-y-1">
                        <li>Dashboard</li>
                        <li>คลังพัสดุ</li>
                        <li>ประวัติ</li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h4 className="font-semibold mb-2">ติดต่อ</h4>
                    <ul className="text-sm text-gray-500 space-y-2">
                        <li className="flex gap-2"><Mail size={14} /> email</li>
                        <li className="flex gap-2"><Phone size={14} /> phone</li>
                        <li className="flex gap-2"><Globe size={14} /> website</li>
                    </ul>
                </div>

                {/* Social (ใช้ SVG ล้วน) */}
                <div>
                    <h4 className="font-semibold mb-2">Follow</h4>
                    <div className="flex gap-3">

                        {/* GitHub */}
                        <a href="#" className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-xl hover:bg-indigo-600 hover:text-white">
                            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.1 3.29 9.42 7.86 10.96.57.1.78-.25.78-.56v-2.02c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.72 0-1.27.46-2.31 1.2-3.13-.12-.3-.52-1.5.12-3.13 0 0 .98-.31 3.2 1.2a11.1 11.1 0 0 1 5.83 0c2.22-1.51 3.2-1.2 3.2-1.2.64 1.63.24 2.83.12 3.13.75.82 1.2 1.86 1.2 3.13 0 4.45-2.7 5.43-5.28 5.71.42.36.8 1.1.8 2.22v3.29c0 .31.21.67.79.56A11.52 11.52 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
                            </svg>
                        </a>

                        {/* Facebook */}
                        <a href="#" className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-xl hover:bg-indigo-600 hover:text-white">
                            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M22 12a10 10 0 1 0-11.56 9.87v-6.99H8.08V12h2.36V9.8c0-2.33 1.39-3.63 3.52-3.63.99 0 2.03.18 2.03.18v2.23h-1.14c-1.12 0-1.47.7-1.47 1.41V12h2.5l-.4 2.88h-2.1v6.99A10 10 0 0 0 22 12z" />
                            </svg>
                        </a>

                        {/* Instagram */}
                        <a href="#" className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-xl hover:bg-indigo-600 hover:text-white">
                            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm5 5a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm6.5-.75a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
                            </svg>
                        </a>

                    </div>
                </div>
            </div>

            <div className="text-center text-xs text-gray-400 mt-6">
                © {currentYear} IT Asset Management
            </div>
        </footer>
    );
};

export default Footer;