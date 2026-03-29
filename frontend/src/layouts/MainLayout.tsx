import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AdminFooter from '../components/AdminFooter';
import { Outlet } from 'react-router-dom';
import { useMemo } from 'react';

const MainLayout = () => {
    const role = useMemo(() => localStorage.getItem('role'), []);

    return (
        <div className="flex h-screen w-full bg-[#fcfcfd] overflow-hidden font-sans">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 h-full">
                <Navbar />

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