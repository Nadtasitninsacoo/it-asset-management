import * as Lucide from 'lucide-react';

const AdminFooter = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto py-8 px-6 sm:px-10 border-t border-slate-100 bg-white/60 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">

                {/* ⚔️ SYSTEM IDENTITY */}
                <div className="flex items-center gap-3 group">
                    <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200 transition-transform group-hover:rotate-12">
                        <Lucide.ShieldCheck size={16} className="text-blue-500" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-800 leading-none">
                            Sentinel <span className="text-blue-600">Core</span>
                        </span>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            Enterprise Engine <span className="text-slate-300">v1.0.4</span>
                        </span>
                    </div>
                </div>

                {/* 📊 SYSTEM STATUS & COPYRIGHT */}
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full shadow-sm">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                            System Operational
                        </span>
                    </div>

                    <div className="hidden md:block h-4 w-[1px] bg-slate-200"></div>

                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center md:text-left leading-relaxed">
                        &copy; {currentYear} <span className="text-slate-600">IT Asset Management</span>
                        <br className="md:hidden" />
                        <span className="hidden md:inline mx-2 text-slate-200">|</span>
                        Strategic Resource Control
                    </p>
                </div>

            </div>
        </footer>
    );
};

export default AdminFooter;