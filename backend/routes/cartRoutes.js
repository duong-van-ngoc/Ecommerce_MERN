/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Định tuyến cho Giỏ hàng (Express Router for Cart).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Quản lý các con đường (Endpoints) cho phép người dùng tương tác với giỏ hàng của họ trên máy chủ.
 *    - Hỗ trợ tính năng "giỏ hàng xuyên thiết bị": Người dùng thêm sản phẩm vào giỏ thì dữ liệu sẽ được lưu vào DB thay vì chỉ ở trình duyệt.
 *    - Cung cấp tính năng đồng bộ hóa (Sync) giỏ hàng khi người dùng chuyển từ trạng thái khách sang trạng thái đã đăng nhập.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Giỏ hàng (Cart Flow) & Luồng Trải nghiệm người dùng (UX Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Express Router: Định nghĩa cấu trúc API cho giỏ hàng.
 *    - Authentication Middleware: Sử dụng `verifyUserAuth` để đảm bảo mọi thao tác với giỏ hàng đều phải gắn với một tài khoản cụ thể.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Yêu cầu lấy giỏ hàng, thêm/sửa/xóa sản phẩm từ ứng dụng React.
 *    - Output: Điều hướng yêu cầu đến các hàm xử lý logic trong `cartController.js`.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - Không áp dụng.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `getCart`: Lấy danh sách sản phẩm hiện có trong giỏ hàng của User.
 *    - `syncCart`: Hợp nhất dữ liệu giỏ hàng từ LocalStorage (khi chưa login) vào Database (sau khi login).
 *    - `updateCartItem`: Thêm sản phẩm mới hoặc thay đổi số lượng, màu sắc, kích cỡ.
 *    - `removeCartItem`: Loại bỏ một mặt hàng cụ thể ra khỏi giỏ.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Người dùng thực hiện thao tác trên giao diện Giỏ hàng.
 *    - Bước 2: Request gửi đến kèm theo Cookie Token.
 *    - Bước 3: Middleware `verifyUserAuth` xác thực danh tính và lấy ra thông tin `req.user`.
 *    - Bước 4: Controller xử lý nghiệp vụ dựa trên `req.user.id` và trả về kết quả JSON.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Client -> Router -> Middleware -> Controller -> MongoDB (Carts collection) -> Response.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Bắt buộc đăng nhập (`verifyUserAuth`) cho tất cả các hành động để bảo vệ dữ liệu cá nhân.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - File chỉ chứa cấu hình điều hướng.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Lưu ý: Tại sao lại dùng `POST` cho việc xóa (`removeCartItem`)? Một số lập trình viên ưu tiên dùng `POST` kèm body để tránh các vấn đề về Query String phức tạp, tuy nhiên bạn cũng có thể cân nhắc chuyển sang `DELETE` nếu muốn chuẩn RESTful hơn.
 *    - Route `/cart/sync` là chìa khóa để giữ chân khách hàng: Nó đảm bảo khách không phải chọn lại đồ sau khi họ vừa dành thời gian tạo giỏ hàng trước khi đăng nhập.
 */
import express from "express";
import { 
    getCart, 
    syncCart, 
    updateCartItem, 
    revalidateCart,
    removeCartItem 
} from "../controllers/cartController.js";
import { verifyUserAuth } from "../middleware/userAuth.js";

const router = express.Router();

router.route("/").get(verifyUserAuth, getCart);
router.route("/sync").post(verifyUserAuth, syncCart);
router.route("/revalidate").post(verifyUserAuth, revalidateCart);
router.route("/item").post(verifyUserAuth, updateCartItem);
router.route("/item/:productId").delete(verifyUserAuth, removeCartItem);

export default router;
