import { GoogleGenerativeAI } from "@google/generative-ai";

// Model mặc định đang dùng để gọi Gemini
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

/**
 * Mục đích:
 * - Đây là custom error riêng cho các lỗi khi gọi Gemini.
 * - Thay vì throw `Error` chung chung, class này giúp backend giữ được:
 *   + message kỹ thuật cho developer
 *   + userMessage thân thiện cho frontend
 *   + status code
 *   + error code
 *   + model đang dùng
 *   + thông tin retryable hay không
 *
 * Vì sao cần class riêng?
 * - Controller/service phía trên sẽ bắt lỗi dễ hơn
 * - Frontend có thể nhận lỗi có cấu trúc rõ ràng hơn
 */
export class GeminiRequestError extends Error {
    constructor({
        message,
        userMessage,
        debugMessage,
        status = 500,
        code = "GEMINI_REQUEST_FAILED",
        model = DEFAULT_GEMINI_MODEL,
        retryable = false,
        cause = null
    }) {
        super(message);
        this.name = "GeminiRequestError";
        this.userMessage = userMessage;
        this.debugMessage = debugMessage;
        this.status = status;
        this.code = code;
        this.model = model;
        this.retryable = retryable;
        this.cause = cause;
    }
}

/**
 * Mục đích:
 * - Tạo delay giữa các lần retry.
 *
 * Input:
 * - `ms`: số mili giây cần chờ
 *
 * Output:
 * - Promise resolve sau `ms`
 *
 * Khi nào được gọi:
 * - Khi Gemini bị rate limit và cần chờ rồi thử lại.
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mục đích:
 * - Chuyển lỗi thô từ Gemini SDK thành object lỗi chuẩn của hệ thống mình.
 * - Đây là nơi map lỗi kỹ thuật sang lỗi dễ hiểu hơn.
 *
 * Input:
 * - `error`: lỗi gốc từ Gemini SDK/network
 * - `modelName`: tên model đang gọi
 * - `fallbackMessage`: message dự phòng nếu error không có message rõ ràng
 *
 * Output:
 * - Trả về object lỗi chuẩn hóa:
 *   + message
 *   + userMessage
 *   + debugMessage
 *   + status
 *   + code
 *   + retryable
 */
function buildGeminiError(error, modelName, fallbackMessage) {
    const status = error?.status || error?.httpStatusCode || 500;
    const rawMessage = (error?.message || fallbackMessage || "Unknown Gemini error")
        .replace(/\s+/g, " ")
        .trim();

    // Trường hợp model không tồn tại hoặc model name sai
    if (status === 404) {
        return {
            message: "Gemini model is unavailable",
            userMessage: "Model AI hiện tại không khả dụng. Kiểm tra lại model hoặc restart backend để nạp config mới.",
            debugMessage: rawMessage,
            status,
            code: "GEMINI_MODEL_NOT_FOUND",
            model: modelName,
            retryable: false
        };
    }

    // Trường hợp API key sai, hết hạn hoặc không đủ quyền
    if (status === 401 || status === 403) {
        return {
            message: "Gemini authentication failed",
            userMessage: "Gemini API key không hợp lệ, đã hết hạn, hoặc chưa có quyền với model này.",
            debugMessage: rawMessage,
            status,
            code: "GEMINI_AUTH_FAILED",
            model: modelName,
            retryable: false
        };
    }

    // Trường hợp bị quá hạn mức gọi API
    if (status === 429) {
        return {
            message: "Gemini rate limited",
            userMessage: "Gemini đang bận hoặc key đã chạm hạn mức. Bạn thử lại sau ít phút nhé.",
            debugMessage: rawMessage,
            status,
            code: "GEMINI_RATE_LIMITED",
            model: modelName,
            retryable: true
        };
    }

    // Trường hợp lỗi mạng / không gọi được tới Gemini API
    if (/fetch failed/i.test(rawMessage)) {
        return {
            message: "Gemini network request failed",
            userMessage: "Backend chưa kết nối được tới Gemini API. Kiểm tra mạng, firewall, proxy, hoặc DNS của server.",
            debugMessage: rawMessage,
            status,
            code: "GEMINI_NETWORK_ERROR",
            model: modelName,
            retryable: true
        };
    }

    // Trường hợp còn lại: gom về lỗi chung
    return {
        message: "Gemini request failed",
        userMessage: "Gemini đang gặp lỗi khi xử lý. Bạn mở debug để xem nguyên nhân cụ thể nhé.",
        debugMessage: rawMessage,
        status,
        code: "GEMINI_REQUEST_FAILED",
        model: modelName,
        retryable: status >= 500
    };
}

