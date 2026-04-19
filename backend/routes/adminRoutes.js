/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Định tuyến cho Trang quản trị (Admin Dashboard Router).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Cung cấp các lối vào (Endpoints) để lấy dữ liệu tổng hợp phục vụ cho giao diện Bảng điều khiển (Dashboard).
 *    - Giúp Admin có cái nhìn nhanh về tình hình kinh doanh thông qua các con số thống kê và danh sách đơn hàng mới.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Quản trị (Admin Dashboard) & Báo cáo thống kê (Reporting).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Express Router: Quản lý các tuyến đường API.
 *    - Admin specialized Middleware: Sử dụng `isAuthenticatedAdmin` để bảo vệ các route chỉ dành cho Quản trị viên cấp cao.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Các yêu cầu lấy thông tin tổng quát từ giao diện Admin.
 *    - Output: Điều hướng yêu cầu đến các hàm tính toán thống kê trong `adminController.js`.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - Không áp dụng.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `/dashboard`: API lấy các chỉ số quan trọng (Tổng doanh thu, Tổng đơn hàng, Tổng khách hàng,...).
 *    - `/orders/recent`: API lấy danh sách các đơn hàng vừa mới phát sinh để hiển thị trên Dashboard.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Admin truy cập vào trang Dashboard của ứng dụng.
 *    - Bước 2: Frontend gọi đồng thời các API trong file này.
 *    - Bước 3: Middleware `isAuthenticatedAdmin` kiểm tra quyền hạn.
 *    - Bước 4: Nếu hợp lệ, Controller sẽ truy vấn Database và trả về dữ liệu JSON đã được tổng hợp.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Client -> Router -> Middleware -> Controller -> Trả kết qủa JSON.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Phân quyền: Cực kỳ nghiêm ngặt, chỉ Role `admin` mới có thể gọi các API này.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - File chỉ chứa cấu hình điều hướng.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Lưu ý: File này sử dụng một middleware riêng là `isAuthenticatedAdmin` (đã được định nghĩa trong `adminAuth.js`) thay vì dùng bộ đôi `verifyUserAuth` + `roleBasedAccess`. Điều này giúp code route Admin trở nên ngắn gọn hơn.
 */
import express from 'express';
import { getDashboardStats, getRecentOrders, getRevenueAnalytics } from '../controllers/adminController.js';
import { isAuthenticatedAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// Admin Dashboard Statistics
router.get('/dashboard', isAuthenticatedAdmin, getDashboardStats);

// Revenue Analytics (Chart)
router.get('/analytics/revenue', isAuthenticatedAdmin, getRevenueAnalytics);

// Recent Orders
router.get('/orders/recent', isAuthenticatedAdmin, getRecentOrders);

export default router;
