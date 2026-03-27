import Swal from 'sweetalert2';

export const notify = {
    success: (title: string, text: string = '') => {
        return Swal.fire({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            background: '#ffffff',
            icon: 'success',
            iconColor: '#10b981',
            width: '24rem',
            padding: '0.8rem 1.2rem',

            title: `<div style="font-family: 'Kanit', sans-serif; font-weight: 700; font-size: 0.95rem; color: #0f172a; margin-bottom: 2px;">${title}</div>`,
            html: `<div style="font-family: 'Kanit', sans-serif; font-size: 0.8rem; color: #64748b; line-height: 1.2;">${text}</div>`,

            customClass: {
                popup: 'rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-slate-50 flex-row items-center',
                timerProgressBar: 'bg-emerald-400 h-[3px]',
                icon: 'm-0 mr-3 scale-75',
                title: 'text-left m-0 p-0',
                htmlContainer: 'text-left m-0 p-0 ml-1'
            },
            showClass: {
                popup: 'animate__animated animate__fadeInRight animate__faster'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutRight animate__faster'
            }
        });
    },

    error: (title: string, text: string = 'เกิดข้อผิดพลาด') => {
        return Swal.fire({
            toast: true,
            position: 'top-end',
            width: '24rem',
            padding: '0.8rem 1.2rem',
            icon: 'error',
            iconColor: '#ef4444',
            background: '#ffffff',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,

            title: `<div style="font-family: 'Kanit', sans-serif; font-weight: 700; font-size: 0.95rem; color: #991b1b; margin-bottom: 2px;">${title}</div>`,
            html: `<div style="font-family: 'Kanit', sans-serif; font-size: 0.8rem; color: #4b5563;">${text}</div>`,

            customClass: {
                popup: 'rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-red-50 flex-row items-center',
                timerProgressBar: 'bg-red-400 h-[3px]',
                icon: 'm-0 mr-3 scale-75',
                title: 'text-left m-0 p-0',
                htmlContainer: 'text-left m-0 p-0 ml-1'
            }
        });
    },

    confirm: async (title: string, text: string) => {
        const result = await Swal.fire({
            icon: 'warning',
            iconColor: '#f59e0b',
            title: `<div style="font-family: 'Kanit', sans-serif; font-weight: 700; font-size: 1rem; color: #1e293b; text-align: left;">${title}</div>`,
            html: `<div style="font-family: 'Kanit', sans-serif; font-size: 0.85rem; color: #64748b; text-align: left; margin-top: 4px;">${text}</div>`,

            showCancelButton: true,
            confirmButtonText: 'ยืนยัน',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#f1f5f9',

            background: '#ffffff',
            width: '28rem',
            padding: '1.5rem',

            customClass: {
                popup: 'rounded-[2rem] shadow-2xl border border-slate-50',
                confirmButton: 'rounded-xl px-6 py-2.5 text-xs font-bold shadow-lg shadow-blue-100 ml-2',
                cancelButton: 'rounded-xl px-6 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors',
                actions: 'mt-6 justify-end w-full flex'
            },
            buttonsStyling: false
        });

        return result.isConfirmed;
    }
};