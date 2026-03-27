import * as Lucide from 'lucide-react';

type PaginationProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    return (
        <div className="flex justify-between items-center bg-gray-50/50 border-t border-gray-200 p-2 text-[10px] md:text-[11px] rounded-b-2xl">
            <span className="font-semibold text-gray-500 uppercase">หน้า {currentPage} / {totalPages}</span>
            <div className="flex gap-1">
                <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                    <Lucide.ChevronLeft size={14} />
                </button>

                {[...Array(totalPages)].map((_, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => onPageChange(idx + 1)}
                        className={`flex items-center justify-center w-6 h-6 md:w-7 md:h-7 text-[10px] md:text-xs font-semibold rounded-lg border transition-colors
                            ${currentPage === idx + 1
                                ? 'bg-gray-900 text-white border-gray-900'
                                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                    >
                        {idx + 1}
                    </button>
                ))}

                <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                    <Lucide.ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;