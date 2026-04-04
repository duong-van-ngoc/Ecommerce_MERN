/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Phân Hệ Hiển Thị Chỉ Số Kinh Doanh (KPI Section).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Là "trái tim" của Dashboard thổng kê. Cung cấp cái nhìn tức thời về hiệu quả kinh doanh của cửa hàng.
 *    - Hiển thị 4 chỉ số vàng: Tổng doanh thu, Tổng đơn hàng, Số lượng sản phẩm và Tổng số khách hàng.
 *    - Giúp Admin nắm bắt nhanh rủi ro hoặc cơ hội (ví dụ: Doanh thu giảm so với kỳ trước).
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Thống kê - Báo cáo dữ liệu (Business Analytics Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Grid Layout (Tailwind): Sử dụng hệ lưới 12 cột (`grid-cols-12`) để tạo bố cục linh hoạt. Card Doanh thu chiếm 5 cột (ưu tiên cao nhất), 3 card còn lại chia nhau 7 cột.
 *    - Null Safety Pattern: Sử dụng `if (!stats) return null` và `Optional Chaining` (`?.`) kết hợp `Nullish Coalescing` (`?? 0`). Kỹ thuật này bảo vệ ứng dụng không bị "trắng trang" nếu Backend gặp sự cố hoặc chưa kịp trả về dữ liệu.
 *    - Advanced Formatting: Gọi hàm `formatVND` từ utils để biến số thô thành chuỗi tiền tệ (ví dụ: `1000000` -> `1.000.000 ₫`).
 *    - Linear Gradient Background: Sử dụng dải màu chuyển từ `#ff6b6b` sang `#ee5a6f` để làm nổi bật thẻ Doanh thu chính.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Object `stats` chứa các số thô từ Database (Revenue, Count, ...).
 *    - Output: Một dãy các Card số liệu được thiết kế Premium với hiệu ứng hover sinh động.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `stats`: Prop quan trọng nhất, nhận dữ liệu tổng hợp từ trang `Dashboard.jsx`.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - Phân tách dữ liệu: Bóc tách `totalRevenue`, `change` (phần trăm tăng trưởng), `totalOrders`, `totalProducts`, `totalUsers`.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Nhận Object `stats` từ trang Cha.
 *    - Bước 2: Kiểm tra tính hợp lệ của dữ liệu.
 *    - Bước 3: Tính toán màu sắc icon và nhãn tăng trưởng.
 *    - Bước 4: Render Card chính (Doanh thu) và các Card phụ bên phải.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Không trực tiếp gọi API. Đây là Component hiển thị thuần túy (Stateless / Presentational Component).
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀF: 
 *    - Conditional Label: Hiển thị ký tự `+` nếu `revChange >= 0`, giúp Admin dễ dàng nhận thấy sự tăng trưởng dương.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Không có.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Hiệu ứng Scale: `hover:scale-105` được áp dụng cho các card nhỏ để tăng tính tương tác (Interactive Feel).
 *    - Shadow Design: Sử dụng một bóng đổ tùy chỉnh có màu hồng mờ (`rgba(238, 90, 111, 0.08)`) để tạo sự đồng bộ hoàn hảo với tông màu thương hiệu.
 */
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
