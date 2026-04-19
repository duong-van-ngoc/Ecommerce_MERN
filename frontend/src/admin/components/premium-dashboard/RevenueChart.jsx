/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Biểu Đồ Phân Tích Doanh Thu (Revenue Analytics Chart).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Trực quan hóa dữ liệu kinh doanh thực tế từ Backend.
 *    - Cho phép Admin so sánh hiệu suất bán hàng qua các mốc thời gian: 7 ngày qua, 30 ngày qua, 12 tháng qua.
 *    - Tích hợp dữ liệu thực tế: Doanh thu = giá trị đơn hàng - phí ship (chỉ tính đơn Delivered).
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Báo cáo Dữ liệu & Trực quan hóa (Data Visualization Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Recharts: BarChart để hiển thị doanh thu.
 *    - useMemo: Tối ưu dữ liệu hiển thị theo bộ lọc thời gian.
 *    - Custom States: Loading, Empty, Error xử lý đồng bộ với tiến trình fetch từ Redux.
 */
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import formatVND from '@/shared/utils/formatCurrency.js';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-2xl border border-[#ee5a6f]/10 backdrop-blur-sm bg-white/90">
        <p className="font-label text-[10px] uppercase tracking-widest text-stone-400 mb-1">{label}</p>
        <p className="font-headline text-sm text-[#ee5a6f] font-bold">
            {formatVND(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ analyticsData, loading }) {
    const [filter, setFilter] = useState('Tuần');

    // Mapped data from props
    const data = useMemo(() => {
        if (!analyticsData) return [];
        
        const source = {
            'Tuần': analyticsData.week || [],
            'Tháng': analyticsData.month || [],
            'Năm': analyticsData.year || []
        };

        return source[filter].map(item => ({
            name: item.label,
            amount: item.amount
        }));
    }, [filter, analyticsData]);

    const isEmpty = useMemo(() => {
        return !loading && (!data || data.length === 0 || data.every(d => d.amount === 0));
    }, [data, loading]);

    return (
        <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl p-10 border border-[#dfbfc0]/10 relative overflow-hidden" 
             style={{boxShadow: '0 20px 40px rgba(238, 90, 111, 0.08)'}}>
            
            <div className="flex justify-between items-center mb-10 relative z-10">
                <div>
                    <h3 className="font-headline text-2xl font-bold text-[#1a1c1b] tracking-tight">Phân Tích Doanh Thu</h3>
                    <p className="font-label text-[10px] uppercase tracking-widest text-stone-400 mt-1">Dữ liệu đơn hàng thực tế</p>
                </div>
                
                <div className="flex gap-2 bg-[#eeeeec] p-1 rounded-lg">
                    {['Tuần', 'Tháng', 'Năm'].map(mode => (
                        <button
                            key={mode}
                            onClick={() => setFilter(mode)}
                            className={`px-4 py-1.5 rounded-md text-[10px] font-label uppercase tracking-widest transition-all ${filter === mode ? 'bg-white shadow-sm text-[#ee5a6f] font-bold' : 'text-stone-400 hover:text-[#1a1c1b]'}`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart Area */}
            <div className="relative" style={{ width: '100%', height: 320 }}>
                {loading && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-xl">
                        <div className="flex flex-col items-center gap-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ee5a6f]"></div>
                            <span className="font-label text-[10px] uppercase tracking-tighter text-stone-400">Đang đồng bộ...</span>
                        </div>
                    </div>
                )}

                {isEmpty ? (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-6 bg-[#f9f9f7]/30 rounded-xl border border-dashed border-stone-200">
                        <span className="material-symbols-outlined text-4xl text-stone-300 mb-3">query_stats</span>
                        <h4 className="font-headline text-stone-500 font-bold">Chưa có dữ liệu</h4>
                        <p className="font-body text-xs text-stone-400 mt-1">Hệ thống chưa ghi nhận doanh thu {filter.toLowerCase()} này.</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ff6b6b" stopOpacity={0.9}/>
                                    <stop offset="100%" stopColor="#ee5a6f" stopOpacity={0.3}/>
                                </linearGradient>
                            </defs>
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#a8a29e', fontSize: 10, fontFamily: 'Outfit'}} 
                                dy={15} 
                            />
                            <Tooltip 
                                content={<CustomTooltip />} 
                                cursor={{ fill: '#ee5a6f', opacity: 0.03 }} 
                            />
                            <Bar 
                                dataKey="amount" 
                                fill="url(#colorBar)" 
                                radius={[8, 8, 0, 0]} 
                                barSize={filter === 'Năm' ? 24 : 32}
                                animationDuration={1000}
                                animationEasing="ease-in-out"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Bottom Decor */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#ee5a6f]/5 rounded-full blur-3xl pointer-events-none"></div>
        </div>
    );
}
