import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AdminFooter from '../components/AdminFooter';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
    const role = localStorage.getItem('role');

    return (
        <div className="flex h-screen w-full bg-[#fcfcfd] overflow-hidden font-sans">

            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 h-full">

                <Navbar />

                <main className="flex-1 w-full overflow-y-auto overflow-x-hidden p-8 flex flex-col gap-10">
                    <div className="flex-1">
                        <Outlet />
                    </div>

                    {role === 'ADMIN' ? (
                        <AdminFooter />
                    ) : (
                        <Footer />
                    )}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;