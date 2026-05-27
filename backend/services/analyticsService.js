// Analytics service for AI chat - logs interactions for insights

/**
 * Mục đích:
 * - Ghi lại một số thông tin cơ bản của cuộc trò chuyện AI để phục vụ analytics.
 * - Đây là nơi gom dữ liệu như:
 *   + User hỏi gì
 *   + Bot trả lời gì
 *   + Đã gợi ý những sản phẩm nào
 *
 * File này dùng để làm gì?
 * - Đây là một backend service rất nhỏ.
 * - Nó KHÔNG render UI.
 * - Nó KHÔNG phải component React / Next.js.
 * - Nó chỉ nhận dữ liệu từ `chatService`, đóng gói lại thành `logData`, rồi log ra console.
 * - Sau này có thể mở rộng để lưu vào database nếu team tạo model như `ChatLog`.
 *
 * Dữ liệu trong file này lấy từ đâu?
 * - `userMessage`: lấy từ service gọi tới hàm này, hiện tại là `chatService`.
 * - `botResponse`: cũng lấy từ `chatService`, sau khi Gemini trả về câu trả lời.
 * - `relevantProducts`: là danh sách sản phẩm đã được lọc là liên quan tới câu hỏi user.
 *
 * Props / Component / use client / Server Component:
 * - Không áp dụng.
 * - Đây là file backend Node.js, không phải component frontend.
 * - Không có props, không có click handler, không có `use client`.
 *
 * Khi nào được gọi?
 * - Được gọi trong `chatService.js` sau khi AI đã trả lời xong
 *   và khi `options.enableAnalytics` được bật.
 *
 * Input:
 * @param {string} userMessage
 * @param {string} botResponse
 * @param {Array} relevantProducts
 *
 * Output:
 * - Hàm này không trả dữ liệu analytics ra UI.
 * - Tác dụng chính là side effect: ghi log ra console.
 */
export async function logInteraction(userMessage, botResponse, relevantProducts) {
    try {
        // `logData` là payload analytics chuẩn hóa.
        // Đây là object mà sau này có thể đem lưu DB hoặc gửi sang dịch vụ theo dõi riêng.
        const logData = {
            // Ghi thời điểm diễn ra tương tác.
            timestamp: new Date(),

            // Câu hỏi gốc của user.
            user_message: userMessage,

            // Chỉ giữ tối đa 200 ký tự đầu của câu trả lời để log nhẹ hơn,
            // tránh console hoặc database bị quá nặng.
            bot_response: botResponse.substring(0, 200),

            // Chỉ lưu danh sách ID sản phẩm, không lưu full object để log gọn hơn.
            products_shown: relevantProducts.map((p) => p._id),

            // Tổng số sản phẩm được AI dùng làm context/gợi ý.
            products_count: relevantProducts.length
        };

        // Hiện tại analytics mới chỉ log ra console để developer/debug theo dõi.
        // Đây là bước tạm thời trước khi có bảng/model lưu chính thức.
        console.log("[Analytics]", JSON.stringify(logData, null, 2));

        // TODO:
        // Sau này nếu có model ChatLog thì có thể lưu logData xuống database.
        // Ví dụ:
        // await ChatLog.create(logData);
    } catch (error) {
        // Nếu analytics lỗi thì chỉ log lỗi ra console.
        // Chủ đích ở đây là "non-blocking":
        // chatbot vẫn hoạt động bình thường, không để analytics làm hỏng luồng chat chính.
        console.error("Analytics error:", error);

        // Không throw lỗi tiếp.
        // Nghĩa là lỗi analytics sẽ không chặn user nhận được câu trả lời từ chatbot.
    }
}

/**
 * ========================= TỔNG KẾT FILE =========================
 *
 * 1. Code chạy từ đâu trước?
 * - User gửi tin nhắn ở frontend
 * - Request đi vào `aiController`
 * - `aiController` gọi `chatService`
 * - `chatService` gọi Gemini để lấy câu trả lời
 * - Nếu bật `enableAnalytics`, `chatService` sẽ gọi `logInteraction()`
 * - `logInteraction()` tạo `logData` và in ra console
 *
 * 2. Khi user bấm vào thì chuyện gì xảy ra?
 * - File này không trực tiếp xử lý click.
 * - "Click" ở frontend thường là nút gửi chat.
 * - Sau click đó, request đi lên backend, rồi luồng mới chạy tới file này.
 * - Nghĩa là file này nằm ở đoạn cuối của luồng chat, không nằm ở UI.
 *
 * 3. Nếu dữ liệu bị rỗng thì UI hiển thị gì?
 * - File này không có UI nên tự nó không hiển thị gì cả.
 * - Nếu `relevantProducts` rỗng:
 *   + `products_shown` sẽ là `[]`
 *   + `products_count` sẽ là `0`
 *   + hàm vẫn log bình thường
 * - Nếu muốn biết UI hiển thị gì, phải xem file frontend hoặc controller/service gọi chatbot.
 *
 * 4. Chỗ intern cần học kỹ:
 * - Khái niệm service layer ở backend
 * - Side effect là gì
 * - Tại sao analytics nên non-blocking
 * - Vì sao chỉ log ID thay vì log full object
 * - Tại sao nên truncate response trước khi lưu/log
 */
