/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Thành Phần Hiệu Ứng Chờ (Loading Spinner).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Hiển thị phản hồi trực quan cho người dùng trong khi ứng dụng đang thực hiện các tác vụ bất đồng bộ (như gọi API lấy danh sách sản phẩm).
 *    - Giúp cải thiện trải nghiệm người dùng (UX), ngăn chặn cảm giác ứng dụng bị "treo".
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Xử lý Trạng thái Trung gian (Middleware/Utility UI Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - CSS Keyframe Animation: Sử dụng các thuộc tính CSS `animation` và `@keyframes` để tạo vòng xoay mượt mà mà không tốn tài nguyên CPU/GPU (Hardware Acceleration).
 *    - Fixed Center Positioning: Sử dụng kỹ thuật Flexbox hoặc Absolute positioning để Spinner luôn nằm chính giữa màn hình hoặc chính giữa container cha.
 *    - Stateless Functional Component: Đây là một "Pure Component" thuần túy, chỉ có nhiệm vụ render giao diện tĩnh, không chứa logic giúp tối ưu hiệu năng tối đa.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Không có.
 *    - Output: Một vòng xoay load (Spinner) hiển thị trên màn hình.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - Không sử dụng.
 * 
 * 7. CÁC HÀM / CHỨC NƠNG CHÍNH:
 *    - Render cấu trúc HTML cho spinner.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Component cha check biến `loading === true`.
 *    - Bước 2: Component Loader được nạp vào DOM.
 *    - Bước 3: CSS animation tự động chạy vô tận cho đến khi component bị unmount.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Không tương tác trực tiếp, nhưng thường xuất hiện "đi kèm" với các request HTTP.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Được render dựa trên điều kiện của component cha.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Không có.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Nếu muốn đổi màu vòng xoay, hãy tìm đến file `Loader.css` và sửa thuộc tính `border-top-color`.
 *    - Loader này được thiết kế để bao phủ toàn bộ vùng chứa nó (Container), nên hãy đảm bảo cha của nó có `position: relative` nếu không muốn nó nhảy ra toàn màn hình.
 */
import React from 'react'

import '@/shared/components/styles/Loader.css'
function Loader() {
  return (
    <div className="loader-container">
        <div className="loader">
            
        </div>
    </div>
  )
}

export default Loader