import React from 'react';
import { useSelector } from 'react-redux';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

function Pagination({
  currentPage,
  onPageChange,
  loading = false
}) {
  const { totalPages, products } = useSelector((state) => state.product);

  if (products.length === 0 || totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pageNumbers = [];
    const pageWindow = 2;
    for (let i = Math.max(1, currentPage - pageWindow);
      i <= Math.min(totalPages, currentPage + pageWindow);
      i++
    ) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  return (
    <div className="flex items-center gap-2 justify-center py-10">
      {/* First Page */}
      <button
        disabled={currentPage === 1 || loading}
        onClick={() => onPageChange(1)}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 hover:text-primary hover:border-primary/20 hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        title="Trang đầu"
      >
        <ChevronsLeft size={16} />
      </button>

      {/* Prev Page */}
      <button
        disabled={currentPage === 1 || loading}
        onClick={() => onPageChange(currentPage - 1)}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 hover:text-primary hover:border-primary/20 hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        title="Trang trước"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1.5 mx-2">
        {getPageNumbers().map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl text-xs font-black transition-all duration-300 ${
              currentPage === page 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-white border border-slate-100 text-slate-500 hover:border-primary/20 hover:text-primary hover:shadow-sm'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next Page */}
      <button
        disabled={currentPage === totalPages || totalPages === 0 || loading}
        onClick={() => onPageChange(currentPage + 1)}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 hover:text-primary hover:border-primary/20 hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        title="Trang sau"
      >
        <ChevronRight size={16} />
      </button>

      {/* Last Page */}
      <button
        disabled={currentPage === totalPages || totalPages === 0 || loading}
        onClick={() => onPageChange(totalPages)}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 hover:text-primary hover:border-primary/20 hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        title="Trang cuối"
      >
        <ChevronsRight size={16} />
      </button>
    </div>
  );
}

export default React.memo(Pagination);