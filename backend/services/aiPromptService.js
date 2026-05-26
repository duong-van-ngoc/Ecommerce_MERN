// Prompt service for AI chat - builds prompts and formats context/responses
import { getFrontendBaseUrl } from "../config/runtimeConfig.js";

/**
 * Mục đích:
 * - Chuyển danh sách sản phẩm thành một đoạn text có cấu trúc để AI đọc.
 * - AI model không "hiểu" object JS như con người, nên cần đổi product data thành text.
 *
 * Input:
 * @param {Array} products - Filtered product list
 * - Đây là danh sách sản phẩm đã được lọc trước ở service khác.
 *
 * Output:
 * @returns {string}
 * - Trả về một chuỗi text dài, mỗi sản phẩm là một block thông tin riêng.
 *
 * Khi nào được gọi:
 * - `chatService` gọi hàm này trước khi build prompt gửi sang Gemini.
 */
export function formatProductContext(products) {
    return products.map((p, i) => {
        // Cho AI biết tình trạng tồn kho hiện tại để ưu tiên gợi ý đúng sản phẩm.
        const stockStatus = p.stock > 0
            ? (p.stock <= 5 ? `Sắp hết (Chỉ còn ${p.stock})` : "Còn hàng")
            : "Hết hàng";

        // Ghép category thành một đường dẫn để AI hiểu sản phẩm thuộc nhóm nào.
        const category = p.category
            ? `${p.category.level1} > ${p.category.level2} > ${p.category.level3}`
            : "N/A";

        // Nếu có giá gốc lớn hơn giá bán, thêm thông tin giảm giá vào context.
        const saleInfo = p.originalPrice > p.price
            ? ` | GIẢM GIÁ: -${Math.round((1 - p.price / p.originalPrice) * 100)}% (Giá gốc: ${p.originalPrice.toLocaleString("vi-VN")}đ)`
            : "";

        // Lấy ảnh đầu tiên để AI có thêm ngữ cảnh mô tả.
        const imageUrl = p.images?.[0]?.url || "";

        // Nếu sản phẩm đang "hot", gắn thêm nhãn để AI có thể ưu tiên nhắc đến.
        const trendingTag = p.trending ? " [HOT 🔥 - XU HƯỚNG]" : "";

        // Mỗi sản phẩm được biến thành 1 block text rõ ràng:
        // ID, tên, giá, category, vibe, style, stock, rating, mô tả...
        return `[SẢN PHẨM ${i + 1}]
ID: ${p._id}
Tên: ${p.name}${trendingTag}
Giá bán: ${p.price.toLocaleString("vi-VN")}đ${saleInfo}
Hạng mục: ${category}
Vibe: ${p.vibe || "Chưa xác định"} | Style: ${p.style || "Chưa xác định"}
Thương hiệu: ${p.brand || "N/A"} | Chất liệu: ${p.material || "N/A"}
Đặc điểm: ${p.sizes?.length > 0 ? `Size: ${p.sizes.join("/")}` : ""} | ${p.colors?.length > 0 ? `Màu: ${p.colors.join("/")}` : ""}
Tình trạng: ${stockStatus} | Đã bán: ${p.sold} | Đánh giá: ${p.ratings}/5
Ảnh: ${imageUrl}
Mô tả: ${(p.description || "").substring(0, 150)}...`;
    }).join("\n\n---\n\n");
}

/**
 * Mục đích:
 * - Chuyển lịch sử chat thành một chuỗi text để AI nhớ được ngữ cảnh hội thoại.
 * - Nếu gửi cả lịch sử quá dài thì prompt sẽ tốn token, nên chỉ lấy phần gần đây.
 *
 * Input:
 * @param {Array} history - [{role, content}, ...]
 * - `history` là các tin nhắn cũ giữa user và chatbot.
 *
 * Output:
 * @returns {string|null}
 * - Trả về chuỗi lịch sử nếu có.
 * - Trả về `null` nếu chưa có hội thoại trước đó.
 *
 * Khi nào được gọi:
 * - `chatService` gọi trước khi build prompt.
 */
export function formatHistoryContext(history) {
    if (!history || history.length === 0) return null;

    // Chỉ lấy 6 tin nhắn gần nhất để giữ prompt gọn.
    const recent = history.slice(-6);

    // Đổi role "user/assistant" thành tên để prompt tự nhiên hơn.
    return recent.map((msg) => {
        const role = msg.role === "user" ? "Khách" : "Tobi";
        return `${role}: ${msg.content}`;
    }).join("\n");
}

