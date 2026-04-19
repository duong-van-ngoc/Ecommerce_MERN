/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Mongoose Model (Model thực thể Đơn hàng).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Lưu trữ chi tiết mọi giao dịch mua sắm của khách hàng.
 *    - Ghi nhận "ảnh chụp" (Snapshot) của sản phẩm tại thời điểm mua (tên, giá, số lượng) để tránh bị ảnh hưởng nếu sản phẩm thay đổi thông tin sau này.
 *    - Quản lý trạng thái vận chuyển và lịch sử thanh toán (MoMo, VNPay, COD).
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Đặt hàng (Checkout), Thanh toán (Payment) và Quản lý đơn hàng (Order Management).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Mongoose Schema: Thiết lập cấu trúc dữ liệu lồng ghép phức tạp.
 *    - Embedded Documents: Lưu thông tin giao hàng (`shippingInfo`) trực tiếp trong đơn.
 *    - References (Population): Trường `user` và `product` liên kết tới các bảng khác để truy xuất thông tin chi tiết.
 *    - Enums: Giới hạn các giá trị hợp lệ cho phương thức thanh toán (COD, MOMO, VNPAY) và trạng thái thanh toán.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Dữ liệu từ giỏ hàng và form thông tin nhận hàng của người dùng.
 *    - Output: Object Đơn hàng (`Order`) được lưu trữ trong MongoDB.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `orderStatus`: Trạng thái đơn hàng (mặc định: "Chờ xử lý").
 *    - `isPaid`: Cờ đánh dấu đã thanh toán hay chưa (Boolean).
 *    - `paymentInfo`: Chứa các mã giao dịch từ cổng thanh toán để đối soát.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - Định nghĩa `orderSchema` và export Model.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Người dùng đặt hàng, dữ liệu được gửi lên Controller.
 *    - Bước 2: Controller tính toán tổng tiền và tạo bản ghi Order mới với trạng thái mặc định.
 *    - Bước 3: Nếu thanh toán Online thành công, trường `isPaid` và `paidAt` sẽ được cập nhật.
 *    - Bước 4: Admin xem danh sách đơn hàng và cập nhật `orderStatus` theo tiến độ thực tế.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Là thực thể đại diện cho collection `orders` trong MongoDB. Liên kết đa-1 với User và đa-đa với Product.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Validate `required` cho toàn bộ thông tin giao hàng và thông tin sản phẩm.
 *    - Ràng buộc Enum cho `paymentInfo.method` và `paymentInfo.status`.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Không có logic bất đồng bộ nội tại, nhưng thường được dùng trong các hàm `async` của Order Controller.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - `orderItems` chứa ID sản phẩm (`product`) để liên kết, nhưng giá và tên nên được lưu trực tiếp (chốt giá tại thời điểm mua).
 *    - Trường `paymentInfo` lưu cả `transId` và `message` từ nhà cung cấp (MoMo/VNPAY) giúp bạn dễ dàng gỡ lỗi (debug) khi có khiếu nại thanh toán.
 *    - Cẩn thận với trường `createdAt`: Đây là dấu mốc quan trọng để Admin thống kê doanh thu theo ngày/tháng.
 */
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  
  orderCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true
  },

  orderItems: [
    {
      product_id: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: true,
      },
      name: { type: String, required: true }, // Snapshot tên sản phẩm
      price: { type: Number, required: true }, // Snapshot giá sản phẩm
      image: { type: String, required: true }, // Snapshot ảnh sản phẩm
      quantity: { type: Number, required: true },
      size: { type: String },
      color: { type: String }
    },
  ],

  shippingInfo: { // Snapshot địa chỉ giao hàng tại thời điểm đặt
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    province: { type: String, required: true },
    district: { type: String, required: true },
    ward: { type: String, required: true },
    streetAddress: { type: String, required: true },
    addressLabel: { type: String, default: "Khác" }
  },

  orderStatus: {
    type: String,
    required: true,
    enum: ["Chờ xử lý", "Đang giao", "Đã giao", "Đã hủy"],
    default: "Chờ xử lý",
  },

  trackingNumber: {
    type: String,
    trim: true,
    sparse: true, // Cho phép null nhưng nếu có giá trị thì phải duy nhất (nếu unique: true)
  },

  cancellationReason: {
    type: String,
    trim: true,
    default: null
  },

  paymentMethod: {
    type: String,
    enum: ["COD", "MOMO", "VNPAY"],
    default: "COD",
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Failed"],
    default: "Pending",
  },

  paymentInfo: {
    provider: { type: String }, 
    transId: { type: String },
    resultCode: { type: String },
    message: { type: String },
    amount: { type: Number },
    payType: { type: String },
  },

  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },

  // --- VOUCHER SNAPSHOT (Refactor: Gộp History vào Order) ---
  voucher_id: {
    type: mongoose.Schema.ObjectId,
    ref: "Voucher",
    index: true
  },
  voucherCode: { // Lưu mã tại thời điểm áp dụng
    type: String,
    uppercase: true,
    trim: true
  },
  voucherType: { // Lưu loại: percentage | fixed
    type: String,
    enum: ["percentage", "fixed"]
  },
  voucherValue: { // Giá trị (ví dụ: 10% hoặc 50000)
    type: Number
  },
  discountAmount: { // Số tiền được giảm thực tế
    type: Number,
    default: 0
  },

  itemsPrice: { type: Number, required: true, default: 0 },
  taxPrice: { type: Number, required: true, default: 0 },
  shippingPrice: { type: Number, required: true, default: 0 },
  totalPrice: { type: Number, required: true, default: 0 },

  deliveredAt: Date,
  cancelledAt: Date, // Thời gian đơn hàng bị hủy
  cancelledBy: { // Người thực hiện việc hủy đơn
    type: mongoose.Schema.ObjectId,
    ref: "User"
  },
  cancellationReason: { // Lý do hủy đơn hàng (Shopee Style)
    type: String,
    default: ""
  },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

// --- CẤU HÌNH INDEX (Tối ưu truy vấn & nghiệp vụ) ---
// Index cho user và voucher để tăng tốc độ đối soát
orderSchema.index({ user_id: 1 });
orderSchema.index({ orderStatus: 1 });

// Compound Index: Phục vụ logic "Kiểm tra User đã dùng voucher này chưa"
// Giúp Query cực nhanh khi hệ thống có hàng triệu đơn hàng
orderSchema.index({ user_id: 1, voucher_id: 1, orderStatus: 1 });


// Middleware tính tổng tiền trước khi lưu đơn hàng
orderSchema.pre('save', function(next) {
  this.itemsPrice = this.orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  this.totalPrice = this.itemsPrice + this.taxPrice + this.shippingPrice;
  next();
});

export default mongoose.model("Order", orderSchema);
