import askGemini from "../utils/geminiUtils.js";
import { getProducts } from "./cacheService.js";
import { filterRelevantProducts, validateInput } from "./filterService.js";
import {
    formatProductContext,
    formatHistoryContext,
    buildPrompt,
    formatResponse
} from "./aiPromptService.js";
import { logInteraction } from "./analyticsService.js";

/**
 * Mục đích:
 * - Đây là service trung tâm của luồng AI chat.
 * - Nó nhận câu hỏi của user, chuẩn bị dữ liệu sản phẩm, build prompt, gọi Gemini,
 *   sau đó làm sạch câu trả lời và trả kết quả về cho controller.
 *
 * File này dùng để làm gì?
 * - Điều phối toàn bộ luồng xử lý chatbot.
 * - Kết nối các service nhỏ hơn:
 *   + `filterService`: kiểm tra input, lọc sản phẩm liên quan
 *   + `cacheService`: lấy sản phẩm từ cache
 *   + `aiPromptService`: biến dữ liệu thành prompt cho AI
 *   + `analyticsService`: ghi log analytics nếu bật
 *   + `geminiUtils`: gọi Gemini API thật
 *
 * Dữ liệu lấy từ đâu?
 * - `userMessage`: đến từ controller gọi hàm này.
 * - `conversationHistory`: cũng do controller truyền vào, thường lấy từ session / RAM.
 * - `options`: do controller truyền vào để tùy chỉnh như tên user, bật analytics...
 * - `products`: lấy từ `getProducts()` trong `cacheService`.
 *
 * Props / Component / use client / Server Component:
 * - Không áp dụng.
 * - Đây là file backend Node.js, không phải component Next.js/React.
 *
 * Input:
 * @param {string} userMessage - Tin nhắn hiện tại của user
 * @param {Array} conversationHistory - Lịch sử chat trước đó
 * @param {Object} options - Tùy chọn thêm như userName, enableAnalytics...
 *
 * Output:
 * - Trả về string là câu trả lời cuối cùng của chatbot.
 *
 * Khi nào được gọi?
 * - Thường được `aiController` gọi khi frontend gửi request chat lên backend.
 */
export async function askChatbot(userMessage, conversationHistory = [], options = {}) {
    try {
        // Bước 1:
        // Kiểm tra input user có hợp lệ không.
        // Ví dụ: rỗng, quá ngắn, hoặc vi phạm rule nào đó.
        const validation = validateInput(userMessage);
        if (!validation.valid) {
            return validation.message;
        }

        // Bước 2:
        // Lấy toàn bộ sản phẩm từ cache/data source.
        // Ý tưởng là không query đi query lại DB quá nhiều cho mỗi tin nhắn.
        const products = await getProducts();

        // Bước 3:
        // Lọc ra những sản phẩm liên quan nhất với câu hỏi user.
        // Ví dụ user hỏi "áo hoodie đen", service sẽ cố lấy các product gần chủ đề đó.
        const relevantProducts = filterRelevantProducts(products, userMessage);

        // Bước 4:
        // Chuyển danh sách sản phẩm thành text để AI đọc được.
        const productContext = formatProductContext(relevantProducts);

        // Bước 5:
        // Chuyển lịch sử chat thành text để AI nhớ mạch hội thoại.
        const historyContext = formatHistoryContext(conversationHistory);

        // Bước 6:
        // Ghép tất cả thành prompt hoàn chỉnh.
        // Prompt sẽ bao gồm:
        // - vai trò của AI
        // - danh sách sản phẩm
        // - lịch sử chat
        // - câu hỏi mới nhất của user
        const prompt = buildPrompt({
            productContext,
            historyContext,
            userMessage,
            userName: options.userName,
            includeShopInfo: options.includeShopInfo !== false
        });

        // Bước 7:
        // Gửi prompt sang Gemini để lấy câu trả lời.
        const response = await askGemini(prompt);

        // Bước 8:
        // Nếu AI trả về rỗng hoặc chỉ toàn khoảng trắng, trả về fallback message.
        // Đây là lớp bảo vệ để controller/frontend luôn nhận được nội dung có nghĩa.
        if (!response || response.trim().length === 0) {
            return "Xin lỗi bạn, mình đang gặp chút vấn đề kỹ thuật. Bạn thử hỏi lại sau vài giây nhé!";
        }

        // Bước 9:
        // Nếu bật analytics thì ghi log tương tác.
        // Lưu ý: đây chỉ là log phụ, không phải phần bắt buộc để chatbot trả lời.
        if (options.enableAnalytics) {
            await logInteraction(userMessage, response, relevantProducts);
        }

        // Bước 10:
        // Làm sạch output AI rồi mới trả về cho controller/frontend.
        return formatResponse(response);
    } catch (error) {
        // Nếu có lỗi ở bất kỳ bước nào:
        // - Ghi lại log debug để developer dễ điều tra
        // - Throw lại để controller xử lý response HTTP phù hợp
        console.error("Chatbot error:", {
            name: error?.name,
            code: error?.code,
            status: error?.status,
            message: error?.debugMessage || error?.message
        });
        throw error;
    }
}

/**
 * Re-export:
 * - Cho phép file khác import `clearCache` từ `chatService`
 *   mà không cần biết implementation thực tế nằm ở `cacheService`.
 *
 * Ý nghĩa:
 * - `chatService` đóng vai trò như một entry point của module AI chat,
 *   gom các chức năng liên quan về một chỗ.
 */
export { clearCache } from "./cacheService.js";

/**
 * ========================= TỔNG KẾT FILE =========================
 *
 * 1. Code chạy từ đâu trước?
 * - User gửi tin nhắn ở frontend
 * - Request đi vào `aiController`
 * - `aiController` gọi `askChatbot()`
 * - `askChatbot()` validate input
 * - Lấy products từ cache
 * - Lọc products liên quan
 * - Build prompt
 * - Gọi Gemini
 * - Ghi analytics (nếu bật)
 * - Làm sạch response
 * - Trả câu trả lời về controller
 *
 * 2. Khi user bấm gửi chat thì chuyện gì xảy ra?
 * - Frontend gọi API chat
 * - Backend controller nhận request
 * - Controller gọi `askChatbot()`
 * - Hàm này xử lý toàn bộ luồng AI và trả về text cuối cùng
 *
 * 3. Nếu dữ liệu bị rỗng thì sao?
 * - Nếu `userMessage` không hợp lệ:
 *   + `validateInput()` sẽ chặn sớm và trả message lỗi
 * - Nếu Gemini trả về rỗng:
 *   + trả fallback message thân thiện
 * - Nếu `relevantProducts` rỗng:
 *   + `productContext` sẽ gần như rỗng
 *   + AI vẫn có thể trả lời, nhưng chất lượng gợi ý sản phẩm có thể giảm
 *
 * 4. Chỗ intern cần học kỹ:
 * - Cách chia service nhỏ và để một service trung tâm điều phối
 * - Validate input trước khi gọi API tốn phí
 * - Prompt flow: raw data -> context text -> prompt -> AI response
 * - Error handling ở backend
 * - Tư duy "fallback response" khi service ngoài trả lỗi/rỗng
 *
 * 5. Lưu ý quan trọng:
 * - File này không xử lý HTTP trực tiếp
 * - File này không biết gì về UI
 * - File này chỉ lo business flow của chatbot
 */
