/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Định tuyến cho Sản phẩm (Express Router for Products).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Khai báo tất cả các đường dẫn API (Endpoints) liên quan đến Sản phẩm và Đánh giá (Review).
 *    - Đóng vai trò "nhân viên điều hướng": Khi có một yêu cầu gửi đến URL nào đó, file này sẽ chỉ định hàm nào trong Controller sẽ xử lý.
 *    - Tích hợp các lớp bảo mật (Middleware) để bảo vệ các thao tác quan trọng (như xóa sản phẩm, import kho).
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Sản phẩm (Product Flow) & Luồng Quản trị (Admin Inventory Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Express Router: Công cụ chia nhỏ các tuyến đường của ứng dụng.
 *    - HTTP Methods: GET (Lấy dữ liệu), POST (Tạo mới), PUT (Cập nhật), DELETE (Xóa).
 *    - Middleware Integration: Kết hợp `verifyUserAuth` và `roleBasedAccess` để kiểm tra quyền hạn trước khi cho phép vào Controller.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Các HTTP Request từ Client (Browser, Postman).
 *    - Output: Chuyển hướng Request đến đúng hàm xử lý trong `productController.js`.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - Đường dẫn động `:id`: Dùng để xác định sản phẩm cụ thể thông qua ID của nó trong MongoDB.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - Nhóm Công khai (Public): Xem toàn bộ sản phẩm, xem chi tiết 1 sản phẩm.
 *    - Nhóm Quản trị (Admin): Chỉ dành cho Role `admin`. Bao gồm các tính năng nâng cao như Import hàng loạt từ Excel, Kiểm tra tồn kho, Cập nhật thông tin nhanh.
 *    - Nhóm Đánh giá (Reviews): Cho phép người dùng đã đăng nhập viết nhận xét.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Request đến `app.js` được dẫn về đây thông qua tiền tố `/api/v1`.
 *    - Bước 2: Router kiểm tra xem URL khớp với định nghĩa nào.
 *    - Bước 3: Nếu là Route Admin, hệ thống sẽ chạy Middleware `verifyUserAuth` (check login) rồi đến `roleBasedAccess` (check quyền admin).
 *    - Bước 4: Nếu pass middleware, hàm Controller tương ứng sẽ thực thi.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Client -> [Middleware] -> Controller -> Database -> Trả JSON về Client.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Sử dụng `verifyUserAuth` để đảm bảo người dùng đã đăng nhập khi muốn viết Review.
 *    - Sử dụng `roleBasedAccess("admin")` để khóa chặt các tính năng chỉnh sửa dữ liệu.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - File này chỉ khai báo cấu hình, các xử lý bất đồng bộ thực sự diễn ra trong Controller.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Cấu trúc `router.route("/path").get().post()` giúp mã nguồn trông gọn gàng hơn khi nhiều phương thức dùng chung một đường dẫn.
 *    - Lưu ý thứ tự: Khi thêm route mới, hãy đảm bảo các route cụ thể (như `/admin/products/search`) nằm **TRƯỚC** các route có tham số động (như `/admin/products/:id`) để Express không nhầm lẫn "search" là một "id".
 */
import express from "express";
import {
  getAllProducts,
  getSingleProduct,
  getAdminProducts,
  createReviewProduct,
  getReviewProduct,
  deleteReviewProduct,
  createProducts,
  updateProduct,
  deteteProduct,
  importProducts,
  importProductsPreCheck,
  updateProductsBulk,
  importStock,
  updateStock,
  searchProducts
} from "../controllers/productController.js";

import { verifyUserAuth, roleBasedAccess } from "../middleware/userAuth.js";

const router = express.Router();

// ======================= PUBLIC ROUTES =======================
router.route("/products").get(getAllProducts);
router.route("/products/:id").get(getSingleProduct);

// ======================= ADMIN ROUTES =======================
router
  .route("/admin/products")
  .get(verifyUserAuth, roleBasedAccess("admin"), getAdminProducts);


router
  .route("/admin/products/create")
  .post(verifyUserAuth, roleBasedAccess("admin"), createProducts);

// Import sản phẩm hàng loạt từ Excel/CSV
router
  .route("/admin/products/import")
  .post(verifyUserAuth, roleBasedAccess("admin"), importProducts);

// Kiểm tra sản phẩm tồn tại trước khi import
router
  .route("/admin/products/import-precheck")
  .post(verifyUserAuth, roleBasedAccess("admin"), importProductsPreCheck);

// Cập nhật sản phẩm hàng loạt từ Excel/CSV
router
  .route("/admin/products/update-bulk")
  .put(verifyUserAuth, roleBasedAccess("admin"), updateProductsBulk);

// Import tồn kho hàng loạt
router
  .route("/admin/products/import-stock")
  .put(verifyUserAuth, roleBasedAccess("admin"), importStock);

// Tìm kiếm sản phẩm theo tên
router
  .route("/admin/products/search")
  .get(verifyUserAuth, roleBasedAccess("admin"), searchProducts);

// Cập nhật tồn kho 1 sản phẩm
router
  .route("/admin/products/:id/stock")
  .put(verifyUserAuth, roleBasedAccess("admin"), updateStock);

router
  .route("/admin/products/:id")
  .put(verifyUserAuth, roleBasedAccess("admin"), updateProduct)
  .delete(verifyUserAuth, roleBasedAccess("admin"), deteteProduct);

// ======================= REVIEWS =======================
router.route("/review").put(verifyUserAuth, createReviewProduct);

router
  .route("/reviews")
  .get(verifyUserAuth, getReviewProduct)
  .delete(verifyUserAuth, deleteReviewProduct);

export default router;
