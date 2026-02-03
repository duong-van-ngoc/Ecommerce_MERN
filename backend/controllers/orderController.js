import Order from '../models/orderModel.js';
import Product from '../models/productModel.js'
import User from '../models/userModel.js'
import HandleError from '../utils/handleError.js';
import handleAsyncError from '../middleware/handleAsyncError.js';
import APIFunctionality from '../utils/apiFunctionality.js';


// tao đơn hàng mới 
export const createNewOrder = handleAsyncError(async (req, res, next) => {
  const { shippingInfo, orderItems, itemPrice, taxPrice, shippingPrice, totalPrice } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,

    paymentInfo: {
      method: "COD",
      status: "PENDING",
    },

    itemPrice,
    taxPrice,
    shippingPrice,
    totalPrice,

    paidAt: null,
    user: req.user._id,

    orderStatus: "Chờ xử lý",
    isPaid: false,
  });

  res.status(200).json({
    success: true,
    orderId: order._id,
    order,
  });
});

// xem chi tiết nội dung của một đơn hàng 

export const getSingleOrder = handleAsyncError(async(req, res, next) => {
    const order = await Order.findById(req.params.id).populate("user", "name email")
    if(!order) {
        return next(new HandleError("Không tìm thấy đơn đặt hàng", 404))

    }
    res.status(200).json({
        success: true,
        order
    })


})

// Xem tất cả đơn hàng của user hiện tại

export const allMyOrder = handleAsyncError(async(req, res, next) => {
    const orders = await Order.find({user: req.user.id})
    if(!orders) {
        return next(new HandleError("Không tìm thấy đơn hàng", 404))

    }

    res.status(200).json({
        success: true,
        orders
    })
})

//   lấy tất cả các đơn đặt hàng 

export const getAllOrder = handleAsyncError(async(req, res, next) => {
    const orders = await Order.find();

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
  const order = await Order.findById(req.params.id);
  if (!order) return next(new HandleError("Không tìm thấy đơn hàng", 404));

  const newStatus = req.body.status;

  const allowed = ["Chờ xử lý", "Đang giao", "Đã giao", "Đã hủy"];
  if (!allowed.includes(newStatus)) {
    return next(new HandleError("Trạng thái không hợp lệ", 400));
  }

  if (order.orderStatus === "Đã giao") {
    return next(new HandleError("Đơn hàng đã giao, không thể cập nhật nữa", 400));
  }

  if (newStatus === "Đang giao" && order.orderStatus !== "Đang giao") {
    await Promise.all(
      order.orderItems.map((item) => updateQuantity(item.product, item.quantity))
    );
  }

  order.orderStatus = newStatus;

  if (newStatus === "Đã giao") {
    order.deliveredAt = Date.now();

    if (order.paymentInfo?.method === "COD" && !order.isPaid) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentInfo.status = "PAID";
    }
  }

  await order.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, order });
});




async function updateQuantity(id, quantity) {
    const product = await Product.findById(id);
    if(!product) {
        throw new HandleError("Không tìm thấy sản phẩm", 404);
    }
    product.stock -= quantity
    await product.save({validateBeforeSave: false})
}

export const deleteOrder = handleAsyncError(async(req, res, next) => {
    const order = await Order.findById(req.params.id) 

    if(!order) {
        return next(new HandleError("Không tìm thấy đơn hàng", 404))
    }
    if(order.orderStatus !== 'Delivered') {
        return next(new HandleError("Đơn hàng đang được xử lý không thể xóa đơn hàng", 404))
    }

    await Order.deleteOne({
        _id: req.params.id
    })

    res.status(200).json({
        success: true,
        message: "Xóa đơn hàng thành công"
    })
})
