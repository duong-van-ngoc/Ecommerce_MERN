/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Thanh Tiêu Đề Dashboard (Premium Admin Header).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Cung cấp tính năng tìm kiếm toàn cục (Global Search) giúp Admin tra cứu nhanh mọi thứ từ bất kỳ trang nào.
 *    - Hiển thị các thông báo hệ thống và lối tắt truy cập nhanh vào hồ sơ cá nhân.
 *    - Đóng vai trò là "Vùng điều hướng tĩnh" luôn nằm trên cùng của trình duyệt.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Quản trị & Tìm kiếm Toàn cục (Admin Search & Navigation Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Redux Toolkit (useDispatch / useSelector): Kết nối trực tiếp với `adminSlice` để quản lý trạng thái tìm kiếm (`globalSearchQuery`).
 *    - Glassmorphism Design: Sử dụng `bg-[#f9f9f7]/70` kết hợp `backdrop-blur-xl` tạo hiệu ứng nền mờ xuyên thấu cực kỳ sang trọng và hiện đại.
 *    - CSS Calc: `w-[calc(100%-16rem)]` giúp Header tự động tính toán chiều rộng còn lại sau khi đã trừ đi 256px (16rem) của Sidebar bên trái.
 *    - Material Symbols: Tích hợp các biểu tượng của Google để tối giản hóa thiết kế.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Prop `user` (thông tin định danh Admin).
 *    - Output: Một giá trị Search Query được đẩy lên Global State để các trang như ProductManagement hay OrderManagement tự động lọc dữ liệu.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `globalSearchQuery`: Lấy từ Store của Redux, đảm bảo nếu bạn gõ ở Header thì kết quả ở bảng bên dưới nhảy ngay lập tức.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `dispatch(setGlobalSearchQuery)`: Hàm "phát sóng" từ khóa tìm kiếm lên toàn hệ thống quản trị.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Admin gõ vào ô tìm kiếm.
 *    - Bước 2: Sự kiện `onChange` kích hoạt action `setGlobalSearchQuery`.
 *    - Bước 3: Store thay đổi -> Các Component con đang "lắng nghe" `globalSearchQuery` sẽ thực hiện Filter dữ liệu (Real-time Filtering).
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Không gọi API trực tiếp. Việc gọi API tìm kiếm thường do Component hiển thị dữ liệu (như ProductsTable) đảm nhận khi Query thay đổi.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Placeholder Styling: Sử dụng `tracking-widest uppercase` cho placeholder để tạo cảm giác chuyên nghiệp, gọn gàng.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Không có. Tuy nhiên, lưu ý việc dispatch liên tục khi gõ có thể gây re-render nhiều. Trong thực tế có thể dùng thêm `debounce`.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - `z-40`: Header có index thấp hơn Sidebar (`z-50`) nhưng cao hơn nội dung trang, giúp Sidebar có thể phủ đè lên Header nếu cần (trong chế độ mobile hoặc hiệu ứng đặc biệt).
 *    - Color Accent: Màu `#ee5a6f` (Hồng san hô) được dùng làm màu nhấn khi focus vào ô tìm kiếm.
 */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setGlobalSearchQuery } from '../../adminSLice/adminSlice';

export default function Header({ user }) {
    const dispatch = useDispatch();
    const globalSearchQuery = useSelector(state => state.admin.globalSearchQuery);

    return (
        <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-20 z-40 bg-[#f9f9f7]/70 backdrop-blur-xl flex justify-between items-center px-12">
            <div className="flex items-center flex-1 max-w-xl">
                <div className="relative w-full">
                    <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-stone-400 text-lg">search</span>
                    <input 
                        className="w-full bg-transparent border-b border-[#dfbfc0]/30 py-2 pl-8 focus:outline-none focus:border-[#ee5a6f] font-label text-[13px] tracking-wide text-[#1a1c1b] placeholder:text-stone-400 placeholder:uppercase placeholder:text-[11px] placeholder:tracking-widest" 
                        placeholder="TÌM KIẾM SẢN PHẨM, ĐƠN HÀNG, KHÁCH HÀNG..." 
                        type="text" 
                        value={globalSearchQuery}
                        onChange={(e) => dispatch(setGlobalSearchQuery(e.target.value))}
                    />
                </div>
            </div>
            <div className="flex items-center gap-8">
                <button className="relative text-[#1a1c1b] hover:text-[#ee5a6f] transition-colors">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-gradient-to-br from-[#ff6b6b] to-[#ee5a6f] rounded-full"></span>
                </button>
                <div className="h-6 w-[1px] bg-[#dfbfc0]/20"></div>
                <div className="flex items-center gap-3 group cursor-pointer">
                </div>
            </div>
        </header>
    );
}
