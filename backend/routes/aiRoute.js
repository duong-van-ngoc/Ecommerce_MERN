// AI Chat routes
import express from "express";
import { chat, clearHistory, getStats } from "../controllers/aiController.js";

/**
 * Mục đích:
 * - Đây là file định tuyến cho cụm AI chat.
 * - Nó khai báo các endpoint mà frontend có thể gọi để làm việc với chatbot.
 *
 * File này dùng để làm gì?
 * - Kết nối URL request với đúng controller xử lý.
 * - Có thể hiểu đơn giản:
 *   + Route là "cửa vào"
 *   + Controller là "người xử lý việc phía sau cánh cửa"
 *
 * Dữ liệu trong file này lấy từ đâu?
 * - File này không tự lấy data.
 * - Nó chỉ nhận request từ frontend/client rồi chuyển cho controller tương ứng.
 *
 * Props / Component / use client / Server Component:
 * - Không áp dụng.
 * - Đây là file backend Express Router, không phải component React/Next.js.
 *
 * Khi user click thì chuyện gì xảy ra?
 * - User bấm gửi tin nhắn ở frontend
 * - Frontend gọi API như `/chat`
 * - Route này nhận request
 * - Route chuyển request sang controller phù hợp
 */

const router = express.Router();

/**
 * Endpoint chính để chat với AI
 *
 * Luồng:
 * - Frontend gửi POST `/chat`
 * - Route gọi `chat` trong `aiController`
 * - Controller sẽ xử lý session, gọi `chatService`, rồi trả response về
 */
router.post("/chat", chat);

/**
 * Endpoint xóa lịch sử chat của một session
 *
 * Luồng:
 * - Frontend gửi POST `/chat/clear`
 * - Route gọi `clearHistory` trong `aiController`
 * - Controller xóa dữ liệu lịch sử tương ứng trong RAM
 */
router.post("/chat/clear", clearHistory);

/**
 * Endpoint lấy thống kê/debug của module AI chat
 *
 * Luồng:
 * - Frontend hoặc developer gọi GET `/chat/stats`
 * - Route gọi `getStats`
 * - Controller trả về số session hiện tại và trạng thái config môi trường
 */
router.get("/chat/stats", getStats);

export default router;

/**
 * ========================= TỔNG KẾT FILE =========================
 *
 * 1. Code chạy từ đâu trước?
 * - Request từ frontend đi vào đây trước
 * - Sau đó route quyết định controller nào sẽ xử lý
 *
 * 2. Nếu user click gửi chat thì sao?
 * - Frontend gọi POST `/chat`
 * - Route này chuyển sang `chat`
 *
 * 3. Nếu user bấm "xóa lịch sử" thì sao?
 * - Frontend gọi POST `/chat/clear`
 * - Route này chuyển sang `clearHistory`
 *
 * 4. Nếu muốn xem thống kê chat thì sao?
 * - Gọi GET `/chat/stats`
 * - Route này chuyển sang `getStats`
 *
 * 5. Chỗ intern cần học kỹ:
 * - Express Router là gì
 * - Khác nhau giữa Route và Controller
 * - Vì sao route nên mỏng, chỉ làm nhiệm vụ điều hướng
 */
