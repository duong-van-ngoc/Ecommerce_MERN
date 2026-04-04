/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Mảnh quản lý trạng thái Giỏ hàng (Cart Redux Slice).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Quản lý toàn bộ vòng đời của các mặt hàng trong giỏ: Thêm mới, cập nhật số lượng, xóa bỏ.
 *    - Lưu trữ thông tin vận chuyển (Shipping Info) của người dùng.
 *    - Điểm đặc biệt: Quản lý giỏ hàng "riêng tư" cho từng User trong LocalStorage bằng cách gắn ID User vào Key lưu trữ.
 *    - Đảm bảo tính đồng bộ tuyệt đối giữa bộ nhớ trình duyệt và cơ sở dữ liệu trên Server.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Mua sắm (Shopping Flow) & Thanh toán (Checkout Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - createAsyncThunk: Thực hiện các cuộc gọi API để đồng bộ giỏ hàng với máy chủ (`fetchCart`, `syncCartWithDB`).
 *    - Dynamic LocalStorage Keys: Kỹ thuật tạo khóa lưu trữ động (VD: `cartItems_123` thay vì `cartItems` chung) để tránh lộ giỏ hàng của người này sang người kia khi dùng chung trình duyệt.
 *    - Cross-slice Logic: Sử dụng `extraReducers` để lắng nghe sự kiện từ `user/logout`, giúp dọn dẹp hoặc chuyển đổi giỏ hàng về trạng thái Guest ngay lập tức.
 *    - getState: Truy cập vào trạng thái của Slice khác (User Slice) ngay trong Thunk để kiểm tra quyền đăng nhập.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Thông tin sản phẩm (ID, số lượng, phân loại màu sắc/kích cỡ) và địa chỉ nhận hàng.
 *    - Output: Mảng `cartItems` đã được tính toán lại và thông tin `shippingInfo` hoàn chỉnh.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `cartItems`: Danh sách các món hàng (với đầy đủ ảnh, giá, số lượng, tồn kho).
 *    - `shippingInfo`: Đối tượng chứa địa chỉ chi tiết (Tỉnh/Thành, Quận/Huyện, Phường/Xã).
 *    - `userId`: Định danh người dùng hiện tại để xác định đúng "kho hàng" cục bộ.
 * 
 * 7. CÁC HÀM / CHỨC NƠNG CHÍNH:
 *    - `addItemsToCart`: Thêm món mới. Nếu trùng ID+Size+Color thì cộng dồn số lượng, nếu khác thì thêm dòng mới.
 *    - `syncCartWithUser`: Hàm chuyển đổi ngữ cảnh, giúp người nạp đúng giỏ hàng của họ ngay khi vừa mở web hoặc đăng nhập.
 *    - `removeItemFromCart`: Xóa sản phẩm khỏi cả LocalStorage và Database.
 *    - `saveShippingInfo`: Lưu lại thông tin nhận hàng để dùng cho bước xác nhận đơn.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Ứng dụng khởi chạy (`App.jsx`) -> Dispatch `syncCartWithUser`.
 *    - Bước 2: Slice đọc dữ liệu từ LocalStorage tương ứng với User ID hiện tại.
 *    - Bước 3: Nếu đã Login, gọi `fetchCart` để cập nhật dữ liệu mới nhất từ Server.
 *    - Bước 4: Khi User thay đổi giỏ, cập nhật Store -> Lưu LocalStorage -> Gọi API cập nhật Database.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - UI -> Dispatch -> Slice (Update Local) -> API /api/v1/cart -> MongoDB (Cart Collection) -> Response.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Logic "Item Identity": Một sản phẩm chỉ được gọi là "trùng" khi thỏa mãn cả 3 điều kiện: ID sản phẩm giống, Size giống và Color giống.
 *    - Validate số lượng: Đảm bảo số lượng mua không vượt quá `stock` (tồn kho) của sản phẩm.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Các Thunk (`fetchCart`, `addItemsToCart`) gọi API Backend bất đồng bộ.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Đây là nơi xử lý logic "Guest Cart vs User Cart". Khi Logout, giỏ hàng phải được chuyển về trạng thái của `cartItems_guest`.
 *    - Cờ `isUpdate` trong `addItemsToCart` giúp phân biệt giữa việc "Thêm mới" (cộng thêm) và "Sửa số lượng" (thay thế hoàn toàn) trong trang giỏ hàng.
 */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../../api/http.js";

// Hàm hỗ trợ lấy Key LocalStorage động dựa trên ID người dùng
const getCartKey = (userId) => userId ? `cartItems_${userId}` : 'cartItems_guest';
const getShippingKey = (userId) => userId ? `shippingInfo_${userId}` : 'shippingInfo_guest';

// Normalize cart items: ensure both "product" and "product_id" exist
// This bridges the gap between old Frontend format (product) and new Backend format (product_id)
const normalizeCartItems = (items) => {
    if (!Array.isArray(items)) return [];
    return items.map(item => {
        const rawProduct = item.product_id || item.product;
        const isPopulated = typeof rawProduct === 'object' && rawProduct !== null && rawProduct._id;
        
        const productId = isPopulated ? rawProduct._id : rawProduct;
        const stock = isPopulated && rawProduct.stock !== undefined ? rawProduct.stock : item.stock;

        return {
            ...item,
            product: productId,
            product_id: productId,
            stock: stock
        };
    });
};

// Thunk: Lấy giỏ hàng từ Backend
export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
    try {
        const { data } = await axios.get('/api/v1/cart');
        return data.cart.items;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Không thể tải giỏ hàng');
    }
});

