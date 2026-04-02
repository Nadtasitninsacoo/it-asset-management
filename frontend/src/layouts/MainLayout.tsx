import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AdminFooter from '../components/AdminFooter';
import { Outlet } from 'react-router-dom';
import { useMemo, useState } from 'react';

const MainLayout = () => {
    const role = useMemo(() => localStorage.getItem('role'), []);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="relative flex h-screen w-full bg-[#fcfcfd] overflow-hidden font-sans">
            <div className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity lg:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsSidebarOpen(false)}
            />

            <div className={`fixed inset-y-0 left-0 z-50 transform bg-white transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </div>

            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

                <main className="flex-1 w-full overflow-y-auto overflow-x-hidden p-4 lg:p-8 flex flex-col">
                    <section className="flex-1">
                        <Outlet />
                    </section>

                    <footer className="mt-10">
                        {role === 'ADMIN' ? <AdminFooter /> : <Footer />}
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;