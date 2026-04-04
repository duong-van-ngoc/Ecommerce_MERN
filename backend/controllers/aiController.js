/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Bộ điều khiển Trợ lý ảo AI (AI Chatbot Controller).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Là "bộ não" điều phối cuộc hội thoại giữa người dùng và Trợ lý ảo Tobi (sử dụng Gemini AI).
 *    - Quản lý lịch sử trò chuyện (Conversation Context) để AI có thể hiểu và trả lời dựa trên các câu hỏi trước đó.
 *    - Đảm bảo tính nhất quán của cấu hình hệ thống (như API Keys) trước khi thực hiện các yêu cầu AI tốn phí.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Trợ lý AI (AI Assistant Flow) & Trải nghiệm khách hàng thông minh.
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - In-memory Caching (Map): Lưu trữ lịch sử chat trực tiếp trong RAM của server để truy xuất cực nhanh theo `sessionId`.
 *    - Session Management: Phân biệt các cuộc hội thoại khác nhau của nhiều người dùng cùng lúc.
 *    - Environmental Fingerprinting: Kỹ thuật so sánh mã băm (hash) của file cấu hình để phát hiện lỗi "Stale Config" (Backend chưa nhận API Key mới).
 *    - Memory Management: Tự động cắt giảm lịch sử quá dài (`MAX_MESSAGES`) và dọn dẹp session cũ (`setInterval`) để tránh tràn RAM.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Tin nhắn văn bản từ Client và `sessionId` định danh.
 *    - Output: Câu trả lời từ AI (JSON) kèm theo các thông tin về trạng thái hệ thống.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - Sử dụng biến toàn cục `conversationHistory` (Map) để lưu trạng thái tạm thời của các cuộc chat.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `chat`: Hàm xử lý chính, kiểm tra điều kiện, gọi AI Service và quản lý bộ nhớ đệm lịch sử.
 *    - `clearHistory`: Cho phép xóa dữ liệu hội thoại khi khách muốn "làm lại từ đầu".
 *    - `getStats`: Cung cấp số liệu thống kê về lượng người đang chat và tình trạng cấu hình cho Developer.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Tiếp nhận tin nhắn và `sessionId`.
 *    - Bước 2: Kiểm tra xem file `.env` có bị thay đổi không (`stale check`).
 *    - Bước 3: Lấy lịch sử chat cũ từ `Map` (nếu có).
 *    - Bước 4: Gửi tin nhắn kèm lịch sử sang `chatService` để gọi Gemini AI.
 *    - Bước 5: Cập nhật câu trả lời mới vào lịch sử và trả về cho Client.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - User -> Route -> Controller -> chatService -> Google Gemini API -> Controller -> User. (Lưu ý: Không dùng Database, dùng RAM để tối ưu tốc độ phản hồi).
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Giới hạn tối đa 20 tin nhắn gần nhất (`MAX_MESSAGES`) để tiết kiệm Token và giữ context tập trung.
 *    - Cơ chế dọn dẹp session sau mỗi 1 giờ để giải phóng tài nguyên server.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Hàm `chat` là bất đồng bộ (`async`) vì phải chờ đợi phản hồi từ trí tuệ nhân tạo (có thể mất vài giây).
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Lịch sử chat được lưu trong RAM: Nếu bạn restart Server, toàn bộ lịch sử hội thoại hiện tại sẽ bị xóa sạch.
 *    - `sessionId`: Frontend cần quản lý và gửi ID này một cách nhất quán (thường lưu ở sessionStorage hoặc UUID) để AI không bị "mất trí nhớ" giữa các câu hỏi.
 */
import { getEnvironmentStatus } from "../config/loadEnv.js";
import { askChatbot } from "../services/chatService.js";

const conversationHistory = new Map();

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
        userMessage: "Backend dang chay cau hinh cu. Hay restart server de nap config.env moi.",
        debug
    });
};

export const chat = async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        const envStatus = getEnvironmentStatus();

        if (envStatus.stale) {
            return respondConfigReloadRequired(res, envStatus);
        }

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

        let history = conversationHistory.get(sessionId);

        if (!history) {
            history = [];
            conversationHistory.set(sessionId, history);
            console.log(`[AI Chat] new session ${sessionId}`);
        }

        console.log(`[AI Chat] session=${sessionId}, history=${history.length}`);

        const reply = await askChatbot(message, history);

        history.push({ role: "user", content: message });
        history.push({ role: "assistant", content: reply });

        const MAX_MESSAGES = 20;
        if (history.length > MAX_MESSAGES) {
            history.splice(0, history.length - MAX_MESSAGES);
        }

        conversationHistory.set(sessionId, history);

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
            "Xin loi, minh dang gap loi khi xu ly. Ban thu lai sau vai giay nhe!";

        console.error("[AI Chat] request failed", debug);

        return res.status(error?.status || 500).json({
            success: false,
            error: debug.code,
            userMessage,
            debug
        });
    }
};

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

setInterval(() => {
    const MAX_SESSIONS = 1000;

    if (conversationHistory.size > MAX_SESSIONS) {
        const oldestSessions = Array.from(conversationHistory.keys()).slice(0, 100);
        oldestSessions.forEach((id) => conversationHistory.delete(id));
        console.log(`[AI Chat] cleaned ${oldestSessions.length} old sessions`);
    }
}, 60 * 60 * 1000);
