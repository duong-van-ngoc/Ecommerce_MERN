const DEFAULT_FRONTEND_URL = "http://localhost:5173";
const DEFAULT_VNPAY_HOST = "https://sandbox.vnpayment.vn";

/**
 * Mục đích:
 * - Xóa dấu `/` thừa ở cuối URL hoặc string.
 *
 * Ví dụ:
 * - `http://localhost:5173/` -> `http://localhost:5173`
 * - `https://abc.com///` -> `https://abc.com`
 *
 * Khi nào được gọi:
 * - Trước khi dùng URL môi trường để tránh nối path bị `//`
 */
export const trimTrailingSlashes = (value = "") =>
    String(value || "").trim().replace(/\/+$/, "");

/**
 * Mục đích:
 * - Lấy base URL của frontend từ biến môi trường.
 * - Nếu không có env thì fallback về localhost.
 *
 * Khi nào được gọi:
 * - `aiPromptService` dùng để build link sản phẩm trong prompt
 * - CORS config cũng dùng để biết frontend nào được phép gọi backend
 */
export const getFrontendBaseUrl = () =>
    trimTrailingSlashes(process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL);

/**
 * Mục đích:
 * - Parse biến môi trường kiểu boolean.
 *
 * Ví dụ:
 * - `"true"` -> true
 * - `"1"` -> true
 * - `"yes"` -> true
 * - `undefined` -> fallback
 */
export const parseBooleanEnv = (value, fallback = false) => {
    if (value === undefined || value === null || value === "") {
        return fallback;
    }

    return ["1", "true", "yes", "on"].includes(String(value).trim().toLowerCase());
};

/**
 * Mục đích:
 * - Chuẩn hóa host VNPay thành dạng origin sạch.
 *
 * Ví dụ:
 * - `https://sandbox.vnpayment.vn/abc` -> `https://sandbox.vnpayment.vn`
 *
 * Nếu parse URL lỗi:
 * - Trả raw value đã trim để tránh crash
 */
const normalizeVnpayHost = (value) => {
    const rawValue = trimTrailingSlashes(value || DEFAULT_VNPAY_HOST);

    try {
        return new URL(rawValue).origin;
    } catch {
        return rawValue;
    }
};

/**
 * Mục đích:
 * - Trả về toàn bộ runtime config liên quan tới VNPay.
 *
 * Output:
 * - `tmnCode`
 * - `secureSecret`
 * - `vnpayHost`
 * - `testMode`
 * - `returnUrl`
 *
 * Khi nào được gọi:
 * - Payment controller gọi khi cần tạo request thanh toán VNPay
 */
export const getVnpayRuntimeConfig = () => {
    const vnpayHost = normalizeVnpayHost(
        process.env.VNPAY_HOST ||
        process.env.VNP_HOST ||
        process.env.VNP_URL ||
        DEFAULT_VNPAY_HOST
    );

    return {
        tmnCode: process.env.VNP_TMN_CODE,
        secureSecret: process.env.VNP_HASH_SECRET,
        vnpayHost,
        testMode: parseBooleanEnv(
            process.env.VNPAY_TEST_MODE ?? process.env.VNP_TEST_MODE,
            vnpayHost.includes("sandbox") || process.env.NODE_ENV !== "production"
        ),
        returnUrl: trimTrailingSlashes(process.env.VNP_RETURN_URL || ""),
    };
};

/**
 * Mục đích:
 * - Bắt buộc VNPay config phải đủ trước khi dùng.
 * - Nếu thiếu biến môi trường quan trọng thì throw lỗi ngay.
 *
 * Khi nào được gọi:
 * - Payment flow gọi trước khi tạo link thanh toán hoặc xác thực config
 */
export const requireVnpayRuntimeConfig = () => {
    const config = getVnpayRuntimeConfig();
    const missing = [];

    if (!config.tmnCode) missing.push("VNP_TMN_CODE");
    if (!config.secureSecret) missing.push("VNP_HASH_SECRET");
    if (!config.returnUrl) missing.push("VNP_RETURN_URL");

    if (missing.length > 0) {
        throw new Error(`Missing VNPay environment variables: ${missing.join(", ")}`);
    }

    return config;
};

/**
 * Mục đích:
 * - Trả về danh sách origin frontend hợp lệ cho CORS.
 *
 * Logic:
 * - Luôn cho phép `FRONTEND_URL`
 * - Nếu không phải production thì cho phép thêm các localhost phổ biến
 *
 * Khi nào được gọi:
 * - `app.js` dùng để cấu hình CORS cho backend
 */
export const getAllowedFrontendOrigins = () => {
    const origins = [getFrontendBaseUrl()];

    if (process.env.NODE_ENV !== "production") {
        origins.push("http://localhost:5173", "http://localhost:5174", "http://localhost:3000");
    }

    return [...new Set(origins.filter(Boolean))];
};

/**
 * ========================= TỔNG KẾT FILE =========================
 *
 * 1. File này dùng để làm gì?
 * - Gom các runtime config cần dùng lúc app đang chạy
 * - Chủ yếu phục vụ:
 *   + frontend base URL
 *   + VNPay config
 *   + CORS origin list
 *
 * 2. Dữ liệu lấy từ đâu?
 * - Lấy từ `process.env`
 *
 * 3. Liên quan gì tới cụm AI chat?
 * - `aiPromptService` dùng `getFrontendBaseUrl()` để tạo link sản phẩm trong prompt
 *
 * 4. Chỗ intern cần học kỹ:
 * - Fallback config
 * - Parse env boolean
 * - Vì sao cần normalize URL
 * - Vì sao CORS cần danh sách origin rõ ràng
 */
