// Product service for AI chat - fetches products from MongoDB
import Product from "../models/productModel.js";

/**
 * Mục đích:
 * - Đây là service lấy dữ liệu sản phẩm từ MongoDB cho cụm AI chat.
 * - Nó tách riêng việc đọc product ra khỏi `cacheService` để code rõ vai trò hơn.
 *
 * File này dùng để làm gì?
 * - Cung cấp các hàm đọc dữ liệu sản phẩm mức thấp:
 *   + lấy toàn bộ sản phẩm
 *   + lấy 1 sản phẩm theo ID
 *
 * Dữ liệu trong file này lấy từ đâu?
 * - Từ MongoDB thông qua model `Product`
 *
 * Props / Component / use client / Server Component:
 * - Không áp dụng.
 * - Đây là file backend service, không phải component frontend.
 */

/**
 * Mục đích:
 * - Lấy toàn bộ sản phẩm phục vụ AI chat.
 * - Chỉ select các field mà chatbot thực sự cần để giảm dữ liệu thừa.
 *
 * Output:
 * @returns {Promise<Array>} Array of product objects
 *
 * Khi nào được gọi:
 * - `cacheService.getProducts()` gọi khi cần nạp product mới vào cache.
 *
 * Vì sao dùng `.lean()`?
 * - `.lean()` giúp Mongoose trả plain object thay vì document đầy đủ
 * - Nhẹ hơn, nhanh hơn, phù hợp với luồng chỉ đọc dữ liệu để build prompt
 */
export async function getAllProducts() {
    return await Product.find()
        .select("name price originalPrice stock sold category brand material sizes colors ratings style vibe trending")
        .lean();
}

/**
 * Mục đích:
 * - Lấy 1 sản phẩm theo ID.
 *
 * Input:
 * @param {string} id - MongoDB ObjectId
 *
 * Output:
 * @returns {Promise<Object|null>}
 * - Trả về product nếu tìm thấy
 * - Trả về `null` nếu không có
 *
 * Khi nào được gọi:
 * - Hiện tại cụm AI chat chưa dùng trực tiếp
 * - Nhưng hàm này hữu ích nếu sau này chatbot cần xem chi tiết 1 sản phẩm cụ thể
 */
export async function getProductById(id) {
    return await Product.findById(id).lean();
}

/**
 * ========================= TỔNG KẾT FILE =========================
 *
 * 1. Code chạy từ đâu trước?
 * - `cacheService` gọi `getAllProducts()`
 * - Hàm này query MongoDB qua model `Product`
 * - Trả dữ liệu về cho cache
 *
 * 2. Khi user bấm gửi chat thì chuyện gì xảy ra?
 * - Chatbot cần danh sách sản phẩm
 * - `chatService` -> `cacheService`
 * - Nếu cache hết hạn thì `cacheService` gọi file này để đọc DB
 *
 * 3. Nếu dữ liệu bị rỗng thì sao?
 * - Nếu DB không có sản phẩm:
 *   + `getAllProducts()` trả về `[]`
 * - Nếu ID không tồn tại:
 *   + `getProductById()` trả về `null`
 *
 * 4. Chỗ intern cần học kỹ:
 * - `Model.find()` và `Model.findById()`
 * - `select()` để giảm field thừa
 * - `lean()` để tối ưu query read-only
 *
 * 5. Lưu ý:
 * - File này chỉ lo đọc product
 * - Không lọc keyword
 * - Không build prompt
 * - Không cache
 */
