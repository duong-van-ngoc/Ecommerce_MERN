// Cache service for AI chat - caches product data in memory
import { getAllProducts } from "./productService.js";

/**
 * Mục đích:
 * - File này chịu trách nhiệm cache dữ liệu sản phẩm trong RAM.
 * - Mục tiêu là giảm số lần đọc dữ liệu thật từ database / service gốc.
 *
 * File này dùng để làm gì?
 * - Khi AI chat cần danh sách sản phẩm, thay vì lần nào cũng fetch mới,
 *   file này sẽ:
 *   + trả cache nếu cache còn hạn
 *   + fetch mới nếu cache hết hạn
 *
 * Dữ liệu trong file này lấy từ đâu?
 * - Lấy từ `getAllProducts()` trong `productService.js`
 *
 * Props / Component / use client / Server Component:
 * - Không áp dụng.
 * - Đây là file backend service, không phải component frontend.
 */

// Dữ liệu sản phẩm đang được cache trong RAM
let cachedProducts = null;

// Thời điểm lần cuối cache được cập nhật
let cacheTime = null;

// Cache có hiệu lực trong 5 phút
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * Mục đích:
 * - Lấy danh sách sản phẩm cho AI chat, có áp dụng cache.
 *
 * Logic:
 * - Nếu cache còn hạn:
 *   + trả dữ liệu cache ngay
 * - Nếu cache hết hạn hoặc chưa có:
 *   + fetch dữ liệu mới từ `productService`
 *   + cập nhật cache
 *   + trả dữ liệu mới
 *
 * Output:
 * @returns {Promise<Array>}
 *
 * Khi nào được gọi:
 * - `chatService` gọi khi cần danh sách sản phẩm để lọc và build prompt.
 */
export async function getProducts() {
    const now = Date.now();

    // Nếu đã có cache và cache vẫn còn hạn thì dùng lại luôn.
    if (cachedProducts && cacheTime && (now - cacheTime < CACHE_DURATION)) {
        console.log("📦 Đang dùng product cache");
        return cachedProducts;
    }

    // Nếu không có cache hợp lệ thì lấy dữ liệu mới.
    console.log("🔄 Đang lấy product mới từ nguồn dữ liệu");
    cachedProducts = await getAllProducts();
    cacheTime = now;

    return cachedProducts;
}

/**
 * Mục đích:
 * - Xóa cache hiện tại bằng tay.
 *
 * Khi nào được gọi:
 * - Sau khi sản phẩm bị cập nhật/thêm/xóa
 * - Hoặc khi developer muốn ép hệ thống đọc dữ liệu mới hoàn toàn
 *
 * Logic:
 * - Set cache về `null`
 * - Set thời gian cache về `null`
 */
export function clearCache() {
    cachedProducts = null;
    cacheTime = null;
    console.log("🗑️ Đã xóa product cache");
}

/**
 * ========================= TỔNG KẾT FILE =========================
 *
 * 1. Code chạy từ đâu trước?
 * - `chatService` gọi `getProducts()`
 * - `getProducts()` kiểm tra cache
 * - Nếu còn hạn thì trả cache
 * - Nếu hết hạn thì fetch mới
 *
 * 2. Khi user bấm gửi chat thì chuyện gì xảy ra?
 * - Frontend gửi request
 * - `chatService` cần product list
 * - File này quyết định dùng cache hay lấy mới
 *
 * 3. Nếu dữ liệu bị rỗng thì sao?
 * - File này không tự tạo empty UI
 * - Nếu `getAllProducts()` trả mảng rỗng thì cache cũng sẽ là mảng rỗng
 * - Lúc đó `filterService` và `aiPromptService` sẽ phải xử lý tiếp
 *
 * 4. Chỗ intern cần học kỹ:
 * - Cache trong RAM là gì
 * - TTL (time-to-live) là gì
 * - Khi nào nên xóa cache
 * - Tradeoff giữa dữ liệu nhanh và dữ liệu mới nhất
 *
 * 5. Lưu ý:
 * - Đây là cache trong RAM của process hiện tại
 * - Restart server là mất cache
 * - Nếu có nhiều instance backend thì mỗi instance có cache riêng
 */
