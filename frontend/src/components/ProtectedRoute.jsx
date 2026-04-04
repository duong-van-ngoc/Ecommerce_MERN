/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Component "Người Giữ Cửa" (ProtectedRoute).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Bảo vệ các đường dẫn (Routes) riêng tư, chỉ cho phép người dùng đã đăng nhập mới được vào xem.
 *    - Ngăn chặn khách vãng lai truy cập trái phép vào các trang như: Giỏ hàng, Thanh toán, hay Quản lý tài khoản.
 *    - Điều hướng tự động người dùng về trang Đăng nhập nếu họ cố tình "vượt rào".
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Bảo mật & Điều hướng (Authentication & Navigation Security Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Higher-Order Component (HOC) Pattern: Một kỹ thuật nâng cao trong React. Nó nhận một Component khác làm đầu vào và trả về một phiên bản "đã được kiểm dịch" của Component đó.
 *    - Redux Store Integration: Móc trực tiếp vào kho lưu trữ toàn cục để lấy ra hai "con át chủ bài": `isAuthenticated` (Đã đăng nhập chưa?) và `loading` (Đang chờ server trả lời à?).
 *    - Declarative Navigation: Sử dụng `<Navigate />` thay vì `useNavigate()`. Đây là cách ra lệnh chuyển hướng bằng mã JSX, giúp code trông rất sạch sẽ và dễ đọc theo kiểu "Nếu không có chìa khóa, thì đưa tôi về trang Login".
 *    - Loading Guard Logic: Một tiểu tiết cực kỳ quan trọng. Trong khi hệ thống đang "hỏi" Server xem Token cũ còn hạn không (`loading === true`), ta phải hiện vòng xoay tải (`Loader`) để tránh việc giao diện bị nhấp nháy hoặc lộ thông tin nhạy cảm trong tích tắc.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Một khối giao diện (`element`) mà bạn muốn bảo vệ.
 *    - Output: Nếu hợp lệ -> Hiện giao diện đó. Nếu không -> Chuyển sang trang Login.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - Prop `element`: Là "ruột" của trang web (ví dụ: Trang thanh toán).
 *    - Global State: `isAuthenticated` và `loading` từ `state.user`.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - Kiểm tra trạng thái đăng nhập và đưa ra quyết định Render phù hợp.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: User click vào "Giỏ hàng".
 *    - Bước 2: Router gọi đến ProtectedRoute.
 *    - Bước 3: ProtectedRoute nhìn vào Redux xem User đã Login chưa.
 *    - Bước 4: Nếu đang load dữ liệu User -> Hiện Loader.
 *    - Bước 5: Nếu đã Login -> "Mở cửa" cho `element` hiện ra. Nếu chưa -> Ép trình duyệt nhảy sang `/login`.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Không gọi API trực tiếp, nhưng kết quả render phụ thuộc hoàn toàn vào kết quả của API `/api/v1/me` đã chạy trước đó.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Logic rẽ nhánh 3 tầng: Đang tải -> Chưa đăng nhập -> Đã đăng nhập.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Không có.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Đây là "chốt chặn" đầu tiên ở Frontend. Hãy cực kỳ cẩn thận khi sửa file này vì nó ảnh hưởng đến quyền truy cập của toàn bộ website.
 *    - Chú ý: File này chỉ bảo vệ ở mức giao diện. Bảo mật thực sự vẫn nằm ở Backend (Middleware chặn API).
 */
import React from 'react'

import {useSelector} from 'react-redux'
import Loader from '../components/Loader'
import {Navigate} from 'react-router-dom'


function ProtectedRoute({element}) {

  const {isAuthenticated, loading} = useSelector(state => state.user)

  if(loading) {
    return <Loader/>
  }
  if(!isAuthenticated) {
    return <Navigate to ="/login" />

  }
  return element
}

export default ProtectedRoute