/**
 * Mục đích:
 * - Ghép tất cả context thành một prompt hoàn chỉnh gửi cho Gemini.
 * - Đây là hàm "định hình" chatbot: vai trò, quy tắc, phong cách trả lời.
 *
 * Input:
 * - `productContext`: chuỗi thông tin sản phẩm đã được format.
 * - `historyContext`: chuỗi lịch sử chat đã được format.
 * - `userMessage`: câu hỏi hiện tại của user.
 * - `includeShopInfo`: có truyền vào nhưng hiện tại chưa được dùng trong logic.
 * - `userName`: tên để AI xưng hô cho tự nhiên.
 *
 * Output:
 * - Trả về một string prompt đầy đủ.
 *
 * Khi nào được gọi:
 * - `chatService` gọi ngay trước lúc gửi prompt sang Gemini API.
 */
export function buildPrompt({ productContext, historyContext, userMessage, includeShopInfo, userName = "bạn" }) {
    // Biến này hiện tại chưa được dùng bên dưới.
    // Có khả năng team dự định mở rộng logic cho first message trong tương lai.
    const isFirstMessage = !historyContext;
    const frontendUrl = getFrontendBaseUrl();

    // Tránh warning "declared but never used" trong trường hợp rule lint chặt hơn sau này.
    void includeShopInfo;
    void isFirstMessage;

    // SYSTEM_INSTRUCTION là phần quan trọng nhất của prompt:
    // nó bắt AI đóng vai stylist, phải chèn link, phải gợi ý outfit, phải giữ tone giao tiếp.
    const SYSTEM_INSTRUCTION = `Bạn là "TOBI" - CHUYÊN GIA TẠO MẪU & TƯ VẤN PHONG CÁCH CÁ NHÂN (PERSONAL STYLIST PRO).
Mục tiêu: Biến trải nghiệm mua sắm của ${userName} thành một hành trình thời trang đẳng cấp.

QUY TẮC CỐ ĐỊNH (PHẢI TUÂN THỦ):
1. MỖI SẢN PHẨM GỢI Ý PHẢI CÓ LINK MUA HÀNG.
   - Định dạng: [Tên SP - Giá](${frontendUrl}/product/\${ID})
   - Nút chốt đơn: [THÊM VÀO GIỎ HÀNG NGAY 🛒](${frontendUrl}/cart/add/\${ID})
2. KHÔNG ĐƯỢC chỉ viết tên sản phẩm suông. Nếu không có link, người dùng không thể mua được.
3. PHỐI ĐỒ: Luôn gợi ý 2-3 món tạo thành 1 outfit hoàn chỉnh.

VÍ DỤ PHẢN HỒI CHUẨN:
"Chào Ngọc! Với phong cách Streetwear, Tobi gợi ý bộ này nhé:
- [Áo Hoodie đen - 350.000đ](${frontendUrl}/product/123)
- [Quần Cargo - 450.000đ](${frontendUrl}/product/456)
- [THÊM ÁO VÀO GIỎ 🛒](${frontendUrl}/cart/add/123)
- [THÊM QUẦN VÀO GIỎ 🛒](${frontendUrl}/cart/add/456)"

NHÂN CÁCH: Chuyên nghiệp, sành điệu, sử dụng icon (✨, 👕, 👟). Chủ động hỏi chiều cao/cân nặng để tư vấn size.`;

    // Nếu có lịch sử thì chèn vào prompt.
    // Nếu không có thì bỏ qua để prompt ngắn hơn.
    const historySection = historyContext ? `
HISTORY CONTEXT:
${historyContext}
` : "";

    // Prompt cuối cùng gửi cho Gemini theo thứ tự:
    // 1. System instruction
    // 2. Danh sách sản phẩm
    // 3. Lịch sử chat
    // 4. Câu hỏi hiện tại của user
    return `${SYSTEM_INSTRUCTION}

AVAILABLE PRODUCTS (CONTEXT):
${productContext}

${historySection}

USER QUESTION: "${userMessage}"
💬 TOBI PERSONAL STYLIST RESPONSE:`;
}

