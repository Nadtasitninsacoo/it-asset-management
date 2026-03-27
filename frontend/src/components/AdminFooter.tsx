import * as Lucide from 'lucide-react';

const AdminFooter = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto py-6 px-8 border-t border-gray-100 bg-white/50 backdrop-blur-md">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-900 rounded-lg flex items-center justify-center">
                        <Lucide.ShieldCheck size={14} className="text-white" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        Sentinel Core <span className="text-indigo-500">v1.0.4</span>
                    </span>
                </div>

                <div className="flex items-center gap-6">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        &copy; {currentYear} IT Asset Management System
                    </p>
                    <div className="h-3 w-[1px] bg-gray-200"></div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">System Operational</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default AdminFooter;