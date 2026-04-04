/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Bộ tải cấu hình biến môi trường (Environment Configuration Loader).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Đảm bảo các thông tin nhạy cảm và cấu hình (DB URI, Secret Keys, Port...) từ file `config.env` được nạp vào `process.env`.
 *    - Giúp ứng dụng "hiểu" được các thông số môi trường trước khi thực hiện bất kỳ logic nào khác.
 *    - Cung cấp các công cụ kiểm tra xem file cấu hình có bị thay đổi (stale) trong quá trình ứng dụng đang chạy hay không.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Hệ thống Config / Khởi tạo (Setup).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Thư viện `dotenv`: Dùng để đọc file .env.
 *    - Node.js Built-in Modules: `fs` (xử lý file), `path` (đường dẫn), `crypto` (tạo mã hash).
 *    - Fingerprinting: Dùng thuật toán SHA1 để tạo mã định danh cho nội dung file, giúp so sánh sự thay đổi.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: File vật lý `backend/config/config.env`.
 *    - Output: Đẩy các cặp Key-Value vào `process.env`. Cung cấp trạng thái thông qua `getEnvironmentStatus()`.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `envLoaded`: Cờ hiệu (boolean) để tránh việc nạp file nhiều lần gây lãng phí tài nguyên.
 *    - `envMetadata`: Đối tượng lưu trữ thông tin về nguồn gốc và thời điểm nạp biến môi trường.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `loadEnvironment()`: Hàm thực hiện nạp file `config.env`. Phân biệt giữa môi trường Local và Vercel.
 *    - `buildFingerprint()`: Tạo mã định danh duy nhất cho nội dung file để theo dõi sự thay đổi.
 *    - `getEnvironmentStatus()`: Trả về trạng thái hiện tại của biến môi trường (đã nạp chưa, có bị cũ không...).
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Kiểm tra xem đã nạp môi trường chưa (`envLoaded`).
 *    - Bước 2: Nếu không phải chạy trên Vercel, xác định đường dẫn tới file `config.env`.
 *    - Bước 3: Dùng `dotenv.config` để đẩy dữ liệu vào `process.env`.
 *    - Bước 4: Chụp ảnh metadata (fingerprint, thời gian cập nhật file).
 *    - Bước 5: Đánh dấu `envLoaded = true`.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Không tương tác trực tiếp với Database hay Request khách hàng.
 *    - Nhưng nó là "nền móng" để các file Database (db.js) lấy được URI kết nối.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Có điều kiện kiểm tra `process.env.VERCEL` để tùy chỉnh cách nạp.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Các thao tác file dùng hàm đồng bộ (`Sync`) để đảm bảo cấu hình được nạp **ngay lập tức** và **chặn** các tiến trình sau cho đến khi nạp xong.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - File này sử dụng `import.meta.url`, yêu cầu môi trường Node.js hỗ trợ ES Modules.
 *    - Luôn đảm bảo file `config.env` tồn tại trong thư mục `backend/config` khi chạy ở máy cục bộ (Local).
 *    - Mọi thay đổi trong file `config.env` sẽ không tự động cập nhật vào `process.env` trừ khi server được khởi động lại (trừ khi có logic hot-reload khác).
 */
import crypto from "crypto";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

let envLoaded = false;
let envMetadata = {
    source: "process",
    loadedAt: null,
    envPath: null,
    loadedFingerprint: null,
    loadedMtimeMs: null
};

const buildFingerprint = (content = "") =>
    crypto.createHash("sha1").update(content).digest("hex").slice(0, 12);

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

export const loadEnvironment = () => {
    if (envLoaded) {
        return;
    }

    const loadedAt = new Date().toISOString();

    if (!process.env.VERCEL) {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const envPath = path.resolve(__dirname, "config.env");
        const result = dotenv.config({ path: envPath });

        if (result.error) {
            console.error("Loi khi nap config.env:", result.error);
        } else {
            const count = Object.keys(result.parsed || {}).length;
            console.log(`[loadEnv] Da nap ${count} bien tu ${envPath}`);
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

export const getEnvironmentStatus = () => {
    const baseStatus = {
        ...envMetadata,
        canCheckForChanges: false,
        stale: false,
        currentFingerprint: envMetadata.loadedFingerprint,
        currentMtimeMs: envMetadata.loadedMtimeMs,
        missing: false
    };

    if (!envMetadata.envPath) {
        return baseStatus;
    }

    const currentMetadata = readEnvFileMetadata(envMetadata.envPath);

    if (!currentMetadata) {
        return {
            ...baseStatus,
            canCheckForChanges: true,
            currentFingerprint: null,
            currentMtimeMs: null,
            missing: true
        };
    }

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
