/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Định tuyến cho Trợ lý ảo AI (AI Chatbot Router).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Cung cấp các "cánh cổng" (Endpoints) để Frontend kết nối với bộ não AI của hệ thống (Trợ lý Tobi).
 *    - Quản lý việc gửi nhận tin nhắn, xóa lịch sử trò chuyện và theo dõi hiệu năng của chatbot.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Trợ lý AI (AI Assistant Flow) & Chăm sóc khách hàng tự động.
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Express Router: Định nghĩa các đường dẫn cho tính năng Chat.
 *    - AI Integration: Kết nối với Google Gemini API (thông qua Controller) để xử lý ngôn ngữ tự nhiên.
 *    - RESTful API: Sử dụng các phương thức POST để bảo mật dữ liệu và nội dung tin nhắn dài.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Tin nhắn văn bản từ người dùng gửi qua ứng dụng React.
 *    - Output: Điều hướng yêu cầu đến `aiController.js` để xử lý và trả về phản hồi thông minh từ AI.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - Không áp dụng.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `/chat`: Đầu nhận tin nhắn chính của người dùng.
 *    - `/chat/clear`: Xóa sạch lịch sử hội thoại hiện tại (thường dùng khi người dùng muốn bắt đầu chủ đề mới).
 *    - `/chat/stats`: Endpoint dành cho môi trường phát triển để kiểm tra tình trạng kết nối và số lượng token/tin nhắn.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Người dùng gõ tin nhắn vào khung chat trên trang web.
 *    - Bước 2: Request POST gửi đến URL `/ai/chat`.
 *    - Bước 3: Router chuyển yêu cầu vào Controller.
 *    - Bước 4: Controller gọi sang API của Google Gemini, nhận kết quả và trả về cho người dùng.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - User -> API Server -> aiController -> Google Gemini Cloud -> API Server -> User.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Hiện tại các route này là Public (Công khai) để khách vãng lai cũng có thể hỏi đáp về sản phẩm.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - File chỉ chứa cấu hình.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Chatbot Tobi được huấn luyện dựa trên dữ liệu sản phẩm thực tế của cửa hàng (RAG logic), do đó các endpoint này là cầu nối sống còn để tăng tỷ lệ chuyển đổi đơn hàng.
 *    - Nếu bạn muốn lưu lịch sử chat vào Database thay vì chỉ dùng trong Session, hãy cân nhắc thêm Middleware `verifyUserAuth` vào các route này.
 */
// AI Chat routes
import express from "express";
import { chat, clearHistory, getStats } from "../controllers/aiController.js";

const router = express.Router();

// Main chat endpoint
router.post("/chat", chat);

// Clear session history
router.post("/chat/clear", clearHistory);

// Get stats (debug)
router.get("/chat/stats", getStats);

export default router;
