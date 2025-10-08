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
