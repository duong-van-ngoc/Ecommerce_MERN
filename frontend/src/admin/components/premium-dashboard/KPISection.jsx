import React from 'react';
import formatVND from '../../../utils/formatCurrency.js';

export default function KPISection({ stats }) {
    if (!stats) return null;
    
    // Safety check for stats API payload structure
    const totalRev = stats.totalRevenue?.value ?? 0;
    const revChange = stats.totalRevenue?.change ?? 0;
    
    const totalOrd = stats.totalOrders?.value ?? 0;
    const totalProd = stats.totalProducts?.value ?? 0;
    const totalUsr = stats.totalUsers?.value ?? 0;

    return (
        <section className="grid grid-cols-12 gap-6 mb-12">
            {/* Large Primary Stat */}
            <div className="col-span-12 md:col-span-5 bg-gradient-to-br from-[#ff6b6b] to-[#ee5a6f] rounded-[1.5rem] px-12 py-10 flex flex-col justify-between text-white min-h-[240px]" style={{boxShadow: '0 20px 40px rgba(238, 90, 111, 0.08)'}}>
                <div className="flex justify-between items-start">
                    <span className="material-symbols-outlined text-3xl opacity-80">payments</span>
                    <span className="bg-white/20 px-3 py-1 rounded-full font-label text-[10px] tracking-widest uppercase">
                        {revChange >= 0 ? '+' : ''}{revChange}% so với cùng kỳ
                    </span>
                </div>
                <div>
                    <span className="font-label text-xs uppercase tracking-widest opacity-80">Tổng Doanh Thu</span>
                    <div className="font-headline text-6xl font-bold mt-1 tracking-tighter">{formatVND(totalRev)}</div>
                </div>
            </div>
            
            {/* Smaller Tonal Stats */}
            <div className="col-span-12 md:col-span-7 grid grid-flow-col auto-cols-auto gap-6 cursor-default">
                <div className="bg-white rounded-xl p-8 flex flex-col justify-between border border-[#dfbfc0]/10 transition-transform hover:scale-105 duration-300" style={{boxShadow: '0 20px 40px rgba(238, 90, 111, 0.08)'}}>
                    <div className="w-10 h-10 rounded-full bg-[#f4f4f2] flex items-center justify-center text-[#ee5a6f] mb-6">
                        <span className="material-symbols-outlined">shopping_bag</span>
                    </div>
                    <div>
                        <span className="font-label text-[10px] uppercase tracking-widest text-stone-400">Tổng Đơn Hàng</span>
                        <div className="font-headline text-3xl font-bold text-[#1a1c1b] mt-1">{totalOrd}</div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl p-8 flex flex-col justify-between border border-[#dfbfc0]/10 transition-transform hover:scale-105 duration-300" style={{boxShadow: '0 20px 40px rgba(238, 90, 111, 0.08)'}}>
                    <div className="w-10 h-10 rounded-full bg-[#f4f4f2] flex items-center justify-center text-[#ee5a6f] mb-6">
                        <span className="material-symbols-outlined">inventory_2</span>
                    </div>
                    <div>
                        <span className="font-label text-[10px] uppercase tracking-widest text-stone-400">Sản Phẩm</span>
                        <div className="font-headline text-3xl font-bold text-[#1a1c1b] mt-1">{totalProd}</div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl p-8 flex flex-col justify-between border border-[#dfbfc0]/10 transition-transform hover:scale-105 duration-300" style={{boxShadow: '0 20px 40px rgba(238, 90, 111, 0.08)'}}>
                    <div className="w-10 h-10 rounded-full bg-[#f4f4f2] flex items-center justify-center text-[#ee5a6f] mb-6">
                        <span className="material-symbols-outlined">group</span>
                    </div>
                    <div>
                        <span className="font-label text-[10px] uppercase tracking-widest text-stone-400">Người Dùng</span>
                        <div className="font-headline text-3xl font-bold text-[#1a1c1b] mt-1">{totalUsr}</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
