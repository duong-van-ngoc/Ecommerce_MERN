/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Bộ điều khiển Đơn hàng (Order Controller).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Quản lý quy trình bán hàng từ lúc khách nhấn "Đặt hàng" cho đến khi Admin hoàn tất đơn hàng.
 *    - Đảm bảo tính chính xác về tài chính (tổng tiền) và hàng hóa (tồn kho) trong suốt vòng đời của đơn hàng.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Hoàn tất đơn hàng (Checkout/Order Flow).
 *    - Luồng Sau bán hàng (Post-purchase): Xem lại đơn hàng, đánh giá sản phẩm.
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Mongoose Populate: Liên kết dữ liệu để lấy thông tin khách hàng (name, email) từ ID lưu trong đơn hàng.
 *    - Stock Management Logic: Tự động trừ số lượng sản phẩm trong kho khi đơn hàng bắt đầu được giao.
 *    - Higher-Order Logic: Kiểm tra quyền truy cập (chỉ Admin hoặc chính chủ đơn hàng mới được xem chi tiết).
 *    - Promise.all: Xử lý cập nhật kho cho nhiều sản phẩm trong một đơn hàng cùng lúc để tối ưu hiệu năng.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Thông tin giao hàng, danh sách sản phẩm, các loại phí (item, tax, shipping) từ Frontend.
 *    - Output: Dữ liệu đơn hàng hoặc thông báo trạng thái cập nhật thành công (JSON).
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - Không áp dụng.
 * 
 * 7. CÁC HÀM / CHỨC NƠNG CHÍNH:
 *    - `createNewOrder`: Khởi tạo đơn hàng mới trong cơ sở dữ liệu.
 *    - `getSingleOrder`: Truy vấn chi tiết một đơn hàng kèm thông tin người mua.
 *    - `allMyOrder`: Lấy lịch sử mua hàng của người dùng đang đăng nhập.
 *    - `updateOrderStauts`: (Admin) Cập nhật tiến độ đơn hàng (Chờ xử lý -> Đang giao -> Đã giao).
 *    - `updateQuantity`: Hàm nội bộ để thực hiện trừ kho sau khi xác nhận giao hàng.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Khách hàng xác nhận giỏ hàng và địa chỉ.
 *    - Bước 2: `createNewOrder` lưu thông tin vào DB với trạng thái "Chờ xử lý".
 *    - Bước 3: Admin vào hệ thống, duyệt đơn và chuyển sang trạng thái "Đang giao".
 *    - Bước 4: Hệ thống tự động gọi `updateQuantity` để trừ số lượng trong kho sản phẩm.
 *    - Bước 5: Khi khách nhận hàng, Admin chuyển sang "Đã giao", hệ thống ghi nhận thời gian giao và trạng thái thanh toán.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Frontend -> Route -> Controller -> Order Model -> (Nếu cập nhật trạng thái) -> Product Model -> Response.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Bảo mật: Luôn kiểm tra `order.user` trùng với `req.user.id` để tránh việc người dùng xem lén đơn hàng của người khác.
 *    - Ràng buộc: Đơn hàng đã giao thì không được phép quay lại trạng thái trước đó.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - File chứa nhiều tác vụ I/O với database (Tìm, lưu, cập nhật liên tục), tất cả đều dùng `async/await`.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Việc trừ kho xảy ra khi trạng thái chuyển sang "Đang giao". Bạn cần lưu ý điều này để tránh việc trừ kho hai lần nếu logic code bị thay đổi.
 *    - Đơn hàng Payment COD sẽ được tự động đánh dấu là `isPaid: true` khi Admin chuyển trạng thái đơn hàng sang "Đã giao".
 */
import mongoose from "mongoose";
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js'
import User from '../models/userModel.js'
import Address from '../models/addressModel.js'
import HandleError from '../utils/handleError.js';
import handleAsyncError from '../middleware/handleAsyncError.js';
import APIFunctionality from '../utils/apiFunctionality.js';
import { sendStatusEmail } from '../services/emailService.js';
import Voucher from '../models/voucherModel.js';
import Notification from '../models/notificationModel.js';
import { validateVoucher } from '../utils/voucherValidator.js';

// Helper: Sinh mã đơn hàng ngẫu nhiên chuyên nghiệp: TB-YYYYMMDD-XXXXX
const generateOrderCode = async () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD

  let isUnique = false;
  let code = "";

  while (!isUnique) {
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase(); // 5 ký tự ngẫu nhiên
    code = `TB-${dateStr}-${randomStr}`;

    // Kiểm tra tính duy nhất trong database
    const existingOrder = await Order.findOne({ orderCode: code });
    if (!existingOrder) {
      isUnique = true;
    }
  }

  return code;
};

