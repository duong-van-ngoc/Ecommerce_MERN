import React from 'react';
import { SearchX } from 'lucide-react';

function NoProducts({ keyword, onResetFilters }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
      <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-300 shadow-sm mb-6">
        <SearchX size={40} strokeWidth={1.5} />
      </div>
      
      <h3 className="text-xl font-black text-primary mb-3 max-w-md leading-tight">
        {keyword 
          ? `Không tìm thấy sản phẩm phù hợp cho "${keyword}"`
          : "Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại"
        }
      </h3>
      
      <p className="text-sm font-medium text-slate-500 max-w-sm mb-8 leading-relaxed">
        Hãy thử từ khóa khác hoặc xóa bớt bộ lọc để tìm thấy thứ bạn cần.
      </p>
      
      {onResetFilters && (
        <button 
          className="bg-primary text-white px-8 py-3 rounded-xl text-xs font-black shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:-translate-y-0.5 transition-all active:scale-95"
          onClick={onResetFilters}
        >
          Xóa tất cả bộ lọc
        </button>
      )}
    </div>
  );
}

export default React.memo(NoProducts);