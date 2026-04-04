/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Biểu Đ Đồ Phân Tích Doanh Thu (Revenue Analytics Chart).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Trực quan hóa dữ liệu kinh doanh thô thành các cột biểu đồ dễ hiểu.
 *    - Cho phép Admin so sánh hiệu suất bán hàng qua các mốc thời gian khác nhau (Tuần/Tháng/Năm).
 *    - Giúp phát hiện các "điểm rơi" hoặc "điểm bùng nổ" doanh số để đưa ra chiến lược marketing kịp thời.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Báo cáo Dữ liệu & Trực quan hóa (Data Visualization Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Recharts Library: Thư viện biểu đồ mạnh mẽ nhất cho React. Sử dụng `BarChart`, `Bar`, `XAxis` và `ResponsiveContainer`.
 *    - useMemo Pattern: Tối ưu hiệu năng bằng cách chỉ tính toán lại dữ liệu biểu đồ khi Admin thay đổi bộ lọc (`filter`). Điều này giúp biểu đồ mượt mà, không bị lag.
 *    - Custom React Tooltip: Tự viết giao diện hiển thị khi Admin di chuột vào các cột (Tooltips) để đồng bộ với phong cách thiết kế sang trọng của dự án.
 *    - SVG Linear Gradient: Sử dụng thẻ `<defs>` để định nghĩa một dải màu gradient từ `#ff6b6b` (đỉnh cột) xuống mờ dần ở chân cột, tạo hiệu ứng thị giác hiện đại (Modern UI Chart).
 *    - Responsive Container: Đảm bảo biểu đồ tự co giãn 100% chiều rộng của thẻ bọc ngoài mà không bị vỡ SVG.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Filter state (Tuần/Tháng/Năm) do Admin chọn.
 *    - Output: Biểu đồ cột SVG động với dữ liệu tương ứng.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `filter`: Lưu trạng thái hiện tại (Tuần, Tháng hoặc Năm). 
 *    - `data`: Mảng dữ liệu đã qua xử lý lọc (`mockDataWeek`, `mockDataMonth`...).
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `setFilter`: Thay đổi bộ lọc thời gian.
 *    - `useMemo`: Quyết định mảng dữ liệu nào sẽ được nạp vào biểu đồ dựa trên `filter`.
 *    - `CustomTooltip`: Component chức năng để render hộp thông tin khi di chuột.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Khởi tạo mặc định xem theo "Tuần".
 *    - Bước 2: Admin bấm chọn "Tháng".
 *    - Bước 3: `filter` state cập nhật -> `useMemo` kích hoạt nạp `mockDataMonth`.
 *    - Bước 4: Recharts thực hiện hoạt cảnh (Animation) vẽ lại các cột biểu đồ.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Hiện đang dùng Mock Data để minh họa UI. Trong thực tế, mảng dữ liệu này sẽ được lấy từ API thống kê tổng hợp của Server.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Active State Styling: Thay đổi màu nền trắng và đổ bóng cho nút Filter đang được chọn.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Animation của Recharts diễn ra bất đồng bộ trên lớp SVG.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - `id="colorBar"`: ID này được dùng để liên kết giữa định nghĩa Gradient và thuộc tính `fill` của thẻ `Bar`. Đừng đổi tên ID nếu không muốn cột bị mất màu.
 *    - Font Family: Trục X (`XAxis`) sử dụng font 'Outfit' đồng bộ với toàn bộ hệ thống Dashboard.
 */
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
