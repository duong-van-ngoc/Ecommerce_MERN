/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Định tuyến cho Đơn hàng (Express Router for Orders).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Quản lý quy trình mua sắm từ lúc khách hàng nhấn "Đặt hàng" cho đến khi đơn hàng được hoàn tất.
 *    - Cung cấp các API để khách hàng xem lại lịch sử mua hàng và chi tiết từng đơn hàng.
 *    - Cung cấp các công cụ quản lý cho Admin để theo dõi doanh thu, cập nhật trạng thái vận chuyển hoặc hủy đơn hàng.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Đặt hàng (Checkout/Order Flow) & Luồng Quản trị Đơn hàng (Admin Order Management).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Express Router: Định nghĩa các đường dẫn API theo cấu trúc RESTful.
 *    - Middleware Security: Tất cả các route đơn hàng đều được bảo vệ bởi `verifyUserAuth` vì đơn hàng luôn phải gắn với một người dùng cụ thể.
 *    - Phân quyền (Role Based Access Control): Chỉ Admin mới có quyền sửa trạng thái hoặc xem toàn bộ đơn hàng của cửa hàng.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Thông tin đơn hàng (địa chỉ, sản phẩm, giá) hoặc yêu cầu xem/sửa đơn hàng.
 *    - Output: Điều hướng yêu cầu đến các hàm xử lý logic trong `orderController.js`.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `:id`: ID của đơn hàng cần truy vấn hoặc cập nhật.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - Đối với Người dùng: Tạo mới (`/order/new`), Xem đơn hàng cá nhân (`/orders/user`), Xem chi tiết (`/order/:id`).
 *    - Đối với Admin: Lấy tất cả đơn hàng (`/admin/orders`), Cập nhật trạng thái (`/admin/order/:id`), Xóa đơn hàng.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Request từ Frontend gửi đến (kèm theo Cookie chứa Token).
 *    - Bước 2: Middleware `verifyUserAuth` kiểm tra đăng nhập.
 *    - Bước 3: (Nếu là route admin) Middleware `roleBasedAccess('admin')` kiểm tra quyền quản trị.
 *    - Bước 4: Chuyển yêu cầu vào Controller để thực hiện logic nghiệp vụ.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Request -> Router -> [Auth/Role Middleware] -> Order Controller -> MongoDB -> JSON Response.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Ràng buộc: Không một ai có thể xem đơn hàng nếu chưa đăng nhập.
 *    - Ràng buộc: Người dùng chỉ được xem đơn hàng của chính họ (logic kiểm tra nằm trong Controller).
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - File chỉ chứa cấu hình điều hướng, không có xử lý bất đồng bộ trực tiếp.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Lưu ý route `/admin/orders/` sử dụng dấu `/` ở cuối, hãy đảm bảo Frontend gọi đúng định dạng này hoặc chỉnh sửa lại cho nhất quán.
 *    - Các route Admin bắt đầu bằng tiền tố `/admin/` để dễ dàng quản lý và áp dụng middleware role.
 */
import express from "express";
import { roleBasedAccess, verifyUserAuth } from "../middleware/userAuth.js";
import { allMyOrder, cancelOrder, createNewOrder, getAllOrder, getSingleOrder ,updateOrderStauts} from "../controllers/orderController.js";

const router = express.Router()

router.route("/order/new").post(verifyUserAuth, createNewOrder)
router.route("/order/cancel/:id").put(verifyUserAuth, cancelOrder)
router.route("/order/:id").get(verifyUserAuth, getSingleOrder)
router.route("/admin/order/:id")
.put(verifyUserAuth,roleBasedAccess('admin'), updateOrderStauts)
.get(verifyUserAuth,roleBasedAccess('admin'), getSingleOrder)

router.route("/admin/orders/").get(verifyUserAuth,roleBasedAccess('admin'), getAllOrder)
router.route("/orders/user").get(verifyUserAuth, allMyOrder)




export default router