/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Component "Thanh trạng thái thanh toán" (CheckoutPath).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Hiển thị tiến trình thực hiện đơn hàng của người dùng (Stepper).
 *    - Giúp người dùng biết mình đang ở bước nào trong 3 bước: Giao hàng -> Xác nhận -> Thanh toán.
 *    - Tăng tính chuyên nghiệp và minh bạch cho luồng Checkout.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Thanh toán (Checkout Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Material UI Icons: Sử dụng các icon chuẩn từ thư viện `@mui/icons-material` (LocalShipping, LibraryAddCheck, AccountBalance).
 *    - Stateless Component: Một Functional Component thuần túy, không có logic phức tạp, chỉ nhận dữ liệu và hiển thị UI (Presentational Component).
 *    - Dynamic Class Attribute: Kỹ thuật sử dụng thuộc tính tùy biến `active` và `completed` để điều khiển CSS (thay vì lạm dụng quá nhiều ClassName).
 *    - Array Mapping: Tổ chức các bước thành một mảng đối tượng để dễ dàng bảo trì và mở rộng số lượng bước nếu cần.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Prop `activePath` (số nguyên từ 0 đến 2) đại diện cho bước hiện tại.
 *    - Output: Một thanh tiến trình có màu sắc và icon thay đổi theo trạng thái.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `activePath`: Chỉ số của bước đang thực hiện.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - Render danh sách các bước dựa trên mảng `path`.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Nhận `activePath` từ trang cha (ví dụ: Shipping truyền vào 0).
 *    - Bước 2: Duyệt qua mảng `path`.
 *    - Bước 3: So sánh `index` của bước với `activePath`.
 *    - Bước 4: Nếu `activePath >= index` -> Đánh dấu bước đó là `completed` (hiện màu nổi bật).
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Không có.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Logic so sánh `activePath === index` để xác định bước đang đứng.
 *    - Logic so sánh `activePath >= index` để xác định các bước đã hoàn thành.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Không có.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Chú ý file CSS tương ứng (`CheckoutPath.css`) để xem cách `[active="true"]` và `[completed="true"]` được định nghĩa. Đây là một cách viết CSS hiện đại dựa trên Attribute Selector.
 */
import React from 'react'
import '@/pages/checkout/styles/CheckoutPath.css'
import { AccountBalance, LibraryAddCheck, LocalShipping } from '@mui/icons-material'

function CheckoutPath({activePath}) {
    const path = [
        {
            label: 'Thông tin giao hàng',
            icon: <LocalShipping />
        },
        {
            label: 'Xác nhận đơn',
            icon: <LibraryAddCheck />
        },
        {
            label: 'Thanh toán',
            icon: <AccountBalance />
        }
    ]
  return (
     <>
     <div className="checkoutPath">
        {path.map((item, index) => (
            <div className="checkoutPath-step" key={index}
                active={activePath === index ? 'true' : 'false'}
                completed = {activePath >= index ? 'true' : 'false'}
            >
                <p className="checkoutPath-icon">{item.icon}</p>
                <p className="checkoutPath-label">{item.label}</p>
            </div>
        ))}
        
     </div>
     </>
    )
}

export default CheckoutPath