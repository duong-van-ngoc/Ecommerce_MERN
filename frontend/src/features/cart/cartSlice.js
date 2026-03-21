/**
 * ============================================================================
 * REDUX SLICE: cartSlice
 * ============================================================================
 * 1. Vai trò: 
 *    - Quản lý trạng thái giỏ hàng (sản phẩm, số lượng, biến thể) và thông tin vận chuyển.
 *    - Hỗ trợ lưu trữ riêng biệt cho từng người dùng thông qua LocalStorage.
 * 
 * 2. Luồng hoạt động (Mới):
 *    - (1) Ứng dụng khởi chạy (App.jsx) -> Kiểm tra thông tin người dùng.
 *    - (2) Nhận diện User ID -> Dispatch `syncCartWithUser(userId)` (nếu là khách dùng 'guest').
 *    - (3) Tải dữ liệu từ LocalStorage theo key `cartItems_${userId}` vào Redux state.
 *    - (4) Khi thêm/xóa/sửa: Cập nhật đồng thời Redux state và LocalStorage theo key định danh.
 *    - (5) Khi Logout (Đăng xuất): Tự động chuyển vùng nhớ về key 'guest' (khách).
 * 
 * 3. Các thực thể quản lý:
 *    - `cartItems`: Danh sách sản phẩm trong giỏ hàng hiện tại.
 *    - `shippingInfo`: Thông tin địa chỉ nhận hàng của tài khoản hiện tại.
 *    - `userId`: ID định danh để phân tách dữ liệu các tài khoản khác nhau.
 * ============================================================================
 */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../../api/http.js";

// Hàm hỗ trợ lấy Key LocalStorage động dựa trên ID người dùng
// Điều này giúp tách biệt dữ liệu giữa các tài khoản khác nhau trên cùng 1 trình duyệt
const getCartKey = (userId) => userId ? `cartItems_${userId}` : 'cartItems_guest';
const getShippingKey = (userId) => userId ? `shippingInfo_${userId}` : 'shippingInfo_guest';

// Thunk: Thêm sản phẩm vào giỏ hàng (lấy thông tin chi tiết từ API)
export const addItemsToCart = createAsyncThunk('cart/addItemsToCart', async ({ id, quantity, isUpdate, size, color }, { rejectWithValue }) => {
    try {
        const { data } = await axios.get(`/api/v1/products/${id}`);
        return {
            product: data.product._id,
            name: data.product.name,
            price: data.product.price,
            image: data.product.images[0].url,
            stock: data.product.stock,
            quantity: quantity,
            isUpdate: isUpdate,
            size: size,
            color: color
        }
    } catch (error) {
        return rejectWithValue(error.response?.data || 'Đã xảy ra lỗi')
    }
})

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        userId: null,
        cartItems: [],
        loading: false,
        error: null,
        success: false,
        message: null,
        shippingInfo: {
            address: "", pinCode: "", phoneNumber: "", country: "VN",
            provinceCode: "", districtCode: "", wardCode: "",
            provinceName: "", districtName: "", wardName: "",
        },
    },
    reducers: {
        // Đồng bộ giỏ hàng khi người dùng thay đổi (Đăng nhập/Đăng xuất)
        syncCartWithUser: (state, action) => {
            const userId = action.payload;
            state.userId = userId;
            
            // Tải dữ liệu giỏ hàng tương ứng với ID người dùng từ máy cục bộ
            state.cartItems = JSON.parse(localStorage.getItem(getCartKey(userId))) || [];
            
            // Tải thông tin vận chuyển tương ứng
            state.shippingInfo = JSON.parse(localStorage.getItem(getShippingKey(userId))) || {
                address: "", pinCode: "", phoneNumber: "", country: "VN",
                provinceCode: "", districtCode: "", wardCode: "",
                provinceName: "", districtName: "", wardName: "",
            };
        },
        removeErrors: (state) => {
            state.error = null
        },
        removeMessage: (state) => {
            state.message = null
            state.success = false
        },
        // Xóa sản phẩm khỏi giỏ hàng
        removeItemFromCart: (state, action) => {
            const { product, size, color } = action.payload;
            state.cartItems = state.cartItems.filter(item =>
                !(item.product === product && item.size === size && item.color === color)
            );
            // Lưu lại vào LocalStorage theo ID người dùng hiện tại
            localStorage.setItem(getCartKey(state.userId), JSON.stringify(state.cartItems));
        },
        // Lưu thông tin vận chuyển
        saveShippingInfo: (state, action) => {
            state.shippingInfo = action.payload;
            localStorage.setItem(getShippingKey(state.userId), JSON.stringify(state.shippingInfo));
        },
        // Xóa các sản phẩm đã hoàn thành đặt hàng
        removeOrderedItems: (state, action) => {
            const orderedItems = action.payload;
            const orderedKeys = new Set(orderedItems.map(item => `${item.product}-${item.size}-${item.color}`));
            state.cartItems = state.cartItems.filter(item => !orderedKeys.has(`${item.product}-${item.size}-${item.color}`));
            localStorage.setItem(getCartKey(state.userId), JSON.stringify(state.cartItems));
        },
        // Làm trống hoàn toàn giỏ hàng (khi cần reset)
        clearCart: (state) => {
            state.cartItems = [];
            state.shippingInfo = {
                address: "", pinCode: "", phoneNumber: "", country: "VN",
                provinceCode: "", districtCode: "", wardCode: "",
                provinceName: "", districtName: "", wardName: "",
            };
            localStorage.removeItem(getCartKey(state.userId));
            localStorage.removeItem(getShippingKey(state.userId));
        }
    },
    extraReducers: (builder) => {
        // Tự động xử lý khi người dùng Đăng xuất thành công
        builder.addCase('user/logout/fulfilled', (state) => {
            // Chuyển vùng nhớ về tài khoản Khách (guest)
            state.userId = null;
            state.cartItems = JSON.parse(localStorage.getItem(getCartKey(null))) || [];
            state.shippingInfo = JSON.parse(localStorage.getItem(getShippingKey(null))) || {
                address: "", pinCode: "", phoneNumber: "", country: "VN",
                provinceCode: "", districtCode: "", wardCode: "",
                provinceName: "", districtName: "", wardName: "",
            };
        })
        // Xử lý sau khi thêm sản phẩm thành công qua Thunk
        .addCase(addItemsToCart.fulfilled, (state, action) => {
            const item = action.payload;
            const existingItem = state.cartItems.find((i) =>
                i.product === item.product && i.size === item.size && i.color === item.color
            );

            if (existingItem) {
                if (item.isUpdate) {
                    existingItem.quantity = item.quantity;
                    state.message = `Đã cập nhật số lượng ${item.name} thành công`;
                } else {
                    existingItem.quantity += item.quantity;
                    state.message = `Đã thêm ${item.name} vào giỏ hàng thành công`;
                }
            } else {
                state.cartItems.push(item);
                state.message = `Đã thêm ${item.name} vào giỏ hàng thành công`;
            }

            state.loading = false;
            state.success = true;
            
            // Lưu dữ liệu vào vùng nhớ riêng của người dùng
            localStorage.setItem(getCartKey(state.userId), JSON.stringify(state.cartItems));
        });
    }
})

export const { 
    removeErrors, removeMessage, removeItemFromCart, 
    saveShippingInfo, removeOrderedItems, clearCart, 
    syncCartWithUser 
} = cartSlice.actions

export default cartSlice.reducer