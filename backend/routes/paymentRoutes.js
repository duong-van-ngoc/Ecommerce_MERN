/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Định tuyến Thanh toán VNPay (Payment Router for VNPay Integration).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Tích hợp cổng thanh toán điện tử VNPay vào quy trình mua hàng của hệ thống MERN.
 *    - Cung cấp các điểm tiếp nhận dữ liệu để tạo giao dịch, xử lý kết quả trả về và cập nhật trạng thái đơn hàng tự động.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Thanh toán (Payment Flow) & Tích hợp bên thứ ba (Third-party Integration).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Express Router: Định nghĩa các endpoint dành riêng cho thanh toán.
 *    - IPN (Instant Payment Notification): Cơ chế thông báo tức thời giữa máy chủ VNPay và máy chủ của bạn để đảm bảo an toàn giao dịch.
 *    - URL Redirect: Chuyển hướng người dùng giữa các trang thanh toán.
 *    - Middlewares: Xác thực người dùng trước khi cho phép tạo yêu cầu thanh toán.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Yêu cầu thanh toán từ người dùng (số tiền, mã đơn hàng) hoặc dữ liệu phản hồi từ máy chủ VNPay.
 *    - Output: Điều hướng yêu cầu đến `paymentController.js` để xử lý logic băm mã (hashing) và kiểm tra chữ ký số.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - Không áp dụng.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `createVnpayPayment`: API tạo URL dẫn đến trang thanh toán của ngân hàng.
 *    - `vnpayReturn`: Route xử lý khi người dùng kết thúc thanh toán và quay lại website.
 *    - `vnpayIPN`: Route quan trọng nhất, nhận thông báo ngầm "server-to-server" để cập nhật trạng thái đơn hàng vào Database ngay cả khi người dùng tắt trình duyệt.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Người dùng nhấn "Thanh toán VNPay".
 *    - Bước 2: `createVnpayPayment` tạo URL và chuyển hướng người dùng đi.
 *    - Bước 3: Người dùng thực hiện thanh toán trên cổng VNPay.
 *    - Bước 4: VNPay gửi dữ liệu về `vnpayReturn` (để hiển thị kết quả cho khách) và `vnpayIPN` (để Backend cập nhật DB).
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Client -> [Auth Middleware] -> Controller -> VNPay Gateway -> Return/IPN Router -> Database (Cập nhật trạng thái thanh toán).
 * 
 * 10. RENDER / ĐIỀU KIỆI / VALIDATE / PHÂN QUYỀN: 
 *    - Phân quyền: Route tạo thanh toán (`create`) bắt buộc phải đăng nhập (`verifyUserAuth`).
 *    - Bảo mật: Các route CallBack (`Return` và `IPN`) không được dùng `verifyUserAuth` vì VNPay không có Token của bạn, thay vào đó chúng xác thực bằng chữ ký số `vnp_SecureHash`.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - File chỉ chứa cấu hình.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - IPN (Instant Payment Notification) là phần cực kỳ quan trọng giúp hệ thống không bị lỗi "mất tiền nhưng đơn hàng vẫn chưa thanh toán" nếu người dùng gặp sự cố mạng hoặc tắt máy sau khi trả tiền thành công.
 *    - Hãy đảm bảo `vnpayIPN` luôn luôn được mở công khai (không bọc middleware auth) để server VNPay có thể gọi tới được.
 */
import express from "express";
import { verifyUserAuth } from "../middleware/userAuth.js";
import { createVnpayPayment, vnpayReturn, vnpayIPN } from "../controllers/paymentController.js";

/**
 * ============================================================================
 * PAYMENT ROUTES: VNPay Integration
 * ============================================================================
 * 1. POST /payment/vnpay/create: Tạo URL thanh toán và redirect (Auth required)
 * 2. GET /payment/vnpay/return: Xử lý kết quả trả về trình duyệt (Redirect)
 * 3. GET /payment/vnpay/vnpay_ipn: Xử lý thông báo từ Server VNPay (IPN)
 * ============================================================================
 */
const router = express.Router();

router.route("/payment/vnpay/create").post(verifyUserAuth, createVnpayPayment);
router.route("/payment/vnpay/return").get(vnpayReturn);
router.route("/payment/vnpay/vnpay_ipn").get(vnpayIPN);

export default router;
