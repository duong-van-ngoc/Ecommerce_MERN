// Filter service for AI chat - validates input and filters relevant products

/**
 * Mục đích:
 * - Lọc ra những sản phẩm liên quan nhất tới câu hỏi của user.
 * - Đây là bước rất quan trọng trước khi build prompt cho AI.
 * - Nếu lọc tốt, AI sẽ được xem đúng sản phẩm và trả lời sát nhu cầu hơn.
 *
 * File này dùng để làm gì?
 * - Gồm 2 việc chính:
 *   + `filterRelevantProducts()`: lọc sản phẩm liên quan
 *   + `validateInput()`: kiểm tra câu hỏi user có hợp lệ không
 *
 * Dữ liệu trong file này lấy từ đâu?
 * - `products`: được `chatService` truyền vào sau khi lấy từ cache/database
 * - `userMessage`: là câu hỏi user gửi lên từ frontend qua controller -> chatService
 *
 * Props / Component / use client / Server Component:
 * - Không áp dụng.
 * - Đây là file backend service, không phải component React/Next.js.
 */

/**
 * Mục đích:
 * - Lọc danh sách sản phẩm dựa trên nội dung câu hỏi của user.
 * - Logic lọc hiện tại đi theo nhiều tầng:
 *   1. Giới tính / category level1
 *   2. Loại sản phẩm / category level2
 *   3. Thương hiệu
 *   4. Ngân sách
 *   5. Chất liệu
 *   6. Style / vibe
 *   7. Ưu tiên còn hàng
 *   8. Giới hạn số lượng product để prompt không quá dài
 *
 * Input:
 * @param {Array} products - All products from DB
 * @param {string} userMessage - User's message
 *
 * Output:
 * @returns {Array} - Filtered products
 *
 * Khi nào được gọi:
 * - Được `chatService` gọi sau khi lấy products từ cache
 *   và trước khi build prompt cho AI.
 */