// Helper: Chuẩn hóa dữ liệu địa chỉ để đồng nhất Snapshot và Address Book
const normalizeShippingAddress = (source) => ({
  fullName: source.fullName || source.name || "",
  phone: String(source.phone || source.phoneNo || source.phoneNumber || ""),
  province: source.province || source.state || "",
  district: source.district || source.city || "",
  ward: source.ward || "",
  streetAddress: source.streetAddress || source.address || "",
  addressLabel: source.addressLabel || "Khác",
  provinceCode: source.provinceCode || "",
  districtCode: source.districtCode || "",
  wardCode: source.wardCode || "",
});


// Tạo đơn hàng mới (dữ liệu snapshot được gởi từ Frontend sau Checkout)
export const createNewOrder = handleAsyncError(async (req, res, next) => {
  const {
    address_id,
    shippingInfo,
    saveAddress,
    orderItems,
    itemPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentMethod,
    voucher_id,
    voucherCode,
    discountAmount // Từ FE gửi lên để tham khảo, server sẽ tính lại
  } = req.body;

  let finalShippingInfo = {};

  // BƯỚC 1: XÁC ĐỊNH NGUỒN ĐỊA CHỈ (Ưu tiên address_id)
  if (address_id) {
    // TH1: Chọn từ Sổ địa chỉ
    const savedAddress = await Address.findById(address_id);

    if (!savedAddress) {
      return next(new HandleError("Địa chỉ đã chọn không tồn tại", 404));
    }

    if (savedAddress.user_id.toString() !== req.user.id.toString()) {
      return next(new HandleError("Bạn không có quyền sử dụng địa chỉ này", 403));
    }

    finalShippingInfo = normalizeShippingAddress(savedAddress);
  } else if (shippingInfo) {
    // TH2: Nhập tay địa chỉ mới
    // Validate các trường bắt buộc
    const requiredFields = ["fullName", "phone", "province", "district", "ward", "streetAddress"];
    for (const field of requiredFields) {
      if (!shippingInfo[field]) {
        return next(new HandleError(`Vui lòng cung cấp đầy đủ: ${field}`, 400));
      }
    }

    finalShippingInfo = normalizeShippingAddress(shippingInfo);

    // BƯỚC 2: LƯU ĐỊA CHỈ NẾU YÊU CẦU (saveAddress === true)
    if (saveAddress === true) {
      // Kiểm tra user đã có địa chỉ nào chưa để quyết định isDefault
      const addressCount = await Address.countDocuments({ user_id: req.user.id });

      await Address.create({
        user_id: req.user.id,
        ...finalShippingInfo,
        isDefault: addressCount === 0 // Nếu chưa có cái nào thì cái đầu tiên là default
      });
    }
  } else {
    // TH3: Không cung cấp nguồn địa chỉ nào
    return next(new HandleError("Vui lòng cung cấp địa chỉ giao hàng", 400));
  }

  // BƯỚC 3: CHUẨN HÓA DANH SÁCH SẢN PHẨM
  const normalizedItems = (orderItems || []).map(item => ({
    product_id: item.product_id || item.product,
    name: item.name,
    price: item.price,
    image: item.image || item.images?.[0]?.url || item.images?.[0] || "",
    quantity: item.quantity,
    size: item.size || null,
    color: item.color || null
  }));

  // BƯỚC 4: XỬ LÝ VOUCHER & TÍNH TOÁN LẠI TỔNG TIỀN (BACKEND VALIDATION)
  let serverDiscountAmount = 0;
  let serverVoucherInfo = {
    voucher_id: null,
    voucherCode: "",
    voucherType: "",
    voucherValue: 0
  };

  if (voucher_id) {
    const voucher = await Voucher.findById(voucher_id);
    if (voucher) {
      const validation = await validateVoucher(voucher, req.user, Number(itemPrice));
      if (validation.isValid) {
        serverDiscountAmount = validation.discount;
        serverVoucherInfo = {
          voucher_id: voucher._id,
          voucherCode: voucher.code,
          voucherType: voucher.discount.type,
          voucherValue: voucher.discount.value
        };

        // Tăng lượt sử dụng voucher (Atomic update)
        voucher.usedCount += 1;
        await voucher.save();
      } else {
        // Nếu voucher không còn hợp lệ khi đặt hàng (VD: vừa hết hạn/hết lượt)
        return next(new HandleError(validation.message || "Mã giảm giá đã hết hiệu lực", 400));
      }
    }
  }

  // Tính lại tổng tiền cuối cùng trên server để đảm bảo an toàn
  const serverTotal = Math.max(0, Number(itemPrice) + Number(taxPrice) + Number(shippingPrice) - serverDiscountAmount);

  // BƯỚC 5: KHỞI TẠO ĐƠN HÀNG
  const orderCode = await generateOrderCode();

  const order = await Order.create({
    shippingInfo: finalShippingInfo,
    orderItems: normalizedItems,
    paymentMethod: paymentMethod || req.body.paymentInfo?.method || "COD",
    paymentStatus: "Pending",
    itemsPrice: itemPrice || 0,
    taxPrice: taxPrice || 0,
    shippingPrice: shippingPrice || 0,
    totalPrice: serverTotal,
    discountAmount: serverDiscountAmount,
    voucherCode: serverVoucherInfo.voucherCode,
    voucher_id: serverVoucherInfo.voucher_id,
    voucherType: serverVoucherInfo.voucherType,
    voucherValue: serverVoucherInfo.voucherValue,
    paidAt: null,
    user_id: req.user._id,
    orderCode: orderCode,
    orderStatus: "Chờ xử lý",
    isPaid: false,
  });

  res.status(200).json({
    success: true,
    orderId: order._id,
    order,
  });
});

