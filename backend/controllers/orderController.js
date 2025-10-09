import Order from '../models/orderModel.js';
import Product from '../models/productModel.js'
import User from '../models/userModel.js'
import HandleError from '../utils/handleError.js';
import handleAsyncError from '../middleware/handleAsyncError.js';
import APIFunctionality from '../utils/apiFunctionality.js';


// tao đơn hàng mới 

export const createNewOrder = handleAsyncError(async(req, res, next) => {
    const { shippingInfo, orderItems, payment, itemPrice, taxPrice, shippingPrice, totalPrice } = req.body

    const order = await Order.create({
        shippingInfo, 
        orderItems, 
        payment, 
        itemPrice, 
        taxPrice, 
        shippingPrice, 
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id
    })

    res.status(200).json({
        success: true,
        order
    })
})

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