export function filterRelevantProducts(products, userMessage) {
    // Chuẩn hóa câu hỏi về chữ thường để so khớp keyword dễ hơn.
    const msg = userMessage.toLowerCase();

    // Bắt đầu từ toàn bộ sản phẩm, sau đó lọc dần từng lớp.
    let filtered = [...products];

    // 1. Lọc theo GIỚI TÍNH / NHÓM CHÍNH (category.level1)
    // Ví dụ:
    // - "nam", "con trai", "đàn ông"
    // - "nữ", "con gái", "phụ nữ"
    // - "unisex"
    const genderKeywords = {
        nam: ["nam", "con trai", "đàn ông", "men"],
        nữ: ["nữ", "con gái", "phụ nữ", "women"],
        unisex: ["unisex"]
    };

    for (const [gender, keywords] of Object.entries(genderKeywords)) {
        if (keywords.some((k) => msg.includes(k))) {
            const genderFiltered = filtered.filter((p) =>
                p.category?.level1?.toLowerCase().includes(gender)
            );

            // Chỉ áp dụng bộ lọc nếu thật sự còn kết quả,
            // tránh trường hợp lọc quá tay làm mất hết sản phẩm.
            if (genderFiltered.length > 0) {
                filtered = genderFiltered;
                break;
            }
        }
    }

    // 2. Lọc theo LOẠI SẢN PHẨM (category.level2 hoặc tên sản phẩm)
    // Ví dụ:
    // - áo, quần, giày, dép, túi...
    const typeKeywords = [
        "áo", "quần", "giày", "dép", "túi", "balo", "mũ", "nón", "phụ kiện",
        "shirt", "pants", "shoes", "bag"
    ];

    for (const type of typeKeywords) {
        if (msg.includes(type)) {
            const typeFiltered = filtered.filter((p) =>
                (p.category?.level2 || "").toLowerCase().includes(type) ||
                (p.name || "").toLowerCase().includes(type)
            );

            if (typeFiltered.length > 0) {
                filtered = typeFiltered;
                break;
            }
        }
    }

    // 3. Lọc theo THƯƠNG HIỆU
    const brands = [
        "nike", "adidas", "uniqlo", "zara", "h&m", "gucci", "puma", "converse",
        "vans", "louis vuitton", "balenciaga", "new balance"
    ];

    for (const brand of brands) {
        if (msg.includes(brand)) {
            const brandFiltered = filtered.filter((p) =>
                (p.brand || "").toLowerCase().includes(brand) ||
                (p.name || "").toLowerCase().includes(brand)
            );

            if (brandFiltered.length > 0) {
                filtered = brandFiltered;
                break;
            }
        }
    }

    // 4. Lọc theo NGÂN SÁCH ở đơn vị triệu
    // Ví dụ:
    // - "2 triệu"
    // - "2tr"
    // - "dưới 2"
    // - "khoảng 2"
    const pricePatterns = [
        /(\d+)\s*(triệu|tr|trieu)/i,
        /(\d+)tr/i,
        /dưới\s*(\d+)/i,
        /khoảng\s*(\d+)/i,
        /tầm\s*(\d+)/i
    ];

    for (const pattern of pricePatterns) {
        const match = msg.match(pattern);
        if (match) {
            const budget = parseInt(match[1], 10) * 1000000;

            // Cho phép khoảng dao động 70% -> 130% để tránh lọc quá cứng.
            filtered = filtered.filter((p) =>
                p.price >= budget * 0.7 && p.price <= budget * 1.3
            );
            break;
        }
    }

    // 5. Lọc theo NGÂN SÁCH ở đơn vị nghìn / k
    // Ví dụ:
    // - "500k"
    // - "200 nghìn"
    // - "dưới 300k"
    const kPatterns = [
        /(\d+)\s*(k|nghìn|ngàn|nghin)/i,
        /dưới\s*(\d+)\s*(k|nghìn|ngàn)/i
    ];

    for (const pattern of kPatterns) {
        const match = msg.match(pattern);
        if (match) {
            const budget = parseInt(match[1], 10) * 1000;

            // Với tầm giá nhỏ hơn, nới rộng biên hơn một chút.
            filtered = filtered.filter((p) =>
                p.price >= budget * 0.5 && p.price <= budget * 1.5
            );
            break;
        }
    }

    // 6. Lọc theo CHẤT LIỆU
    const materials = ["cotton", "len", "lụa", "vải", "da", "jean", "denim", "kaki", "linen", "polyester"];

    for (const mat of materials) {
        if (msg.includes(mat)) {
            const matFiltered = filtered.filter((p) =>
                (p.material || "").toLowerCase().includes(mat) ||
                (p.description || "").toLowerCase().includes(mat)
            );

            if (matFiltered.length > 0) {
                filtered = matFiltered;
                break;
            }
        }
    }

    // 7. Lọc theo STYLE và VIBE
    // Đây là phần giúp chatbot giống "personal stylist" hơn.
    const styleKeywords = [
        "streetwear", "minimalism", "vintage", "office", "y2k",
        "old money", "sporty", "thời trang", "phong cách"
    ];
    const vibeKeywords = [
        "bí ẩn", "năng động", "quyến rũ", "phóng khoáng",
        "thanh lịch", "trẻ trung", "chill", "sang trọng"
    ];

    const styleMatch = styleKeywords.find((s) => msg.includes(s));
    const vibeMatch = vibeKeywords.find((v) => msg.includes(v));

    if (styleMatch || vibeMatch) {
        const personalityFiltered = filtered.filter((p) =>
            (styleMatch && (p.style || "").toLowerCase().includes(styleMatch)) ||
            (vibeMatch && (p.vibe || "").toLowerCase().includes(vibeMatch))
        );

        if (personalityFiltered.length > 0) {
            filtered = personalityFiltered;
        }
    }

    // 8. Ưu tiên các sản phẩm còn hàng.
    // Nếu còn ít nhất 1 sản phẩm có stock > 0 thì bỏ các sản phẩm hết hàng ra.
    const inStock = filtered.filter((p) => p.stock > 0);
    if (inStock.length > 0) {
        filtered = inStock;
    }

    // 9. Giới hạn số lượng sản phẩm tối đa để tránh prompt quá dài.
    const MAX_PRODUCTS = 15;
    if (filtered.length > MAX_PRODUCTS) {
        // Sort theo giá để có phân bố đều hơn,
        // sau đó lấy cách quãng thay vì chỉ cắt top đầu tiên.
        filtered.sort((a, b) => a.price - b.price);
        const step = Math.max(1, Math.floor(filtered.length / MAX_PRODUCTS));
        filtered = filtered.filter((_, index) => index % step === 0).slice(0, MAX_PRODUCTS);
    }

    // 10. Fallback:
    // Nếu lọc quá mạnh làm rỗng kết quả, quay về lấy một phần danh sách gốc.
    if (filtered.length === 0) {
        console.log("⚠️ Không lọc được sản phẩm phù hợp, dùng danh sách mặc định.");
        return products.slice(0, MAX_PRODUCTS);
    }

    console.log(`✅ Đã lọc: ${filtered.length}/${products.length} sản phẩm`);
    return filtered;
}