// Thunk: Đồng bộ giỏ hàng hiện tại lên Backend (ví dụ sau khi login)
export const syncCartWithDB = createAsyncThunk('cart/syncCartWithDB', async (items, { rejectWithValue }) => {
    try {
        const { data } = await axios.post('/api/v1/cart/sync', { items });
        return data.cart.items;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Lỗi đồng bộ giỏ hàng');
    }
});

// Thunk: Thêm sản phẩm vào giỏ hàng
export const addItemsToCart = createAsyncThunk('cart/addItemsToCart', async ({ id, quantity, isUpdate, size, color }, { getState, rejectWithValue }) => {
    try {
        const { data } = await axios.get(`/api/v1/products/${id}`);
        const item = {
            product_id: data.product._id,  // Updated to match new backend field name
            product: data.product._id,     // Keep for local state compatibility
            name: data.product.name,
            price: data.product.price,
            image: data.product.images[0].url,
            stock: data.product.stock,
            quantity: quantity,
            isUpdate: isUpdate,
            size: size,
            color: color
        };

        const { user } = getState().user;
        if (user) {
            await axios.post('/api/v1/cart/item', item);
        }

        return item;
    } catch (error) {
        return rejectWithValue(error.response?.data || 'Đã xảy ra lỗi')
    }
});

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
        syncCartWithUser: (state, action) => {
            const userId = action.payload;
            state.userId = userId;
            state.cartItems = JSON.parse(localStorage.getItem(getCartKey(userId))) || [];
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
        removeItemFromCart: (state, action) => {
            const { product, size, color } = action.payload;
            const pId = product && typeof product === 'object' ? product._id : product;
            const pSize = size || '';
            const pColor = color || '';

            state.cartItems = state.cartItems.filter(item => {
                const itemProductId = item.product && typeof item.product === 'object' ? item.product._id : item.product;
                return !(itemProductId === pId && (item.size || '') === pSize && (item.color || '') === pColor);
            });
            
            localStorage.setItem(getCartKey(state.userId), JSON.stringify(state.cartItems));

            if (state.userId) {
                axios.post('/api/v1/cart/item/remove', { product: pId, size: pSize, color: pColor }).catch(err => console.error(err));
            }
        },
        saveShippingInfo: (state, action) => {
            state.shippingInfo = action.payload;
            localStorage.setItem(getShippingKey(state.userId), JSON.stringify(state.shippingInfo));
        },
        removeOrderedItems: (state, action) => {
            const orderedItems = action.payload || [];
            const orderedKeys = new Set(orderedItems.map(item => {
                const pId = item.product && typeof item.product === 'object' ? item.product._id : item.product;
                return `${pId}-${item.size || ''}-${item.color || ''}`;
            }));

            state.cartItems = state.cartItems.filter(item => {
                const pId = item.product && typeof item.product === 'object' ? item.product._id : item.product;
                const key = `${pId}-${item.size || ''}-${item.color || ''}`;
                return !orderedKeys.has(key);
            });

            localStorage.setItem(getCartKey(state.userId), JSON.stringify(state.cartItems));
        },
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
        builder.addCase('user/logout/fulfilled', (state) => {
            state.userId = null;
            state.cartItems = JSON.parse(localStorage.getItem(getCartKey(null))) || [];
            state.shippingInfo = JSON.parse(localStorage.getItem(getShippingKey(null))) || {
                address: "", pinCode: "", phoneNumber: "", country: "VN",
                provinceCode: "", districtCode: "", wardCode: "",
                provinceName: "", districtName: "", wardName: "",
            };
        })
        .addCase(fetchCart.fulfilled, (state, action) => {
            state.cartItems = normalizeCartItems(action.payload);
            state.loading = false;
            localStorage.setItem(getCartKey(state.userId), JSON.stringify(state.cartItems));
        })
        .addCase(syncCartWithDB.fulfilled, (state, action) => {
            state.cartItems = normalizeCartItems(action.payload);
            state.loading = false;
            localStorage.setItem(getCartKey(state.userId), JSON.stringify(state.cartItems));
        })
        .addCase(addItemsToCart.fulfilled, (state, action) => {
            const item = action.payload;
            const existingItem = state.cartItems.find((i) => {
                const iId = (typeof i.product === 'object' && i.product?._id) ? i.product._id : i.product;
                const itemId = (typeof item.product === 'object' && item.product?._id) ? item.product._id : item.product;
                return iId === itemId && (i.size || "") === (item.size || "") && (i.color || "") === (item.color || "");
            });

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
            localStorage.setItem(getCartKey(state.userId), JSON.stringify(state.cartItems));
        });
    }
});

export const { 
    removeErrors, removeMessage, removeItemFromCart, 
    saveShippingInfo, removeOrderedItems, clearCart, 
    syncCartWithUser 
} = cartSlice.actions;

export default cartSlice.reducer;