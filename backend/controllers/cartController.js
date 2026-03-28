import Cart from "../models/cartModel.js";
import handleAsyncError from "../middleware/handleAsyncError.js";
import HandleError from "../utils/handleError.js";

// Lấy giỏ hàng của người dùng hiện tại
export const getCart = handleAsyncError(async (req, res, next) => {
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        // Nếu chưa có giỏ hàng, tạo mới một giỏ hàng trống
        cart = await Cart.create({
            user: req.user.id,
            items: []
        });
    }

    res.status(200).json({
        success: true,
        cart
    });
});

// Đồng bộ giỏ hàng từ Frontend lên Backend (Dùng khi Login)
export const syncCart = handleAsyncError(async (req, res, next) => {
    const { items } = req.body;

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        cart = await Cart.create({
            user: req.user.id,
            items: items || []
        });
    } else {
        // Logic đồng bộ: Có thể gộp hoặc ghi đè. Ở đây ta chọn ghi đè để Frontend quản lý logic gộp trước khi gởi lên.
        cart.items = items || [];
        await cart.save();
    }

    res.status(200).json({
        success: true,
        cart
    });
});

// Thêm hoặc cập nhật sản phẩm trong giỏ hàng
export const updateCartItem = handleAsyncError(async (req, res, next) => {
    const { product, quantity, size, color, name, price, image, stock } = req.body;

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        cart = await Cart.create({
            user: req.user.id,
            items: [{ product, quantity, size, color, name, price, image, stock }]
        });
    } else {
        // Tìm sản phẩm trùng khớp (ID, Size, Color)
        const itemIndex = cart.items.findIndex(item => 
            item.product.toString() === product && 
            (item.size || "") === (size || "") && 
            (item.color || "") === (color || "")
        );

        if (itemIndex > -1) {
            // Cập nhật số lượng nếu tìm thấy
            cart.items[itemIndex].quantity = quantity;
        } else {
            // Thêm mới nếu không tìm thấy
            cart.items.push({ product, quantity, size, color, name, price, image, stock });
        }

        await cart.save();
    }

    res.status(200).json({
        success: true,
        cart
    });
});

// Xóa một sản phẩm cụ thể khỏi giỏ hàng
export const removeCartItem = handleAsyncError(async (req, res, next) => {
    const { product, size, color } = req.body;

    let cart = await Cart.findOne({ user: req.user.id });

    if (cart) {
        cart.items = cart.items.filter(item => 
            !(item.product.toString() === product && 
              (item.size || "") === (size || "") && 
              (item.color || "") === (color || ""))
        );
        await cart.save();
    }

    res.status(200).json({
        success: true,
        cart
    });
});