/**
 * Mục đích:
 * - Kiểm tra câu hỏi đầu vào của user có hợp lệ không trước khi gọi AI.
 * - Đây là lớp chặn sớm để:
 *   + tránh gọi AI khi input rỗng
 *   + tránh tốn chi phí API không cần thiết
 *   + giảm spam / input vô nghĩa
 *
 * Input:
 * @param {string} userMessage
 *
 * Output:
 * @returns {{valid: boolean, message?: string}}
 * - Nếu hợp lệ: `{ valid: true }`
 * - Nếu không hợp lệ: `{ valid: false, message: "..." }`
 *
 * Khi nào được gọi:
 * - `chatService` gọi ở bước đầu tiên của luồng chat.
 */
export function validateInput(userMessage) {
    // Trường hợp không có input hoặc input không phải string.
    if (!userMessage || typeof userMessage !== "string") {
        return {
            valid: false,
            message: "Bạn muốn hỏi gì ạ? 😊"
        };
    }

    // Xóa khoảng trắng đầu/cuối trước khi kiểm tra tiếp.
    const trimmed = userMessage.trim();

    // Trường hợp user chỉ nhập khoảng trắng.
    if (trimmed.length === 0) {
        return {
            valid: false,
            message: "Bạn muốn hỏi gì ạ? 😊"
        };
    }

    // Không cho câu hỏi quá dài để tránh prompt quá nặng.
    if (trimmed.length > 500) {
        return {
            valid: false,
            message: "Câu hỏi hơi dài quá bạn ơi 😅 Bạn có thể nói ngắn gọn hơn được không?"
        };
    }

    // Chặn một số dạng spam cơ bản:
    // - 1 ký tự lặp lại quá nhiều lần: aaaaaaaaaaaa
    // - Chuỗi chỉ toàn ký hiệu, không có chữ/số hợp lệ
    const spamPatterns = /(.)\1{10,}|^[^a-zA-Z0-9\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+$/;
    if (spamPatterns.test(trimmed)) {
        return {
            valid: false,
            message: "Mình không hiểu lắm, bạn có thể hỏi rõ hơn được không? 🤔"
        };
    }

    return { valid: true };
}

/**
 * ========================= TỔNG KẾT FILE =========================
 *
 * 1. Code chạy từ đâu trước?
 * - `chatService` gọi `validateInput(userMessage)` trước
 * - Nếu input hợp lệ, `chatService` gọi `filterRelevantProducts(products, userMessage)`
 * - Kết quả lọc sẽ được gửi qua `aiPromptService` để build prompt
 *
 * 2. Khi user bấm gửi chat thì chuyện gì xảy ra?
 * - Frontend gửi `message`
 * - Backend đi vào `aiController` -> `chatService`
 * - `validateInput()` kiểm tra câu hỏi
 * - `filterRelevantProducts()` quyết định AI sẽ được xem những sản phẩm nào
 * - Sau đó prompt mới được build và gửi sang Gemini
 *
 * 3. Nếu dữ liệu bị rỗng thì sao?
 * - Nếu `userMessage` rỗng:
 *   + `validateInput()` trả `valid: false`
 *   + chatbot không gọi AI
 * - Nếu lọc xong không còn sản phẩm:
 *   + hàm fallback về `products.slice(0, MAX_PRODUCTS)`
 *   + tức là vẫn đưa một danh sách mặc định cho AI
 *
 * 4. Chỗ intern cần học kỹ:
 * - Tư duy lọc dữ liệu nhiều lớp
 * - Fallback khi lọc quá tay
 * - Validate input sớm để tiết kiệm tài nguyên
 * - Khác nhau giữa "business filter" và "AI prompt"
 * - Tại sao prompt quá dài lại có hại
 *
 * 5. Lưu ý:
 * - Đây là rule-based filtering, chưa phải AI semantic search thật sự
 * - Kết quả phụ thuộc mạnh vào keyword
 * - Nếu muốn thông minh hơn sau này, có thể thay bằng embeddings / vector search
 */
