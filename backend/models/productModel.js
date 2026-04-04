/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Mongoose Model (Model thực thể Sản phẩm).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Định nghĩa cấu trúc dữ liệu toàn diện cho một sản phẩm trong hệ thống E-commerce.
 *    - Quản lý các thông tin từ cơ bản (tên, giá, kho) đến nâng cao (phân loại 3 cấp, phong cách AI, đánh giá khách hàng).
 *    - Là trung tâm của các hoạt động: Hiển thị sản phẩm, Tìm kiếm, Lọc (Filter), Quản lý kho và Gợi ý phối đồ (AI Stylist).
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Sản phẩm (Product), Quản lý kho (Stock Management), Trợ lý ảo (AI Stylist).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Mongoose Schema & Sub-documents: Sử dụng mảng object cho `images` và `reviews`.
 *    - References (Liên kết): Trường `user` tham chiếu đến bảng `User` để biết ai tạo sản phẩm, ai đánh giá.
 *    - Sparse Index: Dùng cho trường `sku` để cho phép giá trị null mà vẫn đảm bảo tính duy nhất (unique) khi có giá trị.
 *    - Validation: Ràng buộc nhập liệu bắt buộc và giới hạn độ dài chuỗi.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Dữ liệu từ Admin (tạo thủ công hoặc File Excel).
 *    - Output: Object Product hoàn chỉnh trong MongoDB.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - Các trường đặc biệt: `category` (đối tượng lồng nhau 3 cấp), `images` (mảng ảnh), `style/vibe` (dữ liệu cho AI).
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - Định nghĩa `productSchema`.
 *    - Export model dưới dạng Singleton (`mongoose.models.Product || ...`) để tránh lỗi khi nạp lại file.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Khi Admin tạo/cập nhật sản phẩm, Mongoose sẽ kiểm tra các điều kiện `required` và `maxLength`.
 *    - Bước 2: Dữ liệu ảnh từ Cloudinary (URL và ID) được lưu vào mảng `images`.
 *    - Bước 3: Dữ liệu được ghi vào DB và tự động có thêm trường `createdAt`.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Trực tiếp tương tác với collection `products` trong MongoDB.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Bắt buộc nhập: Tên, Mô tả, Giá, Số lượng kho, Danh mục 3 cấp.
 *    - Phân loại (Category) được thiết kế theo cấu trúc phân cấp (Level 1-3) để hỗ trợ Menu đa cấp trên Frontend.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Model này không chứa logic bất đồng bộ nội tại, nhưng các thao tác với nó (find, save) đều là bất đồng bộ.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - `sku: { sparse: true }`: Cực kỳ quan trọng để không làm hỏng dữ liệu cũ chưa có SKU khi bạn cập nhật hệ thống.
 *    - `category.level1/2/3`: Khi sửa Frontend, phải đảm bảo gửi đủ 3 cấp này để không bị lỗi `required`.
 *    - `ratings` và `numOfReviews`: Hai trường này thường được cập nhật tự động bằng code trong Controller mỗi khi có Review mới.
 */

// Mô hình dữ liệu sản phẩm
// Thêm dòng import categoryModel để đăng ký schema, tránh lỗi "Schema hasn't been registered"
import "./categoryModel.js";
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({ // tạo schema cho sản phẩm
    sku: { // mã sản phẩm duy nhất
        type: String,
        trim: true,
        unique: true,
        sparse: true, // cho phép các sản phẩm cũ chưa có SKU không bị báo lỗi trùng lặp null
        maxLength: [50, "Mã SKU không được vượt quá 50 ký tự"]
    },
    name: {
        // tên sản phẩm
        type: String,
        required: [true, "Nhập tên sản sản phẩm"],
        trim: true,
        maxLength: [100, "Tên sản phẩm không được vượt quá 100 ký tự"]
    },
    description: { // mô tả sản phẩm
        type: String,
        required: [true, "Nhập mô tả sản phẩm"]
    },
    // --- NHÓM GIÁ & KHO ---
    price: { // giá bán (sau khi giảm)
        type: Number,
        required: [true, "Nhập giá sản phẩm"],
        maxLength: [10, "Giá sản phẩm không được vượt quá 10 ký tự"]
    },
    originalPrice: { // giá gốc (để hiện gạch ngang)
        type: Number,
        default: 0
    },
    stock: { // số lượng tồn kho
        type: Number,
        required: [true, "Nhập số lượng sản phẩm"],
        maxLength: [10, "Số lượng sản phẩm không được vượt quá 10 ký tự"],
        default: 1
    },
    sold: { // số lượng đã bán (social proof)
        type: Number,
        default: 0
    },

    // [Graceful Degradation] - Cấu trúc Category cũ dạng Object (Để tương thích Frontend hiện tại)
    category: {
        level1: { type: String, required: [true, "Vui lòng chọn danh mục cấp 1"] },
        level2: { type: String, required: [true, "Vui lòng chọn danh mục cấp 2"] },
        level3: { type: String, required: [true, "Vui lòng chọn danh mục cấp 3"] }
    },
    // Trường Category Reference mới (Dành cho bản cập nhật Frontend sắp tới)
    category_id: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    brand: { // thương hiệu
        type: String,
        default: "No Brand"
    },
    publisher: { // nhà xuất bản (nếu là sách)
        type: String,
        default: ""
    },
    publishYear: { // năm xuất bản
        type: Number
    },
    page: { // số trang
        type: Number
    },
    language: { // ngôn ngữ
        type: String,
        default: "Tiếng Việt"
    },
    material: { // chất liệu (Cotton, Len...)
        type: String,
        default: ""
    },
    sizes: [ // mảng các size có sẵn: ["S", "M", "L"]
        { type: String }
    ],
    colors: [ // mảng các màu có sẵn: ["Red", "Blue"]
        { type: String }
    ],
    // --- PHÂN LOẠI PHONG CÁCH (AI STYLIST) ---
    vibe: { // cảm hứng sản phẩm (Bí ẩn, Năng động, Phóng khoáng...)
        type: String,
        default: ""
    },
    style: { // phong cách thời trang (Streetwear, Minimalism, Vintage...)
        type: String,
        default: ""
    },
    trending: { // đánh giá sản phẩm hot/xu hướng
        type: Boolean,
        default: false
    },

    // --- HÌNH ẢNH & TRẠNG THÁI ---
    ratings: { // đánh giá trung bình của sản phẩm
        type: Number,
        default: 0
    },
    images: [// hình ảnh sản phẩm
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }
    ],

    numOfReviews: { // số lượng đánh giá của sản phẩm
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ["available", "out_of_stock", "discontinued"],
        default: "available"
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: { // ngày tạo sản phẩm
        type: Date,
        default: Date.now
    }

})

// Thêm Index cho Tên sản phẩm để hỗ trợ tìm kiếm
productSchema.index({ name: 1 });

export default mongoose.models.Product || mongoose.model("Product", productSchema);
// Product: tên model, productSchema: schema của model