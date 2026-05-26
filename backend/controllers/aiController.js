import { getEnvironmentStatus } from "../config/loadEnv.js";
import { askChatbot } from "../services/chatService.js";

/**
 * Mục đích:
 * - Đây là controller chính của AI chat.
 * - Nó nhận request từ route, kiểm tra điều kiện, quản lý session chat trong RAM,
 *   gọi `chatService`, rồi trả JSON response về cho frontend.
 *
 * File này dùng để làm gì?
 * - Điều phối request/response của module AI chat.
 * - Gắn sessionId với lịch sử chat tương ứng.
 * - Kiểm tra xem config môi trường có bị "stale" hay không.
 *
 * Dữ liệu trong file này lấy từ đâu?
 * - `req.body.message`: tin nhắn user gửi từ frontend
 * - `req.body.sessionId`: ID session do frontend quản lý và gửi lên
 * - `getEnvironmentStatus()`: lấy trạng thái config backend hiện tại
 * - `askChatbot()`: service xử lý logic chatbot thật sự
 *
 * Props / Component / use client / Server Component:
 * - Không áp dụng.
 * - Đây là file backend controller, không phải component React/Next.js.
 */

/**
 * `conversationHistory` là bộ nhớ tạm trong RAM của server.
 *
 * Cấu trúc:
 * - key: `sessionId`
 * - value: mảng history của session đó
 *
 * Ví dụ:
 * Map {
 *   "session-abc" => [
 *     { role: "user", content: "áo hoodie đen" },
 *     { role: "assistant", content: "..." }
 *   ]
 * }
 *
 * Lưu ý:
 * - Restart server là mất toàn bộ dữ liệu này.
 */
const conversationHistory = new Map();

/**
 * Mục đích:
 * - Chuẩn hóa payload debug khi có lỗi xảy ra.
 * - Giúp controller trả về lỗi dễ đọc hơn cho developer.
 *
 * Input:
 * - `error`: lỗi vừa bắt được
 * - `envStatus`: trạng thái môi trường hiện tại
 *
 * Output:
 * - Trả về object debug có đủ thông tin: code, message, status, env...
 *
 * Khi nào được gọi:
 * - Trong `catch` của `chat()`
 */
const buildDebugPayload = (error = {}, envStatus = getEnvironmentStatus()) => ({
    name: error?.name || "Error",
    code: error?.code || "UNKNOWN_ERROR",
    status: error?.status || 500,
    message: error?.debugMessage || error?.message || "Unknown error",
    model: error?.model || null,
    retryable: Boolean(error?.retryable),
    env: {
        source: envStatus.source,
        loadedAt: envStatus.loadedAt,
        stale: envStatus.stale,
        missing: envStatus.missing,
        loadedFingerprint: envStatus.loadedFingerprint,
        currentFingerprint: envStatus.currentFingerprint
    }
});

/**
 * Mục đích:
 * - Trả response riêng khi backend đang chạy config cũ
 *   và cần restart để nạp config.env mới.
 *
 * Input:
 * - `res`: Express response
 * - `envStatus`: trạng thái môi trường
 *
 * Output:
 * - Trả về HTTP 503 với message rõ ràng cho frontend/developer
 *
 * Khi nào được gọi:
 * - Trong `chat()` nếu `envStatus.stale === true`
 */
const respondConfigReloadRequired = (res, envStatus) => {
    const debug = {
        reason: "config.env changed after the current server process started",
        env: {
            source: envStatus.source,
            loadedAt: envStatus.loadedAt,
            loadedFingerprint: envStatus.loadedFingerprint,
            currentFingerprint: envStatus.currentFingerprint
        }
    };

    console.warn("[AI Chat] config.env changed after startup. Restart backend to load the new values.", debug);

    return res.status(503).json({
        success: false,
        error: "CONFIG_RELOAD_REQUIRED",
        userMessage: "Backend đang chạy cấu hình cũ. Hãy restart server để nạp config.env mới.",
        debug
    });
};

/**
 * Mục đích:
 * - Đây là endpoint chính của AI chat.
 * - Nhận message + sessionId, lấy history, gọi `askChatbot()`,
 *   cập nhật lại history, rồi trả câu trả lời về cho frontend.
 *
 * Input:
 * - `req.body.message`
 * - `req.body.sessionId`
 *
 * Output:
 * - JSON response gồm:
 *   + `success`
 *   + `data` (reply của AI)
 *   + `sessionId`
 *   + `historyLength`
 *   + thông tin env cơ bản
 *
 * Khi nào được gọi:
 * - Khi frontend gọi POST `/chat`
 */
