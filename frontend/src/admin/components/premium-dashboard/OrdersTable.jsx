/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Bảng Hiển Thị Giao Dịch Gần Đây (Premium Orders Table).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Cung cấp danh sách các đơn hàng mới nhất ngay trên Dashboard để Admin xử lý nhanh mà không cần chuyển trang.
 *    - Giúp theo dõi dòng tiền và trạng thái vận chuyển trong thời gian thực.
 *    - Là trung tâm của luồng xử lý đơn hàng (Order Fulfillment).
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Quản trị Đơn hàng & Giao dịch (Transaction Management Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Data Mapping: Duyệt qua mảng `orders` và sử dụng `index` kết hợp `_id` để tạo Key duy nhất cho React.
 *    - Status Color Logic: Một "Machine State" đơn giản dùng câu lệnh `if` để gán màu sắc tương ứng (Xanh: Đã giao, Vàng: Đang xử lý, v.v.). Kỹ thuật này giúp Admin nhận diện trạng thái chỉ trong 0.5 giây.
 *    - Date Formatting: Sử dụng `toLocaleDateString('vi-VN')` để hiển thị ngày tháng theo phong cách Việt Nam, cực kỳ thân thiện với người dùng trong nước.
 *    - CSS Truncating: `substring(0,8)` để thu gọn mã ID đơn hàng dài ngoằng của MongoDB thành một mã ngắn gọn (ví dụ: `#64a1b2c3`).
 *    - Tailwind Responsive Table: Sử dụng `overflow-x-auto` đảm bảo bảng vẫn hiển thị tốt trên các màn hình nhỏ (Tablet) mà không làm vỡ bố cục Dashboard.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Mảng dữ liệu `orders` (từ API).
 *    - Output: Một bảng dữ liệu sang trọng, sắc nét với hiệu ứng hover từng dòng.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `orders`: Danh sách các đối tượng đơn hàng. Mỗi đối tượng chứa thông tin khách hàng, số tiền và trạng thái.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `orderStatus` mapping: Chuyển đổi từ giá trị Tiếng Anh trong Database (Pending, Shipped...) sang Tiếng Việt (Chờ xử lý, Đang giao...) cùng màu sắc tương ứng.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Nhận danh sách đơn hàng.
 *    - Bước 2: Kiểm tra nếu rỗng -> Hiện thông báo "Chưa có đơn hàng".
 *    - Bước 3: Duyệt mảng -> Xử lý thông tin hiển thị (tên khách, mã đơn, định dạng tiền).
 *    - Bước 4: Render dòng dữ liệu với Badge trạng thái có viền và nền màu nhạt (Soft-colored Badges).
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Lấy dữ liệu từ Collection `Orders`. Dữ liệu thường được `populate` thông tin người dùng (`user`) từ Backend để có tên hiển thị.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Phân tích tên: Sử dụng một chuỗi logic `order.user?.name || order.shippingInfo?.fullName || ...` để đảm bảo luôn hiển thị được một cái tên khách hàng dù dữ liệu có bị thiếu hụt ở bộ phận nào.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Không có. (Data đã được fetch ở Component cha).
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Avatar Chữ cái đầu: `String(customerName).charAt(0).toUpperCase()` - Đây là một Pattern thiết kế UI phổ biến giúp trang web trông đầy đặn ngay cả khi khách hàng không tải ảnh đại diện.
 *    - Nut "Xem Tất Cả": Liên kết trực tiếp đến phân hệ quản lý đơn hàng chuyên sâu.
 */
import React from 'react';
import formatVND from '@/shared/utils/formatCurrency.js';

export default function OrdersTable({ orders }) {
    if (!orders || orders.length === 0) {
        return (
            <section className="bg-white rounded-2xl overflow-hidden border border-[#dfbfc0]/10 p-10 text-center" style={{boxShadow: '0 20px 40px rgba(238, 90, 111, 0.08)'}}>
                <p className="font-body text-stone-500">Chưa có đơn hàng nào.</p>
            </section>
        );
    }

    return (
        <section className="bg-white rounded-2xl overflow-hidden border border-[#dfbfc0]/10" style={{boxShadow: '0 20px 40px rgba(238, 90, 111, 0.08)'}}>
            <div className="px-10 py-8 flex justify-between items-center border-b border-[#dfbfc0]/10">
                <h3 className="font-headline text-2xl font-bold text-[#1a1c1b]">Giao Dịch Gần Đây</h3>
                <button className="text-[#ee5a6f] font-label text-[11px] uppercase tracking-[0.2em] hover:opacity-70 transition-opacity">Xem Tất Cả</button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-[#f4f4f2]">
                            <th className="px-10 py-5 font-label text-[10px] uppercase tracking-widest text-stone-500">Mã Đơn</th>
                            <th className="px-6 py-5 font-label text-[10px] uppercase tracking-widest text-stone-500">Khách Hàng</th>
                            <th className="px-6 py-5 font-label text-[10px] uppercase tracking-widest text-stone-500">Ngày Tháng</th>
                            <th className="px-6 py-5 font-label text-[10px] uppercase tracking-widest text-stone-500">Tổng Tiền</th>
                            <th className="px-6 py-5 font-label text-[10px] uppercase tracking-widest text-stone-500">Trạng Thái</th>
                            <th className="px-10 py-5"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#dfbfc0]/10">
                        {orders.map((order, index) => {
                            const orderId = order._id || order.id || `UNKNOWN-${index}`;
                            const dateStr = new Date(order.createdAt || order.date || Date.now()).toLocaleDateString('vi-VN', { month: '2-digit', day: '2-digit', year: 'numeric' });
                            const customerName = order.user?.name || order.shippingInfo?.fullName || order.customer || 'Khách vãng lai';
                            const status = order.orderStatus || order.status || 'Chờ xử lý';
                            const total = order.totalPrice || order.total || 0;

                            let statusColor = 'bg-stone-50 text-stone-600 border-stone-100';
                            let statusText = status === 'Pending' ? 'Chờ xử lý' : status;
                            if(status === 'Processing') { statusColor = 'bg-blue-50 text-blue-600 border-blue-100'; statusText = 'Đang xử lý'; }
                            if(status === 'Shipped') { statusColor = 'bg-amber-50 text-amber-600 border-amber-100'; statusText = 'Đang giao'; }
                            if(status === 'Delivered') { statusColor = 'bg-emerald-50 text-emerald-600 border-emerald-100'; statusText = 'Đã giao'; }
                            
                            return (
                                <tr key={orderId} className="hover:bg-[#f4f4f2]/50 transition-colors">
                                    <td className="px-10 py-6 font-label text-sm text-stone-600">#{String(orderId).substring(0,8)}</td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#e8e8e6] flex items-center justify-center font-headline font-bold text-[#ee5a6f]">
                                                {String(customerName).charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-body text-sm font-medium">{customerName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 font-body text-sm text-stone-500">{dateStr}</td>
                                    <td className="px-6 py-6 font-body text-sm font-bold">{formatVND(total)}</td>
                                    <td className="px-6 py-6">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-label uppercase tracking-widest border ${statusColor}`}>
                                            {statusText}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        <span className="material-symbols-outlined text-stone-400 cursor-pointer hover:text-[#ee5a6f] transition-colors">more_horiz</span>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