/**
 * Mục đích:
 * - Đây là hàm gọi Gemini thật sự.
 * - Nó nhận prompt đã được build từ `chatService`/`aiPromptService`,
 *   gọi model của Google, rồi trả text về.
 *
 * Logic chính:
 * 1. Tạo client Gemini từ API key
 * 2. Chọn model
 * 3. Gọi `generateContent(prompt)`
 * 4. Nếu bị 429 thì retry với exponential backoff
 * 5. Nếu lỗi khác thì chuẩn hóa lỗi và throw
 *
 * Input:
 * - `prompt`: chuỗi prompt hoàn chỉnh
 * - `maxRetries`: số lần retry tối đa khi bị rate limit
 *
 * Output:
 * - Trả về text response của Gemini
 *
 * Khi nào được gọi:
 * - `chatService` gọi sau khi đã build xong prompt.
 */
async function askGemini(prompt, maxRetries = 3) {
    // Khởi tạo Gemini client từ API key trong env
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Tên model đang dùng
    const modelName = DEFAULT_GEMINI_MODEL;

    // Lấy model instance để generate content
    const model = genAI.getGenerativeModel({ model: modelName });

    // Lặp nhiều lần nếu cần retry
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const res = await model.generateContent(prompt);
            return res.response.text();
        } catch (error) {
            const geminiError = buildGeminiError(error, modelName);

            // Nếu bị rate limit và vẫn còn lượt retry:
            // dùng exponential backoff: 2s, 4s, 8s...
            if (geminiError.status === 429 && attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 1000;
                console.warn(
                    `[Gemini] rate limited. attempt=${attempt}/${maxRetries}, delay=${delay}ms, model=${modelName}`
                );
                await sleep(delay);
                continue;
            }

            // Log lỗi kỹ thuật ra console để debug
            console.error("[Gemini] request failed", {
                attempt,
                maxRetries,
                status: geminiError.status,
                code: geminiError.code,
                model: geminiError.model,
                retryable: geminiError.retryable,
                message: geminiError.debugMessage
            });

            // Throw custom error để service/controller phía trên xử lý thống nhất
            throw new GeminiRequestError({
                ...geminiError,
                cause: error
            });
        }
    }

    // Nếu đã retry hết mà vẫn bị rate limit thì throw lỗi cuối cùng.
    throw new GeminiRequestError({
        message: "Gemini stayed rate limited after retries",
        userMessage: "Gemini đang bận quá mức cho phép. Bạn thử lại sau ít phút nhé.",
        debugMessage: `Gemini remained rate limited after ${maxRetries} attempts.`,
        status: 429,
        code: "GEMINI_RATE_LIMITED",
        model: DEFAULT_GEMINI_MODEL,
        retryable: true
    });
}

export default askGemini;

/**
 * ========================= TỔNG KẾT FILE =========================
 *
 * 1. File này dùng để làm gì?
 * - Gọi Google Gemini API thật sự
 * - Map lỗi kỹ thuật thành lỗi chuẩn của hệ thống
 * - Retry khi bị rate limit
 *
 * 2. Code chạy từ đâu trước?
 * - `chatService` gọi `askGemini(prompt)`
 * - `askGemini()` khởi tạo client
 * - Chọn model
 * - Gọi `generateContent(prompt)`
 * - Thành công thì trả text
 * - Thất bại thì map lỗi và throw
 *
 * 3. Khi user bấm gửi chat thì chuyện gì xảy ra?
 * - User click gửi
 * - Frontend -> controller -> chatService
 * - `chatService` build prompt
 * - File này là nơi đem prompt đó đi hỏi Gemini thật
 *
 * 4. Nếu dữ liệu bị rỗng thì sao?
 * - File này không tự kiểm tra prompt rỗng
 * - Nó chỉ cố gọi Gemini với prompt nhận được
 * - Việc fallback response khi Gemini trả rỗng đang nằm ở `chatService`
 *
 * 5. Chỗ intern cần học kỹ:
 * - Custom Error class
 * - Retry với exponential backoff
 * - Phân biệt lỗi 401/403/404/429/500
 * - Tách `userMessage` và `debugMessage`
 * - Vì sao utility gọi AI không nên tự trả HTTP response
 */