export const chat = async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        const envStatus = getEnvironmentStatus();

        // Bước 1:
        // Nếu backend đang chạy config cũ sau khi file env đã đổi,
        // chặn luôn để tránh gọi AI bằng cấu hình sai.
        if (envStatus.stale) {
            return respondConfigReloadRequired(res, envStatus);
        }

        // Bước 2:
        // Validate tối thiểu ở tầng controller.
        if (!message) {
            return res.status(400).json({
                success: false,
                error: "message is required"
            });
        }

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                error: "sessionId is required"
            });
        }

        // Bước 3:
        // Lấy history cũ theo sessionId.
        let history = conversationHistory.get(sessionId);

        // Nếu chưa có session này thì khởi tạo session mới.
        if (!history) {
            history = [];
            conversationHistory.set(sessionId, history);
            console.log(`[AI Chat] new session ${sessionId}`);
        }

        console.log(`[AI Chat] session=${sessionId}, history=${history.length}`);

        // Bước 4:
        // Gọi service chatbot để lấy reply từ AI.
        const reply = await askChatbot(message, history);

        // Bước 5:
        // Cập nhật lại history trong RAM để các câu sau AI còn nhớ ngữ cảnh.
        history.push({ role: "user", content: message });
        history.push({ role: "assistant", content: reply });

        // Bước 6:
        // Chỉ giữ tối đa 20 message gần nhất.
        // Mục tiêu:
        // - tránh history quá dài
        // - giảm token cho các prompt sau
        const MAX_MESSAGES = 20;
        if (history.length > MAX_MESSAGES) {
            history.splice(0, history.length - MAX_MESSAGES);
        }

        conversationHistory.set(sessionId, history);

        // Bước 7:
        // Trả response thành công về frontend.
        return res.json({
            success: true,
            data: reply,
            sessionId,
            historyLength: history.length,
            env: {
                loadedAt: envStatus.loadedAt,
                loadedFingerprint: envStatus.loadedFingerprint
            }
        });
    } catch (error) {
        const envStatus = getEnvironmentStatus();
        const debug = buildDebugPayload(error, envStatus);
        const userMessage =
            error?.userMessage ||
            "Xin lỗi, mình đang gặp lỗi khi xử lý. Bạn thử lại sau vài giây nhé!";

        console.error("[AI Chat] request failed", debug);

        return res.status(error?.status || 500).json({
            success: false,
            error: debug.code,
            userMessage,
            debug
        });
    }
};

/**
 * Mục đích:
 * - Xóa lịch sử chat của một session cụ thể.
 *
 * Input:
 * - `req.body.sessionId`
 *
 * Output:
 * - JSON báo đã xóa thành công hoặc session đã rỗng sẵn
 *
 * Khi nào được gọi:
 * - Khi frontend gọi POST `/chat/clear`
 */
export const clearHistory = (req, res) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                error: "sessionId is required"
            });
        }

        if (conversationHistory.has(sessionId)) {
            conversationHistory.delete(sessionId);
            console.log(`[AI Chat] cleared session ${sessionId}`);
            return res.json({ success: true, message: "History cleared successfully" });
        }

        // Nếu session không còn tồn tại thì coi như đã clear rồi.
        console.log(`[AI Chat] clear requested for missing session ${sessionId}`);
        return res.json({
            success: true,
            message: "History already cleared",
            alreadyCleared: true
        });
    } catch (error) {
        console.error("[AI Chat] clear history failed", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};

/**
 * Mục đích:
 * - Trả về thống kê/debug của module AI chat.
 *
 * Output:
 * - Tổng số session hiện tại
 * - Trạng thái config env
 * - Danh sách session + số lượng message
 *
 * Khi nào được gọi:
 * - Khi frontend/dev gọi GET `/chat/stats`
 */
export const getStats = (req, res) => {
    const envStatus = getEnvironmentStatus();

    return res.json({
        success: true,
        totalSessions: conversationHistory.size,
        env: {
            source: envStatus.source,
            loadedAt: envStatus.loadedAt,
            stale: envStatus.stale,
            loadedFingerprint: envStatus.loadedFingerprint,
            currentFingerprint: envStatus.currentFingerprint
        },
        sessions: Array.from(conversationHistory.entries()).map(([id, history]) => ({
            sessionId: id,
            messageCount: history.length
        }))
    });
};

/**
 * Mục đích:
 * - Dọn bớt session cũ nếu số session trong RAM quá nhiều.
 *
 * Logic:
 * - Mỗi 1 giờ kiểm tra một lần
 * - Nếu số session vượt 1000
 * - Xóa bớt 100 session đầu tiên trong Map
 *
 * Lưu ý:
 * - Đây là cleanup khá đơn giản, chưa phải LRU cache thực thụ.
 * - Nhưng đủ tốt cho phase hiện tại để tránh RAM tăng mãi.
 */
setInterval(() => {
    const MAX_SESSIONS = 1000;

    if (conversationHistory.size > MAX_SESSIONS) {
        const oldestSessions = Array.from(conversationHistory.keys()).slice(0, 100);
        oldestSessions.forEach((id) => conversationHistory.delete(id));
        console.log(`[AI Chat] cleaned ${oldestSessions.length} old sessions`);
    }
}, 60 * 60 * 1000);

/**
 * ========================= TỔNG KẾT FILE =========================
 *
 * 1. Code chạy từ đâu trước?
 * - Frontend gọi route `/chat`
 * - Route chuyển vào `chat()`
 * - `chat()` validate request, lấy history, gọi `askChatbot()`
 * - Sau đó update history và trả JSON về
 *
 * 2. Khi user bấm gửi chat thì chuyện gì xảy ra?
 * - User click gửi
 * - Frontend gửi `message` + `sessionId`
 * - Controller lấy history theo `sessionId`
 * - Gọi service AI
 * - Nhận reply
 * - Lưu reply vào history
 * - Trả reply cho frontend
 *
 * 3. Nếu dữ liệu bị rỗng thì sao?
 * - Không có `message` -> trả 400
 * - Không có `sessionId` -> trả 400
 * - Session chưa tồn tại -> tạo session mới
 *
 * 4. Chỗ intern cần học kỹ:
 * - Controller khác gì Service
 * - Session in-memory hoạt động như thế nào
 * - Tại sao phải giới hạn history
 * - Tại sao config stale phải chặn sớm
 * - Error response JSON ở backend
 *
 * 5. Lưu ý quan trọng:
 * - History chỉ nằm trong RAM
 * - Restart backend là mất hết
 * - Nếu cần production-ready hơn, nên chuyển sang Redis / DB
 */
