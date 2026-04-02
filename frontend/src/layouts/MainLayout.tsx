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

    useEffect(() => {
        const loadUser = () => {
            try {
                const raw = localStorage.getItem('user');
                if (raw && raw !== 'undefined' && raw !== 'null') {
                    const parsed = JSON.parse(raw) as User;
                    setUserData({
                        ...parsed,
                        role: parsed.role?.trim().toUpperCase() || 'USER'
                    });
                }
            } catch (err) {
                console.error('Security System: Data Corruption Detected');
                localStorage.removeItem('user');
                setUserData(null);
            } finally {
                setIsReady(true);
            }
        };

        loadUser();
    }, []);

    if (!isReady) {
        return <div className="h-screen w-full bg-[#fcfcfd] flex items-center justify-center font-black text-slate-400">LOADING SENTINEL...</div>;
    }

    return (
        <div className="relative flex h-screen w-full bg-[#fcfcfd] overflow-hidden font-sans">
            <div
                className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity lg:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={() => setIsSidebarOpen(false)}
            />

            <div
                className={`fixed inset-y-0 left-0 z-50 transform bg-white transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            </div>

            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                <Navbar />

                <main className="flex-1 w-full overflow-y-auto overflow-x-hidden p-4 lg:p-8 flex flex-col">
                    <section className="flex-1">
                        <Outlet />
                    </section>

                    <footer className="mt-10">
                        {userData && userData.role === 'ADMIN' ? <AdminFooter /> : <Footer />}
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;