// Helper: Check admin role (supports both legacy `role` field and new `role_id.name` field)
const isAdmin = (user) => {
  return user.role === 'admin' || user.role_id?.name === 'admin';
};

// Xem chi tiết nội dung của một đơn hàng
export const getSingleOrder = handleAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate("user_id", "name email")
  if (!order) {
    return next(new HandleError("Không tìm thấy đơn đặt hàng", 404))
  }

  // Check access: only admin or the order owner can view
  if (!isAdmin(req.user) && order.user_id?.toString() !== req.user.id.toString()) {
    return next(new HandleError("Bạn không có quyền truy cập đơn hàng này", 403));
  }

  res.status(200).json({
    success: true,
    order
  })
})

// Xem tất cả đơn hàng của user hiện tại
export const allMyOrder = handleAsyncError(async (req, res, next) => {
  const orders = await Order.find({ user_id: req.user.id }).populate("user_id", "name email");
  if (!orders) {
    return next(new HandleError("Không tìm thấy đơn hàng", 404))
  }
  res.status(200).json({
    success: true,
    orders
  })
})

// Admin - Lấy tất cả các đơn hàng
export const getAllOrder = handleAsyncError(async (req, res, next) => {
  const orders = await Order.find().populate("user_id", "name email");

  let totalAmount = 0
  orders.forEach(order => {
    totalAmount += order.totalPrice
  })

  res.status(200).json({
    success: true,
    orders,
    totalAmount
  })
})

// cập nhật trạng thái đơn hàng
export const updateOrderStauts = handleAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate("user_id", "name email");
  if (!order) return next(new HandleError("Không tìm thấy đơn hàng", 404));

  const newStatus = req.body.status;
  const { trackingNumber, cancellationReason } = req.body;

  const allowed = ["Chờ xử lý", "Đang giao", "Đã giao", "Đã hủy"];
  if (!allowed.includes(newStatus)) {
    return next(new HandleError("Trạng thái không hợp lệ", 400));
  }

  if (order.orderStatus === "Đã giao") {
    return next(new HandleError("Đơn hàng đã giao, không thể cập nhật nữa", 400));
  }

  if (newStatus === "Đang giao" && order.orderStatus !== "Đang giao") {
    await Promise.all(
      order.orderItems.map((item) => updateQuantity(item.product_id, item.quantity))
    );
  }

  order.orderStatus = newStatus;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (cancellationReason) order.cancellationReason = cancellationReason;

  if (newStatus === "Đã giao") {
    order.deliveredAt = Date.now();

    if (order.paymentMethod === "COD" && !order.isPaid) {
      order.isPaid = true;
      order.paidAt = Date.now();
      if (order.paymentInfo) {
        order.paymentInfo.status = "PAID";
      }
    }
  }

  if (newStatus === "Đã hủy" && order.orderStatus !== "Đã hủy") {
    order.cancelledAt = Date.now();
    order.cancelledBy = req.user._id;

    // Hoàn lại lượt dùng voucher nếu đơn bị hủy
    if (order.voucher_id) {
      await Voucher.findByIdAndUpdate(order.voucher_id, { $inc: { usedCount: -1 } });
    }
  }

  await order.save({ validateBeforeSave: false });

  // Gửi email thông báo (bất đồng bộ)
  sendStatusEmail(order, newStatus);

  // TỰ ĐỘNG TẠO THÔNG BÁO CHO USER
  let notificationMessage = `Đơn hàng #${order.orderCode} đã chuyển sang trạng thái: ${newStatus}`;

  // Bổ sung mã vận đơn cho các trạng thái giao vận theo yêu cầu
  const shippingStatuses = ["Đang giao", "Đã giao"];
  if (shippingStatuses.includes(newStatus) && order.trackingNumber) {
    notificationMessage += `. Mã vận đơn: ${order.trackingNumber}`;
  }

  // TỰ ĐỘNG TẠO THÔNG BÁO CHO USER (Chỉ nếu đơn hàng gắn với tài khoản user)
  if (order.user_id) {
    await Notification.create({
      userId: order.user_id._id || order.user_id,
      title: `📦 Cập nhật đơn hàng ${order.orderCode}`,
      message: notificationMessage,
      type: 'order',
      link: '/orders/my'
    });
  }

  res.status(200).json({ success: true, order });
});




