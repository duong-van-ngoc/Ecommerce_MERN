/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Cấu hình Kho lưu trữ trạng thái tập trung (Redux Store Configuration).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Đóng vai trò là "Trái tim" quản lý toàn bộ dữ liệu của ứng dụng Frontend.
 *    - Kết hợp các mảnh dữ liệu nhỏ (Slices) như Thông tin User, Giỏ hàng, Sản phẩm thành một khối thống nhất.
 *    - Giúp dữ liệu được chia sẻ xuyên suốt giữa các Component mà không cần truyền Props phức tạp qua nhiều cấp.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Quản lý Trạng thái Toàn cục (Global State Management Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Redux Toolkit (`configureStore`): Thư viện chuẩn mới giúp tạo Store ngắn gọn, bảo mật và hiệu suất cao.
 *    - Reducer Mapping: Cơ chế gán các bộ xử lý logic (Reducers) vào các "khoang" dữ liệu tương ứng.
 *    - Middleware (Tự động): Redux Toolkit tự động tích hợp Thunk (xử lý API) và DevTools (để Debug trên trình duyệt).
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Các Reducer từ các file Slices (`userSlice`, `cartSlice`, `productSlice`, ...).
 *    - Output: Một đối tượng `store` duy nhất dùng để cung cấp cho `<Provider>` ở file `main.jsx`.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - Định nghĩa cấu trúc cây dữ liệu (State Tree) của toàn bộ ứng dụng.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `configureStore`: Hàm khởi tạo và thiết lập các thông số kỹ thuật cho Store.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Gom tất cả các Reducer từ các tính năng khác nhau về một nơi.
 *    - Bước 2: Khai báo chúng vào object `reducer`. Tên thuộc tính ở đây chính là tên gọi khi truy xuất dữ liệu (VD: `state.user`).
 *    - Bước 3: Export Store ra ngoài để ứng dụng sử dụng.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Không trực tiếp gọi API nhưng là nơi lưu trữ kết quả cuối cùng từ các cuộc gọi API trả về.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Không trực tiếp render UI.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Hỗ trợ các hành động bất đồng bộ thông qua Middleware mặc định.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Nếu bạn tạo thêm một Slice mới (ví dụ: `wishlistSlice`), bạn PHẢI đăng ký Reducer của nó vào đây thì dữ liệu mới có hiệu lực toàn cục.
 *    - Tên bạn đặt trong phần `reducer` cực kỳ quan trọng: Nó sẽ quyết định cách bạn lấy dữ liệu ra ở các Component bằng Hook `useSelector`.
 */
import { configureStore } from '@reduxjs/toolkit';
import productReducer from '@/features/products/productSlice';
import userReducer from '@/features/user/userSlice';
import cartReducer from '@/features/cart/cartSlice';
import orderReducer from '@/features/orders/orderSlice';
import adminReducer from '@/admin/adminSLice/adminSlice'


export const store = configureStore({
    reducer: {
        product: productReducer,
        user: userReducer,
        cart: cartReducer,
        order: orderReducer,
        admin: adminReducer,
    }
})