/**
 * Mục đích:
 * - Dọn dẹp response AI trước khi trả về frontend.
 * - Model đôi lúc thêm prefix hoặc ký tự trang trí không cần thiết.
 *
 * Input:
 * @param {string} rawResponse
 * - `rawResponse` là kết quả gốc trả về từ Gemini.
 *
 * Output:
 * @returns {string}
 * - Chuỗi đã được làm sạch để UI hiển thị gọn hơn.
 *
 * Khi nào được gọi:
 * - `chatService` gọi sau khi nhận kết quả từ Gemini.
 */
export function formatResponse(rawResponse) {
    return rawResponse
        .trim()
        // Bỏ các đầu nhãn không cần thiết nếu model tự thêm vào.
        .replace(/^(Trả lời:|Phản hồi:|Bot:|ChatBot:)/i, "")
        // Rút gọn số dòng trống quá nhiều.
        .replace(/\n{3,}/g, "\n\n")
        // Bỏ một số khung ký tự unicode nếu model tự vẽ.
        .replace(/╔═.*═╗/g, "")
        .replace(/╚═.*═╝/g, "")
        .trim();
}

/**
 * Mục đích:
 * - Lọc ra các sản phẩm còn hàng.
 *
 * Input:
 * - `products`: danh sách sản phẩm.
 *
 * Output:
 * - Mảng mới chỉ gồm các sản phẩm có `stock > 0`.
 *
 * Khi nào được gọi:
 * - Hiện tại đã export để tái sử dụng, nhưng `chatService` chưa dùng trực tiếp.
 */
export function filterAvailableProducts(products) {
    return products.filter((p) => p.stock > 0);
}

/**
 * Mục đích:
 * - Lấy ra nhóm sản phẩm bán chạy nhất.
 *
 * Input:
 * - `products`: danh sách sản phẩm.
 * - `limit`: số lượng sản phẩm tối đa cần lấy.
 *
 * Output:
 * - Mảng sản phẩm còn hàng, được sort theo `sold` giảm dần, sau đó cắt theo `limit`.
 *
 * Khi nào được gọi:
 * - Hiện tại đã export để tái sử dụng, nhưng `chatService` chưa gọi trực tiếp.
 */
export function getBestSellers(products, limit = 3) {
    return products
        .filter((p) => p.stock > 0)
        .sort((a, b) => b.sold - a.sold)
        .slice(0, limit);
}

/**
 * ========================= TỔNG KẾT FILE =========================
 *
 * File này để làm gì?
 * - Đây là file chuyên lo "viết prompt" cho AI.
 * - Nó KHÔNG query DB.
 * - Nó KHÔNG gọi Gemini trực tiếp.
 * - Nó KHÔNG xử lý route/controller.
 *
 * Luồng hoạt động để intern hiểu nhanh:
 * - User gửi câu hỏi
 *   -> chatService lấy products từ cache/database
 *   -> filterService lọc product liên quan
 *   -> formatProductContext() biến products thành text
 *   -> formatHistoryContext() biến lịch sử chat thành text
 *   -> buildPrompt() ghép thành prompt hoàn chỉnh
 *   -> chatService gửi prompt sang Gemini
 *   -> Gemini trả về raw text
 *   -> formatResponse() dọn output
 *   -> controller trả về frontend
 *
 * Logic từng hàm:
 * - formatProductContext(): biến data sản phẩm thành context để AI đọc.
 * - formatHistoryContext(): giữ ngữ cảnh hội thoại.
 * - buildPrompt(): quy định role, style, quy tắc bắt buộc cho AI.
 * - formatResponse(): làm sạch kết quả AI.
 * - filterAvailableProducts(): lọc sản phẩm còn hàng.
 * - getBestSellers(): lấy sản phẩm bán chạy.
 *
 * Điểm dễ nhầm:
 * - includeShopInfo đang được truyền vào nhưng chưa được sử dụng trong prompt.
 * - isFirstMessage được khai báo nhưng hiện tại chưa tham gia logic.
 * - File này phụ trách "prompt engineering", không phải "business logic sản phẩm".
 *
 * Gợi ý cải thiện:
 * - Có thể tách SYSTEM_INSTRUCTION ra file config riêng.
 * - Có thể xóa param/biến chưa dùng nếu team chưa cần.
 * - Có thể thêm fallback prompt khi không có productContext.
 */
