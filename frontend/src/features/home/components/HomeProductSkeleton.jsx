import React from "react";

function HomeProductSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6" aria-label="Đang tải sản phẩm">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm animate-pulse">
          <div className="aspect-[4/5] bg-slate-100" />
          <div className="p-4 sm:p-5 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-2 w-16 bg-slate-100 rounded-full" />
              <div className="h-2 w-12 bg-slate-100 rounded-full" />
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-full" />
            <div className="h-4 w-2/3 bg-slate-100 rounded-full" />
            <div className="pt-4 flex justify-between">
              <div className="h-6 w-20 bg-slate-100 rounded-full" />
              <div className="h-4 w-12 bg-slate-100 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default React.memo(HomeProductSkeleton);
