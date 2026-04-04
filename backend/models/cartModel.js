/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Mongoose Model (Model thực thể Giỏ hàng).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Lưu trữ danh sách các sản phẩm người dùng chọn nhưng chưa thanh toán vào Cơ sở dữ liệu.
 *    - Giúp "duy trì" giỏ hàng trên nhiều thiết bị: Người dùng có thể thêm đồ trên điện thoại và thấy chúng khi đăng nhập bằng máy tính.
 *    - Là bước đệm quan trọng trước khi chuyển sang luồng Đặt hàng (Checkout).
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Giỏ hàng (Shopping Cart Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Mongoose Schema & Sub-documents: Mảng `items` chứa các thông tin chi tiết của từng dòng sản phẩm.
 *    - References: Trường `user` tham chiếu tới bảng `User`, trường `product` tham chiếu tới bảng `Product`.
 *    - Timestamps: Tự động ghi lại thời điểm tạo và cập nhật giỏ hàng.
 *    - Validation: Ràng buộc số lượng (`quantity`) tối thiểu phải là 1.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Hành động "Thêm vào giỏ" hoặc "Cập nhật số lượng" từ người dùng.
 *    - Output: Đối tượng Giỏ hàng (`Cart`) được cập nhật trong MongoDB.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `user`: ID người dùng sở hữu giỏ hàng này (Duy nhất 1 cart cho 1 user).
 *    - `items`: Danh sách các mặt hàng (mỗi mặt hàng lưu ID, thông tin cơ bản, số lượng, kích cỡ, màu sắc).
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - Định nghĩa `cartSchema` và export Model "Cart".
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Người dùng nhấn nút "Thêm vào giỏ".
 *    - Bước 2: Controller sẽ tìm giỏ hàng của User đó. Nếu chưa có, nó khởi tạo model này để tạo mới.
 *    - Bước 3: Kiểm tra nếu sản phẩm (cùng ID, Size, Color) đã có thì tăng số lượng, nếu chưa thì đẩy thêm 1 object vào mảng `items`.
 *    - Bước 4: Lưu thay đổi và trả về dữ liệu giỏ hàng mới nhất cho Frontend.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Đại diện cho collection `carts` trong MongoDB.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - `unique: true` cho trường `user` đảm bảo 1 tài khoản không bao giờ bị trùng lặp giỏ hàng trong DB.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - File này chỉ chứa Schema, các thao tác bất đồng bộ diễn ra ở Cart Controller.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - `items` lưu trữ cả `name`, `price`, `image` (Denormalization): Kỹ thuật này giúp Frontend load giỏ hàng cực nhanh mà không cần thực hiện câu lệnh "Join" (Populate) phức tạp từ bảng Product.
 *    - Tuy nhiên, hãy nhớ rằng nếu giá sản phẩm thay đổi, giỏ hàng cũ có thể vẫn giữ giá cũ trừ khi bạn có logic cập nhật lại giá trong Controller.
 */
import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
        unique: true // Mỗi user chỉ có 1 giỏ hàng duy nhất trong DB
    }
}, { timestamps: true });

export default mongoose.model("Cart", cartSchema);
