/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Định tuyến cho Cài đặt hệ thống (System Settings Router).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Quản lý các đường dẫn API để xem và thay đổi các thiết lập vận hành của cửa hàng (như tên công ty, địa chỉ, email nhận thông báo).
 *    - Đảm bảo tính bảo mật tuyệt đối cho cấu hình hệ thống: Chỉ những tài khoản có quyền Admin cao nhất mới được phép đọc hoặc sửa đổi các thông tin này.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Quản trị (Admin) & Cấu hình (Settings Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - RESTful API Design: Sử dụng `GET` để lấy dữ liệu và `PUT` để cập nhật toàn bộ cấu hình.
 *    - Route Chaining: Kỹ thuật gom các phương thức HTTP khác nhau (`.get()`, `.put()`) vào cùng một đường dẫn duy nhất để code gọn gàng, dễ bảo trì.
 *    - Middleware Chain: Xếp chồng nhiều lớp bảo vệ (Check Login -> Check Admin Role) trước khi cho phép vào Controller chính.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Yêu cầu lấy thông tin hoặc dữ liệu cập nhật cài đặt từ Admin Dashboard.
 *    - Output: Chuyển hướng yêu cầu đến `settingsController.js` sau khi đã vượt qua các lớp bảo mật.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - Đường dẫn cố định: `/admin/settings` (vì đây là mô hình Singleton - chỉ có duy nhất 1 bản ghi cài đặt nên không cần ID).
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - GET: Lấy bản ghi cài đặt duy nhất trong DB.
 *    - PUT: Ghi đè thông tin mới lên bản ghi cài đặt hiện có.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Admin mở trang Cài đặt trên giao diện Quản trị.
 *    - Bước 2: Request được gửi đến `verifyUserAuth` để kiểm tra Token.
 *    - Bước 3: Nếu đã đăng nhập, thông tin user được đẩy sang `roleBasedAccess('admin')` để kiểm tra quyền hạn.
 *    - Bước 4: Nếu là Admin, hàm Controller (`getSettings` hoặc `updateSettings`) sẽ được gọi để thực hiện truy vấn MongoDB.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Client -> [Authentication Layer] -> [Authorization Layer] -> Settings Controller -> Database.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Phân quyền: Sử dụng "Security Layers" (Lớp bảo mật đa tầng) để ngăn chặn mọi rủi ro rò rỉ cấu hình hệ thống.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - File chỉ chứa cấu hình.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Tại sao không dùng ID trong URL? Vì hệ thống dùng mô hình Singleton, dữ liệu cài đặt luôn được lấy từ bản ghi đầu tiên hoặc duy nhất trong collection `settings`.
 *    - Hãy chú ý thứ tự chạy Middleware trong `router.route()`: `verifyUserAuth` phải chạy trước để xác định danh tính (req.user), sau đó mới có dữ liệu role cho `roleBasedAccess` kiểm tra.
 */
import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { verifyUserAuth, roleBasedAccess } from '../middleware/userAuth.js';

/**
 * Settings Routes
 * 
 * RESTFUL API DESIGN:
 * - GET /api/v1/admin/settings  → Lấy settings
 * - PUT /api/v1/admin/settings  → Update settings (full update)
 * 
 * LÝ DO DÙNG ROUTE CHAINING:
 * router.route('/path').get().put().delete()
 * - Clean code: Gom các methods cùng path vào 1 chỗ
 * - DRY: Không lặp lại path string
 * - Maintainable: Dễ thêm/xóa methods
 */
const router = express.Router();

/**
 * ========================================
 * ADMIN SETTINGS ROUTE
 * ========================================
 * 
 * Path: /api/v1/admin/settings
 * 
 * MIDDLEWARE CHAIN (chạy từ trái sang phải):
 * 
 * 1. verifyUserAuth
 *    - Kiểm tra JWT token trong cookies/headers
 *    - Decode token → lấy user ID
 *    - Query user từ DB
 *    - Inject user vào req.user
 *    - Nếu fail → return 401 Unauthorized
 * 
 * 2. roleBasedAccess('admin')
 *    - Kiểm tra req.user.role === 'admin'
 *    - Nếu không phải admin → return 403 Forbidden
 *    - Chỉ cho phép admin truy cập
 * 
 * 3. getSettings / updateSettings
 *    - Controller function xử lý logic
 *    - Chỉ chạy nếu pass 2 middleware trước
 * 
 * SECURITY LAYERS:
 * - Layer 1: Authentication (đã đăng nhập?)
 * - Layer 2: Authorization (có quyền admin?)
 * - Layer 3: Business Logic (data validation, processing)
 */
router.route('/admin/settings')
    .get(
        verifyUserAuth,           // Middleware 1: Check authentication
        roleBasedAccess('admin'), // Middleware 2: Check authorization
        getSettings               // Controller: Handle request
    )
    .put(
        verifyUserAuth,           // Middleware 1: Check authentication
        roleBasedAccess('admin'), // Middleware 2: Check authorization
        updateSettings            // Controller: Handle request
    );

/**
 * Export router
 * Sẽ được import vào app.js và mount vào Express app
 * app.use('/api/v1', settingsRoutes)
 */
export default router;
