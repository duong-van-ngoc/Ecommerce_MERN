import crypto from "crypto";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

/**
 * Mục đích:
 * - Đây là file nạp biến môi trường từ `config.env` vào `process.env`.
 * - Ngoài việc load env, file này còn theo dõi xem env hiện tại có bị "stale" không.
 *
 * "Stale" ở đây nghĩa là gì?
 * - File `config.env` ngoài ổ đĩa đã thay đổi
 * - Nhưng process backend đang chạy vẫn giữ giá trị cũ trong RAM
 * - Lúc đó phải restart backend để nạp lại
 *
 * File này dùng để làm gì trong cụm AI chat?
 * - `geminiUtils` cần `process.env.GEMINI_API_KEY`
 * - `aiController` dùng `getEnvironmentStatus()` để biết config có bị stale không
 *
 * Props / Component / use client / Server Component:
 * - Không áp dụng.
 * - Đây là file backend config utility.
 */

// Cờ để tránh load env nhiều lần không cần thiết
let envLoaded = false;

// Metadata về lần load env hiện tại
let envMetadata = {
    source: "process",
    loadedAt: null,
    envPath: null,
    loadedFingerprint: null,
    loadedMtimeMs: null
};

/**
 * Mục đích:
 * - Tạo fingerprint ngắn cho nội dung file env.
 * - Dùng để phát hiện file env có thay đổi hay không.
 *
 * Input:
 * - `content`: nội dung file env
 *
 * Output:
 * - Chuỗi hash ngắn độ dài 12 ký tự
 */
const buildFingerprint = (content = "") =>
    crypto.createHash("sha1").update(content).digest("hex").slice(0, 12);

/**
 * Mục đích:
 * - Đọc metadata của file env hiện tại:
 *   + đường dẫn
 *   + fingerprint
 *   + thời gian sửa cuối
 *
 * Input:
 * - `envPath`: đường dẫn file env
 *
 * Output:
 * - `null` nếu file không tồn tại
 * - object metadata nếu file tồn tại
 */
const readEnvFileMetadata = (envPath) => {
    if (!envPath || !fs.existsSync(envPath)) {
        return null;
    }

    const content = fs.readFileSync(envPath, "utf8");
    const stats = fs.statSync(envPath);

    return {
        envPath,
        fingerprint: buildFingerprint(content),
        mtimeMs: stats.mtimeMs
    };
};

/**
 * Mục đích:
 * - Load biến môi trường vào `process.env`.
 *
 * Logic:
 * - Nếu đã load rồi thì bỏ qua
 * - Nếu không chạy trên Vercel:
 *   + tìm `config.env`
 *   + dùng `dotenv.config()`
 *   + lưu fingerprint + metadata
 * - Nếu chạy trên Vercel:
 *   + coi nguồn env là platform-env
 *
 * Khi nào được gọi:
 * - Thường được gọi lúc app/server bootstrap
 */
export const loadEnvironment = () => {
    if (envLoaded) {
        return;
    }

    const loadedAt = new Date().toISOString();

    // Local / server tự host:
    // load trực tiếp từ file `config.env`
    if (!process.env.VERCEL) {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const envPath = path.resolve(__dirname, "config.env");
        const result = dotenv.config({ path: envPath });

        if (result.error) {
            console.error("Lỗi khi nạp config.env:", result.error);
        } else {
            const count = Object.keys(result.parsed || {}).length;
            console.log(`[loadEnv] Đã nạp ${count} biến từ ${envPath}`);
        }

        const fileMetadata = readEnvFileMetadata(envPath);
        envMetadata = {
            source: "config.env",
            loadedAt,
            envPath,
            loadedFingerprint: fileMetadata?.fingerprint || null,
            loadedMtimeMs: fileMetadata?.mtimeMs || null
        };
    } else {
        // Vercel:
        // biến env được platform inject sẵn, không cần đọc file local
        envMetadata = {
            source: "platform-env",
            loadedAt,
            envPath: null,
            loadedFingerprint: null,
            loadedMtimeMs: null
        };
    }

    envLoaded = true;
};

/**
 * Mục đích:
 * - Trả về trạng thái hiện tại của môi trường.
 * - Đây là hàm giúp controller biết config đang ổn hay đã bị stale.
 *
 * Output:
 * - object trạng thái gồm:
 *   + source
 *   + loadedAt
 *   + envPath
 *   + loadedFingerprint
 *   + currentFingerprint
 *   + stale
 *   + missing
 *
 * Khi nào được gọi:
 * - `aiController` gọi trước khi xử lý chat
 */
export const getEnvironmentStatus = () => {
    const baseStatus = {
        ...envMetadata,
        canCheckForChanges: false,
        stale: false,
        currentFingerprint: envMetadata.loadedFingerprint,
        currentMtimeMs: envMetadata.loadedMtimeMs,
        missing: false
    };

    // Nếu không có envPath thì không có file local để so sánh
    // (ví dụ chạy trên Vercel)
    if (!envMetadata.envPath) {
        return baseStatus;
    }

    const currentMetadata = readEnvFileMetadata(envMetadata.envPath);

    // Nếu file env đã biến mất sau khi app chạy
    if (!currentMetadata) {
        return {
            ...baseStatus,
            canCheckForChanges: true,
            currentFingerprint: null,
            currentMtimeMs: null,
            missing: true
        };
    }

    // So fingerprint hiện tại với fingerprint lúc load ban đầu.
    // Nếu khác nhau => file env đã đổi => config stale.
    return {
        ...baseStatus,
        canCheckForChanges: true,
        currentFingerprint: currentMetadata.fingerprint,
        currentMtimeMs: currentMetadata.mtimeMs,
        stale: Boolean(
            envMetadata.loadedFingerprint &&
            envMetadata.loadedFingerprint !== currentMetadata.fingerprint
        )
    };
};

/**
 * ========================= TỔNG KẾT FILE =========================
 *
 * 1. Code chạy từ đâu trước?
 * - `server.js` hoặc `app.js` gọi `loadEnvironment()`
 * - File này nạp env vào `process.env`
 * - Sau đó các file khác mới dùng được biến env
 *
 * 2. Khi user bấm gửi chat thì chuyện gì xảy ra?
 * - `aiController` gọi `getEnvironmentStatus()`
 * - Nếu env stale thì chặn request AI
 * - Nếu env ổn thì tiếp tục gọi `chatService`
 *
 * 3. Nếu dữ liệu bị rỗng thì sao?
 * - Nếu file env không tồn tại:
 *   + metadata có thể là `null`
 *   + `missing: true`
 * - Nếu API key không có / sai:
 *   + lỗi thật sẽ xảy ra ở `geminiUtils`
 *
 * 4. Chỗ intern cần học kỹ:
 * - `dotenv.config()`
 * - `process.env`
 * - Fingerprint file là gì
 * - Vì sao đổi env thường phải restart backend
 *
 * 5. Lưu ý:
 * - File này không gọi AI
 * - File này không query DB
 * - Nó là nền tảng config cho cả hệ thống
 */
