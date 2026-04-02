// src/layouts/MainLayout.tsx
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AdminFooter from '../components/AdminFooter';
import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';

type User = {
    name: string;
    role: string;
};

const MainLayout = () => {
    const [userData, setUserData] = useState<User | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isReady, setIsReady] = useState(false);

    // โหลดข้อมูล user จาก localStorage
    const syncUserAuth = () => {
        try {
            const raw = localStorage.getItem('user');
            if (raw && raw !== 'undefined' && raw !== 'null') {
                const parsed = JSON.parse(raw) as User;
                setUserData({
                    ...parsed,
                    role: parsed.role?.trim().toUpperCase() || 'USER',
                });
            } else {
                setUserData({ name: 'Guest', role: 'USER' });
            }
        } catch (err) {
            localStorage.removeItem('user');
            setUserData({ name: 'Guest', role: 'USER' });
        } finally {
            setIsReady(true);
        }
    };

    useEffect(() => {
        syncUserAuth();
        window.addEventListener('storage', syncUserAuth);
        return () => window.removeEventListener('storage', syncUserAuth);
    }, []);

    // กำลังโหลด user
    if (!isReady) {
        return (
            <div className="h-screen w-full bg-[#fcfcfd] flex items-center justify-center font-black text-slate-400 animate-pulse">
                INITIALIZING SENTINEL CORE...
            </div>
        );
    }

    return (
        <div className="relative flex h-screen w-full bg-[#fcfcfd] overflow-hidden font-sans">
            {/* Overlay มือถือ */}
            <div
                className={`fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity lg:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={() => setIsSidebarOpen(false)}
            />

            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                userData={userData} // ส่ง userData ให้ Sidebar กรองเมนู
            />

            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                {/* Navbar ใช้ userData จาก localStorage ภายในตัวมันเอง */}
                <Navbar />

                <main className="flex-1 w-full overflow-y-auto p-4 lg:p-8 flex flex-col custom-scrollbar">
                    <section className="flex-1">
                        <Outlet context={{ userData }} /> {/* ส่ง Context ให้หน้าลูก */}
                    </section>

                    <footer className="mt-10">
                        {userData?.role === 'ADMIN' ? <AdminFooter /> : <Footer />}
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;