async function updateQuantity(id, quantity) {
  const product = await Product.findById(id);

  // [Graceful Skip]: Bỏ qua việc trừ tồn kho đối với các sản phẩm đã bị xóa hoặc không còn tồn tại
  if (!product) {
    console.warn(`[Stock System Warning]: Bỏ qua trừ kho. Cảnh báo - không tìm thấy Sản phẩm mang ID: ${id} (Có thể đã bị xóa khỏi hệ thống).`);
    return;
  }

  product.stock -= quantity;
  await product.save({ validateBeforeSave: false });
}

// Người dùng tự hủy đơn hàng
export const cancelOrder = handleAsyncError(async (req, res, next) => {
  // [HYBRID TRANSACTION LOGIC]
  // Kiểm tra xem database có hỗ trợ Transaction (Replica Set/Sharded) hay không
  const dbConfig = mongoose.connection.getClient().topology.description;
  const supportsTransactions = ["ReplicaSetNoPrimary", "ReplicaSetPrimary", "Sharded"].includes(dbConfig.type);

  let session = null;
  if (supportsTransactions) {
    session = await mongoose.startSession();
    session.startTransaction();
  }

  try {
    // Nếu có session thì dùng session, nếu không thì truy vấn bình thường
    const queryOptions = session ? { session } : {};
    const order = await Order.findById(req.params.id).setOptions(queryOptions);

    if (!order) {
      if (session) await session.abortTransaction();
      return next(new HandleError("Không tìm thấy đơn hàng", 404));
    }

    // Kiểm tra quyền sở hữu (Chỉ người đặt hàng hoặc Admin mới có quyền hủy)
    if (!order.user_id || order.user_id.toString() !== req.user._id.toString()) {
      if (session) await session.abortTransaction();
      return next(new HandleError("Bạn không có quyền hủy đơn hàng này", 403));
    }

    // Kiểm tra tính lũy đẳng
    if (order.orderStatus === "Đã hủy") {
      if (session) await session.abortTransaction();
      return res.status(200).json({
        success: true,
        message: "Đơn hàng này đã được hủy trước đó",
      });
    }

    // Kiểm tra trạng thái cho phép hủy
    const allowedToCancel = ["Chờ xử lý", "Đang xử lý", "Processing", "pending"];
    if (!allowedToCancel.includes(order.orderStatus)) {
      if (session) await session.abortTransaction();
      return next(new HandleError(`Không thể hủy đơn hàng đang ở trạng thái: ${order.orderStatus}`, 400));
    }

    // [FAIL-SAFE] Khôi phục tồn kho nếu đơn hàng đã lỡ bước sang trạng thái trừ kho
    if (order.orderStatus === "Đang giao" || order.orderStatus === "shipping") {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(
          item.product_id,
          { $inc: { stock: item.quantity } },
          { ...queryOptions, new: true }
        );
      }
    }

    // Cập nhật trạng thái và thông tin Audit
    order.orderStatus = "Đã hủy";
    order.cancelledAt = new Date();
    order.cancelledBy = req.user._id;
    order.cancellationReason = req.body.reason || "";

    // Hoàn lại lượt dùng voucher nếu đơn bị hủy
    if (order.voucher_id) {
      await Voucher.findByIdAndUpdate(
        order.voucher_id,
        { $inc: { usedCount: -1 } },
        queryOptions
      );
    }

    await order.save({ ...queryOptions, validateBeforeSave: false });

    if (session) await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Hủy đơn hàng thành công",
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    next(error);
  } finally {
    if (session) session.endSession();
  }
});

// Admin xóa đơn hàng
export const deleteOrder = handleAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new HandleError("Không tìm thấy đơn hàng", 404));
  }

  // Khôi phục số lượng kho nếu đơn hàng bị xóa khi chưa hủy (đang giao, đã giao)
  // Thực tế admin nên hủy trước khi xóa, nhưng backup logic:
  if (order.orderStatus === "Đang giao" || order.orderStatus === "Đã giao") {
    for (const item of order.orderItems) {
      await updateQuantity(item.product_id, -item.quantity);
    }
  }

  // Hoàn lại lượt voucher nếu đơn chưa bị hủy trước đó
  if (order.orderStatus !== "Đã hủy" && order.voucher_id) {
    await Voucher.findByIdAndUpdate(order.voucher_id, { $inc: { usedCount: -1 } });
  }

  await order.deleteOne();

  res.status(200).json({
    success: true,
    message: "Xóa đơn hàng thành công",
  });
});

