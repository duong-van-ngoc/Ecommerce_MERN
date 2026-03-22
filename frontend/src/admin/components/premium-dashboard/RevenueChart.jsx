import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Dữ liệu mock (Trong thực tế API sẽ trả mảng này khi toggle)
const mockDataWeek = [
  { name: 'T2', uv: 4000 }, { name: 'T3', uv: 3000 }, { name: 'T4', uv: 2000 },
  { name: 'T5', uv: 2780 }, { name: 'T6', uv: 1890 }, { name: 'T7', uv: 2390 }, { name: 'CN', uv: 3490 }
];
const mockDataMonth = [
  { name: 'Tuần 1', uv: 12000 }, { name: 'Tuần 2', uv: 15000 }, { name: 'Tuần 3', uv: 11000 }, { name: 'Tuần 4', uv: 18000 }
];
const mockDataYear = [
  { name: 'Thg 1', uv: 40000 }, { name: 'Thg 2', uv: 35000 }, { name: 'Thg 3', uv: 50000 }, { name: 'Thg 4', uv: 45000 },
  { name: 'Thg 5', uv: 60000 }, { name: 'Thg 6', uv: 55000 }, { name: 'Thg 7', uv: 70000 }, { name: 'Thg 8', uv: 65000 },
  { name: 'Thg 9', uv: 80000 }, { name: 'Thg 10', uv: 75000 }, { name: 'Thg 11', uv: 90000 }, { name: 'Thg 12', uv: 100000 }
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-[#ee5a6f]/20">
        <p className="font-label text-sm text-[#722F37] font-bold">Doanh thu: ${payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function RevenueChart() {
    const [filter, setFilter] = useState('Tuần');

    const data = useMemo(() => {
        if (filter === 'Tháng') return mockDataMonth;
        if (filter === 'Năm') return mockDataYear;
        return mockDataWeek;
    }, [filter]);

    return (
        <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl p-10 border border-[#dfbfc0]/10" style={{boxShadow: '0 20px 40px rgba(238, 90, 111, 0.08)'}}>
            <div className="flex justify-between items-center mb-10">
                <h3 className="font-headline text-2xl font-bold text-[#1a1c1b] tracking-tight">Phân Tích Doanh Thu</h3>
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
            
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ff6b6b" stopOpacity={0.9}/>
                                <stop offset="100%" stopColor="#ee5a6f" stopOpacity={0.4}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#a8a29e', fontSize: 10, fontFamily: 'Outfit'}} dy={10} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ee5a6f', opacity: 0.05 }} />
                        <Bar 
                            dataKey="uv" 
                            fill="url(#colorBar)" 
                            radius={[6, 6, 0, 0]} 
                            barSize={filter === 'Year' ? 24 : 36}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
